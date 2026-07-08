# 05 — UI/UX Specification

## 1. Design Philosophy

Groovepad's UI must read as **instrument, not dashboard** — a piece of tactile hardware, not a data-entry tool. Reference points: pocket-sized groovebox hardware ("Pocket Operator" aesthetic), professional studio gear, and tactile/skeuomorphic touch surfaces. The interface runs on a deep "Void" foundation (near-black base) so that OLED-ready neon accents pop at maximum luminosity, while pads simulate real travel and depth through soft ambient shadows and a pressed/unpressed state model. The result should transform the screen from a data-entry tool into something that feels "playable."

**Design pillars:**
1. Pads are the hero and behave like physical hardware surfaces — not flat UI tiles. Everything else is secondary in visual weight.
2. High tactility: every trigger has an immediate, "physical" visual response — travel, glow, and depth communicate feedback instantly.
3. Legible at a glance from a distance (stage/projector use case) and usable at arm's length on a phone.
4. No modal ever blocks the performance surface for longer than the user's active task.
5. Motion is fast (100–180ms) and purposeful — it simulates physical response, never decorative-only, never blocking input.

---

## 2. Visual Design System

### 2.1 Color Palette ("Void" Foundation — only theme in v1)

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0F0F0F` | App background ("Void" base) |
| `--bg-surface` | `#1A1A1A` | Containers, panels, sidebars |
| `--bg-surface-raised` | `#252525` | Floating panels, modals, pad "empty"/idle background |
| `--border-subtle` | `#333333` | Dividers, panel borders |
| `--text-primary` | `#E5E2E1` | Primary text (on-surface) |
| `--text-secondary` | `#A0A0A0` | Hardware-style labels, secondary text |
| `--text-disabled` | `#5A5A64` | Disabled/empty state text |
| `--accent-cyan` | `#00F0FF` | Primary accent — active bank indicator, primary buttons/knobs, focus rings, "Drums" pad category |
| `--accent-cyan-hover` | `#7DF4FF` | Hover state of the cyan accent |
| `--accent-lime` | `#C3F400` | "Loops" pad category; also doubles as the success/confirmation accent |
| `--accent-pink` | `#FF007A` | "One-shots" pad category; also the record/danger accent |
| `--accent-amber` | `#FFB020` | "FX" pad category; also the warning accent |
| `--accent-danger` | `#93000A` | Destructive-action backgrounds (error containers) |

Unlike a freely-assignable palette, pad color is **categorical**: the four accent hues (Cyan, Lime, Pink, Amber) map to the four sample types — Drums, Loops, One-shots, FX — so color instantly communicates *what kind* of sound a pad holds, not just *that* it's occupied.

**State logic:** active/triggered pads use the full-intensity category hex with an outer glow; inactive or empty pads use a ~10% opacity tint of the category color with a subtle stroke, over the `--bg-surface-raised` base.

### 2.2 Typography

| Token | Font | Weight | Size | Usage |
|---|---|---|---|---|
| `--font-family` | `Inter` (system-ui fallback) | — | — | Legibility & navigation text |
| `--font-mono` | `JetBrains Mono` (monospace fallback) | — | — | Technical data & hardware-style labels |
| Display | Inter | 700 | 48px, -0.02em tracking | Reserved for hero/splash moments (e.g. first-load logo treatment) |
| App Title (top bar) | Inter | 600 | 24px | Top bar branding |
| Panel Heading | JetBrains Mono | 700 | 11px, uppercase, +0.1em tracking | Hardware-style section headers (e.g. "SAMPLE BROWSER", "GATE") in `--text-secondary` |
| Body | Inter | 400 | 16px / 24px line-height | Standard UI text |
| Small / Caption | Inter | 400 | 12px | Tooltips, secondary labels |
| Pad Label / Sample Name | JetBrains Mono | 500 | 13px | Pad display name — monospaced so it never jitters as names change |
| Numeric Readout | JetBrains Mono | 500 | 13px | Parameter values, BPM, timers, dB, ms |

High-level navigation should stay visually quiet during performance; typographic focus is reserved for whatever parameter is currently being tweaked.

### 2.3 Spacing Scale

Base unit: `4px`. Named tokens: `pad-gap` (8px), `panel-padding` (20px), `grid-margin` (32px). Pad grid gutters use `pad-gap` (8px) uniformly — intentionally tight at every breakpoint to support fast multi-finger gestures and make the grid read as one cohesive instrument surface, rather than widening on desktop. A generous `grid-margin` (32px) surrounds the main grid as a safe zone to prevent accidental triggers of side-menu items during intense play.

### 2.4 Elevation / Depth

Depth is communicated through **tonal layering plus soft ambient shadows**, simulating physical hardware rather than flat material design:

- **Unpressed (raised) elements:** a 2px inner-highlight on the top edge plus a 4px soft drop shadow (`#000000` at 50% opacity) to create a "lifted off the chassis" effect. This applies to idle pads, buttons, and knobs.
- **Pressed (active) elements:** the drop shadow is removed and a subtle inner-shadow is applied instead, simulating the control being physically depressed into the chassis.
- **Glassmorphism:** floating side/bottom panels (Sample Browser, Parameter Panel, Sample Editor) use a 20px backdrop blur over a translucent `--bg-surface` fill, preserving a sense of verticality while keeping the performance grid visible in the background.
- **Modals:** a soft `rgba(0,0,0,0.6)` scrim sits behind them; buttons and inputs inside modals follow the same pressed/unpressed logic as the rest of the system.

### 2.5 Shapes / Corner Radius

The shape language favors "squircle"-style roundedness — softening the dark, industrial theme to feel approachable and touch-friendly:

- **Pads:** `16px` radius (`rounded-lg`) to maximize tactile feel.
- **Panels / Modals / Containers:** `24px` radius (`rounded-xl`).
- **Knobs, sliders, small buttons:** fully circular (`rounded-full`) where applicable, or a consistent `8px` radius for rectangular inputs.

### 2.6 Iconography

A single consistent icon set (line icons, 1.5px stroke) used throughout: waveform, upload, trash, lock (mute), star (solo), loop, reverse, scissors (trim), volume, pan, gear (settings).

---

## 3. Layout — Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP BAR: Logo | Project Name | [A][B][C][D] Bank Selector | Master Vol | Settings │
├───────────────┬─────────────────────────────────────┬───────────┤
│               │                                       │           │
│  SAMPLE       │           PAD GRID (4x8)              │  PARAM    │
│  BROWSER      │                                       │  PANEL    │
│  (collapsible │      [Pads render here,               │ (collapsible,
│   left panel) │       fill available space,           │  right)   │
│               │       maintain square-ish aspect]     │           │
│               │                                       │           │
├───────────────┴─────────────────────────────────────┴───────────┤
│ TRANSPORT / FOOTER: (future: sequencer transport) | Storage indicator │
└─────────────────────────────────────────────────────────────────┘
```

- **Top Bar** (height: 56px, fixed, `--bg-surface`): App branding (left), Bank Selector (center-left, always visible), Master Volume fader + mute (center-right), Settings gear icon (far right).
- **Left Panel — Sample Browser**: collapsible (default: open on desktop ≥1280px, collapsed on 1024–1279px), width 280px when open, rendered as a `--bg-surface` panel with `rounded-xl` corners. Contains: search input, built-in pack tabs, sample list (drag-source items), user-uploaded samples section.
- **Center — Pad Grid**: primary focus area, occupies the central portion of the screen (targeting ~70% of available real estate when both side panels are open), fills remaining horizontal space, pads maintain near-square aspect ratio via CSS grid `aspect-ratio: 1`, `pad-gap` (8px) grid gutters, `grid-margin` (32px) safe zone around the whole grid.
- **Right Panel — Parameter Panel**: collapsible, width 320px when open, appears when a pad is selected (single-click, not full editor); shows the FR-PARAM-001 controls, rendered with the glassmorphism treatment (§2.4). Auto-opens on pad selection if not manually pinned closed by the user; user preference persisted.
- **Footer/Transport bar**: height 40px; in v1 shows storage usage indicator and a "Save" status indicator (autosave state: saved/saving/error) in `mono-data` styling. Reserved space for future sequencer transport controls (play/stop/BPM) per `14_FUTURE_FEATURES.md` — when added, transport icons follow the oversized, high-contrast Transport Controls treatment (§10).

---

## 4. Layout — Mobile / Touch (<768px)

- Top Bar collapses to: hamburger/menu icon (opens Sample Browser as a full-height slide-over), Bank Selector (compact segmented control), Master Volume icon (opens a popover fader), Settings icon.
- Sample Browser and Parameter Panel are NOT persistent side panels on mobile — both become full-screen or bottom-sheet modals (glassmorphism treatment, §2.4) triggered explicitly, since screen real estate must prioritize the pad grid.
- Pad Grid: renders as an 8-column × 4-row grid scaled to fit viewport width, with `touch-action: none` to prevent scroll interference; grid may need horizontal micro-scroll disabled entirely (grid always fits width, pad size shrinks instead — never introduce grid scrolling, since that breaks live performance access to all pads). On the smallest devices the grid reflows to 4×8 (scrollable or paged) to keep individual pad hit-targets large enough to stay tactile.
- Minimum touch target: 44×44px (Apple HIG / WCAG minimum) — enforced even if that means the grid gutter shrinks toward zero on very small screens (min width 360px assumed per `FR-XCUT-001`).
- Bottom safe-area padding respected via `env(safe-area-inset-bottom)` for notched devices.

## 4.1 Layout — Tablet (768–1023px)
- Sample Browser and Parameter Panel both become slide-over drawers (not persistent), similar to mobile behavior but with larger touch targets and a 2-column sample browser list.
- Pad grid retains the full 4×8 layout at a larger pad size than mobile.

---

## 5. Pad Component — Detailed States & Interaction

### 5.1 Visual States

| State | Appearance |
|---|---|
| Empty | Dashed 1px `--border-subtle` outline, `--bg-surface-raised` (#252525) fill, centered "+" icon at 30% opacity, key label in top-left corner at `--text-disabled` |
| Loaded / Assigned (idle) | Solid 2px border in the pad's category color (Cyan/Lime/Pink/Amber), category color at ~10% opacity fill over `--bg-surface-raised`, pad name in `mono-data` bottom-left, key label top-left, faint low-res waveform thumbnail as a background watermark. Rendered with the "unpressed" treatment: 2px top inner-highlight + 4px soft drop shadow |
| Hover (desktop only) | Border brightens toward full category-color opacity; drop shadow intensifies slightly to suggest the pad lifting toward the cursor |
| Triggered / Playing | Instant flash to 100% category-color fill with an outer neon glow, plus a `0.95x` scale transform — visually "pressed into the chassis": the drop shadow is removed and replaced with a subtle inner-shadow. Decays back to the Loaded/idle appearance over 120–180ms (`ease-out`) |
| Held (Gate mode, still down) | Sustains the full Triggered fill, glow, and pressed inner-shadow for the duration of the hold; does not decay until release |
| Muted | Loaded appearance at 50% opacity with a small mute icon badge (top-right) |
| Soloed | Full-opacity Loaded appearance PLUS a persistent thin glow/ring in `--accent-amber` around the border |
| Selected (parameter panel open for this pad) | 2px `--accent-cyan` outline ring, persists until another pad is selected or the panel is closed |
| Error (decode failed) | Loaded appearance with a diagonal hazard-stripe overlay in `--accent-pink` at low opacity + small warning icon |
| Drag-over (valid file hover during drag-and-drop) | Border becomes solid 2px `--accent-cyan`, background lightens, "Drop to assign" micro-label (`mono-data`) appears |

### 5.2 Pad Content Layout (single pad, ~1:1 aspect, 16px squircle corners)
```
╭───────────────────╮
│ 1              [•]│  <- key label (top-left), mute/solo badge (top-right)
│                    │
│    ~~waveform~~    │  <- faint background watermark, drawn in category color
│                    │
│ Kick Deep       ▶  │  <- pad name (mono-data, bottom-left), play-mode icon (bottom-right)
╰───────────────────╯
```

### 5.3 Interaction Timing
- Trigger → flash start: **0ms perceived** (CSS class toggle applied in the same event-handler tick, before the audio scheduling promise resolves), simulating an instantaneous physical hit.
- Flash decay: 150ms ease-out back to the idle "unpressed" state (one-shot mode) or sustained "pressed" state until release (gate mode).
- Selection ring: 100ms fade-in.

---

## 6. Bank Selector

- A rounded-full segmented control with 4 labeled segments: `A` `B` `C` `D` (or custom bank names if set, truncated with tooltip for full name).
- Active bank: filled with `--accent-cyan` background, dark on-primary text for contrast against the neon fill.
- Inactive banks: transparent background, `--text-secondary` text, `--border-subtle` 1px divider between segments.
- Keyboard shortcut hint shown as a small `mono-data` subscript under each letter on desktop (`⌘1`, `⌘2`, etc.) — hidden on mobile.
- Switching banks animates the pad grid with a fast (120ms) crossfade/content-swap — never a full page reflow or spinner.

---

## 7. Sample Browser Panel

- **Header**: "SAMPLE BROWSER" set in `label-caps` styling (JetBrains Mono, uppercase, `--text-secondary`) + collapse chevron + search input (icon-prefixed).
- **Tabs**: "Built-In" / "My Samples" (user uploads) / "This Project" (samples currently used on any pad, for quick reuse).
- **List items**: each row shows a mini waveform thumbnail (drawn in the sample's category color), sample name, duration (mm:ss.ms via `mono-data`), and is `draggable="true"` for drag-to-pad assignment. Clicking (not dragging) a row previews the sample (plays once through a dedicated preview player, does not affect any pad).
- **Empty state** ("My Samples" with none uploaded yet): centered icon + "Drag audio files here or click to upload" + visible file-picker button.
- **Upload affordance**: a persistent "+ Upload" button at the panel footer opens the OS file picker (multi-select enabled).
- The panel itself is rendered as a translucent `--bg-surface` glass surface (§2.4) with a 1px `--border-subtle` edge, sliding in from the left and either pushing the grid slightly or overlaying it with the 20px backdrop blur.

---

## 8. Sample Editor (Modal / Full-Screen Panel)

### 8.1 Layout
Opens as a large centered modal (`rounded-xl`, 24px corners) on desktop (min 900×600px, max 1200×760px) or full-screen on mobile/tablet.

```
╭──────────────────────────────────────────────────────────────╮
│ [Pad Name — editable] [Pad Color swatch]              [✕ Close]│
├──────────────────────────────────────────────────────────────┤
│  [− Zoom Out] [Zoom Slider] [+ Zoom In]      [Fit to Window]  │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │        WAVEFORM DISPLAY (#0F0F0F background)                │ │
│ │   [fade-in handle] ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ [fade-out handle]        │ │
│ │  |start marker|                    |end marker|             │ │
│ └──────────────────────────────────────────────────────────┘ │
│ [▶ Preview]  [⟲ Reverse]  [∞ Loop]  [⇕ Normalize]             │
├──────────────────────────────────────────────────────────────┤
│  Pitch: ((●))  Gain: ((●))   <- Performance Knobs, ghost track,│
│                                  cyan-illuminated active arc   │
│  Fade In: [0ms  ▁]      Fade Out: [0ms  ▁]                   │
├──────────────────────────────────────────────────────────────┤
│                                        [Cancel]  [Save]       │
╰──────────────────────────────────────────────────────────────╯
```

### 8.2 Waveform Interaction Details
- The waveform panel background is `#0F0F0F`, with the waveform itself drawn in the sample's category color and a vertical white playhead line carrying a 1px glow.
- Start/end markers render as vertical draggable handles (12px hit-target width, visually a thin 2px line with a small grip icon at the top).
- Region between start/end markers is rendered at full opacity/brightness; outside regions are dimmed to ~35% opacity (`FR-EDIT-014`).
- Fade handles render as small draggable triangles at the top corners of the active region, with a diagonal line overlay showing the fade ramp visually across the waveform.
- Zoom: mouse wheel over waveform zooms centered on cursor position; pinch gesture on touch; explicit +/- buttons and a zoom-level slider for precision; "Fit to Window" resets zoom to show the full sample.
- Playhead position updates via `requestAnimationFrame`, reading current playback position from the Audio Engine.
- Clicking anywhere within the waveform area (not on a marker) seeks the preview playhead to that position and, if this is a mousedown-drag, allows scrubbing.

### 8.3 Numeric Precision Inputs
Pitch and Gain are presented as large circular **Performance Knobs** (§9) with a "ghost" background track and a cyan-illuminated active arc, each with a monospaced (`mono-data`) numeric label centered below for precise entry — since knob-only precision is insufficient for professional sound design. Numeric labels accept keyboard arrow-up/down for fine increments (Shift+Arrow for coarse). Fade In/Out retain compact slider treatments with adjacent numeric fields.

### 8.4 Modal Behavior
- Opening: fade + slight scale-up (200ms), scrim fades in behind (`rgba(0,0,0,0.6)`).
- Closing with unsaved changes: confirmation dialog ("Discard changes?" / "Keep Editing" / "Discard").
- Closing without changes: instant close, no confirmation.
- Focus trap active while modal is open (accessibility); `Escape` key closes (triggering the same unsaved-changes check).

---

## 9. Parameter Panel (Lightweight, Non-Modal)

Appears as a right-side drawer (desktop) or bottom-sheet/modal (mobile) when a pad is single-clicked/selected, rendered with the glassmorphism treatment (translucent `--bg-surface`, 20px backdrop blur) so the grid stays visible behind it. Distinct from the full Sample Editor (opened via double-click or explicit "Edit" action).

**Contents, top to bottom:**
1. Pad name (inline-editable text field, `mono-data`) + color swatch showing the pad's category color (click opens the 4-category picker popover — Drums/Loops/One-shots/FX).
2. Waveform thumbnail (drawn in category color, static, small, click opens full Sample Editor).
3. Volume — a Performance Knob (large circular control, ghost track, cyan-illuminated active portion), dB-labeled per `07_AUDIO_ENGINE.md`.
4. Pan — a Performance Knob (centered default, -100%/+100% labels, L/R indicator).
5. Pitch — a Performance Knob (semitones, -24 to +24).
6. Play Mode toggle (segmented: One-Shot | Gate), rounded-full pill.
7. Mute / Solo toggle buttons (icon buttons; active state = filled category-color background with pressed inner-shadow).
8. Attack / Release mini-sliders (collapsed under an "Envelope" disclosure by default to reduce visual noise for casual users — `FR-PARAM-005`).
9. "Open Full Editor" button (navigates to §8).
10. "Remove Sample" destructive text button in `--accent-pink` at the bottom, requires confirmation.

Every knob uses a monospaced label centered below it, per the Performance Knob component spec.

---

## 10. Master Controls (Top Bar) & Transport

- Master Volume: rendered as a horizontal Performance Knob-style fader, 120px wide, ghost track with cyan-illuminated fill, numeric dB readout (`mono-data`) on hover/focus, mute toggle button immediately adjacent (icon changes between speaker/muted-speaker).
- Output level meter (`FR-MASTER-003`, P1): thin horizontal bar beneath/beside the fader, segmented (Lime → Amber → Pink zones), updates via `requestAnimationFrame` reading an `AnalyserNode`.
- Settings gear icon opens the Settings panel as a modal (desktop) or full-screen (mobile).
- When sequencer Transport Controls (Play/Record/Stop) ship (`14_FUTURE_FEATURES.md`), they follow the oversized-icon treatment in the top-right of the bar; the Record button pulses with a soft `--accent-pink` glow while active.

---

## 11. Onboarding Overlay

- First-visit only (`FR-ONBOARD-001`): a sequence of 2–3 lightweight spotlighted tooltips (glass-panel treatment, not a full-screen takeover) pointing at: (1) the pad grid with the text "Press a key or tap a pad to play", (2) the bank selector "Switch banks for more sounds", (3) the sample browser toggle "Drag your own sounds in here".
- Each tooltip has a "Next"/"Got it" (cyan accent button) and a "Skip" affordance. Dismissed permanently after completion or skip, stored in a lightweight local flag (not full project data) so it doesn't reappear even if the user later clears their project.

---

## 12. Notifications / Toasts

- Positioned top-right (desktop) / top-center (mobile), stacking, auto-dismiss after 4s (except errors, which persist until dismissed or 8s).
- Types: Success (`--accent-lime` left-border accent), Warning (`--accent-amber`), Error (`--accent-pink`), Info (`--accent-cyan`).
- Rendered as small glass panels (`rounded-xl`, translucent `--bg-surface`, 20px backdrop blur) consistent with the rest of the floating-panel system.
- Used for: sample upload success/failure, storage quota warnings, autosave failure, import/export completion.

---

## 13. Animation & Motion Principles

| Interaction | Duration | Easing |
|---|---|---|
| Pad trigger flash (press) | 120–180ms | ease-out |
| Pad selection ring | 100ms | ease-in-out |
| Bank switch content swap | 120ms | ease-in-out |
| Panel open/close (slide) | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Modal open/close (fade+scale) | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Toast enter/exit | 150ms | ease-out |
| Hover states | 100ms | ease |

**Rule:** No animation may delay the audio-triggering code path. Animations are applied via CSS class toggles that run independently of (and never `await`) any audio scheduling logic — enforced structurally per `04_ARCHITECTURE.md`'s parallel audio/visual paths. Motion should always read as a physical response (travel, press, release) rather than a purely decorative flourish.

---

## 14. Keyboard Shortcuts (Full Reference)

| Shortcut | Action |
|---|---|
| `1-8, Q-I, A-K, Z-,` | Trigger mapped pad (see `02_FSD.md` §5) |
| `Ctrl/Cmd + 1/2/3/4` | Switch to Bank A/B/C/D |
| `Ctrl/Cmd + S` | Manual save (in addition to autosave) |
| `Ctrl/Cmd + Z` | Undo last pad parameter change (if undo stack implemented — P2) |
| `Space` (editor open) | Play/pause preview |
| `Escape` | Close current modal/panel |
| `M` (pad selected) | Toggle mute on selected pad |
| `S` (pad selected) | Toggle solo on selected pad |
| `Delete/Backspace` (pad selected) | Remove sample from selected pad (with confirmation) |
| `?` | Open keyboard shortcuts help overlay |

Modifier keys (`Shift`, `Ctrl/Cmd`, `Alt`) are never mapped to raw pad triggers, satisfying `FR-KEY-004`.

---

## 15. Accessibility

### 15.1 Baseline (Applies Everywhere Except the Live Pad-Trigger Surface)
- All buttons, inputs, sliders, and toggles have accessible names (`aria-label` or associated `<label>`).
- Color is never the sole indicator of state (icons/text accompany mute/solo/error states, alongside category color).
- Focus states are visible (2px `--accent-cyan` outline) on all focusable elements.
- Modals implement focus trapping and `aria-modal="true"`.
- Minimum contrast ratio 4.5:1 for body text against its background, verified against the palette in §2.1.

### 15.2 Documented Exception: The Pad Grid
The 32-pad performance grid is a **real-time musical instrument surface**, analogous to a piano keyboard — a genuinely accessible substitute experience is provided by full keyboard operability (every pad is reachable and triggerable via its mapped key, satisfying motor-accessibility for keyboard users) and screen-reader users are provided an alternative "List View" mode (toggle in Settings) that presents pads as a navigable, describable list with standard button semantics for assignment/editing (not live performance, but full configuration access). Real-time low-latency triggering via assistive tech (e.g., switch devices) is a documented future consideration in `14_FUTURE_FEATURES.md`, not a v1 blocker, since the primary interaction (physical keyboard keydown) is itself already a standard assistive-technology-compatible input method.

### 15.3 Reduced Motion
Respect `prefers-reduced-motion: reduce` — pad trigger feedback falls back to an instant color-state change (no scale/glow-pulse animation) while remaining perceptible.

---

## 16. Responsive Breakpoints Summary

| Breakpoint | Width | Layout Behavior |
|---|---|---|
| Mobile | 360–767px | Single-column, panels as full-screen/bottom-sheet overlays |
| Tablet | 768–1023px | Pad grid full-size, panels as slide-over drawers |
| Desktop | 1024–1279px | Side panels available but default-collapsed |
| Desktop Large | ≥1280px | Side panels default-open, 3-column layout as shown in §3 |

---

## 17. Empty / Loading / Error States Summary

| Context | State | Treatment |
|---|---|---|
| App first load (assets loading) | Loading | Minimal centered logo mark with a subtle pulse animation; must resolve to interactive grid within budget (`03_TDD.md` §5) |
| Bank with no samples | Empty | All 32 pads render the dashed-outline empty state (§5.1); subtle CTA banner "Load a sample pack to get started" linking to Sample Browser |
| Sample Browser, no user uploads | Empty | Centered upload icon + drag/drop instructional copy |
| Sample decode failure | Error | Pad error state (§5.1, pink hazard-stripe overlay) + toast notification naming the file |
| Storage quota exceeded | Error | Persistent (non-auto-dismiss) toast + Settings panel storage section highlighted |
| Offline (no network) | Informational only | Small unobtrusive badge in top bar ("Offline — all features available locally"); app remains fully functional |
