import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Briefcase, 
  Award, 
  FileText, 
  Users, 
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { JobDescription } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  jobDescriptions: JobDescription[];
  selectedJobId: string;
  onSelectJob: (id: string) => void;
  activeView: 'dashboard' | 'screen' | 'job-descriptions' | 'fairness-audit';
  setActiveView: (view: 'dashboard' | 'screen' | 'job-descriptions' | 'fairness-audit') => void;
  candidateCount: number;
  onOpenScreenModal: () => void;
  onOpenCopilot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  jobDescriptions,
  selectedJobId,
  onSelectJob,
  activeView,
  setActiveView,
  candidateCount,
  onOpenScreenModal,
  onOpenCopilot,
}) => {
  const { theme, toggleTheme } = useTheme();
  const currentJob = jobDescriptions.find(j => j.id === selectedJobId) || jobDescriptions[0];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 dark:bg-slate-900 border-b border-slate-800 dark:border-slate-800 text-slate-100 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">HireLens AI</span>
                <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" /> Fair HR Screening
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Explainable Candidate Matching & Multimodal Resume Screening
              </p>
            </div>
          </div>

          {/* Active Job Description Selector */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 hover:border-slate-600 transition-colors">
            <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="text-left">
              <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Target Position</span>
              <div className="relative group">
                <select
                  value={selectedJobId}
                  onChange={(e) => onSelectJob(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-100 pr-6 focus:outline-none cursor-pointer appearance-none truncate max-w-[220px]"
                >
                  {jobDescriptions.map((job) => (
                    <option key={job.id} value={job.id} className="bg-slate-900 text-slate-200">
                      {job.title} ({job.department})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action CTAs, Copilot & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Copilot Sidebar Button */}
            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                className="bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/80 font-medium text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Open AI Recruiter Assistant Copilot"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                <span className="hidden sm:inline">AI Copilot</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Bright Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-semibold text-slate-200 hidden sm:inline">Bright Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-semibold text-slate-200 hidden sm:inline">Dark Theme</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenScreenModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Screen CV</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
          <nav className="flex space-x-1 sm:space-x-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeView === 'dashboard'
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Candidate Pool</span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {candidateCount}
              </span>
            </button>

            <button
              onClick={() => setActiveView('screen')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeView === 'screen'
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Screen & Evaluate</span>
            </button>

            <button
              onClick={() => setActiveView('job-descriptions')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeView === 'job-descriptions'
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Job Requirements</span>
            </button>

            <button
              onClick={() => setActiveView('fairness-audit')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeView === 'fairness-audit'
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Fairness & Audit Guide</span>
              <span className="hidden sm:inline-block bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded border border-emerald-800">
                100% Objective
              </span>
            </button>
          </nav>

          <div className="md:hidden py-1">
            <select
              value={selectedJobId}
              onChange={(e) => onSelectJob(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 max-w-[140px] truncate focus:outline-none"
            >
              {jobDescriptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

