import React from 'react';
import { Sparkles, Scissors, Layers } from 'lucide-react';
import { GenerationMode } from '../types';

interface ModeSelectorProps {
  selectedMode: GenerationMode;
  onSelectMode: (mode: GenerationMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  const modes: {
    id: GenerationMode;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    description: string;
  }[] = [
    {
      id: 'inspiration',
      label: 'Inspiration Mode',
      shortLabel: 'Inspiration',
      icon: Sparkles,
      description: 'Clone viral video hook, cut pacing & visual rhythm',
    },
    {
      id: 'raw_cut',
      label: 'Raw Cut',
      shortLabel: 'Raw Cut',
      icon: Scissors,
      description: 'Auto-splice B-roll, match beats & generate dynamic VO',
    },
    {
      id: 'hybrid',
      label: 'Hybrid Remake',
      shortLabel: 'Hybrid Remake',
      icon: Layers,
      description: 'Match inspiration timing using your own raw footage',
    },
  ];

  const activeModeObj = modes.find((m) => m.id === selectedMode) || modes[0];

  return (
    <div className="w-full space-y-2">
      {/* Label and Mode Indicator */}
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
          Generation Mode
        </label>
        <span className="text-[11px] font-mono text-blue-400 font-medium">
          {selectedMode === 'hybrid' ? 'Dual Source' : 'Single Source'}
        </span>
      </div>

      {/* 3-Way Toggle Button Group */}
      <div
        id="mode-selector-group"
        className="grid grid-cols-3 p-1 rounded-xl bg-neutral-900/90 border border-neutral-800/90 shadow-inner"
        role="group"
        aria-label="Generation Mode Selector"
      >
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              id={`mode-toggle-${mode.id}`}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-white' : 'text-neutral-400'
                  }`}
                />
                <span className="tracking-tight text-[12px] leading-tight">
                  {mode.shortLabel}
                </span>
              </div>
              <span
                className={`text-[9px] font-mono uppercase tracking-wider ${
                  isSelected ? 'text-blue-100/90' : 'text-neutral-500'
                }`}
              >
                {mode.id === 'inspiration' ? 'Pacing Ref' : mode.id === 'raw_cut' ? 'Auto-Splice' : 'Best of Both'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mode context helper banner */}
      <div className="px-2.5 py-1.5 rounded-lg bg-neutral-900/50 border border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
        <span className="truncate">{activeModeObj.description}</span>
      </div>
    </div>
  );
};
