import React from 'react';
import { FileText, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-900 bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              Resume<span className="text-brand-400">Analyzer</span>
            </span>
            <span className="text-xs text-slate-500">• Full-Stack AI Edition</span>
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              Spring Boot 3.3
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              React + Vite
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              Tailwind CSS
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              MySQL 8.0
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              Spring AI & LLM
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              JWT & Google OAuth
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center space-x-1">
            <span>Built for intermediate full-stack engineering</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
