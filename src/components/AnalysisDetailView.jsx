import React, { useState } from 'react';
import ScoreGauge from './ScoreGauge';
import { 
  ArrowLeft, RefreshCw, Download, CheckCircle2, AlertTriangle, 
  Lightbulb, HelpCircle, Briefcase, Award, Check, Sparkles, FileText, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AnalysisDetailView({ analysis, onBack, onReanalyze, isAnalyzing }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'sections' | 'interview'

  if (!analysis) return null;

  const toggleCheck = (idx) => {
    setCheckedItems(prev => {
      const next = { ...prev, [idx]: !prev[idx] };
      // Fire confetti if all recommendations checked!
      if (analysis.recommendations && Object.keys(next).length === analysis.recommendations.length) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
      return next;
    });
  };

  const handleExport = () => {
    const reportText = `
# Resume Analysis Report: ${analysis.resumeTitle || 'Resume'}
Target Role: ${analysis.targetRole || 'Not specified'}
Model: ${analysis.modelUsed || 'Spring AI Engine'}
Date: ${new Date(analysis.createdAt).toLocaleDateString()}

## Scores
- ATS Compatibility: ${analysis.atsScore}/100
- Role Match: ${analysis.matchScore}/100

## Executive Summary
${analysis.summary || 'N/A'}

## Identified Skills
${(analysis.presentSkills || []).map(s => `- ${s}`).join('\n')}

## Missing / In-Demand Skills
${(analysis.missingSkills || []).map(s => `- ${s}`).join('\n')}

## Key Strengths
${(analysis.strengths || []).map(s => `- ${s}`).join('\n')}

## Areas for Improvement
${(analysis.weaknesses || []).map(s => `- ${s}`).join('\n')}

## Recommendations
${(analysis.recommendations || []).map(s => `- ${s}`).join('\n')}

## Interview Questions
${(analysis.interviewQuestions || []).map((q, i) => `${i + 1}. ${q}`).join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Resume_Analysis_${analysis.resumeId || 'report'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-card rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {analysis.resumeTitle || 'Resume Analysis'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                {analysis.targetRole || 'Software Engineer'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Analyzed with {analysis.modelUsed || 'AI Engine'}</span>
              <span>•</span>
              <span>{analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : 'Just now'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (.md)</span>
          </button>

          <button
            onClick={() => onReanalyze(analysis.resumeId, analysis.targetRole)}
            disabled={isAnalyzing}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-md shadow-brand-600/30 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Re-analyzing...' : 'Re-analyze'}</span>
          </button>
        </div>
      </div>

      {/* Main Score & Summary Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Gauge Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center">
          <ScoreGauge
            score={analysis.atsScore || 0}
            size={180}
            label="ATS Compatibility Score"
          />
          <p className="text-xs text-slate-400 mt-3 max-w-xs">
            Reflects formatting clarity, standard headings, action verb density, and keyword match.
          </p>
        </div>

        {/* Role Match & Summary Card */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-brand-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Target Role Match Score
                </h3>
              </div>
              <span className="text-xl font-extrabold text-white">
                {analysis.matchScore || 0}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(analysis.matchScore || 0, 100)}%` }}
              />
            </div>

            {/* Executive Summary */}
            <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider block mb-1">
                Executive Profile Summary
              </span>
              <p className="text-sm text-slate-200 leading-relaxed italic">
                "{analysis.summary || 'Profile exhibits balanced experience aligned with target competencies.'}"
              </p>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
            <div className="text-center">
              <span className="block text-lg font-bold text-emerald-400">
                {(analysis.presentSkills || []).length}
              </span>
              <span className="text-[11px] text-slate-400">Skills Detected</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-amber-400">
                {(analysis.missingSkills || []).length}
              </span>
              <span className="text-[11px] text-slate-400">Gaps to Bridge</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-purple-400">
                {(analysis.interviewQuestions || []).length}
              </span>
              <span className="text-[11px] text-slate-400">Prep Questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 sm:space-x-4 overflow-x-auto">
        {[
          { id: 'overview', label: 'Strengths & Improvements' },
          { id: 'skills', label: 'Skills Gap Analysis' },
          { id: 'recommendations', label: 'Actionable Checklist' },
          { id: 'sections', label: 'Section-by-Section ATS Audit' },
          { id: 'interview', label: 'AI Interview Prep' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap px-1 ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview - Strengths & Weaknesses */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Strengths */}
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/10">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Standout Strengths</h3>
            </div>
            <ul className="space-y-3">
              {(analysis.strengths || []).map((strength, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses / Improvements */}
          <div className="glass-card rounded-2xl p-6 border border-amber-500/20 bg-amber-950/10">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {(analysis.weaknesses || []).map((weakness, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm text-slate-200">
                  <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Skills Gap Analysis */}
      {activeTab === 'skills' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Skills Detected in Your Resume ({analysis.presentSkills?.length || 0})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {(analysis.presentSkills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Missing Keywords for "{analysis.targetRole}" ({analysis.missingSkills?.length || 0})</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Adding these keywords into your project descriptions or skills list will boost ATS visibility:
            </p>
            <div className="flex flex-wrap gap-2">
              {(analysis.missingSkills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center space-x-1.5"
                >
                  <span>+ {skill}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Actionable Checklist */}
      {activeTab === 'recommendations' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">Recommended Enhancements</h3>
            </div>
            <span className="text-xs text-slate-400">
              Check off items as you refine your resume
            </span>
          </div>

          <div className="space-y-3">
            {(analysis.recommendations || []).map((rec, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition ${
                    isChecked
                      ? 'bg-slate-900/30 border-slate-800/60 line-through text-slate-500'
                      : 'bg-slate-900/70 border-slate-800 hover:border-brand-500/40 text-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                    isChecked ? 'bg-brand-600 border-brand-500 text-white' : 'border-slate-600'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm font-medium">{rec}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Section-by-Section ATS Audit */}
      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          {analysis.sectionFeedback && Object.entries(analysis.sectionFeedback).map(([section, feedback], idx) => (
            <div key={idx} className="glass-card rounded-xl p-5 border border-slate-800">
              <div className="flex items-center space-x-2 mb-2 text-brand-400">
                <FileText className="w-4 h-4" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{section}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{feedback}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: AI Interview Prep Questions */}
      {activeTab === 'interview' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center space-x-2 mb-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Tailored Interview Questions</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Based on your projects and the target role ({analysis.targetRole}), interviewers are likely to ask:
          </p>

          <div className="space-y-3">
            {(analysis.interviewQuestions || []).map((question, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-200 font-medium">{question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
