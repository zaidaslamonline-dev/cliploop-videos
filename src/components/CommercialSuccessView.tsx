import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Share2,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Database,
  Film,
  Sliders,
  Copy,
  Check,
} from 'lucide-react';
import { RenderedCommercial } from '../types';

interface CommercialSuccessViewProps {
  commercial: RenderedCommercial;
  onReset: () => void;
  onModify: () => void;
  onOpenSupabaseModal: () => void;
}

export const CommercialSuccessView: React.FC<CommercialSuccessViewProps> = ({
  commercial,
  onReset,
  onModify,
  onOpenSupabaseModal,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [commercial.videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 15;
    setProgress((curr / dur) * 100);

    const mins = Math.floor(curr / 60);
    const secs = Math.floor(curr % 60);
    setCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(commercial.videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = commercial.videoUrl;
    a.download = `${commercial.title.toLowerCase().replace(/\s+/g, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Determine aspect ratio class
  const getAspectRatioClasses = () => {
    switch (commercial.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[520px]';
      case '1:1':
        return 'aspect-square max-h-[420px]';
      case '16:9':
        return 'aspect-[16/9] max-h-[300px]';
      default:
        return 'aspect-[9/16] max-h-[520px]';
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Success Badge */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-blue-950/60 border border-emerald-500/30 text-emerald-200 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-xs text-white">Commercial Ready!</p>
            <p className="text-[11px] text-emerald-300/80 font-mono">
              Rendered in 3.0s • 1080p 60fps
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
          {commercial.duration}
        </span>
      </div>

      {/* Smartphone Video Mockup Screen */}
      <div className="relative mx-auto w-full max-w-[340px] rounded-3xl p-2 bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Phone Notch/Speaker Header */}
        <div className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>PREVIEW</span>
          </div>
          <span className="font-semibold text-neutral-300">{commercial.aspectRatio}</span>
        </div>

        {/* Video Canvas Container */}
        <div
          onClick={togglePlay}
          className={`relative w-full rounded-2xl overflow-hidden bg-black cursor-pointer group ${getAspectRatioClasses()}`}
        >
          <video
            ref={videoRef}
            src={commercial.videoUrl}
            playsInline
            loop
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover"
          />

          {/* Dynamic Motion Captions Simulation Overlay */}
          <div className="absolute inset-x-3 bottom-14 pointer-events-none text-center">
            <div className="inline-block px-3 py-1.5 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-white/20 shadow-2xl">
              <p className="text-xs font-black tracking-wide text-amber-300 uppercase drop-shadow-md">
                {commercial.script
                  ? `"${commercial.script.slice(0, 65)}..."`
                  : '"STOP SCROLLING: BOOST YOUR SALES WITH CLIPLOOP"'}
              </p>
            </div>
          </div>

          {/* Center Play/Pause button on hover/pause */}
          <div
            className={`absolute inset-0 bg-neutral-950/30 flex items-center justify-center transition-opacity ${
              isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl backdrop-blur-xs">
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </div>
          </div>

          {/* Top Video Overlay Chips */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-950/70 text-white border border-white/10 backdrop-blur-md">
              CLIPLOOP AI
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="pointer-events-auto p-1.5 rounded-full bg-neutral-950/70 hover:bg-neutral-900 text-white border border-white/10 backdrop-blur-md transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Bottom Progress Bar inside video */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-neutral-800">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Video Scrubber & Controls */}
        <div className="p-2 pt-2.5 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>{currentTime}</span>
          <span className="text-[11px] text-blue-400 font-medium font-sans">
            Viral Hook Score: {commercial.metrics.hookScore}/100
          </span>
          <span>{commercial.duration}</span>
        </div>
      </div>

      {/* Video Generation Metrics Bento */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
          <span className="text-[10px] font-mono text-neutral-500 block uppercase">Cuts</span>
          <span className="text-sm font-bold text-white">
            {commercial.metrics.cutsCount} Auto-Splices
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
          <span className="text-[10px] font-mono text-neutral-500 block uppercase">Pacing</span>
          <span className="text-sm font-bold text-blue-400">
            {commercial.metrics.pacingMultiplier}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
          <span className="text-[10px] font-mono text-neutral-500 block uppercase">Format</span>
          <span className="text-sm font-bold text-emerald-400">
            {commercial.metrics.targetFormat}
          </span>
        </div>
      </div>

      {/* Supabase Storage Reference Card */}
      <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Supabase Direct Storage Path</span>
          </div>
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-mono underline"
          >
            Config
          </button>
        </div>

        <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 font-mono text-[11px] text-neutral-400 break-all flex items-center justify-between gap-2">
          <span className="truncate">{commercial.supabaseStorageInfo.path}</span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 p-1 hover:text-white transition-colors"
            title="Copy path"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Action Buttons for Mobile */}
      <div className="space-y-2 pt-1">
        {/* Primary Download */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Download Commercial (MP4)</span>
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Video'}</span>
          </button>

          <button
            type="button"
            onClick={onModify}
            className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Adjust Script</span>
          </button>
        </div>

        {/* Create Another */}
        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 text-xs text-neutral-400 hover:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Start New Project</span>
        </button>
      </div>
    </div>
  );
};
