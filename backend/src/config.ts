import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  modelId: process.env.KOKORO_MODEL_ID || 'onnx-community/Kokoro-82M-v1.0-ONNX',
  dtype: (process.env.KOKORO_DTYPE || 'q8') as 'fp32' | 'fp16' | 'q8' | 'q4' | 'q4f16',
  device: (process.env.KOKORO_DEVICE || 'cpu') as 'cpu',
  defaultVoice: process.env.DEFAULT_VOICE || 'af_heart',
  defaultSpeed: parseFloat(process.env.DEFAULT_SPEED || '1.0'),
  maxTextLength: parseInt(process.env.MAX_TEXT_LENGTH || '5000', 10),
  cacheMaxItems: parseInt(process.env.CACHE_MAX_ITEMS || '100', 10),
  cacheTtlMs: parseInt(process.env.CACHE_TTL_MS || '3600000', 10), // 1 hour
};
