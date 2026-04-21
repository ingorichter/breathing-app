import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Bell, Eye, Play } from 'lucide-react';
import { AudioMode, SessionConfig } from '../types';
import { loadConfig, saveConfig } from '../store/config';
import { Theme, useTheme } from '../context/ThemeContext';
import styles from './Setup.module.css';

const AUDIO_OPTIONS: { mode: AudioMode; icon: typeof Volume2; label: string; desc: string }[] = [
  { mode: 'bowl', icon: Volume2, label: 'Singing Bowl', desc: 'Tibetan bowl tones' },
  { mode: 'tone', icon: Bell, label: 'Tone', desc: 'Simple sine tones' },
  { mode: 'visual', icon: Eye, label: 'Visual Only', desc: 'No audio' },
];

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'green', label: 'Sage', color: '#74c69d' },
  { id: 'orange', label: 'Ember', color: '#e8843b' },
  { id: 'peach', label: 'Blush', color: '#f0968a' },
];

export function Setup() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SessionConfig>(loadConfig);
  const { theme, setTheme } = useTheme();

  const handleDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    e.target.style.setProperty('--range-pct', `${((val - 1) / 59) * 100}%`);
    setConfig((c) => ({ ...c, duration: val }));
  };

  const handleAudio = (mode: AudioMode) => {
    setConfig((c) => ({ ...c, audioMode: mode }));
  };

  const handleSave = () => {
    saveConfig(config);
    navigate('/');
  };

  const pct = ((config.duration - 1) / 59) * 100;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.heading}>Session Setup</h2>
        <p className={styles.subtitle}>Your preferences are saved locally</p>
      </div>

      {/* Duration */}
      <div className={styles.durationCard}>
        <div className={styles.durationHeader}>
          <span className={styles.durationLabel}>Duration</span>
          <span className={styles.durationValue}>
            {config.duration}
            <span className={styles.durationUnit}>min</span>
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={60}
          step={1}
          value={config.duration}
          onChange={handleDuration}
          style={{ '--range-pct': `${pct}%` } as React.CSSProperties}
          aria-label="Session duration in minutes"
        />

        <div className={styles.rangeLimits}>
          <span>1 min</span>
          <span>60 min</span>
        </div>

        <div className={styles.cyclesInfo}>
          ≈ {Math.floor((config.duration * 60) / 19)} complete cycles
          <span className={styles.cyclesNote}>(4+7+8 = 19s each)</span>
        </div>
      </div>

      {/* Audio mode */}
      <div className={styles.audioCard}>
        <span className={styles.audioLabel}>Audio Guidance</span>

        <div className={styles.audioOptions}>
          {AUDIO_OPTIONS.map(({ mode, icon: Icon, label, desc }) => {
            const active = config.audioMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleAudio(mode)}
                className={`${styles.audioOption}${active ? ` ${styles.audioOptionActive}` : ''}`}
              >
                <Icon size={18} strokeWidth={1.5} />
                <div>
                  <div className={styles.audioOptionText}>{label}</div>
                  <div className={styles.audioOptionDesc}>{desc}</div>
                </div>
                {active && <div className={styles.activeDot} />}
              </button>
            );
          })}
        </div>

        {config.audioMode !== 'visual' && (
          <p className={styles.audioHint}>
            Make sure your phone is not muted to hear the audio cues.
          </p>
        )}
      </div>

      {/* Theme */}
      <div className={styles.themeCard}>
        <span className={styles.audioLabel}>Color Theme</span>
        <div className={styles.themeOptions}>
          {THEMES.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`${styles.themeOption}${theme === id ? ` ${styles.themeOptionActive}` : ''}`}
              aria-label={label}
            >
              <span className={styles.themeSwatch} style={{ background: color }} />
              <span className={styles.themeLabel}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save + Start */}
      <div className={styles.saveRow}>
        <button className={styles.ghostBtn} onClick={() => navigate('/')}>
          Cancel
        </button>
        <button className={styles.saveBtn} onClick={handleSave}>
          <Play size={14} strokeWidth={2} />
          Save
        </button>
      </div>

      <p className={styles.buildInfo}>
        {__BUILD_DATE__} · {__GIT_SHA__}
      </p>
    </div>
  );
}
