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
  const [mode, setMode] = useState<GenerationMode>('hybrid');
  const [inspirationAsset, setInspirationAsset] = useState<UploadedAsset | null>(null);
  const [rawAsset, setRawAsset] = useState<UploadedAsset | null>(null);
  const [script, setScript] = useState('');
  const [aspectRatio, setAspectRatio] = useState<CommercialAspectRatio>('9:16');
  const [duration, setDuration] = useState<TargetDuration>('15s');
  const [voiceoverStyle, setVoiceoverStyle] = useState('energetic-creator');
  const [isRendering, setIsRendering] = useState(false);
  const [renderStep, setRenderStep] = useState('');
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedResult, setRenderedResult] = useState<RenderedCommercial | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const showInspirationDropzone = mode === 'inspiration' || mode === 'hybrid';
  const showRawCutDropzone = mode === 'raw_cut' || mode === 'hybrid';

  // Live GPU Backend Connection
  const handleRenderCommercial = async () => {
    setIsRendering(true);
    setRenderProgress(15);
    setRenderStep('Transmitting script to Colab GPU via Ngrok...');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/render`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          script_text: script.trim() || "Testing my zero cost video backend",
          voice: "en-US-ChristopherNeural",
          video_filename: `render_${Date.now()}.mp3`
        })
      });

      setRenderProgress(75);
      setRenderStep('Rendering audio and uploading to Supabase...');

      const data = await response.json();

      if (data.success) {
        setRenderProgress(100);
        setRenderStep('Render Complete!');

        const commercialId = `comm_${Date.now().toString(36)}`;
        const result: RenderedCommercial = {
          id: commercialId,
          title: `Commercial_${mode}_${duration}`,
          mode,
          videoUrl: data.file_url,
          thumbnailUrl: data.file_url,
          aspectRatio,
          duration,
          script: script.trim() || "Testing my zero cost video backend",
          createdAt: Date.now(),
          supabaseStorageInfo: {
            bucket: 'cliploop-videos',
            path: `generated/${commercialId}.mp3`,
            publicUrl: data.file_url,
          },
          metrics: {
            cutsCount: duration === '15s' ? 6 : duration === '30s' ? 12 : 22,
            hookScore: Math.floor(Math.random() * 8) + 91,
            pacingMultiplier: mode === 'raw_cut' ? '1.8x Fast Cut' : '2.1x Kinetic',
            targetFormat: `${aspectRatio} Vertical HD`,
          },
        };

        setRenderedResult(result);
      } else {
        alert("Backend failed to render. Check your Colab logs.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend. Verify your ngrok URL in Vercel Environment Variables.");
    } finally {
      setIsRendering(false);
      setRenderStep('');
    }
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
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-neutral-950 border-x border-neutral-900 shadow-2xl relative">
        <Header
          onOpenSupabaseInfo={() => setIsSupabaseModalOpen(true)}
          onReset={handleReset}
          hasActiveProject={hasActiveProject}
        />

        <main className="flex-1 p-4 space-y-5 pb-6">
          {renderedResult ? (
            <CommercialSuccessView
              commercial={renderedResult}
              onReset={handleReset}
              onModify={() => setRenderedResult(null)}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            />
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              <ModeSelector
                selectedMode={mode}
                onSelectMode={(newMode) => setMode(newMode)}
              />

              <div className="space-y-4">
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

              <ScriptInput value={script} onChange={setScript} />

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

        {!renderedResult && (
          <StickyGenerateBar
            onRender={handleRenderCommercial}
            isRendering={isRendering}
            renderStep={renderStep}
            renderProgress={renderProgress}
          />
        )}
      </div>

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
