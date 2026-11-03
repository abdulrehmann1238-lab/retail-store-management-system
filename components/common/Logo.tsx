import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false, className = '', light = false }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Minimal geometric inventory / architectural store glyph */}
      <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all ${
        light ? 'bg-white/10 text-white' : 'bg-brand text-white shadow-subtle'
      }`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          {/* Architectural geometric store grid / warehouse vault symbol */}
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <path d="M13 17h8m-4-4v8" />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-semibold tracking-wider text-sm ${
              light ? 'text-white' : 'text-content-primary'
            }`}>
              STOCKROOM
            </span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-medium tracking-tight bg-brand-soft text-brand">
              RETAIL
            </span>
          </div>
          <span className={`text-[11px] font-normal tracking-tight ${
            light ? 'text-white/60' : 'text-content-secondary'
          }`}>
            Store Management System
          </span>
        </div>
      )}
    </div>
  );
};

