'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles, Volume2, Check } from 'lucide-react';
import { VoiceMetadata } from '../types/tts';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: VoiceMetadata[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  onPreviewVoice?: (voice: VoiceMetadata) => void;
  previewingVoiceId?: string | null;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  voices,
  selectedVoiceId,
  onSelectVoice,
  onPreviewVoice,
  previewingVoiceId,
}) => {
  const [search, setSearch] = useState('');
  const [filterAccent, setFilterAccent] = useState<'all' | 'american' | 'british'>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male'>('all');
  const [onlyPopular, setOnlyPopular] = useState(false);

  const filteredVoices = useMemo(() => {
    return voices.filter((v) => {
      if (filterAccent !== 'all' && v.accent !== filterAccent) return false;
      if (filterGender !== 'all' && v.gender !== filterGender) return false;
      if (onlyPopular && !v.isPopular) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesId = v.id.toLowerCase().includes(q);
        const matchesDesc = v.description.toLowerCase().includes(q);
        const matchesTraits = v.traits.some((t) => t.toLowerCase().includes(q));
        return matchesName || matchesId || matchesDesc || matchesTraits;
      }
      return true;
    });
  }, [voices, filterAccent, filterGender, onlyPopular, search]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title-row">
              <Sparkles size={18} color="#a855f7" />
              <h2>Select Kokoro Neural Voice</h2>
              <span className="badge-neural">
                {voices.length} Available
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
              82M open-weight architecture for human-level prosody and tone
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon-nav"
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="modal-search-bar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon-pos" />
            <input
              type="text"
              placeholder="Search by voice name (Heart, Adam, Emma) or trait (warm, clear)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-field"
            />
          </div>

          <div className="modal-filter-pills">
            {/* Accent filters */}
            <div className="filter-group">
              <button
                onClick={() => setFilterAccent('all')}
                className={`filter-btn ${filterAccent === 'all' ? 'active' : ''}`}
              >
                All Accents
              </button>
              <button
                onClick={() => setFilterAccent('american')}
                className={`filter-btn ${filterAccent === 'american' ? 'active' : ''}`}
              >
                🇺🇸 US
              </button>
              <button
                onClick={() => setFilterAccent('british')}
                className={`filter-btn ${filterAccent === 'british' ? 'active' : ''}`}
              >
                🇬🇧 UK
              </button>
            </div>

            {/* Gender filters */}
            <div className="filter-group">
              <button
                onClick={() => setFilterGender('all')}
                className={`filter-btn ${filterGender === 'all' ? 'active' : ''}`}
              >
                All Genders
              </button>
              <button
                onClick={() => setFilterGender('female')}
                className={`filter-btn ${filterGender === 'female' ? 'active' : ''}`}
              >
                ♀ Female
              </button>
              <button
                onClick={() => setFilterGender('male')}
                className={`filter-btn ${filterGender === 'male' ? 'active' : ''}`}
              >
                ♂ Male
              </button>
            </div>

            {/* Recommended only */}
            <button
              onClick={() => setOnlyPopular(!onlyPopular)}
              className={`filter-btn ${onlyPopular ? 'active' : ''}`}
              style={{ border: '1px solid var(--border-subtle)', background: onlyPopular ? 'var(--accent-purple)' : 'var(--bg-input)' }}
            >
              ★ Recommended
            </button>
          </div>
        </div>

        {/* Voices Grid */}
        <div className="modal-body-scroll">
          {filteredVoices.map((voice) => {
            const isSelected = voice.id === selectedVoiceId;
            const isPreviewing = previewingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                onClick={() => {
                  onSelectVoice(voice.id);
                  onClose();
                }}
                className={`voice-card-select ${isSelected ? 'selected' : ''}`}
              >
                <div className="voice-card-top">
                  <div className="voice-card-info-cluster">
                    <div
                      className={`tile-avatar ${
                        voice.gender === 'female' ? 'avatar-female' : 'avatar-male'
                      }`}
                    >
                      {voice.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="voice-name-row">
                        <span className="voice-name-text">{voice.name}</span>
                        {voice.isPopular && (
                          <span style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: 700 }}>
                            ★ Top
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {voice.accent === 'american' ? '🇺🇸 American' : '🇬🇧 British'} • {voice.gender === 'female' ? 'Female' : 'Male'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="voice-grade-tag">
                      Grade {voice.quality}
                    </span>
                    {isSelected && (
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={11} />
                      </span>
                    )}
                  </div>
                </div>

                <p className="voice-desc-text">{voice.description}</p>

                <div className="voice-card-footer">
                  <div className="voice-traits-row">
                    {voice.traits.slice(0, 3).map((t) => (
                      <span key={t} className="voice-trait-pill">
                        {t}
                      </span>
                    ))}
                  </div>

                  {onPreviewVoice && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewVoice(voice);
                      }}
                      className="btn-test-voice"
                    >
                      <Volume2 size={11} />
                      <span>{isPreviewing ? 'Testing...' : 'Test'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredVoices.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No voices found matching &quot;{search}&quot;.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span>Showing {filteredVoices.length} of {voices.length} voices</span>
          <button onClick={onClose} className="btn-done-modal">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
