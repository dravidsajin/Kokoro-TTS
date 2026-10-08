export type VoiceGender = 'female' | 'male';
export type VoiceAccent = 'american' | 'british';
export type VoiceQuality = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-';

export interface VoiceMetadata {
  id: string;
  name: string;
  gender: VoiceGender;
  accent: VoiceAccent;
  quality: VoiceQuality;
  traits: string[];
  description: string;
  previewSampleText: string;
  isPopular?: boolean;
}

export interface SynthesizeRequest {
  text: string;
  voice?: string;
  speed?: number;
  format?: 'wav' | 'base64';
}

export interface SynthesizeResult {
  audioBase64: string;
  audioUrl?: string;
  format: 'wav';
  durationSeconds: number;
  samplingRate: number;
  generationTimeMs: number;
  voice: string;
  textLength: number;
  wordCount: number;
  cached: boolean;
}

export interface SystemHealth {
  status: 'ready' | 'loading' | 'error';
  modelId: string;
  device: string;
  dtype: string;
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  totalGenerations: number;
  cacheStats: {
    size: number;
    hits: number;
    misses: number;
  };
}
