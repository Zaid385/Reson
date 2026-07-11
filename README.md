# Reson

A professional, web-based drum machine and sampler built for modern browsers.

[Live Demo: https://reson-4nav.onrender.com](https://reson-4nav.onrender.com)

---

## Features

- 32-pad performance grid
- Multi-bank support (4 banks, 128 pads total)
- Keyboard and touch input with customizable layouts
- Built-in factory sound kits
- User sample import
- Advanced sample editor (trim, pitch, gain, fade in/out, normalize, reverse, loop)
- Per-pad FX (Filter, Drive, Bitcrusher, Compressor, Delay, Reverb)
- Pad color customization
- Responsive layout
- Local-first workflow
- IndexedDB persistence and autosave
- PWA / offline support

---

## Tech Stack

- React
- TypeScript
- Vite
- Tone.js
- WaveSurfer.js
- Zustand
- Dexie
- Tailwind CSS
- Vitest
- Playwright

---

## Getting Started

```bash
git clone https://github.com/Zaid385/Reson.git
cd Reson
npm install
npm run dev
```

To build for production:

```bash
npm run build
```

---

## Project Structure

- `src/audio-engine/` - Core Web Audio API and Tone.js integration
- `src/components/` - Reusable UI components
- `src/domain/` - Business logic and application services
- `src/features/` - Feature-specific React components (pad grid, sample editor, etc.)
- `src/models/` - TypeScript data models and interfaces
- `src/persistence/` - IndexedDB configuration and repository layers
- `src/state/` - Zustand global state management
- `src/styles/` - Global CSS and Tailwind directives
- `src/utils/` - Shared helper functions

---

## Browser Support

Reson requires a modern browser with full Web Audio API support. Recommended browsers include recent versions of Chrome, Edge, Safari, and Firefox.
