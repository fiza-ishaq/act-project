import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  Loader2, 
  MessageSquare, 
  Zap, 
  Mail, 
  Users, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Candidate, JobDescription } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIRecruiterCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  jobDescription?: JobDescription;
  selectedCandidate?: Candidate | null;
}

export const AIRecruiterCopilot: React.FC<AIRecruiterCopilotProps> = ({
  isOpen,
  onClose,
  candidates,
  jobDescription,
  selectedCandidate,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm **HireLens Copilot**, your AI Recruiter Assistant.

I can help you:
- **Compare candidate qualifications** & highlight skill gaps
- **Draft personalized interview invitation emails**
- **Generate technical & behavioral interview questions**
- **Explain match scores and bias filter audits**

How can I assist your hiring workflow today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          contextData: {
            jobTitle: jobDescription?.title,
            requiredSkills: jobDescription?.requiredSkills,
            selectedCandidateName: selectedCandidate?.name,
            selectedCandidateScore: selectedCandidate?.evaluation?.matchScore,
            selectedCandidateGaps: selectedCandidate?.evaluation?.missingRequirements,
            totalCandidatesCount: candidates.length,
            topCandidateNames: candidates.slice(0, 3).map(c => `${c.name} (${c.evaluation?.matchScore}%)`)
          }
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Copilot service error');
      }

      const botMsg: Message = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err?.message || 'Sorry, I encountered an issue connecting to the Gemini AI server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    {
      label: 'Draft Interview Email',
      icon: Mail,
      prompt: selectedCandidate 
        ? `Draft a warm, professional interview invitation email for candidate ${selectedCandidate.name} for the ${jobDescription?.title || 'position'}. Mention their strong match.` 
        : `Draft a professional interview invitation email template for top candidates.`
    },
    {
      label: 'Compare Top Candidates',
      icon: Users,
      prompt: `Compare the top candidates for ${jobDescription?.title || 'this role'} and summarize which candidate is best suited based on required skills and experience.`
    },
    {
      label: 'Key Technical Questions',
      icon: HelpCircle,
      prompt: selectedCandidate
        ? `Generate 3 targeted technical interview questions for ${selectedCandidate.name} to probe their missing skills or experience gaps.`
        : `What are 3 critical technical questions to ask candidates applying for ${jobDescription?.title || 'this role'}?`
    }
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              HireLens AI Copilot
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[9px] px-1.5 py-0.5 rounded font-mono">
                Gemini 3.6
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {jobDescription?.title ? `Context: ${jobDescription.title}` : 'Recruiter AI Assistant'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Candidate Context Banner (if any) */}
      {selectedCandidate && (
        <div className="bg-indigo-950/60 border-b border-indigo-900/60 px-4 py-2 text-xs flex items-center justify-between text-indigo-200">
          <span className="truncate font-semibold">
            Active Context: {selectedCandidate.name} ({selectedCandidate.evaluation?.matchScore}% Match)
          </span>
          <span className="text-[10px] bg-indigo-900 px-2 py-0.5 rounded text-indigo-300 shrink-0">
            {selectedCandidate.evaluation?.recommendation}
          </span>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              {m.role === 'assistant' ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5" />
                  <span>HireLens Copilot</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  <span>You (Recruiter)</span>
                </div>
              )}
              <span className="text-[10px] text-slate-500 font-mono">{m.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[92%] relative group ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {m.content}

              {m.role === 'assistant' && (
                <button
                  onClick={() => handleCopyText(m.id, m.content)}
                  className="absolute top-2 right-2 p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Copy text"
                >
                  {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-indigo-400 text-xs py-2 px-1">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Copilot is analyzing recruitment data...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Quick Actions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, idx) => {
            const IconComponent = qp.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-left"
              >
                <IconComponent className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{qp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask Copilot (e.g. 'Draft email for Alex', 'Compare candidates')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            !input.trim() || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
