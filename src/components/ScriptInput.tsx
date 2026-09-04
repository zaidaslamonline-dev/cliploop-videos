import React from 'react';
import { MessageSquare, Sparkles, X, Wand2 } from 'lucide-react';

interface ScriptInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const ScriptInput: React.FC<ScriptInputProps> = ({ value, onChange }) => {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const quickTemplates = [
    {
      label: '⚡ 3-Sec Viral Hook',
      script:
        'Stop scrolling if your ads aren’t converting! Here is the exact 3-step UGC framework that generated $84,000 in 14 days without hiring a studio crew. Tap the link to steal the template now.',
    },
    {
      label: '🛍️ E-com Unboxing',
      script:
        'Finally found the only insulated travel tumbler that actually keeps ice frozen for 36 hours. Drop-proof, zero leaks, and fits in any cup holder. 30% off spring sale ends midnight.',
    },
    {
      label: '📱 SaaS Product Tour',
      script:
        'Managing client video revisions over WhatsApp was a nightmare—until ClipLoop. Automatically turn raw phone B-roll into high-retention TikTok commercials in under 60 seconds.',
    },
    {
      label: '☕ Café / Local Brand',
      script:
        'Your morning routine deserves an upgrade. Slow-roasted single-origin beans, oat milk foam, and the coziest corner in town. Show this reel for 20% off your first cold brew.',
    },
  ];

  return (
    <div className="w-full space-y-2">
      {/* Label and Stats */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <label
            htmlFor="commercial-script-input"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono"
          >
            Script &amp; Creative Prompt
          </label>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
          {value.length > 0 && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-neutral-400 hover:text-rose-400 transition-colors"
                title="Clear input"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Spacious Text Area */}
      <div className="relative rounded-2xl bg-neutral-900 border border-neutral-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        <textarea
          id="commercial-script-input"
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter voiceover script, target client niche, or special editing instructions..."
          className="w-full bg-transparent p-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none resize-y min-h-[130px] font-sans leading-relaxed"
        />

        {/* Bottom subtle bar inside textarea */}
        <div className="px-3.5 pb-2.5 flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-800/50 pt-2">
          <span className="flex items-center gap-1">
            <Wand2 className="w-3 h-3 text-blue-400" />
            <span>AI voiceover and dynamic captions will synchronize to this text</span>
          </span>
        </div>
      </div>

      {/* Quick script preset pills for rapid smartphone testing */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-neutral-400 font-medium">
            Quick Commercial Ideas:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickTemplates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => onChange(template.script)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-all active:scale-95"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
