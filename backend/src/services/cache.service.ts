import crypto from 'crypto';
import { config } from '../config.js';

interface CacheEntry {
  buffer: Buffer;
  durationSeconds: number;
  samplingRate: number;
  createdAt: number;
  lastAccessedAt: number;
}

class AudioCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private maxItems: number = config.cacheMaxItems;
  private ttlMs: number = config.cacheTtlMs;
  private hits: number = 0;
  private misses: number = 0;

  private generateKey(text: string, voice: string, speed: number): string {
    const raw = `${voice.toLowerCase()}::${speed.toFixed(2)}::${text.trim()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  get(text: string, voice: string, speed: number): CacheEntry | null {
    const key = this.generateKey(text, voice, speed);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiry
    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    entry.lastAccessedAt = Date.now();
    this.hits++;
    return entry;
  }

  set(text: string, voice: string, speed: number, buffer: Buffer, durationSeconds: number, samplingRate: number): void {
    const key = this.generateKey(text, voice, speed);

    // Evict oldest if full
    if (this.cache.size >= this.maxItems) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const [k, v] of this.cache.entries()) {
        if (v.lastAccessedAt < oldestTime) {
          oldestTime = v.lastAccessedAt;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      buffer,
      durationSeconds,
      samplingRate,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    });
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(2) : '0.00',
    };
  }

  clear(): void {
    this.cache.clear();
  }
}

export const audioCache = new AudioCacheService();
