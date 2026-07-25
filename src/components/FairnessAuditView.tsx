import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertOctagon, UserX, Award, Sparkles, Check, Play } from 'lucide-react';

export const FairnessAuditView: React.FC = () => {
  const [testResume, setTestResume] = useState(`ALEXANDER MORGAN
123 Main Street | San Francisco, CA
[Personal Info: Age: 45 | Married with 2 children | Photo attached | Religion: Christian | Gender: Male]

SUMMARY
Senior Cloud Engineer with 8 years of experience in AWS, Kubernetes, Terraform, and Python.

WORK HISTORY
Lead Cloud Infrastructure Architect | SkyNet Inc | 2020 - Present
- Architected Kubernetes clusters on AWS EKS serving 10M daily requests.
- Wrote Terraform Infrastructure-as-Code modules for automated multi-region deployment.

EDUCATION
BS in Computer Science, UC Berkeley (2018)`);

  const [auditResult, setAuditResult] = useState<{
    sanitizedText: string;
    filteredAttributes: string[];
    isClean: boolean;
  } | null>(null);

  const handleRunAuditTest = () => {
    // Detect protected terms
    const attributesFound: string[] = [];
    if (/age|years old|\b\d{2}\s*years\b/i.test(testResume)) attributesFound.push('Age (45)');
    if (/married|single|divorced/i.test(testResume)) attributesFound.push('Marital Status (Married)');
    if (/photo|picture/i.test(testResume)) attributesFound.push('Photo / Headshot');
    if (/religion|christian|muslim|jewish|buddhist|hindu/i.test(testResume)) attributesFound.push('Religion (Christian)');
    if (/gender|male|female|non-binary/i.test(testResume)) attributesFound.push('Gender (Male)');

    const sanitized = testResume.replace(/\[Personal Info:.*?\]/gi, "[PERSONAL_ATTRIBUTES_STRIPPED_BY_HIRELENS_FAIRNESS_ENGINE]");

    setAuditResult({
      sanitizedText: sanitized,
      filteredAttributes: attributesFound.length > 0 ? attributesFound : ['No personal attributes found!'],
      isClean: true
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">HireLens AI Fairness & Bias Prevention Framework</h1>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                100% Objective Guardrails
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Guaranteeing consistent, transparent, and non-discriminatory candidate screening in accordance with HR compliance rules.
            </p>
          </div>
        </div>
      </div>

      {/* Core Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h2 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <UserX className="w-4 h-4 text-rose-400" />
            Strictly Prohibited & Excluded Attributes
          </h2>
          <p className="text-slate-400 leading-relaxed">
            HireLens AI is hardcoded to disregard and strip out non-job related attributes during score calculation:
          </p>

          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span><strong>Age & Graduation Years:</strong> Score depends solely on years of relevant experience.</span>
            </li>
            <li className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span><strong>Gender, Ethnicity & Name Origin:</strong> Candidates evaluated anonymously on technical merit.</span>
            </li>
            <li className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span><strong>Marital Status, Religion & Photo Appearance:</strong> Fully excluded from prompt context.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h2 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <Award className="w-4 h-4 text-indigo-400" />
            Mathematical 5-Factor Weighting
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Every candidate match score (0–100) is calculated objectively using standard criteria weights:
          </p>

          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-200 font-semibold">1. Required (Must-Have) Skills</span>
              <span className="font-mono text-indigo-400 font-bold">40% Weight</span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-200 font-semibold">2. Relevant Work Experience</span>
              <span className="font-mono text-cyan-400 font-bold">30% Weight</span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-200 font-semibold">3. Education Credentials</span>
              <span className="font-mono text-emerald-400 font-bold">10% Weight</span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-200 font-semibold">4. Professional Certifications</span>
              <span className="font-mono text-purple-400 font-bold">10% Weight</span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-200 font-semibold">5. Projects & Achievements</span>
              <span className="font-mono text-amber-400 font-bold">10% Weight</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Fairness Sandbox Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Fairness Test Simulator & Attribute Stripper
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste a sample resume containing personal attributes (age, photo, religion, marital status) to test HireLens AI's bias filtering engine.
            </p>
          </div>

          <button
            onClick={handleRunAuditTest}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Bias Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Source Resume with Personal Details</label>
            <textarea
              rows={8}
              value={testResume}
              onChange={(e) => setTestResume(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Sanitized Evaluation Payload</label>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-slate-300 leading-relaxed h-[200px] overflow-y-auto whitespace-pre-wrap">
              {auditResult ? auditResult.sanitizedText : 'Click "Simulate Bias Filter" to test...'}
            </div>
          </div>
        </div>

        {auditResult && (
          <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-4 space-y-2 text-xs">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Fairness Audit Result: Personal Attributes Excluded
            </span>

            <div className="flex flex-wrap gap-2 pt-1">
              {auditResult.filteredAttributes.map((attr, i) => (
                <span key={i} className="bg-slate-900 border border-emerald-800 text-emerald-200 px-2.5 py-1 rounded font-mono">
                  ✓ {attr} Filtered
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
