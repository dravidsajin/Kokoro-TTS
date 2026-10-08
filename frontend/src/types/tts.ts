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

export interface SynthesizeResponse {
  audioBase64: string;
  format: 'wav';
  durationSeconds: number;
  samplingRate: number;
  generationTimeMs: number;
  voice: string;
  textLength: number;
  wordCount: number;
  cached: boolean;
}

export interface HistoryItem {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  audioBase64: string;
  durationSeconds: number;
  samplingRate: number;
  generationTimeMs: number;
  cached: boolean;
  createdAt: number;
  speed: number;
}

export interface SamplePrompt {
  id: string;
  category: string;
  title: string;
  voice: string;
  text: string;
}

export interface BackendHealth {
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
    hitRate: string;
  };
}
