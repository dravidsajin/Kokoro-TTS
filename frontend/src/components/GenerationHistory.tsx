'use client';

import React from 'react';
import { History, Play, Download, Trash2, Clock, Sparkles } from 'lucide-react';
import { HistoryItem } from '../types/tts';

interface GenerationHistoryProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  history,
  onSelectHistoryItem,
  onDeleteItem,
  onClearAll,
}) => {
  const formatTimeAgo = (timestamp: number) => {
    const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsedSeconds < 60) return 'Just now';
    if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
    return `${Math.floor(elapsedSeconds / 3600)}h ago`;
  };

  const handleDownload = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = `data:audio/wav;base64,${item.audioBase64}`;
    const cleanName = (item.text.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_') || 'audio').toLowerCase();
    a.download = `kokoro_${item.voiceId}_${cleanName}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="studio-card" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header */}
      <div className="card-top-bar">
        <div className="card-title-tag">
          <History size={14} color="#a855f7" />
          <span>Generation Library</span>
          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '99px', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
            {history.length}
          </span>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="btn-micro btn-micro-danger"
          >
            <Trash2 size={11} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* History Items */}
      <div className="history-items-box" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
        {history.length === 0 ? (
          <div className="history-empty-box">
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} opacity={0.5} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No history yet</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '240px' }}>
              Synthesized audio clips will appear here for one-click replay and download.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistoryItem(item)}
              className="history-item-row"
              style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}
            >
              <div className="history-item-left" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', flex: '1 1 0%' }}>
                <button
                  type="button"
                  title="Play audio"
                  className="btn-history-play"
                >
                  <Play size={13} fill="currentColor" style={{ marginLeft: '1px' }} />
                </button>

                <div className="history-item-meta" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', flex: '1 1 0%', width: 0 }}>
                  <span
                    className="history-text-snippet"
                    title={item.text}
                    style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                  >
                    {item.text}
                  </span>
                  <div className="history-sub-meta" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <span className="voice-badge">{item.voiceName}</span>
                    <span>•</span>
                    <span>{item.durationSeconds}s</span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} />
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="history-item-actions">
                <button
                  onClick={(e) => handleDownload(item, e)}
                  title="Download WAV"
                  className="btn-history-action"
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  title="Delete item"
                  className="btn-history-action btn-history-del"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
