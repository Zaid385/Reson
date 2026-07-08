**12 — Testing Strategy**  
**1. Testing Philosophy**  
Reson's correctness is measured on three axes with different tooling per axis:  
1. **Logical correctness** (state transitions, voice management, persistence) — Unit tests.  
2. **User-facing behavior** (flows across components) — Integration tests.  
3. **Real-world instrument behavior** (actual browser input, actual audio graph, actual timing/latency) — End-to-end (E2E) and performance tests.  
No layer substitutes for another: a unit test proving SoloMuteResolver is logically correct does NOT prove the UI wires it correctly — that requires an integration or E2E test. This layered strategy is mandatory, not optional, given the audio-timing-sensitive nature of the product.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCUZfEnoYmFDBhAU2QtIq6DIzW7UHAMBfnGt1V8fXEwAAXrse/wcF74lXkIsAAAAASUVORK5CYII=)  
**2. Tooling**  
| | |  
|-|-|  
| **Test Type** | **Tool** |   
| Unit | Vitest |   
| Component/Integration | Vitest + React Testing Library |   
| End-to-End | Playwright (Chromium, Firefox, WebKit projects) |   
| Accessibility | axe-core (via @axe-core/playwright), integrated into E2E suite |   
| Performance | Playwright + Chrome DevTools Performance/Tracing API, Lighthouse CI |   
| Visual regression (optional, P2) | Playwright screenshot comparison for key states (pad grid, editor open) |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsad4EjtY9fewnUms4E2ELcGWmTmrKwAA/uLeqrU6vp4AAPDa/gDzWAM6QQXRdAAAAABJRU5ErkJggg==)  
**3. Unit Testing Scope**  
Located in tests/unit/, mirroring src/ structure.  
**3.1 Audio Engine (**tests/unit/audio-engine/ **)**  
| | |  
|-|-|  
| **Target** | **Cases** |   
| VoiceManager | Allocates voice under capacity; steals oldest voice at MAX_VOICES; enforces MAX_VOICES_PER_PAD; releases voice slots on completion |   
| SoloMuteResolver | No solos → mute state alone determines audibility; one or more solos → only soloed pads audible regardless of mute; solo scoping is per-bank |   
| BufferRegistry | Registers/unregisters buffers; generates and caches reversed variant; unregister frees memory (verified via reference removal, not literal GC observation) |   
| PadBus / MasterBus | Gain node values reflect setPadVolume/setMasterVolume inputs correctly, including dB↔linear conversions from utils/math.ts |   
| Envelope computation | Attack/release ramp target values and timing parameters are computed correctly for given inputs |   
   
**Mocking approach:** inject a lightweight fake/mock implementing the subset of the AudioContext/AudioNode interface actually used (createGain, connect, currentTime, param automation methods) rather than requiring a real browser audio backend, per 07_AUDIO_ENGINE.md §16.  
**3.2 Domain Services (**tests/unit/domain/ **)**  
| | |  
|-|-|  
| **Target** | **Cases** |   
| SampleAssignmentService | Rejects unsupported MIME types and oversized files before attempting decode; happy path produces correct peaks + asset record shape |   
| ProjectExportService | Produces a spec-conformant export JSON (08_DATABASE.md §8.1), correctly distinguishes built-in-by-reference vs. embedded-audio assets |   
| ProjectImportService | Rejects unrecognized formatVersion; correctly resolves all assetRefs or fails with a clear error if one is missing |   
| PadParameterService | Clamps out-of-range values (e.g., volume > 1.0, pitch beyond ±24) to valid bounds; applies correct defaults for unset fields |   
| BankDuplicationService | Correctly deep-copies all 32 pads' parameters and (where applicable) asset references with incremented refCounts |   
   
**3.3 State (**tests/unit/state/ **)**  
| | |  
|-|-|  
| **Target** | **Cases** |   
| padSlice | Actions produce correct immutable state transitions; scoped selectors (usePad(bankId, slotIndex)) return stable references when unrelated state changes (regression guard for the re-render performance claims in 06_COMPONENTS.md) |   
| bankSlice | setActiveBank updates correctly; does not mutate pad data |   
| uiSlice | Modal open/close, toast add/remove/auto-dismiss timer logic |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAM0lEQVR4nO3OMQ0AIAwAwZKQ6kBqjSAOJywYYCIkd9OP36pqRMQMAAB+sfqJfLoBAMCN3NYoAzBA+QG0AAAAAElFTkSuQmCC)  
**4. Integration Testing Scope**  
Located in tests/integration/, using React Testing Library with a real (in-memory, fake-indexeddb-backed) store and a mocked Audio Engine (verifying correct calls into the Engine's public API, not real audio output).  
| | |  
|-|-|  
| **Flow** | **Verifies** |   
| pad-trigger-flow.test.tsx | Keydown on a mapped key results in the correct Pad component receiving triggered visual state AND engine.triggerPad being called with correct padId/params |   
| sample-assignment-flow.test.tsx | Dropping a mock File onto a Pad invokes SampleAssignmentService correctly, and resulting store state renders the pad as assigned |   
| sample-editor-flow.test.tsx | Opening editor, modifying staged params, clicking Save results in exactly one padSlice.updatePadParams call with the correct merged shape; Cancel results in zero store mutations |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSd49m4tA8nPaQJjWMGbCFuCLTOzV2cAAPzFvVZbdXw9AQDgtesBorcEPwOKyvQAAAAASUVORK5CYII=)  
**5. End-to-End Testing Scope**  
Located in tests/e2e/, run against a real built application in real browsers via Playwright, across the browser matrix in 03_TDD.md §6.  
**5.1 **keyboard-performance.spec.ts  
- Simulates keydown/keyup across all 32 mapped keys; asserts correct pad-to-key correspondence (FR-KEY-001).  
- Asserts holding a key (simulated repeat) does not multi-trigger (FR-KEY-002).  
- Asserts typing in a focused text field (e.g., pad rename input) does not trigger pads (FR-KEY-005).  
- Measures and asserts input→visual-feedback timing stays within budget using Playwright's tracing/performance APIs.  
**5.2 **touch-multitouch.spec.ts  
- Uses Playwright's touch/CDP input simulation to fire multiple simultaneous touch points on different pads, asserting independent triggering (FR-MOUSE-003).  
- Simulates a drag gesture across multiple pads (finger roll), asserting each newly-entered pad triggers exactly once (FR-MOUSE-004).  
**5.3 **persistence-across-reload.spec.ts  
- Assigns a sample, changes parameters, reloads the page, asserts identical restored state (FR-BOOT-004).  
- Verifies autosave debounce timing (change occurs, assert NOT yet persisted before 500ms, assert persisted after).  
**5.4 **offline-mode.spec.ts  
- Loads app online once (priming the service worker cache), sets the browser context offline, reloads, asserts full functionality including built-in sample audio (FR-XCUT-004).  
**5.5 Additional Required E2E Specs**  
| | |  
|-|-|  
| **Spec** | **Coverage** |   
| sample-upload.spec.ts | File picker + drag-drop upload happy path and rejection path (FR-SAMPLE-001 through 006) |   
| sample-editor.spec.ts | Marker dragging, reverse, loop, normalize, pitch/gain/fade, save/cancel (FR-EDIT-*) |   
| bank-switching.spec.ts | Instant switch, playing-voice continuity across switch (FR-BANK-*) |   
| solo-mute.spec.ts | Solo/mute audibility resolution end-to-end (FR-PAD-007/008) |   
| responsive-layout.spec.ts | Layout correctness at all breakpoints (05_UI_UX.md §16) |   
| accessibility.spec.ts | axe-core scan on every screen/modal state; keyboard-only navigation through all non-pad-grid controls |   
| import-export.spec.ts | Round-trip export → clear data → import → assert identical project state (FR-IO-001/002) |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/jFnsYARvRrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA22QBcposvV4AAAAAElFTkSuQmCC)  
**6. Performance Testing**  
| | | |  
|-|-|-|  
| **Test** | **Method** | **Threshold** |   
| Time to Interactive (cold cache) | Lighthouse CI, run in pipeline | < 2.5s |   
| Input → visual feedback latency | Playwright + performance.now() timestamps captured in-page around the event handler and the CSS class application | ≤ 16ms |   
| Input → audible latency (desktop) | Playwright + Web Audio AnalyserNode sampling or AudioContext.currentTime diffing against the trigger call timestamp, in a controlled test harness page | ≤ 30ms |   
| Bank switch render time | React Profiler API commit timing, asserted in an automated harness | ≤ 16ms |   
| Bundle size | vite build output analysis (e.g., rollup-plugin-visualizer) in CI | ≤ 250KB gzipped initial JS |   
| Memory under load (128 pads populated) | Chrome DevTools Protocol memory sampling during a scripted heavy-performance session | No unbounded growth across a 10-minute scripted session (leak regression guard) |   
| Re-render scoping | React DevTools Profiler, scripted: trigger 1 pad, assert only that Pad instance re-rendered, not the full PadGrid subtree | Zero unrelated re-renders |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsad4EEtY9QcxnUms4E2ELcGWmTmrKwAA/uLeqrU6vp4AAPDa/gDzXgM37EF77AAAAABJRU5ErkJggg==)  
**7. Browser Compatibility Testing**  
Playwright's multi-browser project configuration runs the full E2E suite (or a defined critical subset, for CI time budget reasons) against:  
- Chromium (stand-in for Chrome/Edge)  
- Firefox  
- WebKit (stand-in for Safari — noting WebKit's Web Audio behavior can diverge from Chromium; any WebKit-specific failures require explicit investigation, not suppression)  
Manual QA supplements automated coverage specifically for:  
- Real iOS Safari (simulator or device) — WebKit's AudioContext unlock behavior and touch event timing have known real-device quirks not always reproducible in Playwright's WebKit engine.  
- Real Android Chrome — touch multi-touch and vibration/haptic (if added later) behaviors.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/h5VMYARvRrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA224BcUMk6pDAAAAAElFTkSuQmCC)  
**8. Test Data & Fixtures**  
- A dedicated tests/fixtures/audio/ directory contains small (<100KB), license-clear test WAV files: a short percussive one-shot, a sustained tone (for loop/pitch testing), and an intentionally asymmetric waveform (for reverse-correctness assertions).  
- A tests/fixtures/corrupt.wav (malformed header) exercises FR-ERROR-001 decode-failure handling.  
- A mock IndexedDB (fake-indexeddb package) is used for unit/integration tests to avoid requiring a real browser IndexedDB implementation outside of Playwright's real-browser E2E runs.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCUbfEm6YmFDBhAU2QtIq6DIzW7UHAMBfnGt1V8fXEwAAXrse/w8F7pbTa1oAAAAASUVORK5CYII=)  
**9. CI Pipeline Gates**  
Recommended pipeline stage order (fail-fast):  
1. lint + typecheck  
2. test (unit + integration, Vitest)  
3. build (verify production build succeeds, capture bundle size report)  
4. test:e2e (Playwright, full matrix on merge to main; a fast critical-path subset on every PR)  
5. lighthouse-ci (performance + accessibility scores on the built app)  
A merge to the main branch is blocked if any P0-requirement-covering test fails. P1/P2 test failures are tracked but configurable as non-blocking warnings during early roadmap phases, becoming blocking by Phase 8 (11_IMPLEMENTATION_ROADMAP.md).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AUBBAsUfyVTCg9UygEBVsWGAjJK2CbjNzVGcAAPzFtapV7V9PAAB47X4AEWIEM8iQs0EAAAAASUVORK5CYII=)  
**10. Manual QA Checklist (Supplement to Automation)**  
For each release candidate, a human (or a careful agent pass) verifies:  
- Instrument "feel" — subjective latency/responsiveness check on real hardware, not just automated timers.  
- Audio quality — no clicks/pops on trigger, release, mute, solo-toggle, or voice-stealing events.  
- Visual polish — matches 05_UI_UX.md states exactly (no missed hover/active/disabled states).  
- Real mobile device pass (at least one iOS and one Android device).  
- Screen reader spot-check (VoiceOver or NVDA) on non-pad-grid controls.  
- Storage quota behavior on a deliberately near-full browser profile.  
