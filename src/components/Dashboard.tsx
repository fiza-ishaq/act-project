import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Columns, 
  ChevronRight, 
  Briefcase, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpDown, 
  Download,
  Plus,
  BarChart3,
  CheckSquare,
  Square,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Trash2,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar 
} from 'recharts';
import { Candidate, JobDescription, HRStage, MatchRecommendation } from '../types';

interface DashboardProps {
  candidates: Candidate[];
  jobDescription?: JobDescription;
  onSelectCandidate: (candidate: Candidate, initialTab?: 'analysis' | 'profile' | 'questions' | 'resume' | 'audit' | 'timeline' | 'notes') => void;
  onOpenScreenModal: () => void;
  onCompareCandidates: (selectedCandidates: Candidate[]) => void;
  onUpdateHRStage?: (candidateId: string, stage: HRStage) => void;
  onDeleteCandidate?: (id: string) => void;
  onBulkDeleteCandidates?: (ids: string[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  candidates,
  jobDescription,
  onSelectCandidate,
  onOpenScreenModal,
  onCompareCandidates,
  onUpdateHRStage,
  onDeleteCandidate,
  onBulkDeleteCandidates,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'kanban'>('table');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState<boolean>(true);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState<boolean>(false);
  const [showFullEmails, setShowFullEmails] = useState<boolean>(false);

  const maskEmail = (emailStr?: string) => {
    if (!emailStr || emailStr === 'Not Mentioned' || emailStr.includes('Anonymized')) return emailStr || '';
    const parts = emailStr.split('@');
    if (parts.length < 2) return emailStr;
    const user = parts[0];
    const domain = parts[1];
    if (user.length <= 2) return `${user}***@${domain}`;
    return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
  };

  // Filter candidates for the selected job description
  const jobCandidates = useMemo(() => {
    if (!jobDescription) return candidates;
    return candidates.filter(c => c.jobDescriptionId === jobDescription.id);
  }, [candidates, jobDescription]);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = jobCandidates.length;
    const strong = jobCandidates.filter(c => c.evaluation?.recommendation === 'Strong Match').length;
    const partial = jobCandidates.filter(c => c.evaluation?.recommendation === 'Partial Match').length;
    const weak = jobCandidates.filter(c => c.evaluation?.recommendation === 'Weak Match').length;
    const avgScore = total > 0
      ? Math.round(jobCandidates.reduce((acc, c) => acc + (c.evaluation?.matchScore || 0), 0) / total)
      : 0;

    return { total, strong, partial, weak, avgScore };
  }, [jobCandidates]);

  // Recharts Chart Data
  const scoreDistributionData = useMemo(() => {
    const bands = [
      { name: '90-100%', count: 0, color: '#10b981' },
      { name: '75-89%', count: 0, color: '#06b6d4' },
      { name: '60-74%', count: 0, color: '#f59e0b' },
      { name: '< 60%', count: 0, color: '#f43f5e' }
    ];

    jobCandidates.forEach(c => {
      const score = c.evaluation?.matchScore || 0;
      if (score >= 90) bands[0].count++;
      else if (score >= 75) bands[1].count++;
      else if (score >= 60) bands[2].count++;
      else bands[3].count++;
    });

    return bands;
  }, [jobCandidates]);

  const subScoresAvgData = useMemo(() => {
    if (jobCandidates.length === 0) return [];
    const sum = jobCandidates.reduce((acc, c) => {
      const sub = c.evaluation?.subScores;
      return {
        requiredSkills: acc.requiredSkills + (sub?.requiredSkills || 0),
        relevantExperience: acc.relevantExperience + (sub?.relevantExperience || 0),
        education: acc.education + (sub?.education || 0),
        certifications: acc.certifications + (sub?.certifications || 0),
        projects: acc.projects + (sub?.projectsAndResponsibilities || 0),
      };
    }, { requiredSkills: 0, relevantExperience: 0, education: 0, certifications: 0, projects: 0 });

    const count = jobCandidates.length;
    return [
      { criterion: 'Required Skills (40%)', score: Math.round(sum.requiredSkills / count) },
      { criterion: 'Experience (30%)', score: Math.round(sum.relevantExperience / count) },
      { criterion: 'Education (10%)', score: Math.round(sum.education / count) },
      { criterion: 'Certifications (10%)', score: Math.round(sum.certifications / count) },
      { criterion: 'Projects (10%)', score: Math.round(sum.projects / count) },
    ];
  }, [jobCandidates]);

  // Filter & Sort Candidates
  const filteredCandidates = useMemo(() => {
    return jobCandidates.filter(candidate => {
      const score = candidate.evaluation?.matchScore || 0;
      if (score < minScoreFilter) return false;

      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.email && candidate.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        candidate.resumeText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.evaluation?.strengths.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        false;

      const matchesRecommendation = 
        recommendationFilter === 'All' || candidate.evaluation?.recommendation === recommendationFilter;

      const matchesStage = 
        stageFilter === 'All' || candidate.hrStage === stageFilter;

      return matchesSearch && matchesRecommendation && matchesStage;
    }).sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = a.evaluation?.matchScore || 0;
        const scoreB = b.evaluation?.matchScore || 0;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });
  }, [jobCandidates, searchQuery, recommendationFilter, stageFilter, minScoreFilter, sortBy, sortOrder]);

  // Handle multi-select
  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidateIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCandidateIds.length === filteredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredCandidates.map(c => c.id));
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ["Candidate Name", "Email", "Phone", "Match Score", "Recommendation", "Confidence", "HR Stage", "Required Skills Score", "Experience Score", "Strengths"];
    const rows = filteredCandidates.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.email || c.evaluation?.email || 'Not Mentioned').replace(/"/g, '""')}"`,
      `"${(c.phone || c.evaluation?.phone || 'Not Mentioned').replace(/"/g, '""')}"`,
      c.evaluation?.matchScore || 0,
      `"${(c.evaluation?.recommendation || '').replace(/"/g, '""')}"`,
      `"${(c.evaluation?.confidenceLevel || '').replace(/"/g, '""')}"`,
      `"${(c.hrStage || 'New').replace(/"/g, '""')}"`,
      c.evaluation?.subScores.requiredSkills || 0,
      c.evaluation?.subScores.relevantExperience || 0,
      `"${(c.evaluation?.strengths || []).join('; ').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HireLens_Candidates_${jobDescription?.id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCompareClick = () => {
    const selectedObj = candidates.filter(c => selectedCandidateIds.includes(c.id));
    onCompareCandidates(selectedObj);
  };

  const getRecommendationBadge = (recommendation?: MatchRecommendation) => {
    switch (recommendation) {
      case 'Strong Match':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'Partial Match':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'Weak Match':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Position Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 rounded-full">
              Active Job Opening
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {jobDescription?.id}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {jobDescription?.title || 'All Job Position Screening'}
          </h1>

          <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
            <span>Dept: <strong className="text-slate-300">{jobDescription?.department}</strong></span>
            <span>• Location: <strong className="text-slate-300">{jobDescription?.location}</strong></span>
            <span>• Experience Required: <strong className="text-slate-300">{jobDescription?.experienceRequired}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>{showAnalyticsPanel ? 'Hide Analytics' : 'Show Analytics'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenScreenModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Screen Candidate</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Evaluated</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{metrics.total}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Candidates screened</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Strong Matches</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.strong}</p>
          <span className="text-[11px] text-emerald-500/80 mt-0.5 block">Top fit candidates</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Partial Matches</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-1">{metrics.partial}</p>
          <span className="text-[11px] text-amber-500/80 mt-0.5 block">Review required gaps</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Weak Matches</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-1">{metrics.weak}</p>
          <span className="text-[11px] text-rose-500/80 mt-0.5 block">Below required bar</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Match</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-300 mt-1">{metrics.avgScore}%</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Across pool</span>
        </div>

      </div>

      {/* Analytics Visual Charts Section (Recharts) */}
      {showAnalyticsPanel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Match Score Distribution BarChart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Score Distribution Breakdown
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Total: {jobCandidates.length}</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {scoreDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sub-scores Radar / Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Pool Average Criteria Sub-Scores
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Weighted Criteria</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subScoresAvgData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="criterion" type="category" stroke="#94a3b8" fontSize={10} width={130} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Control Toolbar: Search, Filters, View Mode */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, email, skills, or resume term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Dropdowns & Score Slider */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            
            {/* Match Recommendation Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Match:</span>
              <select
                value={recommendationFilter}
                onChange={(e) => setRecommendationFilter(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Matches</option>
                <option value="Strong Match" className="bg-slate-900">Strong Match</option>
                <option value="Partial Match" className="bg-slate-900">Partial Match</option>
                <option value="Weak Match" className="bg-slate-900">Weak Match</option>
              </select>
            </div>

            {/* HR Stage Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 font-medium">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Stages</option>
                <option value="New" className="bg-slate-900">New</option>
                <option value="Screened" className="bg-slate-900">Screened</option>
                <option value="Phone Screen" className="bg-slate-900">Phone Screen</option>
                <option value="Shortlisted" className="bg-slate-900">Shortlisted</option>
                <option value="Interview" className="bg-slate-900">Interview</option>
                <option value="Rejected" className="bg-slate-900">Rejected</option>
              </select>
            </div>

            {/* Min Score Cutoff */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 font-medium">Min Score:</span>
              <select
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer font-mono"
              >
                <option value={0} className="bg-slate-900">0%+</option>
                <option value={60} className="bg-slate-900">60%+</option>
                <option value={75} className="bg-slate-900">75%+</option>
                <option value={90} className="bg-slate-900">90%+</option>
              </select>
            </div>

            {/* Sorting */}
            <button
              onClick={() => {
                if (sortBy === 'score') setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                else setSortBy('score');
              }}
              className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Score {sortBy === 'score' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Cards Grid View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Selected Action Bar */}
        {selectedCandidateIds.length > 0 && (
          <div className="bg-indigo-950/80 border border-indigo-800/80 rounded-xl p-3 flex items-center justify-between text-xs animate-in fade-in">
            <span className="text-indigo-200 font-semibold">
              {selectedCandidateIds.length} candidate(s) selected
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCompareClick}
                disabled={selectedCandidateIds.length < 2}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCandidateIds.length >= 2
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Side-by-Side Compare ({selectedCandidateIds.length})</span>
              </button>

              {onBulkDeleteCandidates && (
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedCandidateIds.length})</span>
                </button>
              )}

              <button
                onClick={() => setSelectedCandidateIds([])}
                className="text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="p-3.5 w-10 text-center">
                    <button onClick={toggleSelectAll} className="cursor-pointer text-slate-400 hover:text-white">
                      {selectedCandidateIds.length === filteredCandidates.length && filteredCandidates.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Candidate Name</th>
                  <th className="p-3.5 text-center">Match Score</th>
                  <th className="p-3.5">Recommendation</th>
                  <th className="p-3.5 hidden md:table-cell">Required Skills (40%)</th>
                  <th className="p-3.5 hidden lg:table-cell">Key Strength</th>
                  <th className="p-3.5">HR Stage</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filteredCandidates.map((candidate) => {
                  const evalData = candidate.evaluation;
                  const isSelected = selectedCandidateIds.includes(candidate.id);

                  return (
                    <tr 
                      key={candidate.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-indigo-950/30' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <button onClick={() => toggleSelectCandidate(candidate.id)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => onSelectCandidate(candidate, 'resume')}
                          className="font-bold text-white hover:text-indigo-400 text-sm transition-colors text-left flex items-center gap-1.5 cursor-pointer group"
                          title="Click name to view candidate's CV / Resume"
                        >
                          <span>{candidate.name}</span>
                          <span className="text-[10px] bg-slate-800 text-indigo-300 border border-slate-700/80 px-1.5 py-0.5 rounded font-normal opacity-80 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                            <FileText className="w-3 h-3 text-indigo-400" />
                            View CV
                          </span>
                        </button>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-base">
                          <span className={
                            (evalData?.matchScore || 0) >= 85 ? 'text-emerald-400' :
                            (evalData?.matchScore || 0) >= 65 ? 'text-amber-400' : 'text-rose-400'
                          }>
                            {evalData?.matchScore || 0}%
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {evalData?.recommendation ? (
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getRecommendationBadge(evalData.recommendation)}`}>
                            {evalData.recommendation}
                          </span>
                        ) : (
                          <span className="text-slate-500">Pending</span>
                        )}
                      </td>

                      <td className="p-3.5 hidden md:table-cell">
                        <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${evalData?.subScores.requiredSkills || 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          {evalData?.subScores.requiredSkills || 0}% match
                        </span>
                      </td>

                      <td className="p-3.5 hidden lg:table-cell max-w-xs truncate text-slate-300">
                        {evalData?.strengths?.[0] || 'N/A'}
                      </td>

                      <td className="p-3.5">
                        {onUpdateHRStage ? (
                          <select
                            value={candidate.hrStage || 'New'}
                            onChange={(e) => {
                              const newStage = e.target.value as HRStage;
                              onUpdateHRStage(candidate.id, newStage);
                            }}
                            className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold px-2 py-1 rounded-lg cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors"
                          >
                            <option value="New" className="bg-slate-900">New</option>
                            <option value="Screened" className="bg-slate-900">Screened</option>
                            <option value="Phone Screen" className="bg-slate-900">Phone Screen</option>
                            <option value="Shortlisted" className="bg-slate-900">Shortlisted</option>
                            <option value="Interview" className="bg-slate-900">Interview</option>
                            <option value="Rejected" className="bg-slate-900">Rejected</option>
                          </select>
                        ) : (
                          <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium">
                            {candidate.hrStage || 'New'}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectCandidate(candidate)}
                            className="bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteCandidate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCandidateToDelete(candidate);
                              }}
                              title="Delete candidate"
                              className="bg-slate-950 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-800/80 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-300">No candidates match your current filter query.</p>
                      <p className="text-xs text-slate-500 mt-1">Try broadening your search query or lowering the cutoff.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CARDS GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((candidate) => {
            const evalData = candidate.evaluation;
            const isSelected = selectedCandidateIds.includes(candidate.id);

            return (
              <div
                key={candidate.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:border-slate-700 ${
                  isSelected ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <button
                        onClick={() => onSelectCandidate(candidate, 'resume')}
                        className="font-bold text-white text-base hover:text-indigo-400 transition-colors text-left flex items-center gap-2 cursor-pointer group"
                        title="Click name to view candidate's CV / Resume"
                      >
                        <span>{candidate.name}</span>
                        <span className="text-[10px] bg-slate-800 text-indigo-300 border border-slate-700/80 px-1.5 py-0.5 rounded font-normal opacity-80 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                          <FileText className="w-3 h-3 text-indigo-400" />
                          CV
                        </span>
                      </button>
                    </div>

                    <div className="text-right">
                      <span className={`text-2xl font-bold font-mono ${
                        (evalData?.matchScore || 0) >= 85 ? 'text-emerald-400' :
                        (evalData?.matchScore || 0) >= 65 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {evalData?.matchScore || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Recommendation Badge */}
                  <div className="mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getRecommendationBadge(evalData?.recommendation)}`}>
                      {evalData?.recommendation || 'Pending'}
                    </span>
                  </div>

                  {/* Key Summary */}
                  <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                    {evalData?.summary || 'Evaluation summary pending.'}
                  </p>

                  {/* Sub-score Mini Bars */}
                  <div className="space-y-1.5 text-[11px] mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>Required Skills (40%):</span>
                      <span className="font-mono text-indigo-300 font-bold">{evalData?.subScores.requiredSkills}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Experience (30%):</span>
                      <span className="font-mono text-cyan-300 font-bold">{evalData?.subScores.relevantExperience}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => toggleSelectCandidate(candidate.id)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4" />}
                    <span>Select</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {onDeleteCandidate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCandidateToDelete(candidate);
                        }}
                        title="Delete candidate"
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg border border-slate-800 hover:border-rose-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onSelectCandidate(candidate)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Analysis</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 3: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Column 1: Strong Match */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Strong Matches
              </span>
              <span className="bg-emerald-950 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-mono border border-emerald-800">
                {filteredCandidates.filter(c => c.evaluation?.recommendation === 'Strong Match').length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredCandidates.filter(c => c.evaluation?.recommendation === 'Strong Match').map(candidate => (
                <div
                  key={candidate.id}
                  onClick={() => onSelectCandidate(candidate, 'resume')}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 shadow-md cursor-pointer transition-all hover:translate-y-[-2px]"
                  title="Click to view candidate CV and resume text"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5 hover:text-indigo-400">
                      <span>{candidate.name}</span>
                      <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    </h4>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{candidate.evaluation?.matchScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{candidate.evaluation?.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Partial Match */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Partial Matches
              </span>
              <span className="bg-amber-950 text-amber-300 text-xs px-2 py-0.5 rounded-full font-mono border border-amber-800">
                {filteredCandidates.filter(c => c.evaluation?.recommendation === 'Partial Match').length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredCandidates.filter(c => c.evaluation?.recommendation === 'Partial Match').map(candidate => (
                <div
                  key={candidate.id}
                  onClick={() => onSelectCandidate(candidate, 'resume')}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 shadow-md cursor-pointer transition-all hover:translate-y-[-2px]"
                  title="Click to view candidate CV and resume text"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5 hover:text-indigo-400">
                      <span>{candidate.name}</span>
                      <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    </h4>
                    <span className="text-amber-400 font-mono font-bold text-sm">{candidate.evaluation?.matchScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{candidate.evaluation?.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Weak Match */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Weak Matches
              </span>
              <span className="bg-rose-950 text-rose-300 text-xs px-2 py-0.5 rounded-full font-mono border border-rose-800">
                {filteredCandidates.filter(c => c.evaluation?.recommendation === 'Weak Match').length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredCandidates.filter(c => c.evaluation?.recommendation === 'Weak Match').map(candidate => (
                <div
                  key={candidate.id}
                  onClick={() => onSelectCandidate(candidate, 'resume')}
                  className="bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-xl p-3 shadow-md cursor-pointer transition-all hover:translate-y-[-2px]"
                  title="Click to view candidate CV and resume text"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5 hover:text-indigo-400">
                      <span>{candidate.name}</span>
                      <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    </h4>
                    <span className="text-rose-400 font-mono font-bold text-sm">{candidate.evaluation?.matchScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{candidate.evaluation?.summary}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Single Candidate Delete Modal Overlay */}
      {candidateToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="bg-rose-950/80 p-2.5 rounded-xl border border-rose-800">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Delete Candidate</h3>
                <p className="text-xs text-slate-400">This action will remove the candidate record permanently.</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
              <div className="font-bold text-white text-sm">{candidateToDelete.name}</div>
              <div className="text-xs text-indigo-400 font-mono mt-0.5">{candidateToDelete.email}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCandidateToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteCandidate) onDeleteCandidate(candidateToDelete.id);
                  setCandidateToDelete(null);
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

      {/* Bulk Delete Modal Overlay */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="bg-rose-950/80 p-2.5 rounded-xl border border-rose-800">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Delete Selected Candidates</h3>
                <p className="text-xs text-slate-400">Are you sure you want to remove {selectedCandidateIds.length} candidate(s)?</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onBulkDeleteCandidates) onBulkDeleteCandidates(selectedCandidateIds);
                  setSelectedCandidateIds([]);
                  setShowBulkDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All {selectedCandidateIds.length} Candidates</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
