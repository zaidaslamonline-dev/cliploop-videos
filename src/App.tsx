import React, { useState } from 'react';
import {
  GenerationMode,
  UploadedAsset,
  CommercialAspectRatio,
  TargetDuration,
  RenderedCommercial,
} from './types';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { VideoDropzone } from './components/VideoDropzone';
import { ScriptInput } from './components/ScriptInput';
import { CommercialSettings } from './components/CommercialSettings';
import { StickyGenerateBar } from './components/StickyGenerateBar';
import { CommercialSuccessView } from './components/CommercialSuccessView';
import { SupabaseModal } from './components/SupabaseModal';
import { SAMPLE_CLIPS } from './lib/supabaseStorage';

export default function App() {
  // Mode Selector State: 'inspiration' | 'raw_cut' | 'hybrid'
  const [mode, setMode] = useState<GenerationMode>('hybrid');

  // Dynamic Upload Assets
  const [inspirationAsset, setInspirationAsset] = useState<UploadedAsset | null>(null);
  const [rawAsset, setRawAsset] = useState<UploadedAsset | null>(null);

  // Script & Creative Input
  const [script, setScript] = useState('');

  // Creative & Format Settings
  const [aspectRatio, setAspectRatio] = useState<CommercialAspectRatio>('9:16');
  const [duration, setDuration] = useState<TargetDuration>('15s');
  const [voiceoverStyle, setVoiceoverStyle] = useState('energetic-creator');

  // Render & Mock State (3-second timeout)
  const [isRendering, setIsRendering] = useState(false);
  const [renderStep, setRenderStep] = useState('');
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedResult, setRenderedResult] = useState<RenderedCommercial | null>(null);

  // Supabase Info Modal State
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Dynamic Dropzone Visibility Conditions based on User Requirements:
  // - If "Inspiration Mode" or "Hybrid Remake" is selected, show "Upload Inspiration Video (MP4)"
  // - If "Raw Cut" or "Hybrid Remake" is selected, show "Upload Raw Footage / Assets"
  const showInspirationDropzone = mode === 'inspiration' || mode === 'hybrid';
  const showRawCutDropzone = mode === 'raw_cut' || mode === 'hybrid';

  // Handle Mock "Render Commercial" with 3-second timeout
  const handleRenderCommercial = () => {
    setIsRendering(true);
    setRenderProgress(5);
    setRenderStep('Analyzing video pacing & viral hooks...');

    // Progress checkpoints over 3 seconds (3000ms)
    const timer1 = setTimeout(() => {
      setRenderProgress(35);
      setRenderStep('Auto-splicing B-roll cut points...');
    }, 900);

    const timer2 = setTimeout(() => {
      setRenderProgress(70);
      setRenderStep('Synchronizing voiceover & dynamic motion captions...');
    }, 1900);

    const timer3 = setTimeout(() => {
      setRenderProgress(95);
      setRenderStep('Compositing 1080p commercial render...');
    }, 2600);

    const timerFinish = setTimeout(() => {
      // Pick video preview URL: use user uploaded asset, or one of the high quality sample clips
      const videoSource =
        rawAsset?.previewUrl ||
        inspirationAsset?.previewUrl ||
        (aspectRatio === '9:16'
          ? SAMPLE_CLIPS[0].sampleVideoUrl
          : SAMPLE_CLIPS[1].sampleVideoUrl);

      const commercialId = `comm_${Date.now().toString(36)}`;
      const modeLabel =
        mode === 'inspiration'
          ? 'Inspiration Clone'
          : mode === 'raw_cut'
          ? 'Raw Cut Splice'
          : 'Hybrid Remake';

      const result: RenderedCommercial = {
        id: commercialId,
        title: `Commercial_${modeLabel}_${duration}`,
        mode,
        videoUrl: videoSource,
        thumbnailUrl: videoSource,
        aspectRatio,
        duration,
        script:
          script.trim() ||
          'Stop scrolling! Turn any raw smartphone footage into viral TikTok commercials with ClipLoop AI.',
        createdAt: Date.now(),
        supabaseStorageInfo: {
          bucket: 'cliploop-videos',
          path: `rendered/${commercialId}_${aspectRatio.replace(':', 'x')}.mp4`,
          publicUrl: `https://storage.supabase.co/v1/object/public/cliploop-videos/rendered/${commercialId}.mp4`,
        },
        metrics: {
          cutsCount: duration === '15s' ? 6 : duration === '30s' ? 12 : 22,
          hookScore: Math.floor(Math.random() * 8) + 91, // 91-98
          pacingMultiplier: mode === 'raw_cut' ? '1.8x Fast Cut' : '2.1x Kinetic',
          targetFormat: `${aspectRatio} Vertical HD`,
        },
      };

      setRenderedResult(result);
      setIsRendering(false);
      setRenderProgress(100);
      setRenderStep('');
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerFinish);
    };
  };

  const handleReset = () => {
    setInspirationAsset(null);
    setRawAsset(null);
    setScript('');
    setRenderedResult(null);
    setIsRendering(false);
  };

  const hasActiveProject = Boolean(
    inspirationAsset || rawAsset || script.length > 0 || renderedResult
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-blue-600/30 selection:text-blue-200">
      {/* Mobile-First Shell Container */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-neutral-950 border-x border-neutral-900 shadow-2xl relative">
        {/* Header: "ClipLoop" with sleek minimalist logo */}
        <Header
          onOpenSupabaseInfo={() => setIsSupabaseModalOpen(true)}
          onReset={handleReset}
          hasActiveProject={hasActiveProject}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 space-y-5 pb-6">
          {renderedResult ? (
            /* Success State after 3-second render */
            <CommercialSuccessView
              commercial={renderedResult}
              onReset={handleReset}
              onModify={() => setRenderedResult(null)}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            />
          ) : (
            /* Dashboard Generator View */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Mode Selector: 3-way toggle button group */}
              <ModeSelector
                selectedMode={mode}
                onSelectMode={(newMode) => setMode(newMode)}
              />

              {/* Dynamic Dropzones Section (Supabase Ready) */}
              <div className="space-y-4">
                {/* Dropzone 1: Inspiration Video (MP4) */}
                {showInspirationDropzone && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <VideoDropzone
                      id="inspiration-video"
                      title="Upload Inspiration Video (MP4)"
                      type="inspiration"
                      asset={inspirationAsset}
                      onAssetChange={(asset) => setInspirationAsset(asset)}
                      helperText="AI analyzes viral hooks, transition pacing & visual framing"
                    />
                  </div>
                )}

                {/* Dropzone 2: Raw Footage / Assets */}
                {showRawCutDropzone && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <VideoDropzone
                      id="raw-footage"
                      title="Upload Raw Footage / Assets"
                      type="raw_footage"
                      asset={rawAsset}
                      onAssetChange={(asset) => setRawAsset(asset)}
                      helperText="Uncut camera roll clips, product b-roll, or voice recordings"
                    />
                  </div>
                )}
              </div>

              {/* Script Input: Spacious textarea */}
              <ScriptInput value={script} onChange={setScript} />

              {/* Creative Output Settings */}
              <CommercialSettings
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                duration={duration}
                onDurationChange={setDuration}
                voiceoverStyle={voiceoverStyle}
                onVoiceoverStyleChange={setVoiceoverStyle}
              />
            </div>
          )}
        </main>

        {/* Sticky Blue Generate Button (hidden when displaying rendered commercial) */}
        {!renderedResult && (
          <StickyGenerateBar
            onRender={handleRenderCommercial}
            isRendering={isRendering}
            renderStep={renderStep}
            renderProgress={renderProgress}
          />
        )}
      </div>

      {/* Supabase Storage Architecture Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
