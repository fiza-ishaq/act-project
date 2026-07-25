export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type MatchRecommendation = 'Strong Match' | 'Partial Match' | 'Weak Match';

export type HRStage = 'New' | 'Screened' | 'Phone Screen' | 'Shortlisted' | 'Interview' | 'Rejected';

export interface CategorySubScores {
  requiredSkills: number; // Weight 40%
  relevantExperience: number; // Weight 30%
  education: number; // Weight 10%
  certifications: number; // Weight 10%
  projectsAndResponsibilities: number; // Weight 10%
}

export interface FairnessAudit {
  protectedAttributesFiltered: string[];
  isFairAndObjective: boolean;
  auditMessage: string;
}

export interface ExtractedProfile {
  skills: string[];
  yearsExperience: string;
  education: string[];
  certifications: string[];
  projects: string[];
}

export interface InterviewQuestion {
  question: string;
  category: string;
  targetSkillOrGap: string;
}

export interface CandidateEvaluation {
  candidateName: string;
  email?: string;
  phone?: string;
  matchScore: number; // 0 - 100
  confidenceLevel: ConfidenceLevel;
  subScores: CategorySubScores;
  extractedProfile?: ExtractedProfile;
  matchedRequirements: string[];
  missingRequirements: string[];
  strengths: string[];
  weaknesses: string[];
  summary: string; // 3-5 sentences
  recommendation: MatchRecommendation;
  disclaimer: string;
  interviewQuestions?: InterviewQuestion[];
  fairnessAudit: FairnessAudit;
  evaluatedAt: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  jobDescriptionId: string;
  resumeText: string;
  evaluation?: CandidateEvaluation;
  status: 'pending' | 'evaluating' | 'evaluated' | 'error';
  errorMessage?: string;
  createdAt: string;
  notes?: string;
  hrStage?: HRStage;
  activityLog?: ActivityLogItem[];
}

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string; // Full-time, Remote, etc.
  experienceRequired: string;
  requiredSkills: string[]; // Must-have (40%)
  niceToHaveSkills: string[];
  toolsAndTech: string[];
  educationRequired: string[];
  certificationsRequired: string[];
  descriptionText: string;
  updatedAt: string;
}

