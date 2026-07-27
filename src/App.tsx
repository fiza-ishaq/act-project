import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ScreenCandidateView } from './components/ScreenCandidateView';
import { JobDescriptionsManager } from './components/JobDescriptionsManager';
import { FairnessAuditView } from './components/FairnessAuditView';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { CandidateComparisonModal } from './components/CandidateComparisonModal';
import { AIRecruiterCopilot } from './components/AIRecruiterCopilot';
import { INITIAL_JOB_DESCRIPTIONS, SAMPLE_CANDIDATES } from './data/sampleData';
import { Candidate, JobDescription, HRStage } from './types';

export default function App() {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>(() => {
    const saved = localStorage.getItem('hirelens_job_descriptions');
    return saved ? JSON.parse(saved) : INITIAL_JOB_DESCRIPTIONS;
  });

  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    return jobDescriptions[0]?.id || 'jd-001';
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('hirelens_candidates');
    return saved ? JSON.parse(saved) : SAMPLE_CANDIDATES;
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'screen' | 'job-descriptions' | 'fairness-audit'>('dashboard');
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [candidateModalInitialTab, setCandidateModalInitialTab] = useState<'analysis' | 'profile' | 'questions' | 'resume' | 'audit' | 'timeline' | 'notes'>('analysis');
  const [compareCandidatesList, setCompareCandidatesList] = useState<Candidate[]>([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  const handleOpenCandidateDetail = (
    cand: Candidate,
    initialTab: 'analysis' | 'profile' | 'questions' | 'resume' | 'audit' | 'timeline' | 'notes' = 'analysis'
  ) => {
    setSelectedCandidateDetail(cand);
    setCandidateModalInitialTab(initialTab);
  };

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('hirelens_job_descriptions', JSON.stringify(jobDescriptions));
  }, [jobDescriptions]);

  useEffect(() => {
    localStorage.setItem('hirelens_candidates', JSON.stringify(candidates));
  }, [candidates]);

  const currentJob = jobDescriptions.find(j => j.id === selectedJobId) || jobDescriptions[0];

  // API Call to Express backend for Gemini Resume Evaluation (Multimodal PDF, Images, DOCX, Text)
  const handleScreenResume = async (
    jobId: string, 
    candidateName: string, 
    resumeText: string,
    fileData?: string,
    mimeType?: string,
    customWeights?: {
      requiredSkills: number;
      relevantExperience: number;
      education: number;
      certifications: number;
      projectsAndResponsibilities: number;
    }
  ): Promise<Candidate> => {
    const targetJob = jobDescriptions.find(j => j.id === jobId) || currentJob;

    const res = await fetch('/api/evaluate-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDescription: targetJob,
        resumeText,
        candidateName,
        fileData,
        mimeType,
        customWeights
      })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to evaluate candidate resume.");
    }

    const evaluation = data.evaluation;

    // Fallback regex extraction if evaluation email/phone is missing or "Not Mentioned"
    let extractedEmail = (evaluation.email && evaluation.email !== 'Not Mentioned') ? evaluation.email : undefined;
    let extractedPhone = (evaluation.phone && evaluation.phone !== 'Not Mentioned') ? evaluation.phone : undefined;

    if (!extractedEmail && resumeText) {
      const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) extractedEmail = emailMatch[0];
    }

    if (!extractedPhone && resumeText) {
      const phoneMatch = resumeText.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) extractedPhone = phoneMatch[0];
    }

    const targetName = evaluation.candidateName || candidateName || 'Candidate';

    if (!extractedPhone || extractedPhone === 'Not Mentioned') {
      extractedPhone = undefined;
    }

    const finalEmail = extractedEmail;
    const finalPhone = extractedPhone;

    const newCandidate: Candidate = {
      id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: evaluation.candidateName || candidateName || 'Candidate',
      email: finalEmail,
      phone: finalPhone,
      jobDescriptionId: jobId,
      resumeText: resumeText || `[Multimodal Attachment: ${mimeType || 'Document/Image'}]`,
      evaluation: {
        ...evaluation,
        email: finalEmail,
        phone: finalPhone
      },
      status: 'evaluated',
      createdAt: new Date().toISOString(),
      hrStage: 'New',
      notes: ''
    };

    setCandidates(prev => [newCandidate, ...prev]);
    return newCandidate;
  };

  const handleDeleteCandidate = (candidateId: string) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
    if (selectedCandidateDetail && selectedCandidateDetail.id === candidateId) {
      setSelectedCandidateDetail(null);
    }
  };

  const handleBulkDeleteCandidates = (candidateIds: string[]) => {
    setCandidates(prev => prev.filter(c => !candidateIds.includes(c.id)));
    if (selectedCandidateDetail && candidateIds.includes(selectedCandidateDetail.id)) {
      setSelectedCandidateDetail(null);
    }
  };

  const handleScreenComplete = (newCandidate: Candidate) => {
    setSelectedCandidateDetail(newCandidate);
    setActiveView('dashboard');
  };

  const handleUpdateHRStage = (candidateId: string, stage: HRStage) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, hrStage: stage } : c));
    if (selectedCandidateDetail && selectedCandidateDetail.id === candidateId) {
      setSelectedCandidateDetail(prev => prev ? { ...prev, hrStage: stage } : null);
    }
  };

  const handleSaveNotes = (candidateId: string, notes: string) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, notes } : c));
    if (selectedCandidateDetail && selectedCandidateDetail.id === candidateId) {
      setSelectedCandidateDetail(prev => prev ? { ...prev, notes } : null);
    }
  };

  const handleAddJobDescription = (newJob: JobDescription) => {
    setJobDescriptions(prev => [newJob, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar
        jobDescriptions={jobDescriptions}
        selectedJobId={selectedJobId}
        onSelectJob={(id) => setSelectedJobId(id)}
        activeView={activeView}
        setActiveView={setActiveView}
        candidateCount={candidates.filter(c => c.jobDescriptionId === selectedJobId).length}
        onOpenScreenModal={() => setActiveView('screen')}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && (
          <Dashboard
            candidates={candidates}
            jobDescription={currentJob}
            onSelectCandidate={handleOpenCandidateDetail}
            onOpenScreenModal={() => setActiveView('screen')}
            onCompareCandidates={(list) => setCompareCandidatesList(list)}
            onUpdateHRStage={handleUpdateHRStage}
            onDeleteCandidate={handleDeleteCandidate}
            onBulkDeleteCandidates={handleBulkDeleteCandidates}
          />
        )}

        {activeView === 'screen' && (
          <ScreenCandidateView
            jobDescriptions={jobDescriptions}
            selectedJobId={selectedJobId}
            onScreenResume={handleScreenResume}
            onScreenComplete={handleScreenComplete}
          />
        )}

        {activeView === 'job-descriptions' && (
          <JobDescriptionsManager
            jobDescriptions={jobDescriptions}
            selectedJobId={selectedJobId}
            onSelectJob={(id) => setSelectedJobId(id)}
            onAddJobDescription={handleAddJobDescription}
          />
        )}

        {activeView === 'fairness-audit' && (
          <FairnessAuditView />
        )}
      </main>

      {/* AI Recruiter Assistant Copilot Drawer */}
      <AIRecruiterCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        candidates={candidates.filter(c => c.jobDescriptionId === selectedJobId)}
        jobDescription={currentJob}
        selectedCandidate={selectedCandidateDetail}
      />

      {/* Candidate Detail Drawer / Modal */}
      {selectedCandidateDetail && (
        <CandidateDetailModal
          candidate={selectedCandidateDetail}
          jobDescription={jobDescriptions.find(j => j.id === selectedCandidateDetail.jobDescriptionId)}
          initialTab={candidateModalInitialTab}
          onClose={() => setSelectedCandidateDetail(null)}
          onUpdateHRStage={handleUpdateHRStage}
          onSaveNotes={handleSaveNotes}
          onDeleteCandidate={handleDeleteCandidate}
        />
      )}

      {/* Candidate Comparison Matrix Modal */}
      {compareCandidatesList.length > 0 && (
        <CandidateComparisonModal
          candidates={compareCandidatesList}
          jobDescription={currentJob}
          onClose={() => setCompareCandidatesList([])}
          onSelectCandidate={(cand) => {
            setCompareCandidatesList([]);
            setSelectedCandidateDetail(cand);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            HireLens AI – Objective HR Resume Screening Assistant
          </span>
          <span className="text-slate-600">
            Intended to assist human recruiters. Not a automated hiring decision tool.
          </span>
        </div>
      </footer>

    </div>
  );
}
