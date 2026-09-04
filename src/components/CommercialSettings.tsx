import React from 'react';
import { Smartphone, Monitor, Square, Clock, Mic, SlidersHorizontal } from 'lucide-react';
import { CommercialAspectRatio, TargetDuration } from '../types';

interface CommercialSettingsProps {
  aspectRatio: CommercialAspectRatio;
  onAspectRatioChange: (val: CommercialAspectRatio) => void;
  duration: TargetDuration;
  onDurationChange: (val: TargetDuration) => void;
  voiceoverStyle: string;
  onVoiceoverStyleChange: (val: string) => void;
}

export const CommercialSettings: React.FC<CommercialSettingsProps> = ({
  aspectRatio,
  onAspectRatioChange,
  duration,
  onDurationChange,
  voiceoverStyle,
  onVoiceoverStyleChange,
}) => {
  const aspectRatios: { id: CommercialAspectRatio; label: string; icon: React.ElementType; sub: string }[] = [
    { id: '9:16', label: '9:16 Vertical', icon: Smartphone, sub: 'TikTok / Reels' },
    { id: '16:9', label: '16:9 Wide', icon: Monitor, sub: 'YouTube / Web' },
    { id: '1:1', label: '1:1 Square', icon: Square, sub: 'Feed / LinkedIn' },
  ];

  const durations: { id: TargetDuration; label: string; sub: string }[] = [
    { id: '15s', label: '15s', sub: 'Punchy Hook' },
    { id: '30s', label: '30s', sub: 'Standard Ad' },
    { id: '60s', label: '60s', sub: 'Deep Demo' },
  ];

  const voices = [
    { id: 'energetic-creator', label: '🔥 Fast-Paced UGC Creator' },
    { id: 'cinematic-deep', label: '🎙️ Deep Cinematic Narrator' },
    { id: 'warm-conversational', label: '✨ Warm & Trustworthy' },
    { id: 'no-voiceover', label: '🎵 Music Only (No VO)' },
  ];

  return (
    <div className="w-full space-y-3 pt-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
            Output Configuration
          </span>
        </div>
      </div>

      {/* Grid of Aspect Ratio & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Aspect Ratio */}
        <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-[11px] font-mono text-neutral-400 font-medium">
            Format &amp; Ratio
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {aspectRatios.map((item) => {
              const Icon = item.icon;
              const isSelected = aspectRatio === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onAspectRatioChange(item.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500 text-blue-300 font-semibold'
                      : 'bg-neutral-950/60 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-[11px] leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Duration */}
        <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-[11px] font-mono text-neutral-400 font-medium">
            Target Length
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {durations.map((item) => {
              const isSelected = duration === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onDurationChange(item.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500 text-blue-300 font-semibold'
                      : 'bg-neutral-950/60 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 mb-1" />
                  <span className="font-bold text-[12px]">{item.label}</span>
                  <span className="text-[9px] text-neutral-500">{item.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voiceover style dropdown / selector */}
      <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-neutral-200">Voiceover Style</span>
            <span className="text-[11px] text-neutral-400">AI narrator tone</span>
          </div>
        </div>

        <select
          value={voiceoverStyle}
          onChange={(e) => onVoiceoverStyleChange(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
        >
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
