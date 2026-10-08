import { KokoroTTS } from 'kokoro-js';
import { config } from '../config.js';
import { VoiceMetadata, SynthesizeResult, SystemHealth } from '../types/tts.types.js';
import { audioCache } from './cache.service.js';
import { createWavBuffer, concatenateAudioChunks } from './wav.helper.js';

export const VOICES_CATALOG: VoiceMetadata[] = [
  // American Female
  {
    id: 'af_heart',
    name: 'Heart (Recommended)',
    gender: 'female',
    accent: 'american',
    quality: 'A',
    traits: ['Warm', 'Natural', 'Expressive', 'High Quality'],
    description: 'The highest quality female voice with exceptional naturalness and warm inflection.',
    previewSampleText: 'Hello! I am Heart, the flagship voice with pristine clarity and warmth.',
    isPopular: true,
  },
  {
    id: 'af_bella',
    name: 'Bella',
    gender: 'female',
    accent: 'american',
    quality: 'A-',
    traits: ['Energetic', 'Polished', 'Dynamic'],
    description: 'Vibrant and expressive American voice ideal for marketing, presentations, and storytelling.',
    previewSampleText: 'Welcome to our platform. Everything you need is right here at your fingertips.',
    isPopular: true,
  },
  {
    id: 'af_nicole',
    name: 'Nicole',
    gender: 'female',
    accent: 'american',
    quality: 'B-',
    traits: ['Calm', 'Studio Narrator', 'Crisp'],
    description: 'Smooth, podcast-style voice with clear diction and steady pacing.',
    previewSampleText: 'Today we are exploring the frontiers of artificial intelligence and speech synthesis.',
    isPopular: true,
  },
  {
    id: 'af_aoede',
    name: 'Aoede',
    gender: 'female',
    accent: 'american',
    quality: 'C+',
    traits: ['Gentle', 'Melodic', 'Soft'],
    description: 'Soothing and melodic tone suited for audiobooks and meditation.',
    previewSampleText: 'Take a deep breath and relax as we embark on this quiet journey together.',
  },
  {
    id: 'af_kore',
    name: 'Kore',
    gender: 'female',
    accent: 'american',
    quality: 'C+',
    traits: ['Contemplative', 'Soft', 'Intimate'],
    description: 'Delicate tone suitable for thoughtful essays and poetic narration.',
    previewSampleText: 'Between the silence of thought and the resonance of sound lies meaning.',
  },
  {
    id: 'af_sarah',
    name: 'Sarah',
    gender: 'female',
    accent: 'american',
    quality: 'C+',
    traits: ['Professional', 'Articulate', 'Clear'],
    description: 'Balanced business professional voice for tutorials and documentation.',
    previewSampleText: 'Please review the system architecture diagram before initiating the deployment.',
  },
  {
    id: 'af_nova',
    name: 'Nova',
    gender: 'female',
    accent: 'american',
    quality: 'C',
    traits: ['Bright', 'Conversational', 'Youthful'],
    description: 'Bright and approachable tone for modern conversational assistants.',
    previewSampleText: 'Hey there! How can I help you streamline your creative workflow today?',
  },
  {
    id: 'af_alloy',
    name: 'Alloy',
    gender: 'female',
    accent: 'american',
    quality: 'C',
    traits: ['Direct', 'Modern', 'Clean'],
    description: 'Crisp, contemporary voice with neutral inflection.',
    previewSampleText: 'System diagnostics complete. All modules are operating within normal parameters.',
  },
  {
    id: 'af_river',
    name: 'River',
    gender: 'female',
    accent: 'american',
    quality: 'D',
    traits: ['Casual', 'Youthful'],
    description: 'Spontaneous and casual style for informal dialog.',
    previewSampleText: 'Check this out, it only takes a couple of clicks to configure.',
  },
  {
    id: 'af_sky',
    name: 'Sky',
    gender: 'female',
    accent: 'american',
    quality: 'C-',
    traits: ['Airy', 'Light'],
    description: 'Light and airy timbre for playful and casual scenarios.',
    previewSampleText: 'The sky is clear and the possibilities are endless.',
  },
  {
    id: 'af_jessica',
    name: 'Jessica',
    gender: 'female',
    accent: 'american',
    quality: 'D',
    traits: ['Friendly', 'Relaxed'],
    description: 'Friendly everyday American tone.',
    previewSampleText: 'Let us take a look at the latest updates together.',
  },

  // American Male
  {
    id: 'am_michael',
    name: 'Michael',
    gender: 'male',
    accent: 'american',
    quality: 'B',
    traits: ['Warm', 'Narrator', 'Authoritative'],
    description: 'Rich, comforting male voice perfect for documentary narration and long-form audio.',
    previewSampleText: 'In the vast expanse of the cosmos, discovery is only the beginning of our story.',
    isPopular: true,
  },
  {
    id: 'am_adam',
    name: 'Adam',
    gender: 'male',
    accent: 'american',
    quality: 'B',
    traits: ['Deep', 'Resonant', 'Confident'],
    description: 'Strong, deep baritone voice with command and gravitas.',
    previewSampleText: 'Precision engineering and thoughtful design define everything we create.',
    isPopular: true,
  },
  {
    id: 'am_fenrir',
    name: 'Fenrir',
    gender: 'male',
    accent: 'american',
    quality: 'C+',
    traits: ['Cinematic', 'Deep', 'Textured'],
    description: 'Cinematic resonance for trailers, drama, and intense readings.',
    previewSampleText: 'From the shadows of the past emerges a new standard of power.',
  },
  {
    id: 'am_puck',
    name: 'Puck',
    gender: 'male',
    accent: 'american',
    quality: 'C+',
    traits: ['Playful', 'Energetic', 'Character'],
    description: 'Lively, expressive character voice for creative content and stories.',
    previewSampleText: 'Ready for an adventure? Buckle up, because things are about to get interesting!',
  },
  {
    id: 'am_echo',
    name: 'Echo',
    gender: 'male',
    accent: 'american',
    quality: 'D',
    traits: ['Direct', 'Clear'],
    description: 'Straightforward tone for technical reading and announcements.',
    previewSampleText: 'The requested action has been processed successfully.',
  },
  {
    id: 'am_eric',
    name: 'Eric',
    gender: 'male',
    accent: 'american',
    quality: 'D',
    traits: ['Conversational', 'Casual'],
    description: 'Relaxed conversational delivery for casual audio.',
    previewSampleText: 'Sounds good to me, let us wrap up the details tomorrow.',
  },
  {
    id: 'am_liam',
    name: 'Liam',
    gender: 'male',
    accent: 'american',
    quality: 'D',
    traits: ['Friendly', 'Youthful'],
    description: 'Modern, friendly everyday voice.',
    previewSampleText: 'Thanks for tuning in, I hope you have an awesome rest of your day.',
  },
  {
    id: 'am_onyx',
    name: 'Onyx',
    gender: 'male',
    accent: 'american',
    quality: 'D',
    traits: ['Low Pitch', 'Steady'],
    description: 'Low-pitched, measured delivery for serious announcements.',
    previewSampleText: 'Security verification completed. Access granted to privileged workspace.',
  },
  {
    id: 'am_santa',
    name: 'Santa',
    gender: 'male',
    accent: 'american',
    quality: 'D-',
    traits: ['Jovial', 'Deep', 'Warm'],
    description: 'Deep, jolly festive character voice.',
    previewSampleText: 'Ho ho ho! Wishing you joy, cheer, and wonderful holidays!',
  },

  // British Female
  {
    id: 'bf_emma',
    name: 'Emma',
    gender: 'female',
    accent: 'british',
    quality: 'B-',
    traits: ['Sophisticated', 'Eloquent', 'Warm'],
    description: 'Refined British female voice with sophisticated cadence and warmth.',
    previewSampleText: 'Good evening. It is an absolute pleasure to welcome you to tonight’s recital.',
    isPopular: true,
  },
  {
    id: 'bf_isabella',
    name: 'Isabella',
    gender: 'female',
    accent: 'british',
    quality: 'C',
    traits: ['Crisp', 'Refined', 'Academic'],
    description: 'Precise British pronunciation ideal for educational and cultural presentations.',
    previewSampleText: 'Historical records show that innovative thought flourished during this era.',
  },
  {
    id: 'bf_alice',
    name: 'Alice',
    gender: 'female',
    accent: 'british',
    quality: 'D',
    traits: ['Gentle', 'Understated'],
    description: 'Subtle and gentle British cadence for quiet narratives.',
    previewSampleText: 'The countryside was bathed in a gentle morning mist.',
  },
  {
    id: 'bf_lily',
    name: 'Lily',
    gender: 'female',
    accent: 'british',
    quality: 'D',
    traits: ['Modern British', 'Soft'],
    description: 'Modern London conversational style.',
    previewSampleText: 'Shall we take a quick look through the notes before we begin?',
  },

  // British Male
  {
    id: 'bm_george',
    name: 'George',
    gender: 'male',
    accent: 'british',
    quality: 'C',
    traits: ['Documentary', 'Articulate', 'Classic'],
    description: 'Classic BBC documentary style with impeccable phrasing and depth.',
    previewSampleText: 'Deep within the ancient forest, nature maintains its delicate equilibrium.',
    isPopular: true,
  },
  {
    id: 'bm_fable',
    name: 'Fable',
    gender: 'male',
    accent: 'british',
    quality: 'C',
    traits: ['Storyteller', 'Textured', 'Dramatic'],
    description: 'Theatrical storyteller voice tailored for fantasy, folklore, and fiction.',
    previewSampleText: 'Once upon a time, long before memory had written down its secrets...',
    isPopular: true,
  },
  {
    id: 'bm_lewis',
    name: 'Lewis',
    gender: 'male',
    accent: 'british',
    quality: 'D+',
    traits: ['Modern', 'Podcast', 'Clear'],
    description: 'Contemporary British male delivery for journalism and technology talks.',
    previewSampleText: 'This episode looks at the fundamental shifts reshaping modern technology.',
  },
  {
    id: 'bm_daniel',
    name: 'Daniel',
    gender: 'male',
    accent: 'british',
    quality: 'D',
    traits: ['Calm', 'Measured'],
    description: 'Measured, thoughtful British voice.',
    previewSampleText: 'Let us consider the implications of these developments very carefully.',
  },
];

export class KokoroTTSService {
  private static instance: KokoroTTSService;
  private ttsModel: any = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;
  private totalGenerations: number = 0;
  private startTime: number = Date.now();
  private status: 'ready' | 'loading' | 'error' = 'loading';

  private constructor() {}

  public static getInstance(): KokoroTTSService {
    if (!KokoroTTSService.instance) {
      KokoroTTSService.instance = new KokoroTTSService();
    }
    return KokoroTTSService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.ttsModel) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.status = 'loading';

    this.initPromise = (async () => {
      try {
        console.log(`[KokoroTTS] Initializing model "${config.modelId}" with dtype="${config.dtype}" on device="${config.device}"...`);
        const start = performance.now();

        this.ttsModel = await KokoroTTS.from_pretrained(config.modelId, {
          dtype: config.dtype,
          device: config.device,
        });

        const elapsed = (performance.now() - start).toFixed(0);
        console.log(`[KokoroTTS] Model loaded successfully in ${elapsed}ms! Available voices: ${Object.keys(this.ttsModel.voices).length}`);
        this.status = 'ready';
      } catch (err) {
        console.error('[KokoroTTS] Initialization error:', err);
        this.status = 'error';
        throw err;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  public getVoices(): VoiceMetadata[] {
    return VOICES_CATALOG;
  }

  public getVoice(id: string): VoiceMetadata | undefined {
    return VOICES_CATALOG.find((v) => v.id.toLowerCase() === id.toLowerCase());
  }

  public getHealth(): SystemHealth {
    const memory = process.memoryUsage();
    return {
      status: this.status,
      modelId: config.modelId,
      device: config.device,
      dtype: config.dtype,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      memoryUsageMb: {
        rss: Math.round(memory.rss / (1024 * 1024)),
        heapUsed: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
      },
      totalGenerations: this.totalGenerations,
      cacheStats: audioCache.getStats(),
    };
  }

  /**
   * Intelligently chunks text into manageable segments for natural synthesis
   */
  private splitTextIntoChunks(text: string, maxChunkLength: number = 280): string[] {
    const cleaned = text.replace(/\r\n/g, '\n').trim();
    if (cleaned.length <= maxChunkLength) {
      return [cleaned];
    }

    // Split on sentence boundaries
    const sentences = cleaned.match(/[^.!?\n]+[.!?\n]*/g) || [cleaned];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const rawSentence of sentences) {
      const sentence = rawSentence.trim();
      if (!sentence) continue;

      if ((currentChunk + ' ' + sentence).trim().length <= maxChunkLength) {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }

        // If a single sentence exceeds maxChunkLength, split by commas or semicolons
        if (sentence.length > maxChunkLength) {
          const subClauses = sentence.split(/([,;:]\s+)/);
          let subChunk = '';
          for (const clause of subClauses) {
            if ((subChunk + clause).length <= maxChunkLength) {
              subChunk += clause;
            } else {
              if (subChunk.trim()) chunks.push(subChunk.trim());
              subChunk = clause;
            }
          }
          if (subChunk.trim()) {
            currentChunk = subChunk.trim();
          }
        } else {
          currentChunk = sentence;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [cleaned];
  }

  /**
   * Synthesizes text to speech with performance caching and chunk stitching
   */
  public async synthesize(
    rawText: string,
    voiceId: string = config.defaultVoice,
    speed: number = config.defaultSpeed
  ): Promise<SynthesizeResult> {
    const text = rawText.trim();
    if (!text) {
      throw new Error('Text to synthesize cannot be empty.');
    }

    if (text.length > config.maxTextLength) {
      throw new Error(`Text exceeds maximum allowed length of ${config.maxTextLength} characters.`);
    }

    // Verify voice
    const voiceMeta = this.getVoice(voiceId);
    const validVoiceId = voiceMeta ? voiceMeta.id : config.defaultVoice;
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));

    // Check cache
    const cachedEntry = audioCache.get(text, validVoiceId, clampedSpeed);
    if (cachedEntry) {
      return {
        audioBase64: cachedEntry.buffer.toString('base64'),
        format: 'wav',
        durationSeconds: cachedEntry.durationSeconds,
        samplingRate: cachedEntry.samplingRate,
        generationTimeMs: 0,
        voice: validVoiceId,
        textLength: text.length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        cached: true,
      };
    }

    await this.initialize();

    const startTime = performance.now();
    const chunks = this.splitTextIntoChunks(text);
    const audioChunks: Float32Array[] = [];
    let samplingRate = 24000;

    for (const chunk of chunks) {
      const generated = await this.ttsModel.generate(chunk, {
        voice: validVoiceId,
        speed: clampedSpeed,
      });

      if (generated?.sampling_rate) {
        samplingRate = generated.sampling_rate;
      }

      if (generated?.audio) {
        audioChunks.push(generated.audio);
      }
    }

    const mergedSamples = concatenateAudioChunks(audioChunks, samplingRate, 0.12);
    const durationSeconds = +(mergedSamples.length / samplingRate).toFixed(2);
    const wavBuffer = createWavBuffer(mergedSamples, samplingRate);
    const elapsedMs = Math.round(performance.now() - startTime);

    // Save to cache
    audioCache.set(text, validVoiceId, clampedSpeed, wavBuffer, durationSeconds, samplingRate);
    this.totalGenerations++;

    return {
      audioBase64: wavBuffer.toString('base64'),
      format: 'wav',
      durationSeconds,
      samplingRate,
      generationTimeMs: elapsedMs,
      voice: validVoiceId,
      textLength: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      cached: false,
    };
  }

  /**
   * Direct WAV buffer generator for binary streaming
   */
  public async synthesizeToBuffer(
    rawText: string,
    voiceId: string = config.defaultVoice,
    speed: number = config.defaultSpeed
  ): Promise<{ buffer: Buffer; duration: number; samplingRate: number }> {
    const result = await this.synthesize(rawText, voiceId, speed);
    const buffer = Buffer.from(result.audioBase64, 'base64');
    return {
      buffer,
      duration: result.durationSeconds,
      samplingRate: result.samplingRate,
    };
  }
}

export const kokoroTTS = KokoroTTSService.getInstance();
