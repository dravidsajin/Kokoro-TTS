import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { kokoroTTS } from '../services/kokoro.service.js';
import { config } from '../config.js';

export const ttsRouter = Router();

// Validation schema for synthesis request
const synthesizeSchema = z.object({
  text: z.string().trim().min(1, 'Text is required').max(config.maxTextLength, `Max text length is ${config.maxTextLength} characters`),
  voice: z.string().optional().default(config.defaultVoice),
  speed: z.number().min(0.5).max(2.0).optional().default(config.defaultSpeed),
});

// Curated sample library
const SAMPLE_PROMPTS = [
  {
    id: 'sample-1',
    category: 'Innovation',
    title: 'The AI Revolution',
    voice: 'af_heart',
    text: 'Kokoro is an extraordinary open-weight text-to-speech model. Packing 82 million parameters, it delivers audio quality comparable to models ten times its size, with remarkably fluid pacing and natural resonance.',
  },
  {
    id: 'sample-2',
    category: 'Audiobook',
    title: 'Cosmic Journey',
    voice: 'am_michael',
    text: 'Far beyond the perimeter of known constellations, the silence of deep space was interrupted only by the rhythmic hum of the navigation core. Every light year brought them closer to an uncharted world.',
  },
  {
    id: 'sample-3',
    category: 'Elegance',
    title: 'British Literature',
    voice: 'bf_emma',
    text: 'It is a truth universally acknowledged that an evening filled with captivating conversations, good company, and great tea makes for an utterly delightful memory.',
  },
  {
    id: 'sample-4',
    category: 'Storytelling',
    title: 'Mythic Chronicles',
    voice: 'bm_fable',
    text: 'Legend speaks of an ancient forge buried beneath the Whispering Mountains, where artisans crafted instruments capable of speaking in tones of pure gold and fire.',
  },
  {
    id: 'sample-5',
    category: 'Assistant',
    title: 'Smart Assistant',
    voice: 'af_bella',
    text: 'Good morning! Your schedule is clear until two in the afternoon, the weather is seventy-two degrees and sunny, and your morning briefing is ready whenever you are.',
  },
  {
    id: 'sample-6',
    category: 'Tech Tutorial',
    title: 'Architecture Overview',
    voice: 'am_adam',
    text: 'Our full-stack architecture utilizes Next.js for a responsive, reactive interface, paired with a high-throughput Node.js TypeScript microservice executing local ONNX neural speech synthesis.',
  },
];

// GET /api/health
ttsRouter.get('/health', (req: Request, res: Response) => {
  const health = kokoroTTS.getHealth();
  res.json({
    success: true,
    data: health,
  });
});

// GET /api/voices
ttsRouter.get('/voices', (req: Request, res: Response) => {
  let voices = kokoroTTS.getVoices();
  const { gender, accent, query } = req.query;

  if (typeof gender === 'string') {
    voices = voices.filter((v) => v.gender.toLowerCase() === gender.toLowerCase());
  }

  if (typeof accent === 'string') {
    voices = voices.filter((v) => v.accent.toLowerCase() === accent.toLowerCase());
  }

  if (typeof query === 'string' && query.trim()) {
    const q = query.toLowerCase().trim();
    voices = voices.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.traits.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: voices.length,
    data: voices,
  });
});

// GET /api/samples
ttsRouter.get('/samples', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: SAMPLE_PROMPTS,
  });
});

// POST /api/tts/synthesize
ttsRouter.post('/tts/synthesize', async (req: Request, res: Response) => {
  try {
    const validated = synthesizeSchema.parse(req.body);
    const result = await kokoroTTS.synthesize(validated.text, validated.voice, validated.speed);

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: err.issues,
      });
      return;
    }

    console.error('[TTS Route Error]', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Speech synthesis failed',
    });
  }
});

// POST /api/tts/synthesize-stream (Server-Sent Events stream with granular progress)
ttsRouter.post('/tts/synthesize-stream', async (req: Request, res: Response) => {
  try {
    const validated = synthesizeSchema.parse(req.body);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Content-Encoding': 'none',
    });

    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    const sendEvent = (data: any) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }
    };

    // Immediate ping to force socket transmission
    res.write(': connected\n\n');

    // Initial event
    sendEvent({
      type: 'progress',
      stage: 'preparing',
      currentChunk: 0,
      totalChunks: 0,
      percent: 8,
      chunkText: 'Initializing synthesis...',
    });

    const result = await kokoroTTS.synthesizeWithProgress(
      validated.text,
      validated.voice,
      validated.speed,
      (progress) => {
        sendEvent({
          type: 'progress',
          ...progress,
        });
      }
    );

    sendEvent({
      type: 'result',
      data: result,
    });
    res.end();
  } catch (err: any) {
    if (res.headersSent) {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: err?.message || 'Synthesis failed' })}\n\n`);
        res.end();
      }
    } else {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: err.issues,
        });
        return;
      }

      console.error('[TTS Stream Route Error]', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Speech synthesis failed',
      });
    }
  }
});

// POST or GET /api/tts/raw (Binary audio stream)
ttsRouter.all('/tts/raw', async (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const validated = synthesizeSchema.parse(params);

    const { buffer, duration } = await kokoroTTS.synthesizeToBuffer(
      validated.text,
      validated.voice,
      validated.speed
    );

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('X-Audio-Duration', duration);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.issues[0]?.message || 'Invalid parameters' });
      return;
    }
    console.error('[TTS Raw Route Error]', err);
    res.status(500).json({ success: false, error: err.message || 'Audio generation failed' });
  }
});
