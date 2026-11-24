import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Sparkles, LayoutDashboard, Files, LogOut, Plus, User as UserIcon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal, onOpenResumeModal }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <FileText className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold tracking-tight text-white">
                  Resume<span className="text-brand-400">Analyzer</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">
                  AI 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                ATS Optimization & Role Matcher
              </p>
            </div>
          </div>

          {/* Navigation links (when authenticated) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'dashboard'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('resumes')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'resumes' || activeTab === 'analysis'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Files className="w-4 h-4" />
                <span>My Resumes</span>
              </button>
            </nav>
          )}

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={onOpenResumeModal}
                  className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-600/25 hover:shadow-brand-600/40 transition transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Resume</span>
                </button>

                {/* User badge */}
                <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
                  {user?.pictureUrl ? (
                    <img
                      src={user.pictureUrl}
                      alt={user.fullName || 'User'}
                      className="w-8 h-8 rounded-full border border-brand-500/40 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-300 font-semibold text-xs">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                  )}

                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {user?.fullName || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAuthModal}
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenAuthModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/25 transition"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
