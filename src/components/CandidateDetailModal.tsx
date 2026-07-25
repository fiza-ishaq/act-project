import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Layers, 
  FileText, 
  Clock, 
  Check, 
  Printer, 
  Download, 
  MessageSquare,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  User,
  Eye,
  EyeOff,
  Copy,
  Mail,
  Phone,
  HelpCircle,
  Code2,
  Calendar,
  History,
  Trash2
} from 'lucide-react';
import { Candidate, JobDescription, HRStage } from '../types';

interface CandidateDetailModalProps {
  candidate: Candidate;
  jobDescription?: JobDescription;
  initialTab?: 'analysis' | 'profile' | 'questions' | 'resume' | 'audit' | 'timeline' | 'notes';
  onClose: () => void;
  onUpdateHRStage: (candidateId: string, stage: HRStage) => void;
  onSaveNotes: (candidateId: string, notes: string) => void;
  onDeleteCandidate?: (candidateId: string) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  jobDescription,
  initialTab = 'analysis',
  onClose,
  onUpdateHRStage,
  onSaveNotes,
  onDeleteCandidate,
}) => {
  const evalData = candidate.evaluation;

  const [activeTab, setActiveTab] = useState<'analysis' | 'profile' | 'questions' | 'resume' | 'audit' | 'timeline' | 'notes'>(initialTab);
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false);
  const [showFullEmail, setShowFullEmail] = useState<boolean>(false);
  const [stageUpdatedToast, setStageUpdatedToast] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [notesText, setNotesText] = useState(candidate.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState(false);
  // Interview Management State
  const [interviewType, setInterviewType] = useState<string>('Technical Round');
  const [interviewDate, setInterviewDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [interviewers, setInterviewers] = useState<string>('Engineering Lead & Senior HR');
  const [meetingLink, setMeetingLink] = useState<string>('https://meet.google.com/hirelens-interview');
  const [interviewStatus, setInterviewStatus] = useState<'Scheduled' | 'In Progress' | 'Completed'>('Scheduled');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [scorecardSaved, setScorecardSaved] = useState(false);

  // Scorecard Ratings (1 to 5)
  const [ratings, setRatings] = useState({
    technical: 4,
    problemSolving: 4,
    communication: 5,
    cultureFit: 4,
  });
  const [hiringDecision, setHiringDecision] = useState<'Strong Hire' | 'Hire' | 'Hold' | 'Do Not Hire'>('Strong Hire');
  const [interviewFeedback, setInterviewFeedback] = useState<string>('');

  const handleCopyInvite = () => {
    const text = `Interview Invitation for ${candidate.name}
Role: ${jobDescription?.title || 'Position'}
Type: ${interviewType}
Date & Time: ${new Date(interviewDate).toLocaleString()}
Interviewer(s): ${interviewers}
Meeting Link: ${meetingLink}
Candidate Email: ${candidate.email || evalData?.email || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleDownloadCalendarInvite = () => {
    const startDate = new Date(interviewDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HireLens ATS//Interview Scheduler//EN
BEGIN:VEVENT
SUMMARY:Interview: ${candidate.name} - ${jobDescription?.title || 'Candidate'}
DESCRIPTION:Interview Type: ${interviewType}\\nCandidate: ${candidate.name}\\nInterviewer(s): ${interviewers}\\nMeeting Link: ${meetingLink}
LOCATION:${meetingLink}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Interview_${candidate.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveScorecard = () => {
    const avgScore = ((ratings.technical + ratings.problemSolving + ratings.communication + ratings.cultureFit) / 4).toFixed(1);
    const summaryNotes = `[Interview Scorecard - ${interviewType}]
Status: ${interviewStatus} | Date: ${new Date(interviewDate).toLocaleDateString()}
Ratings: Tech: ${ratings.technical}/5 | Problem Solving: ${ratings.problemSolving}/5 | Comm: ${ratings.communication}/5 | Culture: ${ratings.cultureFit}/5 (Avg: ${avgScore}/5)
Hiring Decision: ${hiringDecision}
Feedback Notes: ${interviewFeedback || 'No additional comments.'}`;

    const newCombinedNotes = notesText ? `${notesText}\n\n${summaryNotes}` : summaryNotes;
    setNotesText(newCombinedNotes);
    onSaveNotes(candidate.id, newCombinedNotes);
    setScorecardSaved(true);
    setTimeout(() => setScorecardSaved(false), 3000);
  };

  const maskEmail = (emailStr?: string) => {
    if (!emailStr || emailStr === 'Not Mentioned' || emailStr.includes('Anonymized') || emailStr.includes('•')) return emailStr || '';
    const parts = emailStr.split('@');
    if (parts.length < 2) return emailStr;
    const user = parts[0];
    const domain = parts[1];
    if (user.length <= 2) return `${user}***@${domain}`;
    return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
  };

  const handleSaveNotes = () => {
    onSaveNotes(candidate.id, notesText);
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportText = `HIRELENS AI EVALUATION REPORT
Candidate Name: ${isBlindMode ? `Candidate #${candidate.id.slice(-6)}` : candidate.name}
Position: ${jobDescription?.title || 'Job Role'}
Overall Match Score: ${evalData?.matchScore || 0}% (${evalData?.recommendation || 'Evaluated'})
Confidence Level: ${evalData?.confidenceLevel || 'High'}

CONTACT INFORMATION:
Email: ${isBlindMode ? '[Anonymized in Blind Review Mode]' : (candidate.email || evalData?.email || 'Not Mentioned')}
Phone: ${isBlindMode ? '[Anonymized in Blind Review Mode]' : (candidate.phone || evalData?.phone || 'Not Mentioned')}

SUB-SCORES BREAKDOWN:
- Required Skills (40% Weight): ${evalData?.subScores?.requiredSkills || 0}%
- Relevant Experience (30% Weight): ${evalData?.subScores?.relevantExperience || 0}%
- Education (10% Weight): ${evalData?.subScores?.education || 0}%
- Certifications (10% Weight): ${evalData?.subScores?.certifications || 0}%
- Projects & Responsibilities (10% Weight): ${evalData?.subScores?.projectsAndResponsibilities || 0}%

EXECUTIVE SUMMARY:
${evalData?.summary || 'N/A'}

MATCHED QUALIFICATIONS:
${evalData?.matchedRequirements?.map(m => `- ${m}`).join('\n') || 'None'}

MISSING QUALIFICATIONS / GAPS:
${evalData?.missingRequirements?.map(m => `- ${m}`).join('\n') || 'None'}

STRENGTHS:
${evalData?.strengths?.map(s => `- ${s}`).join('\n') || 'None'}

RECOMMENDED INTERVIEW QUESTIONS:
${evalData?.interviewQuestions?.map((q, i) => `${i + 1}. [${q.category}] ${q.question} (Target: ${q.targetSkillOrGap})`).join('\n\n') || 'N/A'}

FAIRNESS AUDIT:
Protected attributes filtered: ${evalData?.fairnessAudit?.protectedAttributesFiltered?.join(', ') || 'None'}
Status: ${evalData?.fairnessAudit?.isFairAndObjective ? 'PASSED FAIRNESS CHECK' : 'NEEDS REVIEW'}

DISCLAIMER:
${evalData?.disclaimer || 'This evaluation is intended to assist human recruiters.'}
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HireLens_${candidate.name.replace(/\s+/g, '_')}_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRecommendationBadge = (recommendation?: string) => {
    switch (recommendation) {
      case 'Strong Match':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/80';
      case 'Partial Match':
        return 'bg-amber-950 text-amber-300 border-amber-700/80';
      case 'Weak Match':
        return 'bg-rose-950 text-rose-300 border-rose-700/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (score >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  const stages: HRStage[] = ['New', 'Screened', 'Phone Screen', 'Shortlisted', 'Interview', 'Rejected'];

  const displayName = isBlindMode ? `Candidate #${candidate.id.slice(-6).toUpperCase()}` : candidate.name;
  const rawEmail = candidate.email || evalData?.email || 'Not Mentioned';
  const displayEmail = isBlindMode 
    ? '••••••••@anonymized.org' 
    : (showFullEmail ? rawEmail : maskEmail(rawEmail));
  const displayPhone = isBlindMode 
    ? '•••-•••-••••' 
    : (candidate.phone || evalData?.phone || 'Not Mentioned');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <User className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight truncate">{displayName}</h2>
                {evalData?.recommendation && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getRecommendationBadge(evalData.recommendation)}`}>
                    {evalData.recommendation}
                  </span>
                )}
                {evalData?.confidenceLevel && (
                  <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    Confidence: <strong className="text-white">{evalData.confidenceLevel}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap font-mono">
                <span className="flex items-center gap-1 text-slate-300">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  {jobDescription?.title || 'Job Position'}
                </span>
                <span className="flex items-center gap-1">
                  • Email: <strong className="text-slate-300">{displayEmail}</strong>
                  {!isBlindMode && rawEmail !== 'Not Mentioned' && (
                    <button
                      onClick={() => setShowFullEmail(!showFullEmail)}
                      className="ml-1 p-0.5 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                      title={showFullEmail ? "Hide email address" : "Show full email address"}
                    >
                      {showFullEmail ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </span>
                <span>• Phone: <strong className="text-slate-300">{displayPhone}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Blind Mode Toggle */}
            <button
              onClick={() => setIsBlindMode(!isBlindMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                isBlindMode 
                  ? 'bg-amber-950/80 border-amber-600 text-amber-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Toggle Blind Review Mode (Anonymizes Personal Info)"
            >
              {isBlindMode ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isBlindMode ? 'Blind Mode Active' : 'Blind Review'}</span>
            </button>

            <button
              onClick={handlePrint}
              title="Print Summary Report"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownloadReport}
              title="Export ATS Report File"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {onDeleteCandidate && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete Candidate"
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/80 border border-rose-900/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HR Pipeline Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-2.5 flex items-center justify-between text-xs overflow-x-auto gap-4">
          <div className="flex items-center gap-2 shrink-0 text-slate-400">
            <span className="font-semibold text-slate-300">HR Recruitment Pipeline:</span>
            {stageUpdatedToast && (
              <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-700 text-[11px] px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1 animate-in fade-in">
                <Check className="w-3 h-3 text-emerald-400" />
                {stageUpdatedToast}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {stages.map((stage) => {
              const isCurrent = candidate.hrStage === stage;
              
              const getStageActiveStyle = (s: HRStage) => {
                switch(s) {
                  case 'New': return 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50 border border-indigo-400';
                  case 'Screened': return 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/50 border border-cyan-400';
                  case 'Phone Screen': return 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/50 border border-blue-400';
                  case 'Shortlisted': return 'bg-amber-600 text-white font-bold shadow-md shadow-amber-900/50 border border-amber-400';
                  case 'Interview': return 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/50 border border-emerald-400';
                  case 'Rejected': return 'bg-rose-600 text-white font-bold shadow-md shadow-rose-900/50 border border-rose-400';
                  default: return 'bg-indigo-600 text-white font-bold';
                }
              };

              return (
                <button
                  key={stage}
                  onClick={() => {
                    onUpdateHRStage(candidate.id, stage);
                    setStageUpdatedToast(`Updated to "${stage}"`);
                    setTimeout(() => setStageUpdatedToast(null), 3000);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    isCurrent
                      ? getStageActiveStyle(stage)
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-700/80 border border-slate-700/60'
                  }`}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Context Banner */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-2 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">Active Stage Info:</span>
            {candidate.hrStage === 'Interview' && (
              <span className="text-emerald-300 flex items-center gap-1.5 font-medium">
                🎤 <strong className="text-white">Interview Stage Active:</strong> Interview scheduling, evaluator scorecard, and candidate meeting brief enabled.
              </span>
            )}
            {candidate.hrStage === 'Phone Screen' && (
              <span className="text-blue-300 flex items-center gap-1.5 font-medium">
                📞 <strong className="text-white">Phone Screen Stage:</strong> Initial recruiter screening active. Phone: <span className="font-mono text-white">{displayPhone}</span>.
              </span>
            )}
            {candidate.hrStage === 'Shortlisted' && (
              <span className="text-amber-300 flex items-center gap-1.5 font-medium">
                ⭐ <strong className="text-white">Shortlisted Stage:</strong> Recommended for hiring manager review ({evalData?.matchScore || 0}% match score).
              </span>
            )}
            {candidate.hrStage === 'Screened' && (
              <span className="text-cyan-300 flex items-center gap-1.5 font-medium">
                🔍 <strong className="text-white">Screened Stage:</strong> AI resume analysis complete. Evaluation details loaded.
              </span>
            )}
            {candidate.hrStage === 'New' && (
              <span className="text-indigo-300 flex items-center gap-1.5 font-medium">
                🆕 <strong className="text-white">New Application:</strong> Candidate profile received and ready for initial review.
              </span>
            )}
            {candidate.hrStage === 'Rejected' && (
              <span className="text-rose-300 flex items-center gap-1.5 font-medium">
                ❌ <strong className="text-white">Rejected Stage:</strong> Candidate archived. Notes and audit logs preserved.
              </span>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-900/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analysis'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Match & Scoring Breakdown
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            Extracted Profile & Skills
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'questions'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            Interview & Scorecard
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'resume'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Source CV Text
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Fairness & Bias Log
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Activity History
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Recruiter Notes {candidate.notes ? '•' : ''}
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'analysis' && evalData && (
            <div className="space-y-6">
              
              {/* Score Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
                
                {/* Score Dial */}
                <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 pr-4">
                  <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-2xl shadow-lg shrink-0 ${getScoreColorClass(evalData.matchScore)}`}>
                    <span>{evalData.matchScore}</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-normal">/ 100</span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Overall Match Fit</span>
                    <p className="text-sm font-bold text-white mt-0.5">{evalData.recommendation}</p>
                    <span className="text-[11px] text-slate-400 block mt-1">Weighted against JD criteria</span>
                  </div>
                </div>

                {/* Sub-scores Progress Bars */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300">Weighted Evaluation Sub-Scores</span>
                    <span className="text-[11px] text-indigo-400 font-mono">100% Objective Criteria</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                      <span className="text-[10px] font-semibold text-slate-400 block truncate">Required (40%)</span>
                      <span className="text-sm font-bold text-indigo-300">{evalData.subScores.requiredSkills}%</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                      <span className="text-[10px] font-semibold text-slate-400 block truncate">Experience (30%)</span>
                      <span className="text-sm font-bold text-cyan-300">{evalData.subScores.relevantExperience}%</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                      <span className="text-[10px] font-semibold text-slate-400 block truncate">Education (10%)</span>
                      <span className="text-sm font-bold text-emerald-300">{evalData.subScores.education}%</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                      <span className="text-[10px] font-semibold text-slate-400 block truncate">Certs (10%)</span>
                      <span className="text-sm font-bold text-purple-300">{evalData.subScores.certifications}%</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-semibold text-slate-400 block truncate">Projects (10%)</span>
                      <span className="text-sm font-bold text-amber-300">{evalData.subScores.projectsAndResponsibilities}%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Summary Box */}
              <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Explainable AI Executive Summary</h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {evalData.summary}
                </p>
              </div>

              {/* Matched vs Missing Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Matched Requirements */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Matched Requirements ({evalData.matchedRequirements.length})</h3>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {evalData.matchedRequirements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-200 bg-slate-900/80 p-2 rounded border border-slate-800">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Requirements */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Skill Gap Analysis & Missing Criteria</h3>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {evalData.missingRequirements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-200 bg-slate-900/80 p-2 rounded border border-slate-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {evalData.missingRequirements.length === 0 && (
                      <li className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                        <Check className="w-3.5 h-3.5" />
                        <span>Candidate meets all required qualifications! No key gaps found.</span>
                      </li>
                    )}
                  </ul>
                </div>

              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Key Candidate Strengths
                  </h3>
                  <ul className="space-y-2 text-xs">
                    {evalData.strengths.map((str, i) => (
                      <li key={i} className="text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Job-Related Probing Points
                  </h3>
                  <ul className="space-y-2 text-xs">
                    {evalData.weaknesses.map((wk, i) => (
                      <li key={i} className="text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 block mb-0.5 font-semibold">Mandatory HR Assistant Disclaimer:</strong>
                  {evalData.disclaimer}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <User className="w-4 h-4 text-indigo-400" />
                  Contact & Identity Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase font-semibold">Full Name</span>
                    <span className="text-slate-200 font-bold text-sm">{displayName}</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase font-semibold">Email Address</span>
                    <span className="text-slate-200 font-bold text-sm flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      {displayEmail}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase font-semibold">Phone Number</span>
                    <span className="text-slate-200 font-bold text-sm flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {displayPhone}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase font-semibold">Total Stated Experience</span>
                    <span className="text-slate-200 font-bold text-sm flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {evalData?.extractedProfile?.yearsExperience || 'Extracted in evaluation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extracted Skills */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Extracted Technical & Functional Skills
                </h3>

                <div className="flex flex-wrap gap-2 pt-1">
                  {evalData?.extractedProfile?.skills && evalData.extractedProfile.skills.length > 0 ? (
                    evalData.extractedProfile.skills.map((sk, i) => (
                      <span key={i} className="bg-slate-900 border border-slate-700 text-indigo-300 text-xs px-3 py-1 rounded-lg font-medium">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Skills extracted from evaluation and resume text.</p>
                  )}
                </div>
              </div>

              {/* Education & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    Education
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {evalData?.extractedProfile?.education && evalData.extractedProfile.education.length > 0 ? (
                      evalData.extractedProfile.education.map((edu, idx) => (
                        <li key={idx} className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          {edu}
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">Refer to source resume.</li>
                    )}
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Certifications
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {evalData?.extractedProfile?.certifications && evalData.extractedProfile.certifications.length > 0 ? (
                      evalData.extractedProfile.certifications.map((cert, idx) => (
                        <li key={idx} className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          {cert}
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">None specified or Not Mentioned.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Interview Scheduler & Logistics Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Interview Schedule & Logistics</h3>
                      <p className="text-xs text-slate-400">Configure interview date, type, meeting links, and calendar invites.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleDownloadCalendarInvite}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .ics Calendar Invite</span>
                    </button>

                    <button
                      onClick={handleCopyInvite}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-300" />}
                      <span>{copiedInvite ? 'Copied Invite!' : 'Copy Meeting Invite'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Interview Round / Type</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Technical Round">Technical Deep-Dive / Coding</option>
                      <option value="Hiring Manager Screening">Hiring Manager Screening</option>
                      <option value="System Design & Architecture">System Design & Architecture</option>
                      <option value="Culture & Team Alignment">Culture & Team Alignment</option>
                      <option value="Executive Final Round">Executive Final Round</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Scheduled Date & Time</label>
                    <input
                      type="datetime-local"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Assigned Interviewer(s)</label>
                    <input
                      type="text"
                      value={interviewers}
                      onChange={(e) => setInterviewers(e.target.value)}
                      placeholder="e.g. Lead Engineer, Engineering VP"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Video Call Link / Location</label>
                    <input
                      type="text"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Status:</span>
                    <select
                      value={interviewStatus}
                      onChange={(e) => setInterviewStatus(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Scheduled">🗓️ Scheduled</option>
                      <option value="In Progress">⏳ In Progress</option>
                      <option value="Completed">✅ Completed</option>
                    </select>
                  </div>

                  <span className="text-slate-400 font-mono text-[11px]">
                    Candidate: <strong className="text-slate-200">{candidate.name}</strong> ({jobDescription?.title || 'Role'})
                  </span>
                </div>
              </div>

              {/* Interview Scorecard & Rubric Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Interviewer Evaluation Scorecard</h3>
                      <p className="text-xs text-slate-400">Rate core competencies and record structured interview feedback.</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs font-mono">
                    <span className="text-slate-400">Scorecard Avg: </span>
                    <strong className="text-indigo-400 text-sm">
                      {(((ratings.technical + ratings.problemSolving + ratings.communication + ratings.cultureFit) / 4)).toFixed(1)} / 5.0
                    </strong>
                  </div>
                </div>

                {/* Rating Dimensions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {[
                    { key: 'technical', label: 'Technical Depth & Stack Mastery', desc: 'Proficiency in required tech stack, code quality, and best practices.' },
                    { key: 'problemSolving', label: 'Problem Solving & System Design', desc: 'Analytical approach, handling edge cases, and architectural reasoning.' },
                    { key: 'communication', label: 'Communication & Articulation', desc: 'Clarity in explaining technical decisions and active listening.' },
                    { key: 'cultureFit', label: 'Culture & Collaboration Alignment', desc: 'Ownership, teamwork, growth mindset, and adaptability.' },
                  ].map((dim) => (
                    <div key={dim.key} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{dim.label}</span>
                        <span className="font-bold text-amber-400 font-mono text-sm">
                          {ratings[dim.key as keyof typeof ratings]} / 5
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{dim.desc}</p>
                      
                      {/* Rating selector buttons 1-5 */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setRatings({ ...ratings, [dim.key]: score })}
                            className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                              ratings[dim.key as keyof typeof ratings] === score
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50 border border-indigo-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                          >
                            {score} ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Decision Selector */}
                <div className="space-y-2 text-xs">
                  <label className="block text-slate-300 font-semibold">Overall Hiring Decision</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { decision: 'Strong Hire', color: 'border-emerald-600 text-emerald-300 bg-emerald-950/60' },
                      { decision: 'Hire', color: 'border-blue-600 text-blue-300 bg-blue-950/60' },
                      { decision: 'Hold', color: 'border-amber-600 text-amber-300 bg-amber-950/60' },
                      { decision: 'Do Not Hire', color: 'border-rose-600 text-rose-300 bg-rose-950/60' },
                    ].map((item) => (
                      <button
                        key={item.decision}
                        type="button"
                        onClick={() => setHiringDecision(item.decision as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          hiringDecision === item.decision
                            ? `${item.color} shadow-md ring-1 ring-white/20`
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {item.decision}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Notes */}
                <div className="space-y-2 text-xs">
                  <label className="block text-slate-300 font-semibold font-sans">Interviewer Detailed Assessment & Notes</label>
                  <textarea
                    rows={3}
                    value={interviewFeedback}
                    onChange={(e) => setInterviewFeedback(e.target.value)}
                    placeholder="Enter observations, key answers, technical strengths, or concerns from the candidate interview..."
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  />
                </div>

                {/* Save Scorecard Button */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleSaveScorecard}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Scorecard to Candidate File</span>
                  </button>

                  {scorecardSaved && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-400" /> Scorecard saved to candidate notes!
                    </span>
                  )}
                </div>
              </div>

              {/* Candidate Quick Brief Card */}
              {evalData && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    Candidate Quick Brief for Interviewers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <strong className="text-emerald-400 block mb-1">Key Strengths to Validate:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {evalData.strengths?.slice(0, 3).map((s, i) => (
                          <li key={i}>{s}</li>
                        )) || <li>Solid background matching job criteria</li>}
                      </ul>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <strong className="text-amber-400 block mb-1">Missing Requirements to Probe:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {evalData.missingRequirements?.slice(0, 3).map((m, i) => (
                          <li key={i}>{m}</li>
                        )) || <li>No major missing requirements detected</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {candidate.resumeText}
            </div>
          )}

          {activeTab === 'audit' && evalData?.fairnessAudit && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">HireLens Fairness Guarantee Enforced</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {evalData.fairnessAudit.auditMessage}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Protected Personal Attributes Filtered Out:</h4>
                <div className="flex flex-wrap gap-2">
                  {evalData.fairnessAudit.protectedAttributesFiltered.map((attr, idx) => (
                    <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {attr} (Excluded)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  Candidate Audit & Activity Timeline
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3 border-l-2 border-indigo-500 pl-4 py-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 -ml-[21px] mt-1" />
                    <div>
                      <span className="font-bold text-slate-200 block">Multimodal CV Processed by Gemini AI</span>
                      <span className="text-slate-400 text-[11px] font-mono">{new Date(candidate.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-l-2 border-slate-700 pl-4 py-1">
                    <div className="w-2 h-2 rounded-full bg-slate-500 -ml-[21px] mt-1" />
                    <div>
                      <span className="font-bold text-slate-200 block">HR Stage Updated: {candidate.hrStage}</span>
                      <span className="text-slate-400 text-[11px] font-mono">Current Stage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Internal Recruiter Notes & Comments
                </label>
                <textarea
                  rows={6}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Add notes from recruiter call, interview feedback, or team comments..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Notes are stored securely in local database.
                </span>
                <button
                  onClick={handleSaveNotes}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {isSavedNotes ? 'Saved!' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            ID: {candidate.id}
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="bg-rose-950/80 p-2.5 rounded-xl border border-rose-800">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Delete Candidate</h3>
                  <p className="text-xs text-slate-400">Are you sure you want to delete this candidate record?</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="font-bold text-white text-sm">{candidate.name}</div>
                <div className="text-xs text-indigo-400 font-mono">{candidate.email}</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onDeleteCandidate) onDeleteCandidate(candidate.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-950"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
