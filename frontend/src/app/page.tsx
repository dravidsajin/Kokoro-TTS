'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { TextInputArea } from '../components/TextInputArea';
import { AudioPlayerCard } from '../components/AudioPlayerCard';
import { GenerationHistory } from '../components/GenerationHistory';
import { VoiceSelectorModal } from '../components/VoiceSelectorModal';
import { InfoModal } from '../components/InfoModal';
import { getVoices, getSamples, getHealth, synthesize, synthesizeWithProgress } from '../lib/api';
import { INITIAL_VOICES, INITIAL_SAMPLES } from '../lib/constants';
import { VoiceMetadata, SamplePrompt, SynthesizeResponse, HistoryItem, BackendHealth, SynthesisProgress } from '../types/tts';
import { AlertCircle, X, Sparkles, Volume2 } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'vocalis_tts_history_v1';
const STORAGE_KEY_THEME = 'vocalis_tts_theme_v1';

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [voices, setVoices] = useState<VoiceMetadata[]>(INITIAL_VOICES);
  const [samples, setSamples] = useState<SamplePrompt[]>(INITIAL_SAMPLES);
  const [health, setHealth] = useState<BackendHealth | null>(null);

  const [text, setText] = useState<string>(
    'Vocalis is an extraordinary neural text-to-speech engine. Delivering studio audio quality with remarkably fluid pacing, human cadence, and natural resonance.'
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('af_heart');
  const [speed, setSpeed] = useState<number>(1.0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [synthesisProgress, setSynthesisProgress] = useState<SynthesisProgress | null>(null);
  const [currentAudio, setCurrentAudio] = useState<SynthesizeResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  // Initialize Theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'dark' | 'light' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, next);
    } catch (e) {}
  };

  // Load History from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 30));
        }
      }
    } catch (e) {
      console.warn('Could not read history from localStorage:', e);
    }
  }, []);

  const saveHistoryToStorage = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory.slice(0, 30)));
    } catch (e) {
      console.warn('Could not persist history:', e);
    }
  };

  // Fetch initial voices, samples, and health
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [voicesData, samplesData, healthData] = await Promise.all([
        getVoices(),
        getSamples(),
        getHealth(),
      ]);

      if (isMounted) {
        if (voicesData && voicesData.length > 0) setVoices(voicesData);
        if (samplesData && samplesData.length > 0) setSamples(samplesData);
        if (healthData) setHealth(healthData);
      }
    }

    loadData();

    const interval = setInterval(async () => {
      const h = await getHealth();
      if (isMounted && h) setHealth(h);
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0];

  const handleSynthesize = useCallback(async () => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSynthesisProgress({
      stage: 'preparing',
      currentChunk: 0,
      totalChunks: 0,
      percent: 5,
      chunkText: 'Initializing synthesis...',
    });

    try {
      const result = await synthesizeWithProgress(
        text.trim(),
        selectedVoiceId,
        speed,
        (progress) => {
          setSynthesisProgress(progress);
        }
      );
      setCurrentAudio(result);

      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        text: text.trim(),
        voiceId: result.voice,
        voiceName: selectedVoice?.name || result.voice,
        audioBase64: result.audioBase64,
        durationSeconds: result.durationSeconds,
        samplingRate: result.samplingRate,
        generationTimeMs: result.generationTimeMs,
        cached: result.cached,
        createdAt: Date.now(),
        speed,
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev.filter((i) => i.text !== newItem.text || i.voiceId !== newItem.voiceId)];
        saveHistoryToStorage(updated);
        return updated;
      });
    } catch (err: any) {
      console.error('Synthesis failed:', err);
      setErrorMessage(err.message || 'Speech generation failed. Please check backend connection.');
    } finally {
      setIsLoading(false);
      setSynthesisProgress(null);
    }
  }, [text, selectedVoiceId, speed, isLoading, selectedVoice]);

  const handlePreviewVoice = async (voice: VoiceMetadata) => {
    if (previewingVoiceId) return;
    setPreviewingVoiceId(voice.id);

    try {
      const sampleText = voice.previewSampleText || `Hello, I am ${voice.name}. This is Vocalis neural speech synthesis.`;
      const result = await synthesize(sampleText, voice.id, 1.0);
      const audio = new Audio(`data:audio/wav;base64,${result.audioBase64}`);
      audio.onended = () => setPreviewingVoiceId(null);
      audio.onerror = () => setPreviewingVoiceId(null);
      await audio.play();
    } catch (e) {
      console.warn('Voice preview error:', e);
      setPreviewingVoiceId(null);
    }
  };

  const handleSelectSample = (sample: SamplePrompt) => {
    setText(sample.text);
    if (sample.voice && voices.some((v) => v.id === sample.voice)) {
      setSelectedVoiceId(sample.voice);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setText(item.text);
    setSelectedVoiceId(item.voiceId);
    setSpeed(item.speed || 1.0);
    setCurrentAudio({
      audioBase64: item.audioBase64,
      format: 'wav',
      durationSeconds: item.durationSeconds,
      samplingRate: item.samplingRate,
      generationTimeMs: item.generationTimeMs,
      voice: item.voiceId,
      textLength: item.text.length,
      wordCount: item.text.split(/\s+/).length,
      cached: item.cached,
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      saveHistoryToStorage(updated);
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {}
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        health={health}
        voiceCount={voices.length}
      />

      {/* Hero Section */}
      <section className="hero-banner">
        <div className="app-container">
          <div className="hero-content-wrap">
            <div>
              <div className="hero-pill-badge">
                <Sparkles size={13} color="#06b6d4" />
                <span>Next-Gen Neural Speech Architecture</span>
              </div>
              <h2 className="hero-title">
                Studio-Grade Text to Speech with{' '}
                <span className="text-gradient">Vocalis AI</span>
              </h2>
              <p className="hero-desc">
                Transform written words into nuanced, natural human voices. Powered by quantized ONNX neural weights and 24kHz studio audio.
              </p>
            </div>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="btn-browse-voices"
            >
              <Volume2 size={15} color="#06b6d4" />
              <span>Browse 28 Voices</span>
            </button>
          </div>
        </div>
      </section>

      {/* Error Toast */}
      {errorMessage && (
        <div className="app-container" style={{ margin: '8px auto' }}>
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#fecdd3', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#fb7185" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              style={{ color: '#fb7185', padding: '4px' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Studio Workspace Main Grid */}
      <main className="app-container" style={{ flex: 1, width: '100%', maxWidth: '1240px', minWidth: 0, boxSizing: 'border-box' }}>
        <div className="studio-main-grid">
          {/* Left Column: Script & Controls */}
          <div className="studio-col">
            <TextInputArea
              text={text}
              onChangeText={setText}
              speed={speed}
              onChangeSpeed={setSpeed}
              selectedVoice={selectedVoice}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onSynthesize={handleSynthesize}
              isLoading={isLoading}
              progress={synthesisProgress}
              samples={samples}
              onSelectSample={handleSelectSample}
            />
          </div>

          {/* Right Column: Audio Station & Library */}
          <div className="studio-col">
            <AudioPlayerCard
              currentAudio={currentAudio}
              textTranscript={text}
              selectedVoiceName={selectedVoice?.name || selectedVoiceId}
            />

            <GenerationHistory
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="app-container footer-row">
          <div>
            <strong>Vocalis AI Studio</strong> • Full-Stack Next.js & Node.js TypeScript Architecture
          </div>
          <div>
            Neural ONNX Architecture & 24kHz Studio Audio
          </div>
        </div>
      </footer>

      {/* Voice Selector Modal */}
      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voices={voices}
        selectedVoiceId={selectedVoiceId}
        onSelectVoice={(id) => setSelectedVoiceId(id)}
        onPreviewVoice={handlePreviewVoice}
        previewingVoiceId={previewingVoiceId}
      />

      {/* Architecture Specs Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
