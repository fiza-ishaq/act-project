import express from "express";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json({ limit: "10mb" }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { "User-Agent": "aistudio-build" },
    },
  });
};

async function generateContentWithRetry(ai: GoogleGenAI, params: any, retries = 3, delayMs = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const isTransient = err?.status === 503 || err?.status === 429 || (err?.message && (err.message.includes("503") || err.message.includes("429")));
      if (isTransient && i < retries - 1) {
        console.warn(`[Gemini API] Retrying (${i + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 1.5;
      } else {
        throw err;
      }
    }
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "HireLens AI" });
});

app.post("/api/evaluate-resume", async (req, res) => {
  try {
    const { jobDescription, resumeText, candidateName, fileData, mimeType, customWeights } = req.body;
    if (!jobDescription || (!resumeText && !fileData)) {
      return res.status(400).json({ error: "jobDescription and either resumeText or fileData are required." });
    }

    const ai = getGeminiClient();
    const weights = customWeights || { requiredSkills: 40, relevantExperience: 30, education: 10, certifications: 10, projectsAndResponsibilities: 10 };

    const systemPrompt = `You are HireLens AI, an advanced HR resume screening assistant.

OBJECTIVE:
Analyze the candidate's resume against the provided job description and produce a fair evaluation.
Extract profile details and generate interview questions.

RULES:
1. Use ONLY information explicitly stated in the job description and resume.
2. NEVER consider protected attributes: Age, Gender, Race, Religion, Nationality, Marital status, Disability, Photo.
3. Scoring - Required skills: ${weights.requiredSkills}%, Experience: ${weights.relevantExperience}%, Education: ${weights.education}%, Certifications: ${weights.certifications}%, Projects: ${weights.projectsAndResponsibilities}%
4. Confidence: "High", "Medium", "Low".
5. Recommendation: "Strong Match", "Partial Match", "Weak Match".
6. Disclaimer: "This evaluation is intended only to assist recruiters during the screening process."`;

    const parts: any[] = [];
    if (fileData && mimeType) {
      const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;
      parts.push({ inlineData: { mimeType, data: base64Data } });
    }
    parts.push({ text: `JOB DESCRIPTION:\n${typeof jobDescription === 'string' ? jobDescription : JSON.stringify(jobDescription, null, 2)}\n\n${resumeText ? `RESUME:\n${resumeText}` : ''}` });

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            matchScore: { type: Type.INTEGER },
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
                yearsExperience: { type: Type.STRING },
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
              items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, category: { type: Type.STRING }, targetSkillOrGap: { type: Type.STRING } }, required: ["question", "category", "targetSkillOrGap"] }
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
          required: ["candidateName", "email", "matchScore", "subScores", "matchedRequirements", "missingRequirements", "strengths", "weaknesses", "summary", "recommendation", "disclaimer", "fairnessAudit"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini.");
    const evaluation = JSON.parse(jsonText);
    evaluation.evaluatedAt = new Date().toISOString();
    return res.json({ success: true, evaluation });
  } catch (error: any) {
    console.error("Error evaluating resume:", error);
    return res.status(500).json({ success: false, error: error?.message || "AI screening failed." });
  }
});

app.post("/api/ai-copilot", async (req, res) => {
  try {
    const { message, history, contextData } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    const ai = getGeminiClient();
    const systemPrompt = `You are HireLens Copilot, an AI Recruiter Assistant. Provide concise, professional advice to recruiters. Do NOT make definitive hiring decisions.`;
    const contents = [
      ...(history || []).map((h: any) => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] })),
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.6-flash",
      contents,
      config: { systemInstruction: systemPrompt, temperature: 0.3 }
    });

    return res.json({ success: true, reply: response.text || "No response generated." });
  } catch (err: any) {
    console.error("Copilot error:", err);
    return res.status(500).json({ success: false, error: err?.message || "Copilot error" });
  }
});

export default app;
