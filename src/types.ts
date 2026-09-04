export type GenerationMode = 'inspiration' | 'raw_cut' | 'hybrid';

export type CommercialAspectRatio = '9:16' | '16:9' | '1:1';
export type TargetDuration = '15s' | '30s' | '60s';

export interface UploadedAsset {
  id: string;
  name: string;
  size: number;
  type: 'inspiration' | 'raw_footage';
  previewUrl: string;
  uploadProgress: number; // 0 to 100
  status: 'ready' | 'uploading' | 'completed' | 'error';
  supabasePath?: string;
  duration?: number;
  file?: File;
}

export interface RenderCommercialConfig {
  mode: GenerationMode;
  inspirationFile: UploadedAsset | null;
  rawAssets: UploadedAsset[];
  script: string;
  aspectRatio: CommercialAspectRatio;
  duration: TargetDuration;
  voiceoverStyle: string;
  captionStyle: 'bold-viral' | 'clean-minimal' | 'cinematic';
  musicVibe: 'trending-phonk' | 'synth-hype' | 'lofi-acoustic' | 'cinematic-epic';
}

export interface RenderedCommercial {
  id: string;
  title: string;
  mode: GenerationMode;
  videoUrl: string;
  thumbnailUrl: string;
  aspectRatio: CommercialAspectRatio;
  duration: TargetDuration;
  script: string;
  createdAt: number;
  supabaseStorageInfo: {
    bucket: string;
    path: string;
    publicUrl: string;
  };
  metrics: {
    cutsCount: number;
    hookScore: number; // 0-100
    pacingMultiplier: string;
    targetFormat: string;
  };
}

export interface SupabaseStorageUploadOptions {
  bucket?: string;
  folder?: string;
  onProgress?: (progress: number) => void;
}

export interface SupabaseUploadResult {
  success: boolean;
  bucket: string;
  path: string;
  publicUrl: string;
  error?: string;
}

