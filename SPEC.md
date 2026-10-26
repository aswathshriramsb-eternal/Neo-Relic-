# SPECIFICATION — NEON RELIC: THE LAST SIGNAL

Complete baseline architectural, gameplay, audio, visual, accessibility, and reliability specification for the consolidated 3-level game.

---

## 1. Core Architecture & Tech Constraints

- **Engine:** Pure vanilla JavaScript, HTML5 Canvas 2D, and CSS3. Zero frameworks, game engines, build tools, or runtime dependencies.
- **Delivery:** Must run 100% offline by opening `index.html` directly via `file://` with plain `<script>` tags (no ES modules).
- **Code Organization:** Clean modular structure loaded in strict dependency order:
  1. `logic.js`: Pure mathematical and data functions (collision geometry, input normalization, score clamping, state transitions, save data sanitization, Mulberry32 PRNG, level fairness validation, balance analysis, headless bot simulation). Zero DOM or Canvas dependencies.
  2. `audio.js`: Procedural Web Audio API sound subsystem (4-voice polyphony limit, DynamicsCompressorNode, master gain, volume slider support, 60ms throttle, 150ms suspension delay, mute toggle, debug noaudio mode).
  3. `effects.js`: Time-based visual effects subsystem (particle pool capped at 80, floating text pool capped at 8, expanding ring pool capped at 4, hit flash vignette, live reduced-motion support, seeded RNG).
  4. `game.js`: Arena configuration, data-driven levels, state machine, physics, keyboard input hardening, focus management, error boundary, HUD write caching, and canvas rendering.

---

## 2. Arena Geometry & Scaling

- **Logical Resolution:** Fixed 960 x 600 pixels.
- **Viewport Scaling:** Responsive CSS flexbox container preserving 16:10 aspect ratio.
- **HiDPI Rendering:** Backing-store scaled by `window.devicePixelRatio` (capped at `2.0` to preserve performance on ultra-dense displays).

---

## 3. Levels & Data-Driven Progression

All level data is defined statically in `LEVELS`:

| Level | Sector Name | Fragments | Drones | Drone Speed | Patrol Patterns | Time Limit |
|---|---|---|---|---|---|---|
| **Level 1** | SECTOR 01: ENTRY GRID | 6 | 3 | 110 px/s | A (horizontal), B (vertical), C (rectangular loop) | 90 s |
| **Level 2** | SECTOR 02: TRANSIT HUB | 8 | 4 | 135 px/s | A (horiz x2), B (vert), C (rectangular loop) | 100 s |
| **Level 3** | SECTOR 03: CORE BREACH | 10 | 5 | 160 px/s | A (horiz), B (vert x2), C (rect loop), D (diagonal bounce) | 110 s |

### Level Fairness Guarantees (`validateLevels`)
- Minimum clearance from player spawn `(60, 60)` to any drone spawn or patrol line: $\ge 150\text{ px}$ (actual: 170 px).
- Fragment clearance from arena walls: $\ge 40\text{ px}$.
- Fragment clearance from player spawn and extraction portal: $\ge 80\text{ px}$.
- Risk/reward fragments near drone paths (< 60 px): Level 1 has 1 ($\le 2$); Level 2 has 2 ($\le 2$); Level 3 has 2 ($\le 3$).

---

## 4. Player Mechanics & Hardened Controls

- **Player Dimensions:** 28 x 28 pixels square.
- **Player Speed:** 220 px/s.
- **Start Position:** Top-left `(60, 60)`.
- **Directional Facing Cue:** Rendered physical perimeter notch indicating travel direction.
- **Input Normalization:** Diagonal velocity normalized to length 1.0 ($220 / \sqrt{2} \approx 155.56\text{ px/s}$).
- **Opposite Key Cancellation:** Simultaneous opposing inputs (A+D, W+S) produce 0 movement.
- **Key Code Compatibility:** Uses `event.code` for international layout support (QWERTY, AZERTY, Dvorak).
- **Shortcut Preservation:** All game shortcuts are ignored when `Ctrl`, `Meta`, or `Alt` is held, preserving browser shortcuts (e.g., `Ctrl+R` to reload).
- **Double-Fire Prevention:** Space and Enter ignore game actions when an HTML `<button>` is actively focused.
- **State Transition Key Clear:** Held keys are cleared via `clearKeys()` on blur, visibilitychange, and level load, preventing stuck movement or $dt$ frame spikes.

---

## 5. Drones & Collision Physics

- **Visual Radius:** 14 pixels.
- **Collision Hitbox:** Forgiving 80% circle radius ($14 \times 0.8 = 11.2\text{ px}$).
- **Collision Math:** Exact `circleRect` collision detection testing distance to closest clamped rectangle point.
- **Patrol Patterns:**
  - Pattern A: Horizontal linear ping-pong between arena margins.
  - Pattern B: Vertical linear ping-pong between arena margins.
  - Pattern C: Rectangular loop traversing 4 corners in clockwise fashion.
  - Pattern D: 45° diagonal reflection bouncing off defined bounding box.
- **Collision Penalty:** -50 points and -5 seconds from remaining mission time.
- **Invulnerability Cooldown:** 1.5 seconds. Player blinks at 3 Hz and displays a protective perimeter ring.
- **Contact Guard:** Exactly 1 penalty applied per contact event; 2nd penalty applied only after 1.5s cooldown expires.

---

## 6. Scoring Integrity & Extraction

- **Energy Fragment:** +100 points once per fragment (`fragment.collected = true`).
- **Sector Clear Bonus:** +250 points once per sector (`levelBonusAwarded = true` guard prevents repeated bonuses).
- **Score Clamping:** Score can never fall below 0 (`NeonLogic.clampScore`).
- **Zero Score Penalty:** Hits taken when score is 0 still deduct 5 seconds from the remaining timer.
- **Maximum Theoretical Score:**  
  $$\text{Fragments: } (6 + 8 + 10) \times 100 = 2,400$$  
  $$\text{Sector Bonuses: } 3 \times 250 = 750$$  
  $$\textbf{Total Max Score: } 2,400 + 750 = \mathbf{3,150}$$
- **Extraction Portal:** 70 x 70 px hexagon located at bottom-right `(870, 510)`.
- **Activation:** Unlocks immediately when all sector fragments are collected.
- **Progression:**
  - Sectors 1 & 2: Contact transitions to `LEVEL_COMPLETE` screen; score carries forward.
  - Sector 3: Contact transitions to `WON` (Final Victory) screen; score committed to high scores.
- **Same-Frame Precedence:** Reaching extraction takes precedence over timer expiration if both occur on the same frame update.

---

## 7. State Machine

- **States:** `START`, `PLAYING`, `PAUSED`, `LEVEL_COMPLETE`, `WON`, `LOST`, `ERROR`.
- **Valid Transitions:** Governed by `NeonLogic.canTransition(from, to)`:
  - `START` $\to$ `PLAYING`
  - `PLAYING` $\to$ `PAUSED`, `LEVEL_COMPLETE`, `WON`, `LOST`, `ERROR`
  - `PAUSED` $\to$ `PLAYING`, `START`
  - `LEVEL_COMPLETE` $\to$ `PLAYING`, `START`
  - `WON` $\to$ `START`
  - `LOST` $\to$ `START`
  - `ERROR` $\to$ `PLAYING`, `START`
- **Pause Behavior:** Freezes timer, drones, hit cooldown, and scoring. Web Audio suspends after 150ms delay.
- **Auto-Pause:** Triggered automatically on `window.blur` and `document.hidden`.
- **Restart (`R` / Button):** Works from any state, immediately starts clean run at Level 1, score 0, while keeping best score intact.

---

## 8. Persistence & LocalStorage Schema

- **Key:** `neonRelic.v1`
- **Schema v1 Structure:**
  ```json
  {
    "version": 1,
    "bestScore": 2400,
    "settings": {
      "muted": false,
      "volume": 0.5,
      "effects": "auto"
    }
  }
  ```
- **Robustness:**
  - Corrupt JSON strings reset safely to Schema v1 defaults without throwing.
  - Day 2 legacy saves (`{ bestScore, settings: { muted } }`) migrate automatically, preserving `bestScore`.
  - Disabled storage (private browsing / `SecurityError`) displays a non-intrusive warning on the title screen while the game runs safely in memory.

---

## 9. Audio Subsystem (Web Audio API)

- **Architecture:** Zero external audio files or downloads. Real-time procedural synthesis.
- **Signal Chain:** `Voice Oscillators -> Voice Gain -> Master Gain -> DynamicsCompressorNode -> Destination`.
- **Polyphony:** Maximum 4 concurrent active voices. Voice disconnects on `onended`.
- **Throttle:** $\ge 60\text{ ms}$ between consecutive plays of the same sound design.
- **Suspension Delay:** 150 ms delay on pause/blur to allow click sounds to finish playing.
- **Discrete Sound Designs:**
  - Fragment: Rising 2-note chime (880 Hz $\to$ 1320 Hz sine, 120 ms).
  - Hit: Descending sawtooth sweep (240 Hz $\to$ 60 Hz, 200 ms).
  - Extraction Online: Rising 3-note chime (523 Hz $\to$ 659 Hz $\to$ 784 Hz sine, 250 ms).
  - Level Complete: 4-note A-major fanfare (440 Hz $\to$ 554 Hz $\to$ 659 Hz $\to$ 880 Hz, 350 ms).
  - Final Victory: 6-note C-major victory arpeggio (523 Hz $\to$ 659 Hz $\to$ 784 Hz $\to$ 1046 Hz $\to$ 1318 Hz, 600 ms).
  - Defeat: Descending low-frequency sawtooth sweep (140 Hz $\to$ 40 Hz, 400 ms).
  - UI Click: Short sine blip (800 Hz, 40 ms).
- **Controls:** Master volume slider (0–100%, default 50%), Mute toggle button and `M` hotkey, `?debug&noaudio` flag.

---

## 10. Visual Effects & Object Pools

- **Fixed Object Pools:**
  - Particles: Pre-allocated pool capped at `MAX_PARTICLES = 80`.
  - Floating Texts: Pre-allocated pool capped at `MAX_TEXTS = 8`.
  - Expanding Rings: Pre-allocated pool capped at `MAX_RINGS = 4` with FIFO eviction.
- **Garbage Collection:** Zero object or array allocations during active frame loops.
- **Time-Based Physics:** All animations use clock/$dt$, never frame counters (`fpscap=30` matches 60 FPS speed).
- **Flash Safety:** No visual effect exceeds 3 Hz (hit vignette lasts 0.25s single pulse; glow pulses at 1.0–1.5 Hz).
- **Reduced Motion:** Live support via OS `prefers-reduced-motion` and Settings dropdown: disables particles, bobs, glow pulses, vignette flashes, and rotors while keeping static shapes.

---

## 11. Accessibility & Theming

- **WCAG 2.1 Contrast Compliance:**
  - White text (`#ffffff`): **19.81:1** (AAA)
  - Neon Cyan (`#00f5ff`): **14.63:1** (AAA)
  - Neon Lime (`#39ff14`): **14.61:1** (AAA)
  - Light Cyan (`#c0e0ff`): **14.48:1** (AAA)
  - Neon Gold (`#ffd700`): **14.13:1** (AAA)
  - Secondary Dim (`#809cb8`): **6.95:1** (AAA)
  - Drone Magenta (`#ff33cc`): **6.22:1** (AA Text, AAA UI)
  - Urgent Red (`#ff3333`): **5.45:1** (AA)
- **High-Contrast Focus Rings:** 3px bright cyan outline (`:focus-visible`).
- **Focus Trapping:** Background marked `inert` and `aria-hidden="true"` when overlays are open; focus shifts to primary button.
- **Screen Reader Announcer:** Live region (`#announcer`) with 400ms message joining, deduplication, and immediate bypass for critical milestone announcements.
- **Windows High Contrast Mode:** `@media (forced-colors: active)` overrides borders with `ButtonText`, hovers with `Highlight`/`HighlightText`, and focus with `Highlight`.

---

## 12. Robustness & Error Boundary

- **Global Handlers:** `window.onerror` and `window.addEventListener('unhandledrejection')`.
- **Render Loop Boundary:** Master `loop()` wrapped in `try / catch`.
- **Recovery:** On unhandled error, loop halts safely and displays `#screen-error` ("System Malfunction"). Clicking "RESTART MISSION" re-attaches error boundary, cleans state, and re-initializes loop with `stats.loopStarts === 1` without creating duplicate rAF chains.
- **Testing Flag:** `?debug&throwtest` simulates frame 2 exception to verify crash handling.
