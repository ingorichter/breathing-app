import { SessionConfig } from '../types';

const CONFIG_KEY = 'breathing-config';

const DEFAULT_CONFIG: SessionConfig = {
  duration: 5,
  audioMode: 'bowl',
};

export function loadConfig(): SessionConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: SessionConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
