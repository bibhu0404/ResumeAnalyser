import React from 'react';

export default function ScoreGauge({ score = 0, size = 160, strokeWidth = 14, label = "ATS Score", sublabel = "" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorClass = "text-rose-500 stroke-rose-500";
  let bgGlow = "shadow-rose-500/20";
  let ratingText = "Needs Work";

  if (clampedScore >= 80) {
    colorClass = "text-emerald-400 stroke-emerald-400";
    bgGlow = "shadow-emerald-500/20";
    ratingText = "Excellent Match";
  } else if (clampedScore >= 60) {
    colorClass = "text-amber-400 stroke-amber-400";
    bgGlow = "shadow-amber-500/20";
    ratingText = "Good Potential";
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className={`relative flex items-center justify-center rounded-full shadow-lg ${bgGlow}`} style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
            fill="transparent"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {clampedScore}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="block text-sm font-semibold text-slate-200">{label}</span>
        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
          clampedScore >= 80 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
          clampedScore >= 60 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
          'bg-rose-500/15 text-rose-300 border border-rose-500/30'
        }`}>
          {sublabel || ratingText}
        </span>
      </div>
    </div>
  );
}
