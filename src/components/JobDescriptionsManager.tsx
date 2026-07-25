import React, { useState } from 'react';
import { Briefcase, Plus, FileText, Check, Trash2, Edit, Award, Sparkles } from 'lucide-react';
import { JobDescription } from '../types';

interface JobDescriptionsManagerProps {
  jobDescriptions: JobDescription[];
  selectedJobId: string;
  onSelectJob: (id: string) => void;
  onAddJobDescription: (job: JobDescription) => void;
}

export const JobDescriptionsManager: React.FC<JobDescriptionsManagerProps> = ({
  jobDescriptions,
  selectedJobId,
  onSelectJob,
  onAddJobDescription,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState('Full-time');
  const [experienceRequired, setExperienceRequired] = useState('3+ years');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [niceToHaveInput, setNiceToHaveInput] = useState('');
  const [descriptionText, setDescriptionText] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !requiredSkillsInput.trim()) return;

    const newJob: JobDescription = {
      id: `jd-custom-${Date.now()}`,
      title,
      department,
      location,
      type,
      experienceRequired,
      requiredSkills: requiredSkillsInput.split('\n').filter(s => s.trim().length > 0),
      niceToHaveSkills: niceToHaveInput.split('\n').filter(s => s.trim().length > 0),
      toolsAndTech: ['React', 'TypeScript', 'Node.js', 'SQL'],
      educationRequired: ['Bachelor’s degree in related field or equivalent experience'],
      certificationsRequired: ['Industry relevant certification (Preferred)'],
      descriptionText: descriptionText || title,
      updatedAt: new Date().toISOString()
    };

    onAddJobDescription(newJob);
    onSelectJob(newJob.id);
    setIsAdding(false);
    
    // Reset
    setTitle('');
    setRequiredSkillsInput('');
    setNiceToHaveInput('');
    setDescriptionText('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Job Requirements Directory</h1>
            <p className="text-xs text-slate-400">
              Manage job descriptions, required must-haves, and weighted screening criteria.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Create Job Description'}</span>
        </button>
      </div>

      {/* Add New Job Form */}
      {isAdding && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Add New Job Opening
          </h2>

          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior Full Stack Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g., Engineering / Marketing"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location & Work Type</label>
                <input
                  type="text"
                  placeholder="e.g., Remote (US) / Hybrid NYC"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Required Experience</label>
                <input
                  type="text"
                  placeholder="e.g., 5+ years of full stack web engineering"
                  value={experienceRequired}
                  onChange={(e) => setExperienceRequired(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Required (Must-Have) Skills (40% Weighting) — One per line *
              </label>
              <textarea
                rows={4}
                required
                placeholder="5+ years experience in React and TypeScript&#10;Backend API development with Node.js & Express&#10;Database design with PostgreSQL"
                value={requiredSkillsInput}
                onChange={(e) => setRequiredSkillsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nice-to-Have Requirements (Optional) — One per line
              </label>
              <textarea
                rows={3}
                placeholder="Docker & Kubernetes containerization&#10;AWS Cloud certification"
                value={niceToHaveInput}
                onChange={(e) => setNiceToHaveInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Job Opening</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Job Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobDescriptions.map((job) => {
          const isSelected = job.id === selectedJobId;

          return (
            <div
              key={job.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-950/20' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-full">
                      {job.department}
                    </span>
                    <h3 className="font-bold text-white text-base mt-1">{job.title}</h3>
                    <span className="text-xs text-slate-400">{job.location} • {job.type}</span>
                  </div>

                  {isSelected && (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Active Target
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs mb-4">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Required Skills (40% Weight):</span>
                    <ul className="space-y-1 text-slate-300">
                      {job.requiredSkills.map((req, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {job.niceToHaveSkills.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Nice-to-Have Skills:</span>
                      <ul className="space-y-1 text-slate-400">
                        {job.niceToHaveSkills.map((nice, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                            <span>{nice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Exp: {job.experienceRequired}
                </span>

                <button
                  onClick={() => onSelectJob(job.id)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isSelected ? 'Active Target Position' : 'Set as Screening Target'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
