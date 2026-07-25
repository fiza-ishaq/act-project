import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Retry helper for Gemini calls to gracefully handle transient 503 / 429 errors
async function generateContentWithRetry(ai: GoogleGenAI, params: any, retries = 3, delayMs = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const isTransient = err?.status === 503 || err?.status === 429 || (err?.message && (err.message.includes("503") || err.message.includes("429")));
      if (isTransient && i < retries - 1) {
        console.warn(`[Gemini API] Received ${err?.status || 503} status. Retrying in ${delayMs}ms (Attempt ${i + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 1.5;
      } else {
        throw err;
      }
    }
  }
  throw new Error("Failed after retries");
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "HireLens AI" });
});

// Resume Screening Endpoint with Multimodal (PDF, Image, DOCX, Text) and Custom Weights Support
app.post("/api/evaluate-resume", async (req, res) => {
  try {
    const { jobDescription, resumeText, candidateName, fileData, mimeType, customWeights } = req.body;

    if (!jobDescription || (!resumeText && !fileData)) {
      return res.status(400).json({ error: "jobDescription and either resumeText or fileData are required." });
    }

    const ai = getGeminiClient();

    // Default or custom weights
    const weights = customWeights || {
      requiredSkills: 40,
      relevantExperience: 30,
      education: 10,
      certifications: 10,
      projectsAndResponsibilities: 10
    };

    const systemPrompt = `You are HireLens AI, an advanced HR resume screening assistant designed to support enterprise recruiters during candidate evaluation.

OBJECTIVE:
Analyze the candidate's resume (provided as text, PDF document, or resume image) against the provided job description and produce a fair, consistent, and explainable evaluation.
Extract structured profile details including Full Name, Email, Phone Number, Skills, Work Experience, Education, Certifications, and Key Projects.
Generate 3-5 custom interview questions specifically tailored to this candidate's strengths and potential skill gaps for this job role.

RULES:
1. General Rules:
   - Use ONLY the information explicitly stated in the job description and the resume file/text.
   - Do NOT infer or guess missing qualifications or experience.
   - Extract actual email addresses (e.g., alex@example.com) and phone numbers if present in the resume text or document image.
   - If contact email is not stated in the document, construct a standard professional email based on candidate's name (e.g., firstname.lastname@applicant.org). Always provide a valid email.

2. Fairness & Bias Guardrails:
   - NEVER consider protected personal attributes: Age, Gender, Race/ethnicity, Religion, Nationality, Marital status, Disability, Photo, or Personal Opinions.
   - If personal attributes or photos are present, filter them out and list them in 'protectedAttributesFiltered'.

3. Evaluation Criteria & Scoring (Weighted):
   - Required skills: ${weights.requiredSkills}% weight
   - Relevant experience: ${weights.relevantExperience}% weight
   - Education: ${weights.education}% weight
   - Certifications: ${weights.certifications}% weight
   - Projects & Responsibilities: ${weights.projectsAndResponsibilities}% weight

4. Confidence Level:
   - Choose: "High", "Medium", "Low". (Low if resume is sparse or image is blurry).

5. Recommendation:
   - Choose: "Strong Match", "Partial Match", "Weak Match".

6. Disclaimer:
   - MUST BE EXACTLY: "This evaluation is intended only to assist recruiters during the screening process. It is not a hiring decision. Final hiring decisions should always be made by qualified human reviewers."`;

    const userPromptText = `JOB DESCRIPTION:
${typeof jobDescription === 'string' ? jobDescription : JSON.stringify(jobDescription, null, 2)}

${candidateName ? `CANDIDATE NAME PROVIDED: ${candidateName}` : ''}
${resumeText ? `CANDIDATE RESUME TEXT:\n${resumeText}` : 'CANDIDATE RESUME IS ATTACHED AS MULTIMODAL FILE (PDF / IMAGE / DOCUMENT).'}`;

    const parts: any[] = [];

    if (fileData && mimeType) {
      const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    parts.push({ text: userPromptText });

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: parts }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING, description: "Extracted or provided candidate full name" },
            email: { type: Type.STRING, description: "Extracted candidate email address or 'Not Mentioned'" },
            phone: { type: Type.STRING, description: "Extracted candidate phone number or 'Not Mentioned'" },
            matchScore: { type: Type.INTEGER, description: "Overall match score from 0 to 100" },
            confidenceLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            subScores: {
              type: Type.OBJECT,
              properties: {
                requiredSkills: { type: Type.INTEGER },
                relevantExperience: { type: Type.INTEGER },
                education: { type: Type.INTEGER },
                certifications: { type: Type.INTEGER },
                projectsAndResponsibilities: { type: Type.INTEGER }
              },
              required: ["requiredSkills", "relevantExperience", "education", "certifications", "projectsAndResponsibilities"]
            },
            extractedProfile: {
              type: Type.OBJECT,
              properties: {
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                yearsExperience: { type: Type.STRING, description: "Calculated or stated years of experience or 'Not Mentioned'" },
                education: { type: Type.ARRAY, items: { type: Type.STRING } },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                projects: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["skills", "yearsExperience", "education", "certifications", "projects"]
            },
            matchedRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            recommendation: { type: Type.STRING, enum: ["Strong Match", "Partial Match", "Weak Match"] },
            disclaimer: { type: Type.STRING },
            interviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  category: { type: Type.STRING, description: "e.g., Technical Depth, Skill Gap Verification, Behavioral, System Design" },
                  targetSkillOrGap: { type: Type.STRING, description: "Skill or requirement being probed" }
                },
                required: ["question", "category", "targetSkillOrGap"]
              },
              description: "3-5 dynamically generated interview questions tailored to candidate strengths and gaps"
            },
            fairnessAudit: {
              type: Type.OBJECT,
              properties: {
                protectedAttributesFiltered: { type: Type.ARRAY, items: { type: Type.STRING } },
                isFairAndObjective: { type: Type.BOOLEAN },
                auditMessage: { type: Type.STRING }
              },
              required: ["protectedAttributesFiltered", "isFairAndObjective", "auditMessage"]
            }
          },
          required: [
            "candidateName",
            "email",
            "phone",
            "matchScore",
            "confidenceLevel",
            "subScores",
            "extractedProfile",
            "matchedRequirements",
            "missingRequirements",
            "strengths",
            "weaknesses",
            "summary",
            "recommendation",
            "disclaimer",
            "interviewQuestions",
            "fairnessAudit"
          ]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Empty response received from Gemini AI model.");
    }

    const evaluation = JSON.parse(jsonText);
    evaluation.evaluatedAt = new Date().toISOString();

    return res.json({ success: true, evaluation });
  } catch (error: any) {
    console.error("Error evaluating resume with HireLens AI:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to complete AI resume screening."
    });
  }
});

// AI Recruiter Assistant Copilot API Endpoint
app.post("/api/ai-copilot", async (req, res) => {
  try {
    const { message, history, contextData } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message prompt is required." });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are HireLens Copilot, an AI Recruiter Assistant embedded in an enterprise AI Candidate Matching & Screening Platform.
Your job is to assist HR managers, talent acquisition leads, and recruiters in evaluating candidates, comparing applicants, drafting interview invitation emails, explaining match scores, or suggesting job requirement adjustments.

RECRUITMENT CONTEXT & DATA:
${contextData ? JSON.stringify(contextData, null, 2) : "No specific candidate context selected yet."}

INSTRUCTIONS:
1. Provide concise, professional, clear, and actionable advice to recruiters.
2. When asked to compare candidates, highlight key differences in required skills, experience, and match scores.
3. When asked to draft an interview email, write a warm, professional invitation template with placeholders for interview date/time.
4. Keep answers focused on objective, job-related criteria.
5. Do NOT make definitive hiring decisions; present options and decision support reasoning for human recruiters.`;

    const contents = [
      ...(history || []).map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3
      }
    });

    return res.json({ success: true, reply: response.text || "I'm sorry, I couldn't generate a response." });
  } catch (err: any) {
    console.error("Error in AI Copilot Assistant:", err);
    return res.status(500).json({ success: false, error: err?.message || "Copilot service error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HireLens AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
