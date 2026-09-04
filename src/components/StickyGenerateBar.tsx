import React from 'react';
import { Loader2, PlayCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface StickyGenerateBarProps {
  onRender: () => void;
  isRendering: boolean;
  renderStep: string;
  renderProgress: number;
  disabled?: boolean;
}

export const StickyGenerateBar: React.FC<StickyGenerateBarProps> = ({
  onRender,
  isRendering,
  renderStep,
  renderProgress,
  disabled = false,
}) => {
  return (
    <div className="sticky bottom-0 z-30 w-full bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/90 px-4 pt-3 pb-5 safe-bottom">
      <div className="max-w-md mx-auto space-y-2">
        {/* Real-time Render Progression Notice */}
        {isRendering && (
          <div className="w-full bg-blue-950/40 border border-blue-500/30 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs text-blue-200 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2 truncate">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
              <span className="font-medium truncate">{renderStep}</span>
            </div>
            <span className="font-mono text-blue-400 font-bold shrink-0">
              {renderProgress}%
            </span>
          </div>
        )}

        {/* Large Sticky Blue Button */}
        <button
          id="render-commercial-btn"
          type="button"
          onClick={onRender}
          disabled={isRendering || disabled}
          className={`w-full h-14 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xl transition-all duration-200 ${
            isRendering
              ? 'bg-blue-700 text-white cursor-wait opacity-90'
              : disabled
              ? 'bg-neutral-800 text-neutral-500 border border-neutral-700/60 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-blue-600/30 hover:shadow-blue-500/40 border border-blue-400/30 cursor-pointer'
          }`}
        >
          {isRendering ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Rendering Commercial...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-blue-200 fill-blue-200" />
              <span>Render Commercial</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
