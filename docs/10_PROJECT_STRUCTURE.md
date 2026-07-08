**10 — Project Structure**  
**1. Purpose**  
This document defines the complete repository folder structure. It is the authoritative layout the implementing agent must follow so that the architectural boundaries in 04_ARCHITECTURE.md are enforced at the filesystem level, not just conceptually.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCj7fFwtCmJHAjAU2QtIq6DIzW7UHAMBfnGt1V8fHEQAA3rsexOkF3va0dq8AAAAASUVORK5CYII=)  
**2. Top-Level Structure**  
Reson/  
 ├── public/  
 │   ├── samples/  
 │   │   ├── manifest.json  
 │   │   ├── acoustic-kit/  
 │   │   └── electronic-kit/  
 │   ├── favicon.svg  
 │   └── fonts/  
 ├── src/  
 │   ├── app/  
 │   ├── components/  
 │   ├── features/  
 │   ├── hooks/  
 │   ├── state/  
 │   ├── domain/  
 │   ├── audio-engine/  
 │   ├── persistence/  
 │   ├── utils/  
 │   ├── types/  
 │   ├── config/  
 │   ├── styles/  
 │   └── main.tsx  
 ├── tests/  
 │   ├── unit/  
 │   ├── integration/  
 │   └── e2e/  
 ├── .eslintrc.cjs  
 ├── .prettierrc  
 ├── tailwind.config.ts  
 ├── tsconfig.json  
 ├── vite.config.ts  
 ├── package.json  
 └── README.md  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBACPq8MH2NpGACyywEZJWQZeZ2aszAAD+4l6rrTq+ngAA8Nr1AL/KBEe6dElaAAAAAElFTkSuQmCC)  
**3. **public/ ** — Static Assets**  
| | |  
|-|-|  
| **Path** | **Contents** |   
| public/samples/manifest.json | Built-in sample pack catalogue: pack names, sample list per pack, file paths, durations, pre-computed low/high-res waveform peaks (avoids client-side analysis on first load) |   
| public/samples/<pack-name>/*.wav | Built-in sample audio files, organized one folder per pack |   
| public/favicon.svg, public/fonts/ | Branding & self-hosted fonts (avoids external font CDN dependency for offline support) |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSPBCj5fFgpQwYwEZiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AMTRBeEgNK9YAAAAAElFTkSuQmCC)  
**4. **src/app/ ** — Application Shell & Bootstrap**  
src/app/  
 ├── App.tsx                 # Root component (04_ARCHITECTURE.md §2.1/2.3 "App")  
 ├── AppShell.tsx  
 ├── AppProviders.tsx         # Wraps error boundaries, any context providers  
 ├── router.tsx                # Reserved; v1 is single-route, present for future multi-project routes  
 └── ErrorBoundary.tsx  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsSdYxKa/i8WMIR7ECt5E2BJsmZmt2gMA4C+Otbqr8+sJAACvXQ85PAYartXEogAAAABJRU5ErkJggg==)  
**5. **src/components/ ** — Shared/Generic UI Components**  
Reusable, feature-agnostic primitives, used across multiple features.  
src/components/  
 ├── controls/  
 │   ├── SliderControl.tsx  
 │   ├── KnobControl.tsx  
 │   ├── PlayModeToggle.tsx  
 │   ├── ColorPickerPopover.tsx  
 │   └── NumericParamInput.tsx  
 ├── overlays/  
 │   ├── ModalRoot.tsx  
 │   ├── ConfirmDialog.tsx  
 │   ├── Toast.tsx  
 │   └── ToastContainer.tsx  
 ├── layout/  
 │   ├── Panel.tsx              # Generic collapsible panel wrapper (used by SampleBrowser, ParameterPanel)  
 │   └── ResponsiveDrawer.tsx   # Adapts between side-panel / drawer / bottom-sheet per breakpoint  
 └── icons/  
     └── (SVG icon components)  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/h5VMYARvRrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA224BcUMk6pDAAAAAElFTkSuQmCC)  
**6. **src/features/ ** — Feature-Scoped Components**  
Each feature folder contains components specific to that feature only; nothing here is imported outside its own feature except via its index.ts public export surface.  
src/features/  
 ├── pad-grid/  
 │   ├── PadGrid.tsx  
 │   ├── Pad.tsx  
 │   ├── PadWaveformThumbnail.tsx  
 │   ├── PadBadge.tsx  
 │   ├── PadContextMenu.tsx  
 │   └── index.ts  
 ├── bank-selector/  
 │   ├── BankSelector.tsx  
 │   └── index.ts  
 ├── sample-browser/  
 │   ├── SampleBrowserPanel.tsx  
 │   ├── SampleBrowserSearch.tsx  
 │   ├── SampleBrowserTabs.tsx  
 │   ├── SampleListItem.tsx  
 │   ├── UploadDropzone.tsx  
 │   └── index.ts  
 ├── parameter-panel/  
 │   ├── ParameterPanel.tsx  
 │   ├── EnvelopeDisclosure.tsx  
 │   ├── PadNameInput.tsx  
 │   └── index.ts  
 ├── sample-editor/  
 │   ├── SampleEditorModal.tsx  
 │   ├── WaveformCanvas.tsx  
 │   ├── WaveformMarker.tsx  
 │   ├── ZoomControls.tsx  
 │   ├── EditorTransportControls.tsx  
 │   └── index.ts  
 ├── top-bar/  
 │   ├── TopBar.tsx  
 │   ├── MasterVolumeControl.tsx  
 │   ├── SettingsButton.tsx  
 │   └── index.ts  
 ├── settings/  
 │   ├── SettingsModal.tsx  
 │   ├── StorageUsageSection.tsx  
 │   └── index.ts  
 ├── onboarding/  
 │   ├── OnboardingOverlay.tsx  
 │   └── index.ts  
 └── footer/  
     ├── FooterBar.tsx  
     ├── StorageIndicator.tsx  
     ├── SaveStatusIndicator.tsx  
     └── index.ts  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OYQ1AABSAwc8mi5wvkwZyCKCAACr4Z7a7BLfMzFYdAQDwF+da3dX+9QQAgNeuB6feBdUJcyS2AAAAAElFTkSuQmCC)  
**7. **src/hooks/ ** — Binding Layer**  
src/hooks/  
 ├── useKeyboardController.ts  
 ├── usePointerRollController.ts  
 ├── usePadTrigger.ts  
 ├── useAudioEngineBinding.ts  
 ├── useSampleUpload.ts  
 ├── useBreakpoint.ts  
 ├── useAutosave.ts  
 └── useMidiController.ts        # stub/reserved, feature-flagged off, per 14_FUTURE_FEATURES.md  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsSdYxKa/jL0MIR7FCt5E2BJsmZmt2gMA4C+Otbqr8+sJAACvXQ85SAYUQNBTfQAAAABJRU5ErkJggg==)  
**8. **src/state/ ** — Zustand Store & Slices**  
src/state/  
 ├── store.ts                    # Combines slices into the root store, persist middleware config  
 ├── slices/  
 │   ├── padSlice.ts  
 │   ├── bankSlice.ts  
 │   ├── projectSlice.ts  
 │   ├── uiSlice.ts               # modal state, selected pad, panel open/closed, toasts  
 │   ├── engineUiSlice.ts         # ephemeral, high-frequency trigger-flash state (kept separate for perf, 06_COMPONENTS.md §5.2)  
 │   └── settingsSlice.ts  
 └── selectors/  
     ├── padSelectors.ts          # e.g., usePad(bankId, slotIndex) scoped selector hook  
     └── bankSelectors.ts  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNhwgJuUPYDMpnRgQU2QtIq6DIze3UGAMBf3Gu1VcfXEwAAXrseaHEEM+cJoFcAAAAASUVORK5CYII=)  
**9. **src/domain/ ** — Business Logic / Domain Services**  
src/domain/  
 ├── sample-assignment/  
 │   ├── SampleAssignmentService.ts   # validateFile, decode, generatePeaks, saveAsset, assign  
 │   └── fileValidation.ts  
 ├── project/  
 │   ├── ProjectBootstrapService.ts    # first-load default kit logic, session restore  
 │   ├── ProjectExportService.ts  
 │   └── ProjectImportService.ts  
 ├── bank/  
 │   └── BankDuplicationService.ts  
 └── pad/  
     └── PadParameterService.ts        # normalize/clamp param values, apply defaults  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSPBCj5fFgpQwYwEZiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AMTRBeEgNK9YAAAAAElFTkSuQmCC)  
**10. **src/audio-engine/ ** — Audio Engine**  
src/audio-engine/  
 ├── AudioEngine.ts               # Public API implementation (07_AUDIO_ENGINE.md §6)  
 ├── VoiceManager.ts               # Voice pool, allocation, stealing policy  
 ├── Voice.ts                       # Single voice node-chain wrapper  
 ├── PadBus.ts                      # Persistent per-pad Pan/Volume chain  
 ├── MasterBus.ts                    # Master volume/mute/(future limiter/effects)  
 ├── PreviewPlayer.ts                 # Sample Editor preview subsystem (07_AUDIO_ENGINE.md §9)  
 ├── BufferRegistry.ts                 # registerBuffer/unregisterBuffer, reversed-buffer cache  
 ├── SoloMuteResolver.ts                # Pure function: pad list -> effectiveAudible map  
 ├── engineEvents.ts                     # 'voice:started' / 'voice:ended' emitter  
 └── types.ts                              # PadPlaybackParams, VoiceHandle, etc.  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OYQ1AABSAwY8JoIGqr4Z6Eoiggn9mu0twy8wc1RkAAH9xbdVa7V9PAAB47X4A9C4EIsmYmgsAAAAASUVORK5CYII=)  
**11. **src/persistence/ ** — Dexie / IndexedDB**  
src/persistence/  
 ├── db.ts                        # Dexie database definition, table schemas  
 ├── migrations.ts                 # Versioned migration functions  
 ├── repositories/  
 │   ├── ProjectRepository.ts  
 │   ├── AssetRepository.ts  
 │   ├── PadRepository.ts  
 │   └── BankRepository.ts  
 └── builtInSampleManifest.ts       # Loader for /public/samples/manifest.json  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSd4NIGhrOTvaQBrWMGbCFuCLTOzV2cAAPzFvVZbdXw9AQDgtesBhYQEO+64Y8AAAAAASUVORK5CYII=)  
**12. **src/utils/ ** — Leaf Utilities**  
src/utils/  
 ├── id.ts                # UUID generation  
 ├── math.ts               # clamp, lerp, dB<->linear conversion  
 ├── format.ts              # time formatting (mm:ss.ms), dB display formatting  
 ├── debounce.ts  
 ├── fileValidation.ts (shared primitives; domain-specific rules live in domain/)  
 ├── colorPalette.ts        # 12 pad color presets  
 └── logger.ts  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSPBCj5fFyM6mJHAjAU2QtIq6DIzW7UHAMBfnGt1V8fXEwAAXrsexOEF35f1aEgAAAAASUVORK5CYII=)  
**13. **src/types/ ** — Shared TypeScript Types**  
src/types/  
 ├── pad.ts        # PadRecord, PadEditableParams  
 ├── bank.ts  
 ├── project.ts  
 ├── asset.ts  
 ├── settings.ts  
 └── index.ts  
   
Types here are the single source of truth referenced by state/, domain/, persistence/, and audio-engine/ — no layer redefines its own shadow copy of these shapes.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAM0lEQVR4nO3OMQ0AIAwAwZJQH0itErzhhAUDTITkbvrxW1WNiJgBAMAvVj+RTzcAALiRG9/sAy8mhuIVAAAAAElFTkSuQmCC)  
**14. **src/config/  
src/config/  
 ├── keyMap.ts             # The 32-key -> pad slot index mapping (FR-KEY-001)  
 ├── constants.ts           # MAX_VOICES, MAX_VOICES_PER_PAD, autosave debounce ms, file size limits  
 └── featureFlags.ts         # Sequencer/MIDI/Effects flags (04_ARCHITECTURE.md §9.3)  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OsQ1AABRAwSdRaPXGMOCv7WkPK+hEcjfBLTNzVFcAAPzFvVZbdX49AQDgtf0BSpoDXv5TGXgAAAAASUVORK5CYII=)  
**15. **src/styles/  
src/styles/  
 ├── globals.css            # Tailwind directives, CSS variable definitions (design tokens, 05_UI_UX.md §2)  
 └── animations.css          # Keyframes for pad trigger pulse, modal transitions, etc.  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBACPq8MH2NpGACyywEZJWQZeZ2aszAAD+4l6rrTq+ngAA8Nr1AL/KBEe6dElaAAAAAElFTkSuQmCC)  
**16. **tests/  
tests/  
 ├── unit/  
 │   ├── audio-engine/        # VoiceManager, SoloMuteResolver, BufferRegistry pure-logic tests  
 │   ├── domain/               # SampleAssignmentService, ProjectExportService tests  
 │   └── state/                  # Zustand slice reducer/action tests  
 ├── integration/  
 │   ├── pad-trigger-flow.test.tsx  
 │   ├── sample-assignment-flow.test.tsx  
 │   └── sample-editor-flow.test.tsx  
 └── e2e/  
     ├── keyboard-performance.spec.ts  
     ├── touch-multitouch.spec.ts  
     ├── persistence-across-reload.spec.ts  
     └── offline-mode.spec.ts  
   
Full testing strategy detail is in 12_TESTING.md.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSNBCUpfDq4wwIAABiywEZJWQZeZ2ao9AAD+4liruzq/ngAA8Nr1ABweBgdur/QFAAAAAElFTkSuQmCC)  
**17. Root Configuration Files**  
| | |  
|-|-|  
| **File** | **Purpose** |   
| vite.config.ts | Vite build config, PWA plugin (vite-plugin-pwa) setup, path aliases (@components, @hooks, @state, @domain, @audio-engine, @persistence, @utils, @types, @config) |   
| tailwind.config.ts | Design token mapping (colors, spacing, radii, fonts from 05_UI_UX.md) |   
| tsconfig.json | strict: true, path alias mirrors of Vite config |   
| .eslintrc.cjs | Includes import/no-restricted-paths (or eslint-plugin-boundaries) rules enforcing 04_ARCHITECTURE.md §3 dependency direction |   
| .prettierrc | Formatting rules |   
| package.json | Scripts: dev, build, preview, test, test:e2e, lint, typecheck |   
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQmAABRAsSd40A5GMORPYEt7WMGbCFuCLTNzVFcAAPzFvVZbdX49AQDgtf0BSrIDUgOg4eAAAAAASUVORK5CYII=)  
**18. Path Alias Convention**  
All cross-folder imports use aliases, never deep relative paths (../../../../), to keep the boundary rules in §17 enforceable and refactors safe:  
// tsconfig.json / vite.config.ts paths  
 "@components/*": ["src/components/*"]  
 "@features/*": ["src/features/*"]  
 "@hooks/*": ["src/hooks/*"]  
 "@state/*": ["src/state/*"]  
 "@domain/*": ["src/domain/*"]  
 "@audio-engine/*": ["src/audio-engine/*"]  
 "@persistence/*": ["src/persistence/*"]  
 "@utils/*": ["src/utils/*"]  
 "@types/*": ["src/types/*"]  
 "@config/*": ["src/config/*"]  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OYQ1AABSAwc8mi5wvkwZyCKCAACr4Z7a7BLfMzFYdAQDwF+da3dX+9QQAgNeuB6feBdUJcyS2AAAAAElFTkSuQmCC)  
**19. Scaling Rationale (100k+ LOC)**  
This structure scales because:  
1. **Feature folders are self-contained** — adding the future Sequencer feature means adding src/features/sequencer/ + src/state/slices/sequencerSlice.ts + src/audio-engine/SequencerClock.ts without touching existing folders.  
2. **Domain services are the only place business rules live** — preventing rule duplication/drift across components as the app grows.  
3. **Lint-enforced boundaries** prevent "shortcut" imports that would otherwise organically erode the layering as the codebase and contributor count grow.  
4. **Shared types in one location** prevent the classic large-codebase failure mode of divergent, slightly-incompatible shape definitions across layers.  
