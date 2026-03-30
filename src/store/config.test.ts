import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfig, saveConfig } from './config';

describe('config store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadConfig', () => {
    it('returns defaults when storage is empty', () => {
      const config = loadConfig();
      expect(config.duration).toBe(5);
      expect(config.audioMode).toBe('bowl');
    });

    it('returns stored values when present', () => {
      localStorage.setItem('breathing-config', JSON.stringify({ duration: 10, audioMode: 'tone' }));
      const config = loadConfig();
      expect(config.duration).toBe(10);
      expect(config.audioMode).toBe('tone');
    });

    it('merges defaults with partially stored config', () => {
      localStorage.setItem('breathing-config', JSON.stringify({ duration: 15 }));
      const config = loadConfig();
      expect(config.duration).toBe(15);
      expect(config.audioMode).toBe('bowl');
    });

    it('returns defaults when stored value is invalid JSON', () => {
      localStorage.setItem('breathing-config', 'not-json');
      const config = loadConfig();
      expect(config.duration).toBe(5);
      expect(config.audioMode).toBe('bowl');
    });
  });

  describe('saveConfig', () => {
    it('persists config to localStorage', () => {
      saveConfig({ duration: 20, audioMode: 'visual' });
      const raw = localStorage.getItem('breathing-config');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.duration).toBe(20);
      expect(parsed.audioMode).toBe('visual');
    });

    it('saved config is readable by loadConfig', () => {
      saveConfig({ duration: 30, audioMode: 'tone' });
      const config = loadConfig();
      expect(config.duration).toBe(30);
      expect(config.audioMode).toBe('tone');
    });
  });
});
