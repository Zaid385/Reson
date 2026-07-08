**14 — Future Features & Post-v1 Roadmap**  
**1. Purpose**  
This document catalogues features explicitly deferred beyond v1, why they were deferred, and how the v1 architecture already prepares for them (cross-referencing the extension points established in 04_ARCHITECTURE.md §8 and 07_AUDIO_ENGINE.md). This is a planning/vision document, not a set of binding requirements — nothing here should be implemented as part of the phases in 11_IMPLEMENTATION_ROADMAP.md.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSPBCj7fFRYQwYwEZiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AMTJBeJDClAyAAAAAElFTkSuQmCC)  
**2. MIDI Input Support**  
**Vision:** Connect a physical MIDI controller/pad device and trigger Reson's pads from it, in addition to keyboard/mouse/touch.  
   
 **Why deferred:** Not core to the "browser IS the instrument" v1 vision (PRD explicitly scopes this out); Web MIDI API browser support (notably Safari) is inconsistent, adding cross-browser risk to a v1 that must ship broadly compatible.  
   
 **Architectural readiness:** A new useMidiController binding hook (already stubbed per 10_PROJECT_STRUCTURE.md §7) would listen to navigator.requestMIDIAccess() note-on/note-off messages, map MIDI note numbers to pad IDs (configurable mapping, likely reusing the same bankId + slotIndex addressing as the keyboard map), and call the existing engine.triggerPad()/releasePad() — zero Engine changes required, satisfying the "extension point" design goal.  
   
 **Future scope additions:** MIDI note velocity → pad velocity scaling (extends FR-PAD-010's existing velocity plumbing); MIDI clock sync for the future Sequencer; MIDI CC mapping to parameter panel controls (e.g., a hardware knob controlling pad volume).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AUBBAsUfyVTCg9UygEBVsWGAjJK2CbjNzVGcAAPzFtapV7V9PAAB47X4AEWIEM8iQs0EAAAAASUVORK5CYII=)  
**3. Step Sequencer**  
**Vision:** A classic 16-step (or variable-length) pattern sequencer per bank/pad, allowing users to program beats rather than only performing them live, with pattern chaining and a transport (play/stop/BPM/swing).  
   
 **Why deferred:** Substantial scope addition (01_PRD.md explicitly lists as "Future goal," not v1); requires new UI surface (step grid), new state slice, and new scheduling logic.  
   
 **Architectural readiness:** 07_AUDIO_ENGINE.md §5 already reserves the  **Transport Path** as a parallel scheduling mechanism alongside the Immediate Trigger Path, both converging on the same VoiceManager.playVoice() primitive — meaning the sequencer's playback engine requires no changes to voice management, buses, or the trigger contract, only a new caller using Tone.Transport/Tone.Sequence for lookahead-scheduled, sample-accurate step playback. A new sequencerSlice (Zustand) and src/features/sequencer/ folder (per 10_PROJECT_STRUCTURE.md §19 scaling rationale) would be additive, not disruptive.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBACP6MMH6NpGACyywEZJWQZeZ2aszAAD+4l6rrTq+ngAA8Nr1AL+6BElk4wV6AAAAAElFTkSuQmCC)  
**4. Audio Recording / Live Looping**  
**Vision:** Record the live performance output (master bus) as the user plays, for capture/export, and/or live-loop recording (record a pattern on the fly, similar to a hardware looper pedal).  
   
 **Why deferred:** Requires MediaRecorder/Tone.Recorder integration, a new UI surface (record/arm/overdub controls), and file-export UX not scoped for v1.  
   
 **Architectural readiness:** 04_ARCHITECTURE.md §8 and 07_AUDIO_ENGINE.md §3 explicitly note the Master Bus as the intended tap point for a future Tone.Recorder/MediaRecorder, independent of the playback signal path — recording taps the bus without modifying it.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBCkLfFR7wwIgHRiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AOIEBeX8aGZPAAAAAElFTkSuQmCC)  
**5. Effects Rack**  
**Vision:** Insert effects (reverb, delay, filter, distortion, compression) per-pad or as master-bus sends, with wet/dry controls, presets, and automation.  
   
 **Why deferred:** Significant UI and DSP-graph complexity; not required for the core "trigger samples live" instrument experience.  
   
 **Architectural readiness:** Both the Pad Bus and Master Bus graphs (07_AUDIO_ENGINE.md §3) already define explicit pass-through insertion points reserved for this purpose, so effects can be added as new nodes spliced into an existing connection without a graph rewrite. Tone.js's effects modules (Tone.Reverb, Tone.FeedbackDelay, Tone.Filter, etc.) map directly onto this reserved insertion pattern.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsad4EEtY9QcxnUms4E2ELcGWmTmrKwAA/uLeqrU6vp4AAPDa/gDzXgM37EF77AAAAABJRU5ErkJggg==)  
**6. Automation**  
**Vision:** Record/draw parameter automation (volume, pan, pitch, filter cutoff once effects exist) over time, synced to the future Sequencer's transport.  
   
 **Why deferred:** Depends on both the Sequencer and Effects Rack existing first; a third-order feature.  
   
 **Architectural readiness:** AudioParam-based automation (already the mandated implementation approach for envelopes per 07_AUDIO_ENGINE.md §10) is inherently compatible with more complex automation curves later — the underlying Web Audio primitives already support this without engine redesign.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhwgJuUPYDMpnRgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseaHEEM+cJoFcAAAAASUVORK5CYII=)  
**7. Sampling Directly from Microphone**  
**Vision:** Record a new sample directly via the device microphone (getUserMedia) and assign it straight to a pad — enabling instant vocal chops, field recording capture, and live sampling performance (a hallmark hardware-groovebox feature).  
   
 **Why deferred:** Requires microphone permission UX, a recording UI (arm/record/trim-immediately-after flow), and careful handling of browser permission-denial states — meaningful scope, not core to v1's "play what's already loaded" baseline.  
   
 **Architectural readiness:** Naturally extends SampleAssignmentService (10_PROJECT_STRUCTURE.md §9) with a new input source (getUserMedia stream → recorded Blob) feeding into the exact same downstream pipeline (decode → generate peaks → AssetRepository.saveAsset → assign to pad) already built for file uploads — no new pipeline required, only a new capture-side entry point.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAMUlEQVR4nO3WAQkAIBAEsBPMYs4PZhMDWMAA5njYUmxU1UqyAwBAF2cmeZE4AIBO7gentgXapSWpbgAAAABJRU5ErkJggg==)  
**8. AI Sample Tagging & Smart Organization**  
**Vision:** Automatically classify/tag uploaded samples (e.g., "kick," "vocal chop," "808 bass," BPM/key detection) to power smarter search/filtering in the Sample Browser and possibly auto-suggest pad placement.  
   
 **Why deferred:** Requires either a client-side ML model (bundle size/performance tradeoffs) or a backend inference service (which doesn't exist until 09_API.md is built) — meaningful new infrastructure.  
   
 **Architectural readiness:** 08_DATABASE.md §7 notes the assets table's design explicitly anticipates additive metadata fields (e.g., tags: string[], detectedBpm: number, detectedKey: string) without a breaking schema change — the migration strategy (08_DATABASE.md §5) is designed exactly for this kind of additive future evolution.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OMQ0AIAwAwZIgBKnVgjN8dGDBABMhuZt+/JaZIyJmAADwi9VP1NMNAABu1AaU3AUhiyfJeAAAAABJRU5ErkJggg==)  
**9. Stem Separation**  
**Vision:** Upload a full song/mix and automatically split it into stems (drums/bass/vocals/other) for use as individual pad sources — directly serving the PRD's "entire song snippets" pad-content vision at a deeper level.  
   
 **Why deferred:** Requires either heavy client-side ML (likely infeasible at acceptable performance/bundle-size in-browser for v1) or server-side processing (backend dependency, 09_API.md).  
   
 **Architectural readiness:** Would plug into SampleAssignmentService as an optional post-upload processing step producing multiple derived assets records (one per stem) from a single uploaded source file — the reference-counted, multi-asset-per-project data model already supports this shape without structural change.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhwgJWEPcbJpnRgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseaIkEMIPgIvAAAAAASUVORK5CYII=)  
**10. Cloud Projects & Cross-Device Sync**  
**Vision:** Sign in, save projects to the cloud, access the same kit from any device.  
   
 **Why deferred:** Explicit v1 non-goal (01_PRD.md §5.4); requires backend, auth, and object storage infrastructure.  
   
 **Architectural readiness:** Fully speculatively designed in 09_API.md; the local ProjectRepository interface (08_DATABASE.md §4) is already abstracted so a future RemoteProjectRepository can be swapped/composed in (e.g., local-first with background sync) without Domain-layer changes.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsSfYxZo/jVEMYQLPJrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA4rLBc059ysnAAAAAElFTkSuQmCC)  
**11. Real-Time Collaboration**  
**Vision:** Multiple users jamming on the same project simultaneously (shared bank/pad state, visible presence of collaborators, possibly shared live performance in a session).  
   
 **Why deferred:** Substantial scope: requires real-time sync infrastructure (WebSocket/CRDT or similar), conflict resolution beyond the simple last-write-wins model in 08_DATABASE.md §10, and new UI for presence/permissions.  
   
 **Architectural readiness:** 09_API.md §4.5 sketches a basic collaborator-invitation REST surface as a starting point; real-time sync mechanics would need a dedicated future design document when this becomes a scheduled priority.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSeYxKS/kJkED6bwYAVvImwJtszMVu0BAPAXx1rd1fn1BACA164HHDwF+DpPyKwAAAAASUVORK5CYII=)  
**12. Additional Smaller Enhancements (Unordered, Lower-Investment Ideas)**  
- Exponential (vs. linear) envelope/fade curve options for more natural-sounding fades (07_AUDIO_ENGINE.md §10 notes this as a documented future refinement).  
- Choke groups fully functional (schema field already reserved, FR-PAD-006).  
- Undo/redo stack for parameter changes (keyboard shortcut already reserved in 05_UI_UX.md §14).  
- Live-updating Sample Editor preview during marker drag (rather than explicit-preview-button-only, 07_AUDIO_ENGINE.md §9).  
- Tiered/zoom-dependent waveform peak storage for very long samples (08_DATABASE.md §6).  
- BroadcastChannel-based multi-tab conflict warning (RISK-BROWSER-004 in 13_RISK_ANALYSIS.md).  
- Master limiter/compressor on the master bus (FR-MASTER-004, already graph-reserved).  
- Switch-device / assistive-input live-performance accessibility beyond the v1 List View mode (RISK-UX-001).  
- Light theme / theme customization (v1 is dark-only by design per 05_UI_UX.md §1).  
- Internationalization / localized UI strings (v1 centralizes strings to ease this later, per 03_TDD.md §8 Non-Functional Requirements).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhZscaUpheJwqQgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseopcEQ2uoYnwAAAAASUVORK5CYII=)  
**13. Prioritization Guidance for Future Planning**  
When future roadmap planning occurs beyond this document's scope, the following relative-value heuristics (consistent with the PRD's "instrument first" philosophy) are recommended as a starting lens, though final prioritization is a product decision at that time:  
1. Features that deepen the **live performance** experience (MIDI, microphone sampling, real-time collaboration) generally align most closely with the core vision and should be weighted favorably.  
2. Features that deepen **sound design depth** (effects rack, automation, stem separation, AI tagging) serve the secondary "build your own kits" goal.  
3. Infrastructure features (cloud sync) are enabling investments — valuable but not experience-differentiating on their own, best sequenced once a clear multi-device or sharing use case is validated with real users.  
