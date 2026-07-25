import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Users, Award, Briefcase, FileText } from 'lucide-react';
import { Candidate, JobDescription } from '../types';

interface CandidateComparisonModalProps {
  candidates: Candidate[];
  jobDescription?: JobDescription;
  onClose: () => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  candidates,
  jobDescription,
  onClose,
  onSelectCandidate,
}) => {
  if (candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Side-by-Side Candidate Matrix</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparing {candidates.length} candidates against target position: <strong className="text-slate-200">{jobDescription?.title}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Grid Content */}
        <div className="p-5 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-44">Criteria</th>
                {candidates.map((cand) => (
                  <th key={cand.id} className="p-3 text-sm font-bold text-white border-l border-slate-800 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{cand.name}</span>
                      <button
                        onClick={() => onSelectCandidate(cand)}
                        className="text-[10px] text-indigo-400 hover:underline font-normal cursor-pointer"
                      >
                        View Full
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              
              {/* Overall Score */}
              <tr>
                <td className="p-3 font-semibold text-slate-300">Overall Match Score</td>
                {candidates.map((cand) => {
                  const score = cand.evaluation?.matchScore || 0;
                  return (
                    <td key={cand.id} className="p-3 border-l border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold font-mono ${
                          score >= 85 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {score}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({cand.evaluation?.recommendation})</span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Confidence */}
              <tr>
                <td className="p-3 font-semibold text-slate-300">Confidence Level</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="p-3 border-l border-slate-800 font-mono text-slate-300">
                    {cand.evaluation?.confidenceLevel || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Required Skills (40%) */}
              <tr className="bg-slate-950/30">
                <td className="p-3 font-semibold text-slate-300">Required Skills (40%)</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="p-3 border-l border-slate-800 font-bold text-indigo-300">
                    {cand.evaluation?.subScores.requiredSkills}%
                  </td>
                ))}
              </tr>

              {/* Experience (30%) */}
              <tr>
                <td className="p-3 font-semibold text-slate-300">Relevant Experience (30%)</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="p-3 border-l border-slate-800 font-bold text-cyan-300">
                    {cand.evaluation?.subScores.relevantExperience}%
                  </td>
                ))}
              </tr>

              {/* Education (10%) */}
              <tr className="bg-slate-950/30">
                <td className="p-3 font-semibold text-slate-300">Education (10%)</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="p-3 border-l border-slate-800 font-bold text-emerald-300">
                    {cand.evaluation?.subScores.education}%
                  </td>
                ))}
              </tr>

              {/* Certifications (10%) */}
              <tr>
                <td className="p-3 font-semibold text-slate-300">Certifications (10%)</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="p-3 border-l border-slate-800 font-bold text-purple-300">
                    {cand.evaluation?.subScores.certifications}%
                  </td>
                ))}
              </tr>

              {/* Key Strengths */}
              <tr className="bg-slate-950/30">
                <td className="p-3 font-semibold text-slate-300">Key Strengths</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="p-3 border-l border-slate-800 align-top">
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {cand.evaluation?.strengths.slice(0, 3).map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Missing Gaps */}
              <tr>
                <td className="p-3 font-semibold text-slate-300">Missing Requirements</td>
                {candidates.map((cand) => (
                  <td key={cand.id} className="p-3 border-l border-slate-800 align-top">
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {cand.evaluation?.missingRequirements.slice(0, 3).map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-amber-300">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{gap}</span>
                        </li>
                      ))}
                      {(!cand.evaluation?.missingRequirements || cand.evaluation.missingRequirements.length === 0) && (
                        <span className="text-emerald-400 text-[11px]">None missing!</span>
                      )}
                    </ul>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
