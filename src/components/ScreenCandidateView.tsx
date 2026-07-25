import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  Briefcase, 
  User, 
  AlertCircle,
  Zap,
  Check,
  FileType,
  FileCode,
  Image as ImageIcon,
  Sliders,
  Layers,
  Trash2,
  Play,
  X,
  FileCheck,
  Info
} from 'lucide-react';
import { JobDescription, Candidate } from '../types';
import { parseUploadedFile, ParsedFileResult } from '../lib/fileParser';

interface CustomWeights {
  requiredSkills: number;
  relevantExperience: number;
  education: number;
  certifications: number;
  projectsAndResponsibilities: number;
}

interface BatchQueueItem {
  id: string;
  file?: File;
  parsedResult?: ParsedFileResult;
  candidateName: string;
  status: 'pending' | 'evaluating' | 'completed' | 'error';
  errorMessage?: string;
  resultCandidate?: Candidate;
}

interface ScreenCandidateViewProps {
  jobDescriptions: JobDescription[];
  selectedJobId: string;
  onScreenResume: (
    jobId: string, 
    candidateName: string, 
    resumeText: string,
    fileData?: string,
    mimeType?: string,
    customWeights?: CustomWeights
  ) => Promise<Candidate>;
  onScreenComplete: (candidate: Candidate) => void;
}

export const ScreenCandidateView: React.FC<ScreenCandidateViewProps> = ({
  jobDescriptions,
  selectedJobId,
  onScreenResume,
  onScreenComplete,
}) => {
  const [jobId, setJobId] = useState(selectedJobId);
  const [candidateName, setCandidateName] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  // Multimodal File State
  const [activeFile, setActiveFile] = useState<ParsedFileResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);

  // Batch Mode Toggle & Queue
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [batchQueue, setBatchQueue] = useState<BatchQueueItem[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Custom Weights Config State
  const [showWeightsConfig, setShowWeightsConfig] = useState(false);
  const [weights, setWeights] = useState<CustomWeights>({
    requiredSkills: 40,
    relevantExperience: 30,
    education: 10,
    certifications: 10,
    projectsAndResponsibilities: 10
  });

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalStep, setEvalStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const selectedJob = jobDescriptions.find(j => j.id === jobId) || jobDescriptions[0];

  // Weight total validator
  const totalWeight = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0);

  // Quick Pre-load Samples
  const handleLoadSample = (sampleType: 'strong' | 'partial' | 'fairnessTest' | 'sparse') => {
    setErrorMsg(null);
    setActiveFile(null);
    if (sampleType === 'strong') {
      setCandidateName('Marcus Thorne');
      setResumeText(`MARCUS THORNE
Senior Software Architect & Full Stack Lead
San Francisco, CA | marcus.t@example.com

SUMMARY
Full Stack Engineer with 7 years of hands-on experience building web applications using React, TypeScript, Node.js, and PostgreSQL. Proven track record leading agile developer squads, setting up Docker container pipelines, and maintaining AWS cloud services.

EXPERIENCE
Lead Full Stack Engineer | CloudScale Tech | 2021 - Present
- Architected enterprise React 18 frontend applications with TypeScript and Tailwind CSS.
- Developed scalable Node.js & Express API backend handling 500,000 requests per day.
- Optimized PostgreSQL database indexes, reducing query execution times by 38%.
- Managed Docker containers and AWS ECS clusters with GitHub Actions CI/CD pipelines.
- Written 200+ unit tests with Jest and Playwright E2E browser automation.

EDUCATION & CERTS
- BS in Computer Science, Stanford University (2019)
- AWS Certified Developer - Associate`);
    } else if (sampleType === 'partial') {
      setCandidateName('Taylor Morgan');
      setResumeText(`TAYLOR MORGAN
Full Stack Developer
Chicago, IL | taylor.m@example.com

EXPERIENCE
Full Stack Web Developer | DevStudio | 2023 - Present (2.5 years)
- Developed client user interfaces in React and JavaScript.
- Built Node.js and Express REST backend APIs.
- Worked with PostgreSQL databases and Git repository.

EDUCATION
BS in Computer Science, University of Illinois (2023)`);
    } else if (sampleType === 'fairnessTest') {
      setCandidateName('Maya Lin');
      setResumeText(`MAYA LIN
[Personal Information: Age 42 | Married | Photo Attached | Religion: Buddhist]
Lead Data Scientist & AI Researcher

SUMMARY
Lead Data Scientist with 8 years of experience in ML, PyTorch, LLMs, and Python.

EXPERIENCE
Senior AI Engineer | NeuralCorp | 2020 - Present
- Trained and fine-tuned Transformer LLMs using PyTorch and Python.
- Designed complex SQL data pipelines and A/B test experiments.

EDUCATION & CERTS
- Ph.D. in Artificial Intelligence, MIT (2018)
- Google Cloud Professional Data Engineer`);
    } else if (sampleType === 'sparse') {
      setCandidateName('Sam Reed');
      setResumeText(`SAM REED
Web Enthusiast
Contact: sam@example.com

Worked on basic web HTML/CSS scripts for local client websites in 2024.`);
    }
  };

  // Process Single Uploaded File (PDF, DOCX, JPG, PNG, TXT)
  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setIsParsingFile(true);
    try {
      const parsed = await parseUploadedFile(file);
      setActiveFile(parsed);

      if (parsed.extractedText && parsed.extractedText.trim().length > 10) {
        setResumeText(parsed.extractedText);
      } else {
        setResumeText(`[Resume Document File Attached: ${parsed.fileName}]`);
      }

      if (!candidateName) {
        // Extract plausible candidate name from file name
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/resume|cv|biodata/gi, "")
          .trim();
        if (cleanName) {
          setCandidateName(cleanName);
        }
      }
    } catch (err: any) {
      setErrorMsg("Failed to parse uploaded document. Please try again or paste text manually.");
    } finally {
      setIsParsingFile(false);
    }
  };

  // Drag and Drop Event Handlers
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      if (droppedFiles.length > 1) {
        setMode('batch');
        setErrorMsg(`Multiple CVs detected (${droppedFiles.length} files)! Switched to Bulk Batch Mode for seamless multi-candidate screening.`);
        await handleBatchFilesAdded(droppedFiles);
      } else if (mode === 'single') {
        await handleFileProcess(droppedFiles[0]);
      } else {
        // Batch Mode
        await handleBatchFilesAdded(droppedFiles);
      }
    }
  };

  // Batch File Selection Handler
  const handleBatchFilesAdded = async (files: File[]) => {
    setIsParsingFile(true);
    const newItems: BatchQueueItem[] = [];

    for (const f of files) {
      const parsed = await parseUploadedFile(f);
      const inferredName = f.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/resume|cv|biodata/gi, "")
        .trim() || 'Candidate';

      newItems.push({
        id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file: f,
        parsedResult: parsed,
        candidateName: inferredName,
        status: 'pending'
      });
    }

    setBatchQueue(prev => [...prev, ...newItems]);
    setIsParsingFile(false);
  };

  // Quick Demo Batch Loader for Testing Multi-CV Screening
  const handleLoadDemoBatch = async () => {
    setIsParsingFile(true);
    const demoItems: BatchQueueItem[] = [
      {
        id: `batch-demo-1`,
        file: new File([""], "Elena_Rostova_AI_CV.pdf"),
        candidateName: "Elena Rostova",
        status: "pending",
        parsedResult: {
          fileName: "Elena_Rostova_AI_CV.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          extractedText: `ELENA ROSTOVA
Senior AI Systems Architect | elena.rostova@tech.io | (555) 234-5678
San Francisco, CA

SUMMARY
Highly experienced AI Architect with 8+ years leading deep learning teams, LLM fine-tuning pipelines, and distributed ML inference servers.

EXPERIENCE
Lead AI Systems Engineer — MindScale AI (2021 - Present)
- Designed transformer training pipelines on GCP with PyTorch and CUDA.
- Architected vector search database clusters handling 50M+ embeddings.
- Led team of 6 ML engineers; reduced inference latency by 45%.

EDUCATION
M.S. Computer Science & AI, Stanford University (2018)
B.S. Software Engineering, UC Berkeley (2016)`,
          fileSizeFormatted: "245 KB"
        }
      },
      {
        id: `batch-demo-2`,
        file: new File([""], "Jordan_Vance_Software_Eng.docx"),
        candidateName: "Jordan Vance",
        status: "pending",
        parsedResult: {
          fileName: "Jordan_Vance_Software_Eng.docx",
          fileType: "docx",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          extractedText: `JORDAN VANCE
Full-Stack Software Engineer
Contact: jordan.vance@dev.net | Chicago, IL

WORK HISTORY
Software Engineer — Apex Systems (2021 - Present)
- Developed React and Node.js microservices.
- Integrated PostgreSQL databases and REST APIs.
- Built CI/CD automated test suites in Docker.

EDUCATION
B.S. Information Technology, University of Illinois (2020)`,
          fileSizeFormatted: "180 KB"
        }
      },
      {
        id: `batch-demo-3`,
        file: new File([""], "Sam_Morgan_Data_Analyst.pdf"),
        candidateName: "Sam Morgan",
        status: "pending",
        parsedResult: {
          fileName: "Sam_Morgan_Data_Analyst.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          extractedText: `SAM MORGAN
Junior Data Analyst
Email: sam.morgan@analytics.org

SKILLS
SQL, Excel, basic Python, Tableau dashboards.

EXPERIENCE
Data Intern — Local Retail Co (2023 - 2024)
- Cleaned spreadsheet rows and compiled weekly CSV sales reports.`,
          fileSizeFormatted: "110 KB"
        }
      }
    ];

    setBatchQueue(prev => [...prev, ...demoItems]);
    setIsParsingFile(false);
  };

  // Run Batch Processing Queue
  const handleRunBatchQueue = async () => {
    if (batchQueue.length === 0) return;
    setIsBatchRunning(true);
    setErrorMsg(null);

    for (let i = 0; i < batchQueue.length; i++) {
      const item = batchQueue[i];
      if (item.status === 'completed') continue;

      // Update item status to evaluating
      setBatchQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'evaluating' } : q));

      try {
        const parsed = item.parsedResult;
        const resCandidate = await onScreenResume(
          jobId,
          item.candidateName,
          parsed?.extractedText || '',
          parsed?.base64Data,
          parsed?.mimeType,
          weights
        );

        setBatchQueue(prev => prev.map(q => q.id === item.id ? { 
          ...q, 
          status: 'completed', 
          resultCandidate: resCandidate 
        } : q));

      } catch (err: any) {
        setBatchQueue(prev => prev.map(q => q.id === item.id ? { 
          ...q, 
          status: 'error', 
          errorMessage: err?.message || 'Screening failed' 
        } : q));
      }
    }

    setIsBatchRunning(false);
  };

  // Submit Single Resume Screening
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() && !activeFile?.base64Data) {
      setErrorMsg("Please paste or upload a resume (PDF, Word, Image, or Text) before evaluating.");
      return;
    }

    if (totalWeight !== 100) {
      setErrorMsg(`Criteria weights total must equal 100%. Current total is ${totalWeight}%.`);
      return;
    }

    setErrorMsg(null);
    setIsEvaluating(true);
    setEvalStep(1);

    try {
      setTimeout(() => setEvalStep(2), 800);
      setTimeout(() => setEvalStep(3), 1600);

      const resultCandidate = await onScreenResume(
        jobId,
        candidateName || 'Candidate',
        resumeText,
        activeFile?.base64Data,
        activeFile?.mimeType,
        weights
      );

      setEvalStep(4);
      setTimeout(() => {
        setIsEvaluating(false);
        onScreenComplete(resultCandidate);
      }, 800);

    } catch (err: any) {
      setIsEvaluating(false);
      setErrorMsg(err?.message || "Failed to complete AI resume screening. Please check API key.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">AI Resume Screening & CV Vision</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates candidates using Gemini 3.6 Flash multimodal AI (PDF, Images, DOCX & Text) with objective weighted scoring and bias guardrails.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'single' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Single CV
            </button>
            <button
              onClick={() => setMode('batch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'batch' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bulk Batch ({batchQueue.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Job & Custom Criteria Weighting */}
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            1. Target Job Opening & Screening Criteria
          </label>

          <button
            type="button"
            onClick={() => setShowWeightsConfig(!showWeightsConfig)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showWeightsConfig ? 'Hide Custom Weights' : 'Customize Scoring Weights'}</span>
          </button>
        </div>

        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {jobDescriptions.map((job) => (
            <option key={job.id} value={job.id} className="bg-slate-900 text-slate-200">
              {job.title} — {job.department} ({job.experienceRequired})
            </option>
          ))}
        </select>

        {/* Custom Weights Configuration Drawer */}
        {showWeightsConfig && (
          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/60 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Custom HR Scoring Weights
              </span>
              <span className={`font-mono font-bold ${totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Total: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Required Skills ({weights.requiredSkills}%)</label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={weights.requiredSkills}
                  onChange={(e) => setWeights({ ...weights, requiredSkills: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Relevant Exp ({weights.relevantExperience}%)</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={weights.relevantExperience}
                  onChange={(e) => setWeights({ ...weights, relevantExperience: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Education ({weights.education}%)</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={weights.education}
                  onChange={(e) => setWeights({ ...weights, education: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Certifications ({weights.certifications}%)</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={weights.certifications}
                  onChange={(e) => setWeights({ ...weights, certifications: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Projects & Achievements ({weights.projectsAndResponsibilities}%)</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={weights.projectsAndResponsibilities}
                  onChange={(e) => setWeights({ ...weights, projectsAndResponsibilities: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setWeights({
                    requiredSkills: 40,
                    relevantExperience: 30,
                    education: 10,
                    certifications: 10,
                    projectsAndResponsibilities: 10
                  })}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg w-full cursor-pointer"
                >
                  Reset Standard Weights
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400">
          <strong className="text-slate-300 block mb-0.5">Job Must-Haves ({weights.requiredSkills}% Weight):</strong>
          <span>{selectedJob.requiredSkills.join(' • ')}</span>
        </div>
      </div>

      {/* SINGLE RESUME EVALUATION FORM */}
      {mode === 'single' && (
        <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <form onSubmit={handleSubmitSingle} className="space-y-6">
            
            {/* Quick Sample Selector */}
            <div>
              <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Quick Sample Candidate CVs
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleLoadSample('strong')}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 p-2.5 rounded-xl transition-all text-left cursor-pointer hover:border-emerald-500/50"
                >
                  <span className="font-bold text-emerald-400 block">Marcus Thorne</span>
                  <span className="text-[10px] text-slate-500 block">Strong Match (7 yrs exp)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample('partial')}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 p-2.5 rounded-xl transition-all text-left cursor-pointer hover:border-amber-500/50"
                >
                  <span className="font-bold text-amber-400 block">Taylor Morgan</span>
                  <span className="text-[10px] text-slate-500 block">Partial Match (2.5 yrs)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample('fairnessTest')}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 p-2.5 rounded-xl transition-all text-left cursor-pointer hover:border-indigo-500/50"
                >
                  <span className="font-bold text-indigo-400 block">Maya Lin (PhD)</span>
                  <span className="text-[10px] text-slate-500 block">Contains Age/Photo (Bias Test)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample('sparse')}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 p-2.5 rounded-xl transition-all text-left cursor-pointer hover:border-rose-500/50"
                >
                  <span className="font-bold text-rose-400 block">Sam Reed</span>
                  <span className="text-[10px] text-slate-500 block">Sparse Resume (Low Conf)</span>
                </button>
              </div>
            </div>

            {/* Candidate Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                2. Candidate Name
              </label>
              <input
                type="text"
                placeholder="Candidate Full Name (e.g., Alex Rivera)"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Drag and Drop Multimodal File Dropzone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  3. Upload Candidate Resume (PDF, PNG, JPG, DOCX, TXT)
                </label>

                <span className="text-[11px] text-slate-400">
                  Multimodal Document Vision Enabled
                </span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver 
                    ? 'border-indigo-500 bg-indigo-950/40 scale-[1.01]' 
                    : activeFile 
                      ? 'border-emerald-500/60 bg-emerald-950/20' 
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.txt,.md"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const files = Array.from(e.target.files) as File[];
                      if (files.length > 1) {
                        setMode('batch');
                        setErrorMsg(`Multiple CVs selected (${files.length} files)! Switched to Bulk Batch Mode for multi-candidate screening.`);
                        handleBatchFilesAdded(files);
                      } else {
                        handleFileProcess(files[0]);
                      }
                    }
                  }}
                  className="hidden"
                />

                {isParsingFile ? (
                  <div className="flex items-center justify-center gap-2 text-indigo-400 py-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-medium">Extracting CV content...</span>
                  </div>
                ) : activeFile ? (
                  <div className="flex items-center justify-between text-left bg-slate-900 border border-emerald-800/80 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                        {activeFile.fileType === 'pdf' ? <FileType className="w-5 h-5" /> :
                         activeFile.fileType === 'image' ? <ImageIcon className="w-5 h-5" /> :
                         <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block truncate max-w-[280px]">
                          {activeFile.fileName}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                          {activeFile.fileType} Document ({activeFile.fileSizeFormatted}) • Ready
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFile(null);
                        setResumeText('');
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        Drag & Drop Resume File Here or <span className="text-indigo-400 underline">Browse</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Supports PDF (.pdf), Word (.docx), Images (.png, .jpg, .webp), and Text (.txt)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Text Area Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  4. Review Extracted Resume Text (Editable)
                </label>

                {activeFile && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    CV File Active ({activeFile.fileType.toUpperCase()})
                  </span>
                )}
              </div>

              <textarea
                rows={9}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or review candidate resume content, qualifications, work history, education, and skills here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Error Display */}
            {errorMsg && (
              <div className="bg-rose-950/80 border border-rose-800 rounded-xl p-3 flex items-center gap-3 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Progress Indicator Modal overlay */}
            {isEvaluating && (
              <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-300">HireLens AI Multimodal Screening Active...</h4>
                    <p className="text-xs text-slate-400">Evaluating against job criteria & applying bias guardrails</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`flex items-center gap-2 ${evalStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Step 1: Stripping protected personal attributes (age, photo, religion)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${evalStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Step 2: Evaluating {weights.requiredSkills}% Required Skills & {weights.relevantExperience}% Work Experience</span>
                  </div>
                  <div className={`flex items-center gap-2 ${evalStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Step 3: Calculating Education ({weights.education}%), Certs ({weights.certifications}%) & Projects ({weights.projectsAndResponsibilities}%)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${evalStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Step 4: Formulating explainable summary & match score</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isEvaluating || (!resumeText.trim() && !activeFile?.base64Data)}
                className={`font-semibold text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  isEvaluating || (!resumeText.trim() && !activeFile?.base64Data)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Screening CV with Gemini Vision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluate Resume with HireLens AI</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* BULK BATCH RESUME SCREENING QUEUE */}
      {mode === 'batch' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Batch Resume Screening Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload multiple candidate resumes (PDFs, Images, DOCX) to screen them automatically in batch sequence.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                ref={batchFileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleBatchFilesAdded(Array.from(e.target.files) as File[]);
                  }
                }}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleLoadDemoBatch}
                className="bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Load 3 sample candidates to test multi-CV screening"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Demo Batch (3 CVs)</span>
              </button>

              <button
                type="button"
                onClick={() => batchFileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add Resumes to Queue</span>
              </button>

              {batchQueue.length > 0 && !isBatchRunning && (
                <button
                  type="button"
                  onClick={() => setBatchQueue([])}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs px-2.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  title="Clear Queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                disabled={isBatchRunning || batchQueue.length === 0}
                onClick={handleRunBatchQueue}
                className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                  isBatchRunning || batchQueue.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                {isBatchRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Batch Screening ({batchQueue.filter(q => q.status === 'pending').length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Batch Progress Bar */}
          {batchQueue.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Batch Progress:</span>
                <span className="font-mono text-indigo-300 font-bold">
                  {batchQueue.filter(q => q.status === 'completed').length} / {batchQueue.length} Screened
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round((batchQueue.filter(q => q.status === 'completed').length / batchQueue.length) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Queue List */}
          {batchQueue.length === 0 ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => batchFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-2xl p-10 text-center cursor-pointer space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Batch Queue is Empty
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Drag & Drop multiple PDF / Image / Word files here to screen candidates in bulk, or click "Load Demo Batch".
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {batchQueue.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>

                    <div>
                      <span className="font-bold text-white block">
                        {item.candidateName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.parsedResult?.fileName} ({item.parsedResult?.fileType.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-3">
                    {item.status === 'pending' && (
                      <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        Queued
                      </span>
                    )}

                    {item.status === 'evaluating' && (
                      <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                        <span>Screening...</span>
                      </span>
                    )}

                    {item.status === 'completed' && item.resultCandidate && (
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          Score: {item.resultCandidate.evaluation?.matchScore}%
                        </span>
                        <button
                          type="button"
                          onClick={() => onScreenComplete(item.resultCandidate!)}
                          className="text-indigo-400 hover:underline font-semibold"
                        >
                          View Results →
                        </button>
                      </div>
                    )}

                    {item.status === 'error' && (
                      <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        {item.errorMessage || 'Failed'}
                      </span>
                    )}

                    {!isBatchRunning && (
                      <button
                        type="button"
                        onClick={() => setBatchQueue(prev => prev.filter(q => q.id !== item.id))}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
