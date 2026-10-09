'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  Zap,
  Radio,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { SynthesizeResponse } from '../types/tts';

interface AudioPlayerCardProps {
  currentAudio: SynthesizeResponse | null;
  textTranscript: string;
  selectedVoiceName: string;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({
  currentAudio,
  textTranscript,
  selectedVoiceName,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasCopiedTranscript, setHasCopiedTranscript] = useState(false);

  const audioSrc = currentAudio ? `data:audio/wav;base64,${currentAudio.audioBase64}` : null;

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentAudio?.durationSeconds || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleDownload = () => {
    if (!audioSrc) return;
    const a = document.createElement('a');
    a.href = audioSrc;
    const cleanName = (textTranscript.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '_') || 'vocalis_speech').toLowerCase();
    a.download = `vocalis_${currentAudio?.voice || 'voice'}_${cleanName}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyTranscript = () => {
    if (!textTranscript) return;
    navigator.clipboard.writeText(textTranscript);
    setHasCopiedTranscript(true);
    setTimeout(() => setHasCopiedTranscript(false), 2000);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const realTimeMultiplier =
    currentAudio && currentAudio.generationTimeMs > 0 && currentAudio.durationSeconds > 0
      ? (currentAudio.durationSeconds / (currentAudio.generationTimeMs / 1000)).toFixed(1)
      : null;

  return (
    <div className="studio-card" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Hidden HTML5 Audio */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Card Header */}
      <div className="card-top-bar">
        <div className="card-title-tag">
          <Radio size={14} color="#06b6d4" />
          <span>Audio Studio Player</span>
        </div>

        {currentAudio && (
          <span
            className={`badge-audio-status ${currentAudio.cached ? 'badge-cache' : ''}`}
          >
            <Zap size={10} />
            <span>{currentAudio.cached ? 'Instant Cache' : 'Neural Synthesis'}</span>
          </span>
        )}
      </div>

      {/* Visualizer */}
      <AudioVisualizer isPlaying={isPlaying} audioRef={audioRef} />

      {/* Timeline Scrubber */}
      <div className="timeline-row">
        <input
          type="range"
          min={0}
          max={duration || currentAudio?.durationSeconds || 1}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          disabled={!audioSrc}
        />
        <div className="time-markers">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || currentAudio?.durationSeconds || 0)}</span>
        </div>
      </div>

      {/* Master Controls Deck */}
      <div className="player-controls-deck">
        <div className="playback-buttons">
          <button
            onClick={togglePlay}
            disabled={!audioSrc}
            className="btn-play-master"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={17} fill="#ffffff" />
            ) : (
              <Play size={17} fill="#ffffff" style={{ marginLeft: '2px' }} />
            )}
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            disabled={!audioSrc}
            className="btn-restart"
            title="Restart playback"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Volume */}
        <div className="volume-deck">
          <button onClick={toggleMute} title="Mute/Unmute">
            {isMuted || volume === 0 ? (
              <VolumeX size={15} color="#f43f5e" />
            ) : (
              <Volume2 size={15} />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>

        {/* Speed Chips */}
        <div className="speed-pills-deck">
          {[1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className={`speed-pill-btn ${playbackRate === rate ? 'active' : ''}`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Player Actions Deck */}
      <div className="player-actions-deck">
        <button
          onClick={handleCopyTranscript}
          disabled={!textTranscript}
          className="btn-copy-script"
        >
          {hasCopiedTranscript ? (
            <>
              <Check size={14} color="#10b981" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Script</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={!audioSrc}
          className="btn-download-wav"
        >
          <Download size={14} />
          <span>Download WAV</span>
        </button>
      </div>

      {/* Metrics Row */}
      {currentAudio ? (
        <div className="metrics-row">
          <div className="metric-tile">
            <span className="metric-tile-title">Latency</span>
            <span className="metric-tile-val">{currentAudio.generationTimeMs}ms</span>
          </div>

          <div className="metric-tile">
            <span className="metric-tile-title">Speed</span>
            <span className="metric-tile-val val-highlight">
              {realTimeMultiplier ? `${realTimeMultiplier}x Real` : 'Instant'}
            </span>
          </div>

          <div className="metric-tile">
            <span className="metric-tile-title">Quality</span>
            <span className="metric-tile-val">24kHz Audio</span>
          </div>

          <div className="metric-tile">
            <span className="metric-tile-title">Voice</span>
            <span className="metric-tile-val val-purple">{selectedVoiceName}</span>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
          Ready to synthesize. Enter text and hit &quot;Generate Speech&quot;.
        </div>
      )}
    </div>
  );
};
