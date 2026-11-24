import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Sparkles, TrendingUp, Award, Plus, ArrowRight, 
  CheckCircle2, Clock, ChevronRight, Zap 
} from 'lucide-react';

export default function DashboardView({ 
  stats, 
  loading, 
  onOpenResumeModal, 
  onViewResume, 
  onViewAnalysis, 
  onNavigateToResumes 
}) {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 overflow-hidden radial-glow">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Spring AI & LLM Powered ATS Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName || 'Candidate'}!
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Track how your resumes score across ATS filters, identify missing in-demand skills, and optimize your qualifications for target tech roles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenResumeModal}
              className="px-5 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-600/30 transition transform active:scale-95 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Resume</span>
            </button>
            <button
              onClick={onNavigateToResumes}
              className="px-4 py-3 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              View All Resumes
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Resumes */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Resumes
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalResumes || 0}
            </span>
            <span className="text-xs text-slate-400">versions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Active across profiles</p>
        </div>

        {/* Average ATS Score */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg. ATS Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.averageAtsScore || 0}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {(stats?.averageAtsScore || 0) >= 80 ? 'Optimal score level' : 'Room for keyword optimization'}
          </p>
        </div>

        {/* Total Analyses */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Analyses Run
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalAnalyses || 0}
            </span>
            <span className="text-xs text-slate-400">evaluations</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Detailed audit logs</p>
        </div>

        {/* Target Optimization Status */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Readiness Status
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-white">
              {(stats?.averageAtsScore || 0) >= 75 ? 'Job Ready' : 'In Progress'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Based on current keyword depth</p>
        </div>
      </div>

      {/* Two Column Grid: Recent Resumes & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recent Resumes */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brand-400" />
              <span>Recent Resumes</span>
            </h2>
            <button
              onClick={onNavigateToResumes}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {(stats?.recentResumes || []).length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 mb-3">No resumes uploaded yet.</p>
              <button
                onClick={onOpenResumeModal}
                className="text-xs font-semibold text-brand-400 hover:underline"
              >
                + Add your first resume
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(stats?.recentResumes || []).map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => onViewResume(resume.id)}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-brand-400 font-bold text-xs uppercase">
                      {resume.fileType || 'TXT'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white line-clamp-1">
                        {resume.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {resume.targetRole || 'General Role'} • {resume.wordCount} words
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {resume.latestAtsScore ? (
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                        resume.latestAtsScore >= 80 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                      }`}>
                        {resume.latestAtsScore} ATS
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Unanalyzed</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent AI Insights */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Recent AI Evaluations</span>
            </h2>
          </div>

          {(stats?.recentAnalyses || []).length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 mb-3">No analysis reports generated yet.</p>
              <p className="text-[11px] text-slate-500">
                Upload a resume and click "Analyze with AI" to view ATS compatibility scores and role suggestions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(stats?.recentAnalyses || []).map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => onViewAnalysis(analysis.id)}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {analysis.resumeTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Target: {analysis.targetRole}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400">
                        {analysis.atsScore}/100
                      </span>
                      <p className="text-[10px] text-slate-400">ATS Score</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 italic">
                    "{analysis.summary}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
