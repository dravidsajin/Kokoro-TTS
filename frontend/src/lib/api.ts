import { VoiceMetadata, SynthesizeResponse, BackendHealth, SamplePrompt } from '../types/tts';
import { INITIAL_VOICES, INITIAL_SAMPLES } from './constants';

const PRIMARY_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const REWRITE_API_URL = '/api/backend';

async function requestWithFallback<T>(path: string, options?: RequestInit): Promise<T> {
  // Try rewrite path first in browser, fallback to direct port 5001
  const endpoints = [
    typeof window !== 'undefined' ? `${REWRITE_API_URL}${path}` : null,
    `${PRIMARY_API_URL}${path}`,
    `http://127.0.0.1:5001/api${path}`,
  ].filter(Boolean) as string[];

  let lastError: Error | null = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      lastError = err;
      // Try next endpoint
    }
  }

  throw lastError || new Error(`Failed to request ${path}`);
}

export async function getVoices(): Promise<VoiceMetadata[]> {
  try {
    const res = await requestWithFallback<{ success: boolean; data: VoiceMetadata[] }>('/voices');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return INITIAL_VOICES;
  } catch (err) {
    console.warn('[API] Could not fetch remote voices, using initial catalog:', err);
    return INITIAL_VOICES;
  }
}

export async function getSamples(): Promise<SamplePrompt[]> {
  try {
    const res = await requestWithFallback<{ success: boolean; data: SamplePrompt[] }>('/samples');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return INITIAL_SAMPLES;
  } catch (err) {
    console.warn('[API] Could not fetch remote samples, using fallback:', err);
    return INITIAL_SAMPLES;
  }
}

export async function getHealth(): Promise<BackendHealth | null> {
  try {
    const res = await requestWithFallback<{ success: boolean; data: BackendHealth }>('/health');
    return res.data;
  } catch (err) {
    return null;
  }
}

export async function synthesize(
  text: string,
  voice: string = 'af_heart',
  speed: number = 1.0
): Promise<SynthesizeResponse> {
  const res = await requestWithFallback<{ success: boolean; data: SynthesizeResponse }>('/tts/synthesize', {
    method: 'POST',
    body: JSON.stringify({ text, voice, speed }),
  });

  if (!res.success || !res.data) {
    throw new Error('Failed to generate speech');
  }

  return res.data;
}
