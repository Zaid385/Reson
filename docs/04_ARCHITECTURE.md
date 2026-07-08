**04 — System Architecture**  
**1. Architectural Overview**  
Reson is a client-only single-page application composed of six strictly-separated layers. No layer may bypass its neighbor's public interface. This document defines those layers, their responsibilities, their boundaries, and the data/control flow between them.  
graph TB  
     subgraph "Presentation Layer"  
         UI[React Components]  
     end  
     subgraph "Binding Layer"  
         Hooks[Custom Hooks / Bindings]  
     end  
     subgraph "State Management Layer"  
         Store[Zustand Store - Domain Slices]  
     end  
     subgraph "Business Logic Layer"  
         Logic[Domain Services: Pad, Bank, Sample, Project]  
     end  
     subgraph "Audio Engine Layer"  
         Engine[Tone.js-based Audio Engine]  
     end  
     subgraph "Persistence Layer"  
         Persist[Dexie.js / IndexedDB]  
     end  
     subgraph "Utilities Layer"  
         Utils[Shared Utils: id-gen, math, format, validation]  
     end  
   
     UI --> Hooks  
     Hooks --> Store  
     Hooks --> Engine  
     Store --> Logic  
     Logic --> Engine  
     Logic --> Persist  
     Engine --> Utils  
     Logic --> Utils  
     Store --> Utils  
     UI --> Utils  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQ2AQBAAsSHhiQI0IWp9ngBsYIEfIWkVdJuZs5oAAPiLe6+O6vp6AgDAa+sBhYwEOqBD7p8AAAAASUVORK5CYII=)  
**2. Layer Responsibilities**  
**2.1 Presentation Layer (**/src/components **, **/src/features **)**  
- Pure React components: rendering, layout, animation, local ephemeral UI state (e.g., "is this dropdown open").  
- **Must not** call Dexie/IndexedDB directly.  
- **Must not** call Tone.js APIs directly.  
- Reads global state exclusively via selector hooks; triggers actions exclusively via action hooks/dispatchers.  
**2.2 Binding Layer (**/src/hooks **)**  
- Thin custom hooks (usePadTrigger, useActiveBank, useSampleUpload) that connect Presentation to State/Engine/Logic.  
- This is the ONLY layer permitted to call both Zustand actions AND Audio Engine imperative methods within the same function, since triggering a pad requires both (play sound + update "isPlaying" visual state).  
- Contains keyboard/pointer event listener registration (global listeners live here, e.g., useKeyboardController).  
**2.3 State Management Layer (**/src/state **)**  
- Zustand store, split into slices: padSlice, bankSlice, projectSlice, uiSlice, settingsSlice.  
- Holds the **serializable** application state (everything that gets persisted or drives rendering). Does NOT hold live AudioBuffer/AudioNode references (those live in the Engine layer, keyed by asset/pad ID).  
- Exposes selector hooks (e.g., usePad(bankId, padIndex)) optimized to avoid unnecessary re-renders.  
**2.4 Business Logic Layer / Domain Services (**/src/domain **)**  
- Framework-agnostic TypeScript classes/functions implementing rules that are NOT simple state setters: sample assignment workflow (decode → store asset → generate waveform peaks → update pad), project import/export (schema validation, merge logic), reference counting for shared assets, choke-group resolution (future), bank duplication logic.  
- Orchestrates calls to Persistence and Engine layers but contains no React and no direct DOM access.  
**2.5 Audio Engine Layer (**/src/audio-engine **)**  
- Wraps Tone.js. Owns all live AudioBuffer, Tone.Player/custom voice objects, the master bus, and the voice pool.  
- Exposes an imperative, framework-agnostic API (see 07_AUDIO_ENGINE.md for the full interface contract).  
- Never imports React or Zustand. Communicates outward via a small event emitter (for UI-relevant events like "voice started"/"voice ended", used by the binding layer to update transient UI, e.g., a playhead or level meter) rather than by reaching into the store.  
**2.6 Persistence Layer (**/src/persistence **)**  
- Dexie.js database definition, schema migrations, typed repositories (ProjectRepository, AssetRepository, PadRepository).  
- Only the Domain Services layer (and select bootstrap code) calls into this layer directly.  
**2.7 Utilities Layer (**/src/utils **)**  
- Pure, side-effect-free helper functions: ID generation, clamping/math helpers, dB↔linear gain conversion, time formatting, file validation, debounce/throttle. Importable from any layer, imports nothing from any other internal layer (leaf dependency).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OUQmAABBAsSdYxKYXx1gmEBOIFfwTYUuwZWa2ag8AgL841uquzq8nAAC8dj05WgYLQTzjnAAAAABJRU5ErkJggg==)  
**3. Module Boundary Enforcement**  
To keep the codebase coherent past 100k LOC, module boundaries are enforced with lint rules (e.g., eslint-plugin-boundaries or path-based import/no-restricted-paths), configured per this dependency direction rule:  
graph LR  
     Utils((Utilities)) --- Engine  
     Utils --- Persistence  
     Utils --- Domain  
     Utils --- State  
     Utils --- Hooks  
     Utils --- Components  
   
     Persistence --> Domain  
     Engine --> Domain  
     Domain --> State  
     State --> Hooks  
     Engine --> Hooks  
     Hooks --> Components  
   
**Rule of thumb:** dependencies only flow "outward" toward Components; Components never get imported by inner layers; Utilities depend on nothing internal; Engine and Persistence never import each other directly — both are orchestrated by Domain Services.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBACPykMH4NpGACyywEZJWQZeZ2aszAAD+4l6rrTo+jgAA8N71AL/CBEiG5xPoAAAAAElFTkSuQmCC)  
**4. High-Level Data Flow: Triggering a Pad**  
sequenceDiagram  
     participant Input as Keyboard/Mouse/Touch  
     participant Hook as useKeyboardController / usePointerController  
     participant Engine as AudioEngine  
     participant Store as Zustand Store  
     participant UI as Pad Component  
   
     Input->>Hook: keydown / pointerdown event  
     Hook->>Hook: Resolve event to padId (via active bank + key map)  
     Hook->>Engine: engine.triggerPad(padId, velocity, timestamp)  
     par Audio path (fast)  
         Engine->>Engine: Acquire voice, connect graph, schedule start()  
         Engine-->>Hook: emits 'voice:started' event  
     and Visual path (fast, parallel, not blocked by audio)  
         Hook->>Store: store.setPadTriggeredState(padId, true)  
         Store-->>UI: Re-render (selector-scoped to this pad only)  
     end  
     UI->>UI: Play trigger animation  
     Note over Engine,UI: Both paths originate from the same input event and run independently, so a slow audio decode never delays visual feedback (decode already happened at assignment time, not at trigger time).  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALUlEQVR4nO3OQQ0AIAwEsAMlSJ0UrOFkGngRklZBR1WtJDsAAPzizNcDAADuNcKwAyU+nb+5AAAAAElFTkSuQmCC)  
**5. High-Level Data Flow: Sample Assignment**  
sequenceDiagram  
     participant UI as Pad / Drop Zone  
     participant Domain as SampleAssignmentService  
     participant Engine as AudioEngine  
     participant DB as Persistence (Dexie)  
     participant Store as Zustand Store  
   
     UI->>Domain: assignSampleToPad(padId, file | builtInSampleId)  
     Domain->>Domain: validateFile(type, size)  
     alt invalid  
         Domain-->>UI: return ValidationError  
     else valid  
         Domain->>Engine: decodeAudioData(arrayBuffer)  
         Engine-->>Domain: AudioBuffer + duration  
         Domain->>Domain: generateWaveformPeaks(buffer)  
         Domain->>DB: AssetRepository.saveAsset(blob, peaks, metadata)  
         DB-->>Domain: assetId  
         Domain->>Engine: registerBuffer(assetId, AudioBuffer)  
         Domain->>Store: padSlice.assignSample(padId, assetId, defaultParams)  
         Store-->>UI: Re-render pad with new sample state  
         Domain->>DB: ProjectRepository.autosave(currentState) [debounced]  
     end  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsSfYxZo/jVEMYQLPJrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA4rLBc059ysnAAAAAElFTkSuQmCC)  
**6. Application State Shape (Conceptual)**  
erDiagram  
     PROJECT ||--o{ BANK : contains  
     BANK ||--o{ PAD : contains  
     PAD ||--o| ASSET_REF : references  
     PROJECT ||--|| MASTER_SETTINGS : has  
     PROJECT ||--|| UI_SETTINGS : has  
     ASSET_REF }o--|| ASSET : "points to (stored separately)"  
   
     PROJECT {  
         string id  
         string name  
         number schemaVersion  
         datetime updatedAt  
     }  
     BANK {  
         string id  
         string projectId  
         string name  
         number index  
     }  
     PAD {  
         string id  
         string bankId  
         number slotIndex  
         string assetId  
         string displayName  
         string color  
         float volume  
         float pan  
         float pitchSemitones  
         boolean reverse  
         float attackMs  
         float releaseMs  
         boolean mute  
         boolean solo  
         string playMode  
         float startMarker  
         float endMarker  
         boolean loop  
         float fadeInMs  
         float fadeOutMs  
         string chokeGroup  
     }  
     ASSET {  
         string id  
         string name  
         string sourceType  
         blob audioData  
         json waveformPeaks  
         number durationSeconds  
     }  
     MASTER_SETTINGS {  
         float masterVolume  
         boolean masterMute  
     }  
   
This conceptual model is normative for 08_DATABASE.md and the Zustand slice shapes in 06_COMPONENTS.md.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AUBBAsUeCE4yeIiT9CRVMWGAjJK2CbjNzVGcAAPzF2qu7Wl9PAAB47XoA/vcF8exqpY4AAAAASUVORK5CYII=)  
**7. Deployment Architecture (v1)**  
graph LR  
     Dev[Source Repo] -->|Vite build| Bundle[Static Bundle: HTML/JS/CSS/Assets]  
     Bundle --> CDN[Static Host / CDN]  
     CDN --> Browser[User's Browser]  
     Browser --> SW[Service Worker Cache]  
     Browser --> IDB[(IndexedDB - per-origin, per-device)]  
     SW -. caches app shell + built-in samples .-> Browser  
   
- No application server. No database server. No API in v1.  
- Deployable to any static host (Netlify/Vercel/Cloudflare Pages/S3+CloudFront/GitHub Pages) since the build output is fully static.  
- Per-user data (custom samples, kit configuration) never leaves the browser in v1 — it lives entirely in that browser's IndexedDB, which is why 09_API.md (future cloud sync) is speculative rather than load-bearing.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OsQ1AABRAwSdRaPXGMOCv7WkPK+hEcjfBLTNzVFcAAPzFvVZbdX49AQDgtf0BSpoDXv5TGXgAAAAASUVORK5CYII=)  
**8. Future Extension Points (Architected Now, Built Later)**  
These are NOT built in v1 but the architecture above must not preclude them without modification:  
| | |  
|-|-|  
| **Future Feature** | **Extension Point Reserved** |   
| MIDI input | New binding-layer hook useMidiController producing the same engine.triggerPad() calls as keyboard/mouse — no Engine changes needed |   
| Step Sequencer | New Domain Service + Zustand slice (sequencerSlice) driving Tone.Transport-scheduled calls into the existing Engine trigger API |   
| Effects Rack | Engine's per-pad signal chain already terminates in a per-pad Tone.Gain before summing to master; effects insert between pad output and master bus per pad or per send bus |   
| Audio Recording | New Engine subsystem tapping the master bus via Tone.Recorder/MediaRecorder, independent of playback path |   
| Cloud Sync | Domain Services' Persistence calls are already abstracted behind repository interfaces (ProjectRepository); a future RemoteProjectRepository can implement the same interface |   
| Stem Separation / AI tagging | New async Domain Service invoked at sample-assignment time, writing additional metadata fields to the ASSET record without schema-breaking changes (additive fields only) |   
   
Full detail on each is in 14_FUTURE_FEATURES.md.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBCkJfFEIwwIgHRiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AOHsBegrsOrIAAAAAElFTkSuQmCC)  
**9. Cross-Cutting Concerns**  
**9.1 Error Boundaries**  
A top-level React Error Boundary wraps the entire app; feature-level error boundaries wrap the Sample Editor and Pad Grid independently so a failure in one (e.g., a corrupt waveform render) does not crash the whole instrument.  
**9.2 Logging**  
A lightweight internal logger (/src/utils/logger.ts) provides leveled logging (debug/info/warn/error), no-op in production builds except for warn/error, which may optionally be wired to an error-reporting service later (not in v1 scope).  
**9.3 Feature Flags**  
A simple, static feature-flag module (/src/config/featureFlags.ts) gates in-progress future features (sequencer, MIDI, effects) so they can be merged incrementally behind flags without affecting the shipped v1 experience — directly supporting the phased roadmap in 11_IMPLEMENTATION_ROADMAP.md.  
