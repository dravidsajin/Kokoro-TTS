'use client';

import React from 'react';
import { X, Cpu, Layers, Zap } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-window"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
              <Cpu size={16} />
            </div>
            <div>
              <h2>System Architecture & Specs</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Vocalis AI • Kokoro-82M Neural Speech Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon-nav"
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section: Model */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c084fc' }}>
              <Zap size={13} color="#06b6d4" />
              <span>Kokoro-82M TTS Neural Architecture</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Kokoro is an open weight 82-million parameter Text-to-Speech model delivering human-like prosody, cadence, and inflection comparable to models tenfold its size.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '6px' }}>
              <div className="metric-tile">
                <span className="metric-tile-title">Parameters</span>
                <span className="metric-tile-val">82 Million</span>
              </div>
              <div className="metric-tile">
                <span className="metric-tile-title">Sample Rate</span>
                <span className="metric-tile-val val-highlight">24,000 Hz</span>
              </div>
              <div className="metric-tile">
                <span className="metric-tile-title">Format</span>
                <span className="metric-tile-val" style={{ color: '#34d399' }}>Q8 ONNX</span>
              </div>
            </div>
          </div>

          {/* Section: Full Stack Pipeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} color="#a855f7" />
              <span>Full Stack Pipeline</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '12px', color: '#ffffff', display: 'block' }}>Next.js 16 Frontend</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Next.js App Router with bespoke Vanilla CSS, Web Audio API frequency analysis canvas visualizer, and local generation caching.
                </p>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '12px', color: '#ffffff', display: 'block' }}>Node.js & TypeScript Backend Service</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Express & TypeScript microservice executing local CPU ONNX runtime inference with sentence chunking, silence padding, and Zod validation.
                </p>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '12px', color: '#ffffff', display: 'block' }}>SHA-256 LRU Audio Caching</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Repeated phrases with identical voice and speed synthesize in ~1ms with zero neural inference overhead.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-done-modal">
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
};
