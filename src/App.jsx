import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { resumeApi, analysisApi, dashboardApi } from './services/api';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ResumesView from './components/ResumesView';
import AnalysisDetailView from './components/AnalysisDetailView';
import AuthModal from './components/AuthModal';
import ResumeModal from './components/ResumeModal';
import Footer from './components/Footer';
import { 
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, 
  Target, FileSearch, BrainCircuit, Users 
} from 'lucide-react';

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'resumes' | 'analysis'
  const [resumes, setResumes] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [isAnalyzingId, setIsAnalyzingId] = useState(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setResumes([]);
      setDashboardStats(null);
      setCurrentAnalysis(null);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoadingResumes(true);
    try {
      const [resumesData, statsData] = await Promise.all([
        resumeApi.getAll(),
        dashboardApi.getStats(),
      ]);
      setResumes(resumesData);
      setDashboardStats(statsData);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleResumeCreated = (newResume, jobDescription) => {
    showToast(`Resume "${newResume.title}" added successfully!`);
    loadData();
    // Automatically trigger initial analysis
    triggerAnalysis(newResume.id, newResume.targetRole, jobDescription);
  };

  const triggerAnalysis = async (resumeId, targetRole, jobDescription = '') => {
    setIsAnalyzingId(resumeId);
    showToast('AI is analyzing your resume against target competencies...');

    try {
      const result = await analysisApi.analyze(resumeId, {
        targetRole,
        jobDescription,
      });
      setCurrentAnalysis(result);
      setActiveTab('analysis');
      showToast('Resume analysis completed!');
      loadData(); // Refresh scores on dashboard & resume list
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Analysis failed. Please try again.';
      showToast(`Error: ${msg}`);
    } finally {
      setIsAnalyzingId(null);
    }
  };

  const handleViewAnalysis = async (analysisId) => {
    try {
      const result = await analysisApi.getById(analysisId);
      setCurrentAnalysis(result);
      setActiveTab('analysis');
    } catch (err) {
      showToast('Could not load analysis details.');
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume and its analysis history?')) {
      return;
    }
    try {
      await resumeApi.delete(id);
      showToast('Resume deleted successfully.');
      if (currentAnalysis?.resumeId === id) {
        setCurrentAnalysis(null);
        setActiveTab('resumes');
      }
      loadData();
    } catch (err) {
      showToast('Failed to delete resume.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading Resume Analyzer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-brand-500/50 shadow-2xl text-sm font-medium text-white flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenResumeModal={() => {
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsResumeModalOpen(true);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isAuthenticated ? (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={dashboardStats}
                loading={loadingResumes}
                onOpenResumeModal={() => setIsResumeModalOpen(true)}
                onViewResume={() => setActiveTab('resumes')}
                onViewAnalysis={handleViewAnalysis}
                onNavigateToResumes={() => setActiveTab('resumes')}
              />
            )}

            {activeTab === 'resumes' && (
              <ResumesView
                resumes={resumes}
                loading={loadingResumes}
                onOpenResumeModal={() => setIsResumeModalOpen(true)}
                onAnalyzeResume={(id, role) => triggerAnalysis(id, role)}
                onViewAnalysis={handleViewAnalysis}
                onDeleteResume={handleDeleteResume}
                isAnalyzingId={isAnalyzingId}
              />
            )}

            {activeTab === 'analysis' && (
              <AnalysisDetailView
                analysis={currentAnalysis}
                onBack={() => setActiveTab('resumes')}
                onReanalyze={(resumeId, targetRole) => triggerAnalysis(resumeId, targetRole)}
                isAnalyzing={isAnalyzingId !== null}
              />
            )}
          </>
        ) : (
          /* Landing Hero for Unauthenticated Visitors */
          <div className="py-12 sm:py-20 animate-fadeIn">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Next-Gen Full Stack Resume Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Optimize Your Resume for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400">ATS Algorithms & Top Roles</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Powered by Spring Boot 3, Spring AI, and MySQL. Manage multiple resumes, match job descriptions, detect skill gaps, and practice custom AI-generated interview questions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 shadow-xl shadow-brand-600/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2"
                >
                  <span>Start Free Analysis</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition"
                >
                  Sign In with Google or Email
                </button>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
                <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-brand-500/40 transition">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Multi-Resume Versioning
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Maintain distinct resumes for Frontend, Backend, DevOps, or Data roles. Manage all versions securely under one user account.
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-brand-500/40 transition">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Spring AI & ATS Scoring
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates keyword density, formatting readability, quantifiable metrics, and computes deep compatibility percentages with instant feedback.
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-brand-500/40 transition">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    JWT & Google OAuth Security
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enterprise-grade authentication with BCrypt password hashing, stateless JWT authorization, and Google Identity token integration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onResumeCreated={handleResumeCreated}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

