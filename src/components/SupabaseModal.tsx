import React, { useState } from 'react';
import { X, Database, Check, Copy, Code, Terminal, Server } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippet = `// 1. Install official Supabase client:
// npm install @supabase/supabase-js

// 2. Set environment variables in .env:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
// VITE_SUPABASE_BUCKET=cliploop-videos

// 3. In src/lib/supabaseStorage.ts:
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function uploadToSupabase(file, path) {
  const { data, error } = await supabase.storage
    .from('cliploop-videos')
    .upload(path, file);
  return data;
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                Supabase Direct Storage
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Pre-configured &amp; Ready to Plug In
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overview info */}
        <p className="text-xs text-neutral-300 leading-relaxed">
          ClipLoop is architected with a decoupled storage abstraction in{' '}
          <code className="px-1.5 py-0.5 rounded bg-neutral-950 text-blue-300 font-mono text-[11px]">
            src/lib/supabaseStorage.ts
          </code>
          . It currently handles local instant previews and progressive uploads, and can be wired to your live Supabase bucket with zero refactoring.
        </p>

        {/* Bucket Layout */}
        <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2 text-xs">
          <div className="flex items-center justify-between text-neutral-300 font-mono font-semibold">
            <span>Recommended Bucket Structure</span>
            <span className="text-blue-400 text-[10px]">cliploop-videos</span>
          </div>
          <ul className="space-y-1 font-mono text-[11px] text-neutral-400">
            <li className="flex items-center gap-2">
              <span className="text-blue-400">📁</span>
              <span>/inspiration/ – viral pacing reference MP4s</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">📁</span>
              <span>/raw-footage/ – unedited creator B-roll</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">📁</span>
              <span>/rendered/ – 1080p final rendered commercials</span>
            </li>
          </ul>
        </div>

        {/* Code Snippet */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-400">Setup Instructions</span>
            <button
              type="button"
              onClick={copyCode}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
            {codeSnippet}
          </pre>
        </div>

        {/* Done button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
