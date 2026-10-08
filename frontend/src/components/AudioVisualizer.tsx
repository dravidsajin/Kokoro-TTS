'use client';

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setupAudioContext = () => {
      try {
        if (!audioContextRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioCtx) return;

          const ctx = new AudioCtx();
          audioContextRef.current = ctx;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.8;
          analyserRef.current = analyser;

          try {
            if (!sourceRef.current) {
              const source = ctx.createMediaElementSource(audio);
              source.connect(analyser);
              analyser.connect(ctx.destination);
              sourceRef.current = source;
            }
          } catch (e) {
            console.debug('MediaElementSource initialization notice:', e);
          }
        }

        if (audioContextRef.current && audioContextRef.current.state === 'suspended' && isPlaying) {
          audioContextRef.current.resume();
        }
      } catch (err) {
        console.debug('Web Audio API not initialized:', err);
      }
    };

    if (isPlaying) {
      setupAudioContext();
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      const numBars = 46;
      const barWidth = (width / numBars) * 0.68;
      const spacing = (width - numBars * barWidth) / (numBars + 1);

      let dataArray: Uint8Array | null = null;
      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray as any);
      }

      phase += 0.05;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 6;

        if (isPlaying) {
          if (dataArray && dataArray.length > 0) {
            const dataIndex = Math.floor(Math.pow(i / numBars, 1.25) * (dataArray.length - 1));
            const value = dataArray[dataIndex] || 0;
            barHeight = Math.max(8, (value / 255) * (height * 0.88));
          } else {
            const wave = Math.sin(phase * 2 + i * 0.3) * 0.5 + 0.5;
            barHeight = Math.max(8, wave * (height * 0.75));
          }
        } else {
          // Resting active wave
          const wave1 = Math.sin(phase + i * 0.18) * 0.4 + 0.5;
          const wave2 = Math.cos(phase * 0.7 + i * 0.12) * 0.3;
          barHeight = 6 + (wave1 + wave2) * 12;
        }

        const x = spacing + i * (barWidth + spacing);
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(0.5, '#a855f7');
          gradient.addColorStop(1, '#ec4899');
        } else {
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, barHeight / 2);
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="visualizer-container" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <canvas
        ref={canvasRef}
        width={500}
        height={84}
        className="visualizer-canvas"
        style={{ width: '100%', maxWidth: '100%', display: 'block' }}
      />
    </div>
  );
};
