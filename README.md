# 4-7-8 Breathing App

A guided 4-7-8 breathing exercise app — React + TypeScript + Vite SPA, deployable to GitHub Pages.

## Features

- 🌊 Animated pulsating breathing circle
- 🎵 Synthesised Tibetan singing bowl audio cues
- 📳 Haptic feedback on phase transitions (mobile)
- 🔒 Screen Wake Lock — phone won't sleep during sessions
- 📊 Session history with streak tracking (localStorage)
- 📱 PWA — installable on mobile home screen
- 🎨 Deep ocean blue + soft green colour palette

## Quick start

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

### 1. Update the base path

In `vite.config.ts`, change the `base` to match your subfolder:

```ts
base: '/your-repo-name/',
```

### 2. Push to GitHub

```bash
git add .
git commit -m "init breathing app"
git push origin main
```

### 3. Enable GitHub Pages

In your repo → **Settings → Pages → Source** → select **GitHub Actions**.

The workflow in `.github/workflows/deploy.yml` handles the rest automatically on every push to `main`.

### 4. Access your app

```
https://yourusername.github.io/your-repo-name/
```

## 4-7-8 Pattern

| Phase   | Duration |
|---------|----------|
| Inhale  | 4 sec    |
| Hold    | 7 sec    |
| Exhale  | 8 sec    |

Each full cycle = 19 seconds. A 5-minute session = ~15 complete cycles.

## Tech stack

- **React 18** + **TypeScript**
- **Vite 6** — bundler with subfolder base path support
- **React Router v6** — HashRouter for GitHub Pages compatibility
- **Tailwind CSS** — utility styling
- **vite-plugin-pwa** — PWA manifest + service worker
- **Web Audio API** — synthesised bowl/tone sounds
- **Screen Wake Lock API** — prevents phone sleep
- **Vibration API** — haptic feedback
- **localStorage** — session history, no backend needed
