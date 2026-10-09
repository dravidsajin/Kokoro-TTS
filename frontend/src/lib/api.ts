import { VoiceMetadata, SynthesizeResponse, BackendHealth, SamplePrompt, SynthesisProgress } from '../types/tts';
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

/**
 * Synthesizes speech with real-time SSE progress reporting.
 * Streams progress events per audio chunk and returns the final synthesized result.
 */
export async function synthesizeWithProgress(
  text: string,
  voice: string = 'af_heart',
  speed: number = 1.0,
  onProgress?: (progress: SynthesisProgress) => void
): Promise<SynthesizeResponse> {
  const endpoints = [
    typeof window !== 'undefined' ? `${REWRITE_API_URL}/tts/synthesize-stream` : null,
    `${PRIMARY_API_URL}/tts/synthesize-stream`,
    `http://127.0.0.1:5001/api/tts/synthesize-stream`,
  ].filter(Boolean) as string[];

  let streamError: Error | null = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ text, voice, speed }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: SynthesizeResponse | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last partial line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr) continue;
            try {
              const event = JSON.parse(jsonStr);
              if (event.type === 'progress') {
                onProgress?.({
                  stage: event.stage,
                  currentChunk: event.currentChunk,
                  totalChunks: event.totalChunks,
                  percent: event.percent,
                  chunkText: event.chunkText,
                });
              } else if (event.type === 'result') {
                finalResult = event.data;
              } else if (event.type === 'error') {
                throw new Error(event.error || 'Server reported synthesis failure');
              }
            } catch (pErr) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      if (finalResult) {
        return finalResult;
      }
    } catch (err: any) {
      streamError = err;
      // Try next endpoint
    }
  }

  // Graceful fallback to standard synthesize if SSE was blocked or unsupported
  console.warn('[API] Streaming endpoint unavailable or failed, falling back to standard synthesize:', streamError);
  onProgress?.({
    stage: 'synthesizing',
    currentChunk: 1,
    totalChunks: 1,
    percent: 45,
    chunkText: 'Processing synthesis request...',
  });
  const fallbackResult = await synthesize(text, voice, speed);
  onProgress?.({
    stage: 'done',
    currentChunk: 1,
    totalChunks: 1,
    percent: 100,
    chunkText: 'Audio ready',
  });
  return fallbackResult;
}
