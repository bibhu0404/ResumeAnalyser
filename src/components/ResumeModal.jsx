import React, { useState } from 'react';
import { resumeApi } from '../services/api';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function ResumeModal({ isOpen, onClose, onResumeCreated }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'text'
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setError('');
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Please upload a supported file format (.pdf, .docx, .txt)');
      return;
    }
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let createdResume;
      if (mode === 'upload') {
        if (!selectedFile) {
          setError('Please select a resume file (.pdf, .docx, .txt)');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title.trim() || selectedFile.name);
        formData.append('targetRole', targetRole.trim());
        createdResume = await resumeApi.uploadFile(formData);
      } else {
        if (!textContent.trim()) {
          setError('Please paste or write your resume text content.');
          setLoading(false);
          return;
        }
        createdResume = await resumeApi.createText({
          title: title.trim() || 'My Resume',
          targetRole: targetRole.trim(),
          content: textContent.trim(),
          jobDescription: jobDescription.trim(),
        });
      }

      onResumeCreated(createdResume, jobDescription);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save resume.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sampleRoles = [
    'Full Stack Developer',
    'Java Backend Engineer',
    'React Frontend Developer',
    'Cloud / DevOps Engineer',
    'Data Scientist / AI Engineer',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-xl glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <UploadCloud className="w-6 h-6 text-brand-400" />
            <span>Add New Resume</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload your resume document or paste raw text to run deep AI role matching & ATS analysis.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-slate-900 rounded-xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'upload' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload File (PDF / DOCX / TXT)
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'text' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste Text Directly
          </button>
        </div>

        {error && (
          <div className="flex items-start space-x-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Zone */}
          {mode === 'upload' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition ${
                dragActive
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
              }`}
            >
              <input
                type="file"
                id="resume-file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center">
                {selectedFile ? (
                  <div className="flex items-center space-x-2 text-brand-300 bg-brand-500/15 px-4 py-2 rounded-xl border border-brand-500/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-semibold">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400">
                      ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      Click to browse or drag & drop your resume file
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PDF, DOCX, or TXT up to 15 MB
                    </p>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Paste Text Mode */}
          {mode === 'text' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Resume Text Content
              </label>
              <textarea
                rows={6}
                required
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your full resume text here (Summary, Experience, Skills, Education)..."
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono text-xs leading-relaxed"
              />
            </div>
          )}

          {/* Title & Target Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Resume Label / Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend CV 2026"
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Quick Role Suggestions */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-slate-500 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-brand-400" />
              <span>Suggestions:</span>
            </span>
            {sampleRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setTargetRole(role)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-brand-600/30 border border-slate-700 transition"
              >
                {role}
              </button>
            ))}
          </div>

          {/* Target Job Description (Optional) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">
                Target Job Description (Optional)
              </label>
              <span className="text-[11px] text-slate-500">Improves Match Accuracy</span>
            </div>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job posting / requirements here to calculate precise role-fit percentage..."
              className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
