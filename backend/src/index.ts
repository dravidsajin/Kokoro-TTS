import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { ttsRouter } from './routes/tts.routes.js';
import { kokoroTTS } from './services/kokoro.service.js';

const app = express();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api', ttsRouter);

// Root informational endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Vocalis AI TTS Service',
    version: '1.0.0',
    description: 'High-performance Text-to-Speech API powered by Vocalis AI and Kokoro-82M ONNX',
    endpoints: {
      health: 'GET /api/health',
      voices: 'GET /api/voices',
      samples: 'GET /api/samples',
      synthesize: 'POST /api/tts/synthesize',
      rawStream: 'POST or GET /api/tts/raw',
    },
    documentation: 'See README.md for full specs',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Server launch and background model warmup
const server = app.listen(config.port, () => {
  console.log('====================================================');
  console.log(`🎙️  Vocalis AI TTS API Server running on port ${config.port}`);
  console.log(`📍 Base URL: http://localhost:${config.port}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - Health:     http://localhost:${config.port}/api/health`);
  console.log(`   - Voices:     http://localhost:${config.port}/api/voices`);
  console.log(`   - Samples:    http://localhost:${config.port}/api/samples`);
  console.log(`   - Synthesize: http://localhost:${config.port}/api/tts/synthesize`);
  console.log('====================================================');

  // Asynchronously warmup Kokoro model
  kokoroTTS
    .initialize()
    .then(() => {
      console.log('⚡ Kokoro model ready for speech synthesis requests.');
    })
    .catch((err) => {
      console.error('⚠️ Kokoro model background warmup encountered an error:', err.message);
    });
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Gracefully shutting down Kokoro TTS server...');
  server.close(() => {
    console.log('👋 Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
