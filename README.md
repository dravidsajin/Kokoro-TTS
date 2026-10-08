# 🎙️ Kokoro TTS Studio — Full-Stack Neural Text-to-Speech

A production-ready, high-performance Text-to-Speech (TTS) application powered by the state-of-the-art **Kokoro-82M v1.0** neural model, featuring a **Next.js** frontend with custom obsidian/violet glassmorphism and an optimized **Node.js & TypeScript** ONNX runtime microservice.

---

## 🌟 Key Highlights

- **🧠 Kokoro-82M Neural Model**: Frontier 82-million parameter TTS model providing natural prosody, human-like cadence, and 24kHz studio-grade audio.
- **⚡ High-Throughput Node.js Microservice**: TypeScript backend utilizing `onnxruntime-node` with Q8 quantization for fast CPU neural inference.
- **🌊 Real-time Web Audio API Spectrum Visualizer**: Dynamic HTML5 Canvas audio spectrum analyzer that animates live frequency bars during speech playback.
- **🗃️ SHA-256 LRU Audio Caching**: Repeated sentences synthesize in **~1ms** with zero neural inference overhead.
- **✂️ Intelligent Sentence Chunking**: Seamlessly splits long paragraphs into natural clauses and stitches audio buffers with acoustic pause padding.
- **🎭 28 Expressive Voices**: Full catalog across American and British accents with quality grading (Grade A, A-, B+, etc.), gender classification, and trait tags.
- **🎨 Bespoke Obsidian & Violet Studio Theming**: Dark mode with radiant glow accents and glassmorphism, plus an Alpine Studio light mode toggle.
- **📦 Generation Library**: Client-side history drawer with instant playback, WAV download, and persistence.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│               Next.js 15+ Frontend                     │
│  - App Router & TypeScript                             │
│  - Studio Obsidian & Alpine Light Theming              │
│  - Web Audio API Canvas Spectrum Visualizer            │
│  - Interactive Voice Explorer (28 Voices)              │
│  - Timeline Seekbar, Volume & Speed Controls           │
│  - Client-Side Generation History (LocalStorage)       │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / Rewrites (/api/backend/*)
┌──────────────────────────▼─────────────────────────────┐
│           Node.js & TypeScript Backend (Port 5001)     │
│  - Express REST API + Helmet + CORS + Zod Validation   │
│  - KokoroTTSService (Singleton with Async Warmup)      │
│  - ONNX Runtime Engine (onnx-community/Kokoro-82M-v1.0)│
│  - Sentence & Clause Chunker + WAV Buffer Concatenator │
│  - SHA-256 LRU Audio Memory Cache                      │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
├── backend/
│   ├── src/
│   │   ├── config.ts              # Server & Kokoro model configurations
│   │   ├── index.ts               # Express application entrypoint & warmup
│   │   ├── routes/
│   │   │   └── tts.routes.ts      # REST endpoints (/voices, /synthesize, /raw, /health)
│   │   ├── services/
│   │   │   ├── cache.service.ts   # SHA-256 in-memory LRU audio cache
│   │   │   ├── kokoro.service.ts  # Kokoro-82M ONNX model loader & chunker
│   │   │   └── wav.helper.ts      # PCM-to-WAV converter & chunk concatenator
│   │   └── types/
│   │       └── tts.types.ts       # TypeScript schemas and interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css        # Bespoke design system, glassmorphism & themes
│   │   │   ├── layout.tsx         # Root layout with typography and metadata
│   │   │   └── page.tsx           # Studio workspace coordinating audio and state
│   │   ├── components/
│   │   │   ├── AudioPlayerCard.tsx# Master player with timeline, volume & download
│   │   │   ├── AudioVisualizer.tsx# Web Audio API real-time canvas visualizer
│   │   │   ├── GenerationHistory.tsx# Saved clips library with replay & export
│   │   │   ├── InfoModal.tsx      # System architecture & specs dialog
│   │   │   ├── Navbar.tsx         # Navigation header, health badge & theme switch
│   │   │   ├── TextInputArea.tsx  # Script editor with presets & speed slider
│   │   │   └── VoiceSelectorModal.tsx # Voice gallery with search & filters
│   │   ├── lib/
│   │   │   ├── api.ts             # API client with automatic rewrite fallbacks
│   │   │   └── constants.ts       # Fallback voice directories & prompts
│   │   └── types/
│   │       └── tts.ts             # Client TypeScript interfaces
│   ├── next.config.ts             # Next.js config with backend proxy rewrites
│   └── package.json
│
├── package.json                   # Root monorepo orchestrator
└── README.md                      # Documentation
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### 2. Installation
Run the root installation command:
```bash
# Install root orchestrator dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Running with One Command (Shell Script)
Run the automated shell script to start both Backend and Frontend concurrently with automatic port cleanup and graceful shutdown:
```bash
./start.sh
# or
bash start.sh
```

Alternatively, you can run via npm:
```bash
npm start
# or
npm run dev
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001](http://localhost:5001)

### 4. Running Backend or Frontend Individually
```bash
# Run backend only (port 5001)
npm run dev:backend

# Run frontend only (port 3000)
npm run dev:frontend
```

---

## 🔌 API Reference

### 1. Health Check
`GET /api/health`
Returns system readiness, memory metrics, and cache hit rates.

**Sample Response**:
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "modelId": "onnx-community/Kokoro-82M-v1.0-ONNX",
    "device": "cpu",
    "dtype": "q8",
    "uptimeSeconds": 1420,
    "memoryUsageMb": { "rss": 267, "heapUsed": 22, "heapTotal": 26 },
    "totalGenerations": 12,
    "cacheStats": { "size": 8, "hits": 4, "misses": 8, "hitRate": "0.33" }
  }
}
```

---

### 2. Voice Catalog
`GET /api/voices`
Query parameters:
- `accent`: `american` | `british`
- `gender`: `female` | `male`
- `query`: Search string across name or traits

**Sample Response**:
```json
{
  "success": true,
  "count": 28,
  "data": [
    {
      "id": "af_heart",
      "name": "Heart (Recommended)",
      "gender": "female",
      "accent": "american",
      "quality": "A",
      "traits": ["Warm", "Natural", "Expressive", "High Quality"],
      "description": "The highest quality female voice with exceptional naturalness.",
      "previewSampleText": "Hello! I am Heart, the flagship voice with pristine clarity.",
      "isPopular": true
    }
  ]
}
```

---

### 3. Speech Synthesis (JSON)
`POST /api/tts/synthesize`

**Request Body**:
```json
{
  "text": "Kokoro produces studio-quality speech at incredible speed.",
  "voice": "af_heart",
  "speed": 1.0
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "audioBase64": "UklGRiS0BQBXQVZFZm10...",
    "format": "wav",
    "durationSeconds": 3.42,
    "samplingRate": 24000,
    "generationTimeMs": 310,
    "voice": "af_heart",
    "textLength": 62,
    "wordCount": 9,
    "cached": false
  }
}
```

---

### 4. Direct Audio Stream / Binary
`POST` or `GET /api/tts/raw?text=...&voice=...&speed=...`
Returns binary `Content-Type: audio/wav` for direct integration into HTML5 `<audio>` tags or automated downloads.

---

## 🎙️ Supported Voices (28 Voices)

| Voice ID | Name | Accent | Gender | Quality Grade | Suggested Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **af_heart** | Heart | 🇺🇸 American | Female | **Grade A** | Flagship, Natural Narration |
| **af_bella** | Bella | 🇺🇸 American | Female | **Grade A-** | Dynamic, Marketing, Presentations |
| **af_nicole** | Nicole | 🇺🇸 American | Female | **Grade B-** | Studio Narrator, Calm Podcasts |
| **am_michael** | Michael | 🇺🇸 American | Male | **Grade B** | Warm Documentary, Long-form |
| **am_adam** | Adam | 🇺🇸 American | Male | **Grade B** | Deep Baritone, Tech & Authority |
| **bf_emma** | Emma | 🇬🇧 British | Female | **Grade B-** | Eloquent, Sophisticated |
| **bm_george** | George | 🇬🇧 British | Male | **Grade C** | Classic BBC Documentary |
| **bm_fable** | Fable | 🇬🇧 British | Male | **Grade C** | Storyteller, Fantasy & Fiction |
| *+20 more* | ... | 🇺🇸 / 🇬🇧 | Female / Male | Various | See Voice Selector in Studio |

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in `backend/` to customize settings:

```env
PORT=5001
CORS_ORIGIN=*
KOKORO_MODEL_ID=onnx-community/Kokoro-82M-v1.0-ONNX
KOKORO_DTYPE=q8
KOKORO_DEVICE=cpu
DEFAULT_VOICE=af_heart
DEFAULT_SPEED=1.0
MAX_TEXT_LENGTH=5000
CACHE_MAX_ITEMS=100
CACHE_TTL_MS=3600000
```

---

## 🛡️ Production Optimizations

1. **Async Warmup**: The ONNX model loads during backend boot so user requests experience immediate low-latency responses.
2. **Buffer Stitching**: Long texts are automatically chunked into natural sentence units and synthesized in sequence with 120ms acoustic pause buffers.
3. **Double-layer Fallbacks**: The Next.js frontend utilizes both relative proxy rewrites (`/api/backend/*`) and direct REST fallbacks (`http://localhost:5001/api/*`).
4. **Zero Audio Lag**: Cached prompts return in under 2ms.
5. **Memory-Safe**: Uses 8-bit quantized ONNX weights requiring under 300MB of RAM.

---

## 📄 License
MIT License. Kokoro model weights licensed under Apache-2.0.
