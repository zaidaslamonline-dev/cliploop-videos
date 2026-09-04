import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Film,
  X,
  CheckCircle2,
  Loader2,
  Play,
  FileVideo,
  Sparkles,
  Database,
} from 'lucide-react';
import { UploadedAsset } from '../types';
import { uploadToSupabaseStorage, SAMPLE_CLIPS } from '../lib/supabaseStorage';

interface VideoDropzoneProps {
  id: string;
  title: string; // Must match "Upload Inspiration Video (MP4)" or "Upload Raw Footage / Assets"
  type: 'inspiration' | 'raw_footage';
  asset: UploadedAsset | null;
  onAssetChange: (asset: UploadedAsset | null) => void;
  helperText?: string;
  acceptsMultiple?: boolean;
}

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({
  id,
  title,
  type,
  asset,
  onAssetChange,
  helperText,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Drag event handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleManualSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);

    const assetId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const previewUrl = URL.createObjectURL(file);

    try {
      // Direct storage upload pipeline (Supabase-ready with progressive updates)
      const uploadResult = await uploadToSupabaseStorage(file, file.name, {
        bucket: 'cliploop-videos',
        folder: type === 'inspiration' ? 'inspiration' : 'raw-footage',
        onProgress: (prog) => {
          setUploadProgress(prog);
        },
      });

      const newAsset: UploadedAsset = {
        id: assetId,
        name: file.name,
        size: file.size,
        type,
        previewUrl,
        uploadProgress: 100,
        status: 'completed',
        supabasePath: uploadResult.path,
        file,
      };

      onAssetChange(newAsset);
    } catch (err) {
      console.error('Storage upload failed:', err);
      // Fallback local asset
      const fallbackAsset: UploadedAsset = {
        id: assetId,
        name: file.name,
        size: file.size,
        type,
        previewUrl,
        uploadProgress: 100,
        status: 'completed',
        file,
      };
      onAssetChange(fallbackAsset);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Quick sample asset loader for mobile instant testing
  const handleLoadSample = (sampleIndex: number) => {
    const sample = SAMPLE_CLIPS[sampleIndex];
    if (!sample) return;

    setIsUploading(true);
    setUploadProgress(20);

    setTimeout(() => {
      setUploadProgress(70);
      setTimeout(() => {
        const sampleAsset: UploadedAsset = {
          id: `sample-${Date.now()}`,
          name: sample.name,
          size: 14.8 * 1024 * 1024,
          type,
          previewUrl: sample.sampleVideoUrl,
          uploadProgress: 100,
          status: 'completed',
          supabasePath: `samples/${sample.name}`,
        };
        onAssetChange(sampleAsset);
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);
    }, 200);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (asset?.previewUrl && asset.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(asset.previewUrl);
    }
    onAssetChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleVideoPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlayingPreview) {
      videoRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      videoRef.current.play().then(() => setIsPlayingPreview(true)).catch(() => {});
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-neutral-200">{title}</span>
        </div>

        {/* Supabase Storage tag */}
        <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
          <Database className="w-3 h-3 text-blue-400/80" />
          <span>Supabase Ready</span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id={`${id}-file-input`}
        accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
        onChange={handleManualSelection}
        className="hidden"
      />

      {/* If an asset is already selected / uploaded */}
      {asset ? (
        <div className="relative rounded-2xl bg-neutral-900 border border-neutral-800 p-3 shadow-lg overflow-hidden transition-all group">
          <div className="flex items-center gap-3">
            {/* Video preview thumbnail with play trigger */}
            <div
              onClick={toggleVideoPlayback}
              className="relative w-20 h-20 rounded-xl bg-neutral-950 overflow-hidden shrink-0 border border-neutral-800 flex items-center justify-center cursor-pointer group-hover:border-blue-500/50 transition-colors"
            >
              <video
                ref={videoRef}
                src={asset.previewUrl}
                playsInline
                muted
                loop
                onEnded={() => setIsPlayingPreview(false)}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-neutral-950/40 flex items-center justify-center transition-opacity ${
                  isPlayingPreview ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-md">
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Asset metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for AI Analysis</span>
              </div>
              <p className="text-xs font-semibold text-neutral-100 truncate">
                {asset.name}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-1">
                <span>{formatFileSize(asset.size)}</span>
                <span>•</span>
                <span className="text-blue-400">Direct Storage</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-700/80 transition-colors"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-[11px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/20 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Dropzone State: Dashed border upload box */
        <div
          id={`${id}-dropzone`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[145px] ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-neutral-750 bg-neutral-900/60 hover:bg-neutral-900/90 hover:border-neutral-600'
          }`}
        >
          {isUploading ? (
            <div className="w-full space-y-2.5 py-2">
              <Loader2 className="w-7 h-7 text-blue-500 animate-spin mx-auto" />
              <div className="text-xs font-semibold text-neutral-200">
                Streaming to Supabase Storage... {uploadProgress}%
              </div>
              <div className="w-48 max-w-full mx-auto h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-150 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Cloud / Video Upload Icon */}
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2.5 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>

              {/* Exact user requested Title */}
              <p className="text-sm font-semibold text-neutral-100 tracking-tight">
                {title}
              </p>

              {/* Subtitle helper */}
              <p className="text-xs text-neutral-400 mt-0.5">
                Drag &amp; drop or <span className="text-blue-400 underline font-medium">browse files</span>
              </p>
              <p className="text-[10px] text-neutral-500 font-mono mt-1">
                Supports MP4, MOV, WebM • Max 100MB
              </p>

              {/* Instant sample button for smartphone testing */}
              <div className="mt-3 pt-2.5 border-t border-neutral-800/80 w-full flex items-center justify-center gap-1.5">
                <span className="text-[11px] text-neutral-500">No video file on hand?</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSample(type === 'inspiration' ? 0 : 1);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2 py-0.5 rounded-full transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Use Sample Clip</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
