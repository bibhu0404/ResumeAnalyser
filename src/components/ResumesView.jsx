import React, { useState } from 'react';
import { 
  FileText, Plus, Search, Trash2, Sparkles, Eye, Calendar, 
  BarChart3, FileType, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function ResumesView({ 
  resumes, 
  loading, 
  onOpenResumeModal, 
  onAnalyzeResume, 
  onViewAnalysis, 
  onDeleteResume,
  isAnalyzingId 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResumes = (resumes || []).filter(resume => {
    const term = searchTerm.toLowerCase();
    const titleMatch = resume.title?.toLowerCase().includes(term);
    const roleMatch = resume.targetRole?.toLowerCase().includes(term);
    return titleMatch || roleMatch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Title, Search, and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Resume Repository
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your tailored resumes, compare ATS scores, and target different job profiles.
          </p>
        </div>

        <button
          onClick={onOpenResumeModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-600/30 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Resume</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by title or target role..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 glass-card rounded-2xl animate-pulse p-6" />
          ))}
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {searchTerm ? 'No matching resumes found' : 'No resumes added yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">
            {searchTerm
              ? 'Try adjusting your search keywords to find your resume.'
              : 'Upload your primary resume in PDF, DOCX, or paste text to generate in-depth ATS scores and role suitability insights.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onOpenResumeModal}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition shadow-lg shadow-brand-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Your First Resume</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((resume) => {
            const isAnalyzing = isAnalyzingId === resume.id;
            const hasAnalysis = resume.latestAtsScore !== null && resume.latestAtsScore !== undefined;

            return (
              <div
                key={resume.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all group hover:-translate-y-1 duration-200"
              >
                <div>
                  {/* Top file type and actions */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      <FileType className="w-3.5 h-3.5 text-brand-400" />
                      <span>{resume.fileType || 'TEXT'}</span>
                    </span>

                    <button
                      onClick={() => onDeleteResume(resume.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Target Role */}
                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition line-clamp-1 mb-1">
                    {resume.title}
                  </h3>

                  <p className="text-xs text-brand-400 font-medium mb-3 flex items-center space-x-1">
                    <span>Target: {resume.targetRole || 'General Profile'}</span>
                  </p>

                  {/* Metadata: Words, Date */}
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mb-4">
                    <span>{resume.wordCount || 0} words</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </span>
                  </div>
                </div>

                {/* Score & Action footer */}
                <div className="pt-4 border-t border-slate-800/80">
                  {hasAnalysis ? (
                    <div className="flex items-center justify-between mb-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">ATS Score</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-base font-extrabold ${
                          resume.latestAtsScore >= 80 ? 'text-emerald-400' :
                          resume.latestAtsScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {resume.latestAtsScore}/100
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          resume.latestAtsScore >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                          resume.latestAtsScore >= 60 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {resume.latestAtsScore >= 80 ? 'High' : resume.latestAtsScore >= 60 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 text-[11px] text-slate-500 italic">
                      No analysis performed yet.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {hasAnalysis && (
                      <button
                        onClick={() => onViewAnalysis(resume.latestAnalysisId)}
                        className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-center space-x-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    )}

                    <button
                      onClick={() => onAnalyzeResume(resume.id, resume.targetRole)}
                      disabled={isAnalyzing}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 flex items-center justify-center space-x-1.5 shadow transition disabled:opacity-50 ${
                        !hasAnalysis ? 'col-span-2' : ''
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      <span>{isAnalyzing ? 'Analyzing...' : hasAnalysis ? 'Re-analyze' : 'Analyze with AI'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
