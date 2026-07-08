**11 — Implementation Roadmap**  
**1. Purpose**  
This roadmap breaks Reson's build into sequential, independently buildable and testable phases. Each phase produces a working, demoable increment. The implementing AI agent should complete phases in order; later phases assume earlier phases' deliverables exist and pass their acceptance checks.  
Priorities reference 02_FSD.md requirement IDs (P0/P1/P2).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSPBCj7fFRYQwYwEZiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AMTJBeJDClAyAAAAAElFTkSuQmCC)  
**2. Phase Overview**  
gantt  
     title Reson Implementation Phases (relative sequence, not calendar time)  
     dateFormat X  
     axisFormat %s  
     section Foundation  
     Phase 0 Project Setup           :p0, 0, 1  
     Phase 1 Audio Engine Core       :p1, after p0, 1  
     section Core Instrument  
     Phase 2 Pad Grid + Input        :p2, after p1, 1  
     Phase 3 Persistence + Banks     :p3, after p2, 1  
     section Sound Design  
     Phase 4 Sample Assignment       :p4, after p3, 1  
     Phase 5 Sample Editor           :p5, after p4, 1  
     section Polish  
     Phase 6 Parameter Panel + Master :p6, after p5, 1  
     Phase 7 Responsive + A11y + PWA :p7, after p6, 1  
     section Hardening  
     Phase 8 Testing + Perf Hardening :p8, after p7, 1  
     Phase 9 P1/P2 Enhancements       :p9, after p8, 1  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSd4EKxgBjP+Asa0hxW8ibAl2DIzR3UFAMBf3Gu1VefXEwAAXtsfSqwDVbgKngwAAAAASUVORK5CYII=)  
**3. Phase 0 — Project Setup & Scaffolding**  
**Goal:** A running, empty Vite+React+TS app with the full folder structure and tooling in place.  
**Tasks:**  
- Initialize repo with Vite (react-ts template), configure tsconfig.json (strict mode), path aliases.  
- Install and configure: Tailwind CSS, ESLint (+ boundary rules), Prettier, Vitest, Playwright, Zustand, Dexie.js, Tone.js, WaveSurfer.js, vite-plugin-pwa.  
- Create the full folder structure from 10_PROJECT_STRUCTURE.md (empty files/index.ts stubs where appropriate).  
- Set up design tokens: Tailwind config + CSS variables from 05_UI_UX.md §2.  
- Set up base layout shell (App, AppShell, MainLayout) with placeholder panels (no real functionality yet).  
**Exit Criteria (testable):**  
- pnpm dev runs, app renders an empty dark-themed shell matching the 3-panel layout at desktop width.  
- pnpm lint, pnpm typecheck, pnpm test all pass (even with 0/trivial tests).  
- Boundary lint rule demonstrably fails if a test file imports audio-engine from inside components/.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCUZfEnoYmFDBhAU2QtIq6DIzW7UHAMBfnGt1V8fXEwAAXrse/wcF74lXkIsAAAAASUVORK5CYII=)  
**4. Phase 1 — Audio Engine Core**  
**Goal:** A fully functional, headless (no UI) Audio Engine passing unit tests, playable via a temporary debug harness (e.g., browser console or a minimal test page).  
**Tasks:**  
- Implement AudioEngine, VoiceManager, Voice, PadBus, MasterBus, BufferRegistry, SoloMuteResolver, engineEvents per 07_AUDIO_ENGINE.md.  
- Implement initialize()/resumeContext() lifecycle and the audio graph topology (§3 of that doc), including reserved future-effects insertion points as pass-through connections.  
- Implement registerBuffer/unregisterBuffer, reversed-buffer caching.  
- Implement triggerPad/releasePad/stopPad (Immediate Trigger Path only — no Transport path yet).  
- Implement voice allocation + FIFO stealing policy at MAX_VOICES/MAX_VOICES_PER_PAD.  
- Implement setPadVolume/setPadPan/setPadMute/setMasterVolume/setMasterMute.  
- Implement PreviewPlayer (used later by the Sample Editor, but build the subsystem now alongside the rest of the engine).  
**Exit Criteria (testable):**  
- Unit tests (Vitest, mocked/stubbed AudioContext where feasible) cover: voice allocation, stealing at capacity, solo/mute resolution logic, buffer registration/unregistration.  
- Playwright-based smoke test: loads a test harness page, calls engine.triggerPad() with a known test WAV buffer, asserts context.state === 'running' post-gesture and that a voice completes (voice:ended fires) within the expected sample duration ± tolerance.  
- Manual/dev verification: triggering 32+ pads rapidly via the debug harness produces no console errors and respects the voice cap.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsSfYxZo/jkUsYQLPJrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA4rDBc72meO5AAAAAElFTkSuQmCC)  
**5. Phase 2 — Pad Grid, Keyboard/Mouse/Touch Input**  
**Goal:** The core performance surface is playable end-to-end: visible pads, keyboard/mouse/touch triggering, wired to the Phase 1 engine, using a hardcoded/in-memory (not yet persisted) single bank of built-in test samples.  
**Tasks:**  
- Implement padSlice, bankSlice (in-memory only for now), engineUiSlice, uiSlice (subset needed).  
- Implement keyMap.ts (FR-KEY-001).  
- Implement useKeyboardController, usePointerRollController, usePadTrigger, useAudioEngineBinding.  
- Implement PadGrid, Pad, PadWaveformThumbnail (static placeholder graphics acceptable if peaks aren't wired yet), PadBadge.  
- Wire a small hardcoded set of built-in test samples (e.g., 8 sounds) into pads 1-8 for manual testing.  
- Implement pad visual states from 05_UI_UX.md §5.1 (empty, idle, hover, triggered, held, muted, soloed, selected — solo/mute wiring can be stubbed to true/false toggles for now if ParameterPanel doesn't exist yet).  
**Exit Criteria (testable):**  
- All FR-PAD-*, FR-KEY-*, FR-MOUSE-* P0 requirements demonstrably work manually.  
- Automated Playwright test: simulate keydown on each of the 32 mapped keys, assert the corresponding pad element receives the "triggered" CSS state within one frame, and (where a sample is assigned) that engine.getActiveVoiceCount() increments.  
- Automated test: OS key-repeat simulation (holding a key) does not cause multiple triggers (FR-KEY-002).  
- Automated test: multi-touch simulation triggers multiple distinct pads simultaneously (FR-MOUSE-003).  
- Visual/interaction latency spot-check against the 03_TDD.md §5 budget using Chrome DevTools Performance panel.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSd4NIGRTPXNaQBrWMGbCFuCLTOzV2cAAPzFvVZbdXw9AQDgtesBhZQEOYZGgUEAAAAASUVORK5CYII=)  
**6. Phase 3 — Persistence Layer & Real Banks**  
**Goal:** State survives reload; all 4 banks are real and switchable; default kit loads for new users.  
**Tasks:**  
- Implement db.ts (Dexie schema), migrations.ts, all four repositories (ProjectRepository, AssetRepository, PadRepository, BankRepository) per 08_DATABASE.md.  
- Implement ProjectBootstrapService (first-load default kit logic, session restore — FR-BOOT-003, FR-BOOT-004).  
- Wire padSlice/bankSlice/projectSlice/settingsSlice to real persisted data via the repositories (replacing Phase 2's in-memory stubs).  
- Implement useAutosave (500ms debounce, FR-PERSIST-001) and SaveStatusIndicator.  
- Implement BankSelector fully, wired to real bankSlice.activeBankId, plus Ctrl/Cmd+1-4 shortcuts (FR-BANK-002, FR-KEY-007).  
- Implement builtInSampleManifest.ts loader and the actual manifest.json + built-in sample files under public/samples/.  
**Exit Criteria (testable):**  
- Playwright test: assign/modify pad state, reload the page, assert identical state is restored (FR-BOOT-004, FR-XCUT-002).  
- Playwright test: fresh IndexedDB (incognito context) loads the default kit into Bank A (FR-BOOT-003).  
- Manual test: switching banks is visually instant with no dropped frames; a voice triggered before switching continues playing after switching (FR-BANK-003) — verify via engine.getActiveVoiceCount() staying consistent across the switch.  
- Autosave failure simulated (mock quota error) surfaces the correct UI state (FR-PERSIST-002).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OYQ1AABSAwY9JoICqL4Z8Ikiggn9mu0twy8wc1RkAAH9xbdVa7V9PAAB47X4A9CgEJQFjJ/EAAAAASUVORK5CYII=)  
**7. Phase 4 — Sample Assignment (Upload, Drag-Drop, Sample Browser)**  
**Goal:** Users can bring their own sounds onto any pad via all supported methods.  
**Tasks:**  
- Implement SampleAssignmentService, fileValidation.ts (domain-level).  
- Implement AssetRepository write paths fully (already scaffolded in Phase 3; now exercised end-to-end with real uploaded blobs).  
- Implement waveform peak generation (low + high res) at assignment time.  
- Implement SampleBrowserPanel, SampleBrowserSearch, SampleBrowserTabs, SampleListItem, UploadDropzone.  
- Implement drag-and-drop directly onto Pad (single-file → single-pad) and onto the grid area (multi-file → sequential empty pads, FR-SAMPLE-007).  
- Implement replace/remove sample flows with ConfirmDialog integration (FR-SAMPLE-004, FR-SAMPLE-005), including asset reference-counting on removal.  
- Implement error toasts for unsupported/oversized files (FR-SAMPLE-006).  
**Exit Criteria (testable):**  
- Playwright test: upload a valid WAV via file picker → pad shows assigned state → sample audible on trigger.  
- Playwright test: drag-and-drop a file onto an empty pad and onto an occupied pad (with confirmation flow) both work correctly.  
- Playwright test: uploading an unsupported file type shows the expected inline error and does NOT assign it.  
- Unit test: AssetRepository refCount increments/decrements correctly across multiple pads sharing one asset, and deletes the blob only when refCount reaches 0 for user-uploaded assets (never auto-deletes built-in reference rows).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCUZfE2IYmVDBhAU2QtIq6DIzW7UHAMBfnGt1V8fXEwAAXrse/xcF7U7sx4wAAAAASUVORK5CYII=)  
**8. Phase 5 — Sample Editor**  
**Goal:** Full non-destructive sample editing per FR-EDIT-*.  
**Tasks:**  
- Integrate WaveSurfer.js in WaveformCanvas, driven by stored waveformPeaksHigh.  
- Implement SampleEditorModal with local staged-params state (not committed until Save), Cancel/discard-confirmation flow.  
- Implement WaveformMarker (start/end/fade handles) drag interactions.  
- Implement ZoomControls, EditorTransportControls (preview play/pause, reverse, loop, normalize), NumericParamInput.  
- Wire PreviewPlayer (already built in Phase 1) into the modal for live-on-demand preview playback (FR-EDIT-005).  
- Implement Normalize (FR-EDIT-008), Pitch (FR-EDIT-009), Gain (FR-EDIT-010), Fade in/out (FR-EDIT-011) controls, all reflected in preview.  
- On Save, commit staged params to padSlice/persistence via PadParameterService, triggering the same live pad playback path used elsewhere so subsequent triggers on the grid reflect the edit.  
**Exit Criteria (testable):**  
- Playwright test: open editor, drag start marker right, verify preview playback (via engine voice/duration assertions) reflects the trimmed region.  
- Playwright test: toggle Reverse + Save, then trigger the pad from the grid, verify the engine used the reversed buffer variant (assert via engine introspection hook or a distinguishable test fixture, e.g., a sample with a detectable asymmetric waveform).  
- Playwright test: Cancel after making changes prompts confirmation; confirming discards changes (pad unaffected); Save persists changes (survives reload, tying back into Phase 3's persistence test).  
- Manual QA: zoom/scroll behavior, fade handle dragging, and numeric input precision all function per 05_UI_UX.md §8.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsSfYxZo/jkUsYQLPJrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA4rDBc72meO5AAAAAElFTkSuQmCC)  
**9. Phase 6 — Parameter Panel, Master Controls, Mute/Solo/Play-Mode**  
**Goal:** Full live-performance sound-shaping without opening the full editor; master bus controls complete.  
**Tasks:**  
- Implement ParameterPanel, SliderControl, KnobControl, PlayModeToggle, ColorPickerPopover, EnvelopeDisclosure, PadNameInput.  
- Wire live parameter updates to the engine via useAudioEngineBinding (FR-PARAM-002).  
- Fully implement Mute (FR-PAD-007) and Solo (FR-PAD-008) with SoloMuteResolver integration end-to-end (previously only stubbed in Phase 2).  
- Implement Gate vs. One-Shot play mode fully, including keyup/pointerup release behavior (FR-PAD-005).  
- Implement MasterVolumeControl (fader + mute), TopBar completed, and (P1) output level meter using an AnalyserNode.  
- Implement PadContextMenu (FR-PAD-009).  
**Exit Criteria (testable):**  
- Playwright test: adjusting Volume/Pan/Pitch sliders while a looped pad is playing produces an audible/measurable change without retriggering the voice.  
- Playwright test: soloing pad A silences pad B on trigger; un-soloing restores pad B.  
- Playwright test: Gate-mode pad stops sounding on keyup/pointerup; One-Shot mode plays to completion regardless of release timing.  
- Manual QA against full 05_UI_UX.md §9-10 spec.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSd4EKxgBjP+Asa0hxW8ibAl2DIzR3UFAMBf3Gu1VefXEwAAXtsfSqwDVbgKngwAAAAASUVORK5CYII=)  
**10. Phase 7 — Responsive Layout, Accessibility, Offline/PWA**  
**Goal:** Product is fully usable across the responsive breakpoint matrix, meets the accessibility baseline, and works offline.  
**Tasks:**  
- Implement useBreakpoint, ResponsiveDrawer, mobile/tablet layout adaptations for Sample Browser and Parameter Panel (05_UI_UX.md §4).  
- Implement touch target sizing, touch-action: none on the grid, safe-area padding.  
- Implement accessibility baseline (§15.1): focus states, aria labels, focus trapping in modals, prefers-reduced-motion handling.  
- Implement the pad-grid accessibility "List View" alternative mode (§15.2).  
- Configure vite-plugin-pwa: app shell caching, built-in sample pack caching, offline fallback behavior (FR-XCUT-004).  
- Implement KeyboardShortcutsModal, OnboardingOverlay.  
**Exit Criteria (testable):**  
- Playwright tests run at multiple viewport sizes (360px, 768px, 1024px, 1440px) verifying layout adaptation and no horizontal scroll on the core surface (FR-XCUT-001).  
- Lighthouse Accessibility score ≥ 90 for non-pad-grid UI; documented manual review of the pad-grid exception rationale.  
- Offline test: load app once online, go offline (Playwright network throttling/offline mode), reload, verify full functionality including built-in sample playback.  
- axe-core automated accessibility scan integrated into CI, zero critical violations outside the documented pad-grid exception.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBCUpfDq4wwIAABiywEZJWQZeZ2ao9AAD+4liruzq/ngAA8Nr1ABweBgdur/QFAAAAAElFTkSuQmCC)  
**11. Phase 8 — Testing & Performance Hardening**  
**Goal:** Full test suite per 12_TESTING.md passes; performance budgets from 03_TDD.md §5 are verified, not assumed.  
**Tasks:**  
- Fill out remaining unit/integration/E2E test coverage gaps identified across Phases 1–7.  
- Run React DevTools Profiler audits confirming the re-render scoping claims in 06_COMPONENTS.md §12 (e.g., triggering one pad does not re-render all 32).  
- Load-test: populate all 128 pad slots with real samples, verify memory footprint and trigger latency remain within budget.  
- Cross-browser QA pass across the full matrix in 03_TDD.md §6.  
- Bundle size audit (03_TDD.md §5 ≤250KB gzipped initial JS) and code-splitting adjustments if exceeded (e.g., lazy-load the Sample Editor modal code and WaveSurfer.js only when first opened).  
**Exit Criteria (testable):**  
- All P0 requirements across 02_FSD.md have at least one passing automated test.  
- CI pipeline green across the full test suite (unit + integration + E2E) on the target browser matrix (Playwright's multi-browser project config).  
- Documented performance report matching or explaining any deviation from 03_TDD.md §5 budgets.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/h5VMYARvRrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA224BcUMk6pDAAAAAElFTkSuQmCC)  
**12. Phase 9 — P1/P2 Enhancement Sweep**  
**Goal:** Close out remaining P1/P2 requirements not yet covered by earlier phases' primary focus.  
**Tasks (representative, cross-reference ** **02_FSD.md** ** for full list):**  
- Non-QWERTY keyboard mapping mode (FR-KEY-006).  
- Velocity-sensitive dynamics where supported (FR-PAD-010).  
- Per-bank naming and bank duplication (FR-BANK-004, FR-BANK-005).  
- Named local projects / project switcher (FR-PERSIST-004), manual save point (FR-PERSIST-005).  
- Project export/import (FR-IO-001, FR-IO-002).  
- Settings panel completion (FR-SETTINGS-001, FR-SETTINGS-002).  
- Master limiter (FR-MASTER-004).  
**Exit Criteria:** Each enhancement independently tested per its own FR-* acceptance criteria; no regression in P0 test suite (full regression run required before considering v1 "release-ready" per 01_PRD.md §11).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsSdYxKa/jL0MIR7FCt5E2BJsmZmt2gMA4C+Otbqr8+sJAACvXQ85SAYUQNBTfQAAAABJRU5ErkJggg==)  
**13. Phase Dependency Notes for the Implementing Agent**  
- **Do not attempt Phase 5 (Sample Editor) before Phase 4 (Sample Assignment)** — the editor operates on already-assigned samples.  
- **Do not attempt Phase 6's Solo/Mute wiring before Phase 1's ** **SoloMuteResolver** ** exists** — it is pure logic built in Phase 1 and only wired to UI in Phase 6.  
- **Phase 3's persistence layer is a hard prerequisite for Phases 4-6's Save flows** — those phases assume PadRepository/AssetRepository are functional.  
- Phases 7 and 8 can partially overlap/interleave in practice (accessibility fixes often surface during performance profiling) but are listed sequentially for clarity of scope.  
- Each phase should end with a working, deployable build — never leave the app in a broken state between phases (supports incremental review/testing by a human reviewer at every checkpoint).  
