**01 — Product Requirements Document (PRD)**  
**Product Name: ** **Reson**  
**A browser-based live performance sampler**  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OUQmAABBAsSeYxZyXSzCJASxgACv4J8KWYMvMbNURAAB/ca7VXe1fTwAAeO16AKe+BdmJqrPdAAAAAElFTkSuQmCC)  
**1. Document Purpose**  
This PRD defines *what* Reson is,  *who* it is for, and  *why* it must exist. It is the top-level source of truth for all downstream specification documents (FSD, TDD, Architecture, UI/UX, etc.). Any conflict between documents is resolved in favor of this PRD unless explicitly noted.  
This document targets an AI coding agent (and human engineers) who will implement the product with no further product clarification available. All requirements are written to be unambiguous, testable, and traceable.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNBCUrfDqrYGVDAgAU2QtIq6DIzW7UHAMBfHGt1V+fXEwAAXrseHCQGBEuErVgAAAAASUVORK5CYII=)  
**2. Product Vision**  
***Reson is not an app that plays sound. Reson IS an instrument.***  
Users open a URL and, within one second of the page becoming interactive, can perform music using a computer keyboard, mouse, or touchscreen. There is no login wall, no mandatory tutorial, no loading screen longer than necessary. The product must feel like picking up an MPC or a Maschine controller — immediate, tactile, responsive, and musical.  
Reson occupies the intersection of:  
- **Hardware groovebox** (Maschine MK3/+, MPC Live, Elektron devices) — pad-based sample triggering, tactile workflow.  
- **DAW sampler** (Ableton Drum Rack, Kontakt) — deep per-pad sound design.  
- **Instrument, not utility** — designed for live expression and performance, not just file management.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhwgJGkPcrHpnRgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseaJkELjbMzy0AAAAASUVORK5CYII=)  
**3. Problem Statement**  
| | | |  
|-|-|-|  
| **Problem** | **Current State** | **Reson's Answer** |   
| Hardware samplers are expensive and immobile | $500–$2000 devices required to jam with samples | Free, instant, browser-based, works on any device |   
| Existing web audio toys are novelties | Low sample count, no editing, poor performance, toy-like UX | Full sampler feature set: 32 pads × 4 banks, per-pad sound design, professional dark UI |   
| DAWs have high setup friction for quick performance | Must open project, load plugin, route MIDI, before making a sound | Zero setup — sound within one interaction |   
| Mobile/touch music tools are rare and shallow | Few browser instruments handle touch as a first-class input | Touch, mouse, and keyboard are equal first-class citizens |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsSfYxZo/jzlMYQLPJrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA4q7Bc870TqdAAAAAElFTkSuQmCC)  
**4. Target Users & Personas**  
**4.1 Persona: "Live Performer Lena"**  
- Beatmaker/DJ who wants a browser-based backup instrument or a controller-free way to sketch ideas.  
- Needs: low latency, satisfying tactile feedback, quick bank switching, keyboard-first workflow.  
**4.2 Persona: "Bedroom Producer Beto"**  
- Home producer building custom kits from field recordings, vocal chops, and one-shots.  
- Needs: sample editing (trim, normalize, pitch), organizing kits into banks, saving/recalling projects.  
**4.3 Persona: "Curious Casual Casey"**  
- Non-musician who stumbles on the site and wants to have fun tapping pads on a phone.  
- Needs: instant gratification, built-in sample packs, no account required, forgiving touch targets.  
**4.4 Persona: "Educator Erin"**  
- Music teacher demonstrating rhythm/sampling concepts in a classroom using a browser and a projector.  
- Needs: large legible UI, keyboard-mapped pads visible on-screen, reliable performance on shared/lab computers.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhwgJOUPcjIpnRgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseaJEEL8XMiYMAAAAASUVORK5CYII=)  
**5. Goals**  
**5.1 Primary Goal**  
Deliver an **enjoyable, low-latency, live-performance instrument** playable immediately via keyboard, mouse, or touch, with 32 velocity-reactive pads across 4 banks.  
**5.2 Secondary Goal**  
Allow users to **build and customize their own sample kits**: upload audio, trim/edit samples, assign to pads, configure per-pad sound parameters, and persist kits locally across sessions.  
**5.3 Future Goal**  
Evolve into a **complete browser-based groovebox**: step sequencer, effects rack, MIDI I/O, live recording/looping, and cloud-synced projects (see 14_FUTURE_FEATURES.md).  
**5.4 Non-Goals (Explicitly Out of Scope for v1)**  
- No user accounts, authentication, or cloud storage in v1 (local-only persistence via IndexedDB).  
- No MIDI controller support in v1 (architecture must allow it later — see 07_AUDIO_ENGINE.md and 14_FUTURE_FEATURES.md).  
- No step sequencer in v1.  
- No collaborative/multiplayer sessions in v1.  
- No native mobile app; this is a responsive web application only.  
- No audio effects rack (reverb/delay/filter sends) in v1 — architecture must reserve the extension point.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OUQmAABBAsSdYxKbXxlpGEAOIFfwTYUuwZWa2ag8AgL841uquzq8nAAC8dj05VAYO3phhoQAAAABJRU5ErkJggg==)  
**6. Success Metrics (Product-Level)**  
| | |  
|-|-|  
| **Metric** | **Target** |   
| Time from page load to first playable sound (interactive) | < 2.5s on broadband, cold cache |   
| Input-to-audible-sound latency (perceived) | < 30ms on desktop Chrome, < 60ms on mobile Safari |   
| Pads triggerable simultaneously without audible glitching (polyphony) | ≥ 32 concurrent voices |   
| Crash-free session rate | > 99.5% |   
| Kit persists across browser refresh/restart | 100% of the time (barring storage quota errors, which must be surfaced to the user) |   
| Lighthouse Performance score (desktop) | ≥ 90 |   
| Works on last 2 major versions of Chrome, Firefox, Safari, Edge | Required |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OsQ1AABRAwSdRaPXGMOCv7WkPK+hEcjfBLTNzVFcAAPzFvVZbdX49AQDgtf0BSpoDXv5TGXgAAAAASUVORK5CYII=)  
**7. Core Feature Requirements (Summary)**  
Full functional detail lives in 02_FSD.md. This section enumerates the required feature set at the product level.  
**7.1 Performance Surface**  
- 32-pad grid mapped to keyboard keys 1 2 3 4 5 6 7 8 / Q W E R T Y U I / A S D F G H J K / Z X C V B N M ,.  
- Pads trigger via keyboard keydown, mouse click, and touchstart.  
- Visual feedback on trigger must be perceptibly instantaneous (see latency budget in 07_AUDIO_ENGINE.md).  
- Support for velocity-like dynamics via mouse/touch pressure where available (progressive enhancement — see FSD).  
**7.2 Sample Management**  
- Built-in sample packs available out of the box (no upload required to start playing).  
- Users can upload their own audio files (drag-and-drop onto a pad, or via file picker).  
- Users can replace or remove a sample assigned to a pad.  
- Each pad independently stores its sample reference plus all sound-shaping parameters (see §7.4).  
**7.3 Sample Editor**  
- Opened by clicking/selecting a pad's "edit" affordance.  
- Waveform display with zoom and horizontal scroll.  
- Draggable start/end markers defining the playback region.  
- Loop mode toggle.  
- Reverse toggle.  
- Normalize action.  
- Pitch adjustment (semitones + fine cents).  
- Gain adjustment.  
- Fade in / fade out with draggable handles or numeric input.  
- Live playback preview reflecting all edits in real time.  
**7.4 Per-Pad Parameters**  
Each pad persists the following state:  
| | | |  
|-|-|-|  
| **Parameter** | **Type** | **Notes** |   
| Sample reference | Audio buffer reference (stored asset ID) | May be empty/unassigned |   
| Pad color | Enum/hex | User-assignable, used for visual identity |   
| Display name | String | User-editable label |   
| Volume | Float 0.0–1.0 | Per-pad gain |   
| Pan | Float -1.0–1.0 | Stereo position |   
| Pitch | Float, semitones (-24 to +24) | Playback rate transposition |   
| Reverse | Boolean | Reverses sample buffer |   
| Attack | Float, ms | Envelope attack time |   
| Release | Float, ms | Envelope release time |   
| Mute | Boolean | Silences pad |   
| Solo | Boolean | Silences all non-soloed pads within the active bank |   
| Play mode | Enum: One-Shot / Gate | One-shot plays to completion; Gate stops on key/press release |   
| Start marker | Float, 0.0–1.0 (normalized) | Trim start |   
| End marker | Float, 0.0–1.0 (normalized) | Trim end |   
| Loop | Boolean | Loops between start/end markers |   
| Fade in | Float, ms |   |   
| Fade out | Float, ms |   |   
| Normalize | Boolean/derived gain | Applied at edit time or as a processing flag |   
   
**7.5 Banks**  
- 4 banks (A/B/C/D) × 32 pads = 128 total pad slots per project.  
- Bank switching must be instant (no perceptible delay, no audio dropout of currently playing voices unless user explicitly stops them).  
- Currently selected bank is clearly indicated in the UI at all times.  
**7.6 Audio Engine Requirements**  
- Polyphonic playback: multiple pads, and multiple retriggers of the same pad, play back simultaneously without cutting each other off (unless in Gate mode or voice-limited by design).  
- Sample-accurate scheduling suitable for future sequencer use.  
- Low, consistent latency.  
- Centralized voice management to prevent audio node leaks and to support future voice-stealing policies.  
- Master volume control, independent of per-pad volume.  
- Architecture must be extensible for: effects sends, MIDI input, a step sequencer, and audio recording, without a rewrite (see 07_AUDIO_ENGINE.md).  
**7.7 Persistence**  
- All kits, pad assignments, bank configurations, and user-uploaded sample data persist locally via IndexedDB.  
- Persistence must survive browser refresh, tab close/reopen, and system restart (subject to browser storage eviction policies, which must be handled gracefully).  
- Users can export/import a project as a portable file (see 08_DATABASE.md for format).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNhRAF6EPYDLhGADSywEZJWQZeZ2aszAAD+4l6rrTq+ngAA8Nr1AIWsBDYDm5cLAAAAAElFTkSuQmCC)  
**8. Experience Principles**  
1. **Instrument, not interface.** Every design decision is judged by whether it increases or decreases the feeling of playing an instrument.  
2. **Zero ceremony to first sound.** No mandatory onboarding blocks initial play.  
3. **Latency is a feature.** Perceived responsiveness is prioritized over visual flourish when the two conflict.  
4. **Keyboard is a first-class controller**, not an accessibility afterthought. Mouse and touch must feel equally immediate.  
5. **Depth is opt-in.** Basic play requires no menus; sound design (editor, per-pad parameters) is one interaction away but never blocks the surface.  
6. **Dark, minimal, performance-lighting-friendly UI.** The interface should look good on a stage, in a dim room, projected, or on a phone screen.  
7. **Never lose the user's work.** Local persistence is automatic and silent; failures are surfaced, not swallowed.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCj5fFyM6mJHAjAU2QtIq6DIzW7UHAMBfnGt1V8fXEwAAXrsexOEF35f1aEgAAAAASUVORK5CYII=)  
**9. Assumptions & Constraints**  
- Target platforms: modern desktop browsers (Chrome, Firefox, Safari, Edge — last 2 versions) and modern mobile browsers (iOS Safari, Chrome Android).  
- Web Audio API (via Tone.js) is available; no server-side audio processing.  
- No backend is required for v1; a backend is speculatively designed in 09_API.md for future cloud-sync features only.  
- Users may have imprecise/variable-latency audio hardware (Bluetooth headphones, etc.); the product cannot fully control end-to-end system latency but must minimize its own contribution.  
- Storage is bounded by browser IndexedDB quotas; large sample libraries must be handled gracefully (quota warnings, eviction handling).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAM0lEQVR4nO3KsQ0AIRAEsUW6Qij1KvnevhMSYmKQ7GiCGd09k3wBAOAVf+2o4wYAwE1qAdYuAy151mgcAAAAAElFTkSuQmCC)  
**10. Risks (Summary — see **13_RISK_ANALYSIS.md ** for full detail)**  
- Web Audio latency varies significantly across browsers/devices, especially mobile Safari.  
- Autoplay/audio-context-unlock policies require a user gesture before sound can play — must be handled without breaking "instant play" feel.  
- Large sample libraries risk exceeding IndexedDB storage quotas.  
- Keyboard layout assumptions (QWERTY) do not map cleanly to all physical keyboards (e.g., AZERTY) — must be documented and mitigated.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhwgJmkPYLLpnRgQU2QtIq6DIze3UGAMBf3Gu1VcfHEQAA3rseaHkEMn1wK7sAAAAASUVORK5CYII=)  
**11. Release Criteria (v1 / MVP)**  
The v1 release is considered complete when:  
1. All requirements in 02_FSD.md marked **P0** are implemented and pass acceptance criteria.  
2. Success metrics in §6 are met on the target browser matrix.  
3. All P0 test cases in 12_TESTING.md pass.  
4. No P0/P1 issues open in 13_RISK_ANALYSIS.md mitigation list.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsSfYxZo/kC1sYQLPJrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA4qzBdC53Vr8AAAAAElFTkSuQmCC)  
**12. Document Map**  
| | |  
|-|-|  
| **Doc** | **Purpose** |   
| 01_PRD.md | This document — product intent, personas, goals |   
| 02_FSD.md | Functional requirements, user flows, acceptance criteria |   
| 03_TDD.md | Technical design decisions and rationale |   
| 04_ARCHITECTURE.md | System architecture, diagrams |   
| 05_UI_UX.md | Full UI/UX specification |   
| 06_COMPONENTS.md | React component catalogue |   
| 07_AUDIO_ENGINE.md | Audio engine deep-dive |   
| 08_DATABASE.md | Local persistence schema |   
| 09_API.md | Future backend API design |   
| 10_PROJECT_STRUCTURE.md | Folder structure |   
| 11_IMPLEMENTATION_ROADMAP.md | Phased build plan |   
| 12_TESTING.md | Test strategy |   
| 13_RISK_ANALYSIS.md | Risks and mitigations |   
| 14_FUTURE_FEATURES.md | Post-v1 roadmap ideas |   
   
