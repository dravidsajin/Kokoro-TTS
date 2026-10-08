'use client';

import React from 'react';
import {
  Wand2,
  Trash2,
  Clipboard,
  Sliders,
  ChevronRight,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { VoiceMetadata, SamplePrompt } from '../types/tts';

interface TextInputAreaProps {
  text: string;
  onChangeText: (text: string) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  selectedVoice: VoiceMetadata | undefined;
  onOpenVoiceModal: () => void;
  onSynthesize: () => void;
  isLoading: boolean;
  samples: SamplePrompt[];
  onSelectSample: (sample: SamplePrompt) => void;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  text,
  onChangeText,
  speed,
  onChangeSpeed,
  selectedVoice,
  onOpenVoiceModal,
  onSynthesize,
  isLoading,
  samples,
  onSelectSample,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Automatically reset immediate submission state once loading completes or errors
  React.useEffect(() => {
    if (!isLoading) {
      setIsSubmitting(false);
    }
  }, [isLoading]);

  const isGenerating = isLoading || isSubmitting;
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = wordCount > 0 ? Math.max(1, Math.round(wordCount / (2.5 * speed))) : 0;

  const handleGenerateClick = () => {
    if (isGenerating || !text.trim()) return;
    setIsSubmitting(true);
    onSynthesize();
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChangeText(clipText);
      }
    } catch (e) {
      console.warn('Could not read clipboard:', e);
    }
  };

  const handleClear = () => {
    onChangeText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerateClick();
    }
  };

  return (
    <div className="studio-card" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Top Header: Title & Actions */}
      <div className="card-top-bar">
        <div className="card-title-tag">
          <span className="card-title-dot"></span>
          <span>Text Script Prompt</span>
        </div>

        <div className="card-top-actions">
          <button
            onClick={handlePaste}
            className="btn-micro"
            title="Paste from clipboard"
          >
            <Clipboard size={12} color="#06b6d4" />
            <span>Paste</span>
          </button>
          {text && (
            <button
              onClick={handleClear}
              className="btn-micro btn-micro-danger"
              title="Clear text"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset sample pills */}
      <div className="presets-section">
        <div className="presets-label-row">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={13} color="#06b6d4" />
            <strong>Quick Presets</strong>
          </span>
          <span>Click to insert sample</span>
        </div>
        <div className="presets-chips-row">
          {samples.slice(0, 5).map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="preset-chip"
            >
              <span style={{ color: '#06b6d4' }}>#</span>
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="textarea-wrap">
        <textarea
          rows={5}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter text to synthesize into lifelike speech with Kokoro AI... (Press ⌘+Enter to generate)"
          className="prompt-textarea"
        />

        {/* Stats bar */}
        <div className="prompt-stats-bar">
          <div className="stats-left">
            <span>
              <strong>{charCount}</strong> chars
            </span>
            <span>•</span>
            <span>
              <strong>{wordCount}</strong> words
            </span>
            {wordCount > 0 && (
              <>
                <span>•</span>
                <span className="audio-estimate">
                  <Clock size={12} />
                  ~{estimatedSeconds}s audio
                </span>
              </>
            )}
          </div>
          <span>Max 5,000 chars</span>
        </div>
      </div>

      {/* Voice & Speed Controls Bar */}
      <div className="controls-pair-row">
        {/* Selected Voice Card */}
        <div onClick={onOpenVoiceModal} className="voice-select-tile">
          <div
            className={`tile-avatar ${
              selectedVoice?.gender === 'female' ? 'avatar-female' : 'avatar-male'
            }`}
          >
            {selectedVoice?.name?.slice(0, 2) || 'AF'}
          </div>

          <div className="tile-voice-info">
            <div className="voice-name-row">
              <span className="voice-name-text">
                {selectedVoice?.name || 'Heart (Recommended)'}
              </span>
              <span className="voice-grade-tag">
                Grade {selectedVoice?.quality || 'A'}
              </span>
            </div>
            <p className="voice-traits-text">
              {selectedVoice?.accent === 'british' ? '🇬🇧 UK' : '🇺🇸 US'} •{' '}
              {selectedVoice?.traits?.slice(0, 2).join(', ') || 'Warm, Natural'}
            </p>
          </div>

          <div className="tile-change-hint">
            <span>Change</span>
            <ChevronRight size={13} />
          </div>
        </div>

        {/* Speed Slider */}
        <div className="speed-tile">
          <div className="speed-label-bar">
            <span className="speed-title">
              <Sliders size={12} color="#06b6d4" />
              <span>Speed Rate</span>
            </span>
            <span className="speed-val-pill">
              {speed.toFixed(2)}x {speed === 1 ? '(Normal)' : speed > 1 ? '(Fast)' : '(Slow)'}
            </span>
          </div>
          <div className="speed-slider-wrap">
            <span className="slider-endpoint-label">0.5x</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speed}
              onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            />
            <span className="slider-endpoint-label">2.0x</span>
          </div>
        </div>
      </div>

      {/* Primary Generate Button */}
      <button
        type="button"
        onClick={handleGenerateClick}
        disabled={isGenerating || !text.trim()}
        className="btn-generate-main"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="spin-icon" />
            <span>Synthesizing Speech...</span>
          </>
        ) : (
          <>
            <Wand2 size={16} color="#67e8f9" />
            <span>Generate Speech</span>
            <span className="shortcut-kbd">⌘ + Enter</span>
          </>
        )}
      </button>
    </div>
  );
};
