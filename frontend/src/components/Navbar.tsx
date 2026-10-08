'use client';

import React from 'react';
import { Volume2, Sun, Moon, Cpu, RefreshCw } from 'lucide-react';
import { BackendHealth } from '../types/tts';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenInfo: () => void;
  health: BackendHealth | null;
  voiceCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenInfo,
  health,
  voiceCount,
}) => {
  const isReady = health?.status === 'ready';

  return (
    <header className="site-header">
      <div className="app-container nav-row">
        {/* Brand Group */}
        <div className="brand-group">
          <div className="brand-icon-box">
            <Volume2 size={20} />
          </div>

          <div className="brand-text-block">
            <div className="brand-title-row">
              <h1>
                Vocalis <span className="text-gradient">AI Studio</span>
              </h1>
              <span className="badge-neural">82M Neural</span>
            </div>
            <p className="brand-subtitle">
              Neural speech synthesis • 24kHz Studio Audio
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="nav-actions">
          {/* Status Indicator */}
          <div className="status-indicator-pill">
            {isReady ? (
              <>
                <span className="status-dot"></span>
                <span>Engine Active • {voiceCount} Voices</span>
              </>
            ) : health?.status === 'loading' ? (
              <>
                <RefreshCw size={13} className="spin-icon" />
                <span>Loading Model...</span>
              </>
            ) : (
              <>
                <span className="status-dot"></span>
                <span>Model Ready</span>
              </>
            )}
          </div>

          {/* Specs / Architecture */}
          <button
            onClick={onOpenInfo}
            className="btn-icon-nav"
            title="System Specs"
          >
            <Cpu size={14} color="#a855f7" />
            <span>Specs</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="btn-icon-nav btn-theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun size={15} color="#fbbf24" />
            ) : (
              <Moon size={15} color="#a855f7" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
