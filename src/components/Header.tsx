import React from 'react';
import { Database, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenSupabaseInfo: () => void;
  onReset: () => void;
  hasActiveProject: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSupabaseInfo,
  onReset,
  hasActiveProject,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
            {/* Minimalist ClipLoop loop icon */}
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 7h10a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-1a4 4 0 0 1 4-4Z" />
              <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full ring-2 ring-neutral-950 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg tracking-tight text-white">
                Clip<span className="text-blue-500">Loop</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                AI VIDEO
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-medium leading-none">
              Commercial Generator
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {hasActiveProject && (
            <button
              type="button"
              onClick={onReset}
              title="Reset project inputs"
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSupabaseInfo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-all shadow-xs group"
          >
            <Database className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="font-mono text-[11px] font-medium hidden sm:inline">Supabase Ready</span>
            <span className="font-mono text-[11px] font-medium sm:hidden">Storage</span>
          </button>
        </div>
      </div>
    </header>
  );
};
