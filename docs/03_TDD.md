**03 — Technical Design Document (TDD)**  
**1. Purpose**  
This document records the technical decisions for Reson: the chosen stack, the rationale for each choice, rejected alternatives, and the engineering principles that govern implementation. 04_ARCHITECTURE.md builds on these decisions with diagrams and layer definitions; this document is the "why."  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCj7fFjsymJHAjAU2QtIq6DIzW7UHAMBfnGt1V8fXEwAAXrsexNkF4H1/HJoAAAAASUVORK5CYII=)  
**2. Technology Stack (Final)**  
| | | |  
|-|-|-|  
| **Layer** | **Technology** | **Version Baseline** |   
| Language | TypeScript | 5.x, strict: true |   
| UI Framework | React | 18.x (concurrent features available, not required) |   
| Build Tool | Vite | 5.x |   
| Audio Engine | Tone.js (built on Web Audio API) | 15.x |   
| Waveform Rendering/Editing | WaveSurfer.js | 7.x |   
| Styling | Tailwind CSS | 3.x |   
| Global State | Zustand | 4.x |   
| Local Persistence | IndexedDB via Dexie.js | 4.x |   
| Testing (unit) | Vitest + React Testing Library | latest |   
| Testing (E2E) | Playwright | latest |   
| Linting/Formatting | ESLint + Prettier | latest |   
| Package Manager | pnpm | latest |   
| Offline Support | Vite PWA plugin (Workbox) | latest |   
   
This matches and confirms the stack suggested in the project brief. Deviations and additions below are justified individually.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OUQmAABBAsSeIWMICprwEpjSIFfwTYUuwZWaO6goAgL+412qrzq8nAAC8tj8tdQNNdXaCdAAAAABJRU5ErkJggg==)  
**3. Decision Log**  
**3.1 React + TypeScript + Vite**  
**Decision:** Confirmed as specified.  
   
 **Rationale:** React's component model maps cleanly onto a UI with many repeated, stateful units (32 pads × 4 banks). TypeScript's static typing is essential at 100k+ LOC scale to keep the audio-parameter data model (dozens of fields per pad) consistent across UI, state, and persistence layers. Vite gives sub-second HMR, which matters heavily for a UI-latency-sensitive product where developers must "feel" the instrument while iterating.  
   
 **Rejected alternatives:** Next.js (rejected — SSR/routing complexity is unnecessary for a single-page instrument with no content pages; adds bundle overhead and framework lock-in without benefit). Svelte/SolidJS (rejected — smaller ecosystems for the specific audio/waveform libraries required; team/agent familiarity with React is higher, reducing implementation ambiguity for an AI coding agent).  
**3.2 Tone.js as the Audio Engine Foundation**  
**Decision:** Use Tone.js as a structured wrapper around the native Web Audio API rather than hand-rolling all AudioContext/AudioBufferSourceNode management.  
   
 **Rationale:** Tone.js provides: a lookahead scheduler (Tone.Transport/Tone.Draw) suitable for future sample-accurate sequencing; Tone.Player/Tone.Players for buffer playback with built-in fade/loop/reverse support; a signal-chain abstraction (Tone.Volume, Tone.Panner, Tone.Gain) that maps directly onto per-pad parameters; and a well-documented pattern for effects chains, which directly serves the "future effects" extensibility requirement.  
   
 **Rejected alternatives:** Raw Web Audio API only (rejected — reinventing scheduling, envelope, and effects-chain primitives is high-risk/high-effort for marginal control gain; Tone.js already wraps these correctly). Howler.js (rejected — optimized for simple sound-effect playback, not for the sample-accurate scheduling, per-voice signal chains, and future sequencer/effects requirements central to this product).  
   
 **Important technical note:** Even though Tone.js is used, the engine must NOT rely on Tone.js's own transport-based scheduling for *immediate* pad triggers (which would add unnecessary lookahead latency). Immediate triggers use direct low-latency scheduling (context.currentTime based, near-zero lookahead) while the  *future* sequencer feature will use Tone.Transport for quantized events. This distinction is detailed in 07_AUDIO_ENGINE.md.  
**3.3 WaveSurfer.js for Waveform Display & Editing**  
**Decision:** Confirmed as specified, used exclusively within the Sample Editor.  
   
 **Rationale:** WaveSurfer.js provides performant waveform rendering (via pre-computed peaks or canvas/webgl rendering), a regions plugin suitable for start/end marker dragging, and zoom/scroll support — covering the majority of FR-EDIT-* requirements out of the box, reducing custom canvas code.  
   
 **Rejected alternatives:** Custom <canvas> waveform renderer (rejected for v1 — significant engineering effort duplicating WaveSurfer's mature, tested implementation; may be revisited in 14_FUTURE_FEATURES.md if WaveSurfer's plugin model cannot support advanced future needs like multi-track editing).  
**3.4 Zustand for Global State Management**  
**Decision:** Use Zustand as the primary global state container, organized into domain-specific "slices" (Pad state, Bank state, UI state, Settings state).  
   
 **Rationale:** The state shape is moderately complex (128 pad slots × ~18 parameters each, plus banks, plus UI/editor state) but does not require Redux's strict unidirectional action/reducer ceremony to remain maintainable, given careful slice separation (see 04_ARCHITECTURE.md). Zustand's minimal API and selector-based subscription model is critical for  **performance**: pads must re-render only when their own data changes, not on every global state mutation — Zustand's built-in shallow-equality selectors make this natural, which directly protects the low-latency visual feedback requirement (FR-PAD-002).  
   
 **Rejected alternatives:** Redux Toolkit (rejected — more boilerplate and indirection for equivalent value at this state complexity; team/agent velocity favored). React Context + useReducer only (rejected — naive Context usage causes broad re-renders across all 32 pads on any state change unless heavily optimized with memoization, which Zustand provides by default). Recoil/Jotai (rejected — smaller communities, less certain long-term maintenance than Zustand at time of writing).  
**3.5 Dexie.js over Raw IndexedDB**  
**Decision:** Use Dexie.js as a typed, Promise-based wrapper around IndexedDB.  
   
 **Rationale:** Raw IndexedDB's callback/event-based API is verbose and error-prone; Dexie provides a schema-versioned, TypeScript-friendly API with transactions, indexes, and migration support — essential given the schema will evolve across the roadmap phases (11_IMPLEMENTATION_ROADMAP.md).  
   
 **Rejected alternatives:** idb (Jake Archibald's lightweight Promise wrapper) — viable alternative, rejected only in favor of Dexie's built-in schema migration and query capabilities, which reduce custom code for 08_DATABASE.md's versioning requirements. Either is acceptable if the implementing agent has strong reason to deviate; Dexie is the default recommendation.  
**3.6 Tailwind CSS**  
**Decision:** Confirmed as specified, combined with a small custom design-token layer (CSS variables for the dark theme palette, see 05_UI_UX.md).  
   
 **Rationale:** Utility-first styling allows rapid, consistent implementation of a dense, custom UI (many small controls: sliders, toggles, pads) without the overhead of maintaining a large separate CSS/SCSS component library. Tailwind's JIT compiler keeps bundle size proportional to actually-used classes.  
   
 **Rejected alternatives:** CSS Modules only (rejected — slower iteration for a UI with this much shared visual language). Styled-components/Emotion (rejected — runtime CSS-in-JS overhead is an unnecessary performance cost for a latency-sensitive app; Tailwind's static extraction is preferable).  
**3.7 No Backend for v1**  
**Decision:** v1 ships as a fully static, client-side application (deployable to any static host/CDN). 09_API.md speculatively designs a future backend but nothing in v1 depends on it.  
   
 **Rationale:** Directly serves PRD non-goals (§5.4): no accounts, no cloud sync in v1. A static deployment minimizes operational complexity and cost, and keeps the "instant play, no setup" experience possible (no server round-trips in the critical path).  
**3.8 PWA / Offline Support**  
**Decision:** Ship a service worker (via vite-plugin-pwa) caching the app shell, static assets, and built-in sample packs for full offline functionality after first load.  
   
 **Rationale:** Directly serves FR-XCUT-004. An instrument that stops working without network access undermines the "instrument, not app" principle.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhZscZXlheJwqQgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseop8EQrmJduIAAAAASUVORK5CYII=)  
**4. Engineering Principles**  
1. **Separation of concerns is mandatory at the folder level, not just conceptual.** The Audio Engine must have zero React imports. The State layer must have zero direct DOM/Web Audio calls. See 04_ARCHITECTURE.md and 10_PROJECT_STRUCTURE.md.  
2. **The Audio Engine is a standalone TypeScript module/class hierarchy**, testable independent of React, exposing an imperative API (engine.triggerPad(padId, velocity), engine.releasePad(padId), etc.) that the UI layer calls into via a thin binding layer (custom hooks).  
3. **State mutations that affect audio-graph parameters (volume, pan, pitch, mute) must propagate to the Audio Engine via a dedicated subscription/effect layer, not by having engine code read Zustand state directly** — this keeps the engine framework-agnostic and independently testable.  
4. **All persisted data is versioned.** Every record written to IndexedDB includes a schemaVersion field; migrations are explicit functions run at load time (see 08_DATABASE.md).  
5. **No blocking work on the main thread during a trigger event.** Sample decoding happens ahead of time (on assignment), not on trigger. Trigger-time work is limited to graph node creation and start() scheduling.  
6. **Numbers, not magic strings, for IDs.** Pad IDs, Bank IDs, and Asset IDs use stable, typed identifiers (string UUIDs for assets/projects; deterministic bankId-padIndex composite keys for pad slots) — never array indices alone, to avoid fragile references during reordering/duplication features.  
7. **Progressive enhancement for advanced input.** Velocity/pressure (FR-PAD-010) and non-QWERTY mapping (FR-KEY-006) must degrade gracefully rather than being required for baseline functionality.  
8. **Every feature area maps to an isolated Zustand slice and an isolated engine subsystem**, enabling the phased roadmap (11_IMPLEMENTATION_ROADMAP.md) to add sequencer/MIDI/effects/recording as new slices+subsystems without refactoring existing ones.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALUlEQVR4nO3OQQ0AIAwEsAMlSJ0UrOFkGngRklZBR1WtJDsAAPzizNcDAADuNcKwAyU+nb+5AAAAAElFTkSuQmCC)  
**5. Performance Budget**  
| | |  
|-|-|  
| **Budget Item** | **Target** |   
| Input event → visual pad feedback | ≤ 16ms (1 frame @ 60fps) |   
| Input event → audible sound (desktop) | ≤ 30ms |   
| Input event → audible sound (mobile) | ≤ 60ms |   
| Bank switch re-render | ≤ 16ms |   
| Sample upload → decoded & assignable | ≤ 2s for a 10MB file on broadband |   
| Max concurrent voices before graceful degradation (voice stealing) | 32 |   
| JS bundle size (initial, gzipped) | ≤ 250KB (excluding sample audio assets) |   
| Memory ceiling before warning (mobile) | Monitor via performance.memory where available; soft target < 300MB heap |   
   
These budgets are binding constraints on implementation choices throughout 06_COMPONENTS.md and 07_AUDIO_ENGINE.md.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSd4NIGhrOTvaQBrWMGbCFuCLTOzV2cAAPzFvVZbdXw9AQDgtesBhYQEO+64Y8AAAAAASUVORK5CYII=)  
**6. Browser Support Matrix**  
| | | |  
|-|-|-|  
| **Browser** | **Minimum Version** | **Notes** |   
| Chrome (desktop & Android) | Last 2 major versions | Primary target, best Web Audio latency |   
| Firefox (desktop) | Last 2 major versions | Full support |   
| Safari (desktop & iOS) | Last 2 major versions | Requires user-gesture audio unlock; test touchstart timing carefully |   
| Edge (Chromium) | Last 2 major versions | Treated as Chromium-equivalent |   
| Samsung Internet | Best-effort | Not a primary QA target but should not hard-crash |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCj7fFwtCmJHAjAU2QtIq6DIzW7UHAMBfnGt1V8fHEQAA3rsexOkF3va0dq8AAAAASUVORK5CYII=)  
**7. Security & Privacy Baseline**  
- All user audio data remains local to the browser (IndexedDB); nothing is uploaded anywhere in v1, eliminating server-side privacy/security surface area for user content.  
- File upload validation (MIME type + magic-byte sniffing where feasible) prevents non-audio files from being processed by the decode pipeline.  
- No third-party analytics/tracking scripts are assumed by default; if added, must be documented separately and must not block or delay audio interactivity.  
- Content Security Policy should restrict script sources to self + required CDN(s) if any external font/asset CDN is used.  
Full risk treatment in 13_RISK_ANALYSIS.md.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAM0lEQVR4nO3OMQ0AIAwAwZKQ6kBqjSAOJywYYCIkd9OP36pqRMQMAAB+sfqJfLoBAMCN3NYoAzBA+QG0AAAAAElFTkSuQmCC)  
**8. Non-Functional Requirements Summary**  
| | |  
|-|-|  
| **Category** | **Requirement** |   
| Performance | See §5 budget table |   
| Reliability | Autosave within 500ms of any state change; no data loss on crash beyond that window |   
| Availability | Fully offline-capable after first load |   
| Maintainability | Strict separation of layers; ESLint boundaries enforced (see 04_ARCHITECTURE.md §Module Boundaries) |   
| Scalability (codebase) | Architecture must remain coherent at 100k+ LOC; enforced via domain-driven folder structure (10_PROJECT_STRUCTURE.md) |   
| Accessibility | WCAG 2.1 AA for non-performance-surface UI; documented exceptions for the pad grid (05_UI_UX.md) |   
| Internationalization | Not required for v1; string literals should nonetheless be centralized (not hard-coded inline) to ease future i18n |   
   
