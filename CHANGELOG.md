# CHANGELOG — NEON RELIC: THE LAST SIGNAL

All notable changes, architectural milestones, and feature additions across build days.

---

## [v7.0.0] - Master Meta-Verified Upgrade: Clean Multi-Screen Architecture, Authoritative Difficulty System & Dedicated Settings

### Added
- **Clean Multi-Screen Architecture (Phases 2 & 3):**
  - Completely de-cluttered single-screen interface into modular, dedicated screens in `#overlay`:
    1. **Main Menu (`#screen-start`):** Official game title, subtitle, lore description, dynamic taglines ("Survive the Neon. Discover the Unknown. The Relic Awaits."), best score display, and uncluttered navigation stack.
    2. **Difficulty Selection (`#screen-difficulty`):** 3-column interactive challenge cards (`BASIC`, `MEDIUM`, `HARD`), 10-sector deployment selector pills (`01`–`10`), dynamic `#sector-info-card`, and `DEPLOY TO SECTOR` mission launcher.
    3. **Dedicated Settings (`#screen-settings`):** Accessible from both Main Menu and Pause Menu with categorized preferences:
       - *Audio Controls:* Master Volume slider, Music Volume slider, SFX Volume slider, and Sound Output toggle button.
       - *Visuals & Motion:* Motion/Effects mode (`auto`, `full`, `reduced`), Screen Shake toggle, CRT Scanlines toggle, and Fullscreen toggle.
       - *Data Management:* Reset best score and Restore Defaults.
    4. **Tactical Directives & Controls (`#screen-controls`):** Field manual table displaying all keyboard, mouse, and mobile touch mappings.
    5. **Quit Confirmation (`#screen-quit`):** Confirmation dialog preventing accidental abandonment of active mission sessions.
    6. **Pause Menu (`#screen-paused`):** Halts simulation, displays active difficulty profile, and offers `RESUME`, `RESTART LEVEL`, `SETTINGS`, `MAIN MENU`, and `FULLSCREEN`.
    7. **Level Complete (`#screen-level-complete`):** Sector cleared briefing, bonus telemetry, and next sector progression.
    8. **Mission Accomplished (`#screen-won`):** Full 10-sector victory celebration, final score, record indicator, and replay options.
    9. **Game Over (`#screen-lost`):** Mission termination summary, sector reached, final score, try again, and main menu navigation.
    10. **System Malfunction (`#screen-error`):** Graceful recovery screen caught by error boundary with single-click restart.
- **Authoritative Difficulty System (Phases 4 & 5):**
  - **BASIC:** +25% generous mission timer, -20% drone patrol speed, reduced -25 pts / -3s collision penalty.
  - **MEDIUM (NORMAL):** Standard calibrated countdown timers, standard drone velocities, balanced -50 pts / -5s penalty.
  - **HARD:** -15% tight countdown timers, +15% rapid drone pursuit, harsh -75 pts / -6s collision penalty.
  - Locked difficulty persistence across all 10 sectors of an active run; displayed in real-time on HUD (`#hud-diff`) and Pause menu (`#pause-diff-badge`).
- **Verified Navigation State Flows (Phase 13):**
  - Main Menu $\to$ Start Game $\to$ Difficulty Selection $\to$ Gameplay.
  - Main Menu $\to$ Settings $\to$ Main Menu.
  - Gameplay $\to$ Pause $\to$ Resume $\to$ Gameplay.
  - Gameplay $\to$ Pause $\to$ Settings $\to$ Pause.
  - Gameplay $\to$ Pause $\to$ Restart Level $\to$ Gameplay (via `restartCurrentLevel()`).
  - Gameplay $\to$ Level Complete $\to$ Next Level $\to$ Gameplay.
  - Gameplay $\to$ Game Over $\to$ Restart / Main Menu.
  - Main Menu $\to$ Quit Confirmation $\to$ Return / Abort.

### Fixed
- Fixed trailing syntax error in `game.js` that previously halted execution.
- Fixed `onKeyDown` `e.preventDefault` check for mock and synthetic event safety.
- Ensured single-screen visibility: only the active screen renders, eliminating visual overlap.
- Focus trapping and `:focus-visible` styling properly routed across all modal screens.

### Testing & Verification
- **25 / 25 Unit & Balance Self-Tests Passing** (`run_tests_headless.js`).
- **15 / 15 Cross-Check Verifications Passing**.
- **17 / 17 Comprehensive Acceptance Tests Passing** (`verify_acceptance.js`).
- **12 / 12 Multi-Screen Flow Verifications Passing** (`verify_multiscreen_flows.js`).
- **Total: 69 / 69 Tests (100% Passing)**.

---

## [v6.0.0] - Master Gameplay Upgrade: 10 Distinct Campaign Levels, Cyber Dash, Hazards & Boss Encounter

### Added
- **10 Distinct Playable Levels with Progressive Difficulty:**
  - **EASY (Levels 1–3):**
    - **Sector 01 (ENTRY PROTOCOL):** Open arena, 6 fragments, 3 patrol drones (100 px/s), introductory tutorial instructions.
    - **Sector 02 (TRANSIT HUB):** 7 fragments, 4 drones (115 px/s), 2 transit security pillars for route planning and cover.
    - **Sector 03 (SECURITY BREACH):** 8 fragments, 4 drones (125 px/s), facility alarm tension, and cyan `OVERCLOCK` speed pod (+40% speed for 6s).
  - **MEDIUM (Levels 4–7):**
    - **Sector 04 (PRESSURE ZONE):** 9 fragments, 5 drones (135 px/s), central blast barrier wall with narrow middle transit breach corridor.
    - **Sector 05 (HUNTER PROTOCOL):** 10 fragments, 5 drones (145 px/s) featuring an active pursuit Hunter drone (`patternType: 'H'`), 4 tactical cover pillars, and `OVERCLOCK` powerup.
    - **Sector 06 (HAZARD SECTOR):** 11 fragments, 6 drones (155 px/s), environmental telegraphed laser hazard (blinking yellow warning phase before lethal red beam).
    - **Sector 07 (COLLAPSE SEQUENCE):** 12 fragments, 6 drones (165 px/s), combination of Hunter pursuit, patrol drones, horizontal laser conduit, and golden `SHIELD` powerup.
  - **HARD (Levels 8–10):**
    - **Sector 08 (BLACKOUT):** 13 fragments, 7 drones (175 px/s), atmospheric blackout mode with localized 195px spotlight around player, faint radar blips for distant drones and relics, and green `CHRONO` powerup (+15s time, 25% drone slowdown).
    - **Sector 09 (OVERLOAD):** 14 fragments, 7 drones (185 px/s), dual Hunter drones tracking player simultaneously, criss-crossing laser conduits, and dual powerups.
    - **Sector 10 (CORE BREACH):** 15 fragments, 8 drones (195 px/s), multi-phase Overlord Neural Core boss encounter:
      - *Phase 1 (Frags 0–5):* Outer Firewall with 3 rotating orbital shield nodes.
      - *Phase 2 (Frags 6–10):* Radial shockwaves unleashed every 4.2s expanding across the arena (dodgeable via Cyber Dash!).
      - *Phase 3 (Frags 11–15):* Core Critical Overload with rapid shockwaves, accelerated drones, and extraction transmission upon completion.
- **Cyber Dash / Dodge Ability:**
  - Key bindings: `Space` or `Shift` during active gameplay, or on-screen `#touch-btn-dash` on mobile.
  - 2.6x speed boost burst with particle trails and temporary invulnerability from drone collisions, lasers, and boss shockwaves.
  - Calibrated cooldown (2.0s) with real-time HUD telemetry badge (`#hud-dash`) and touch button visual feedback.
- **Powerup Systems & Visual Auras:**
  - `OVERCLOCK`: +40% movement speed for 6 seconds with electric cyan thruster trail.
  - `SHIELD`: Golden rotating orbital ring absorbing 1 lethal hit with zero penalty.
  - `CHRONO`: +15s added to mission timer and 25% drone slowdown for 5 seconds.
  - Web Audio synthesis cues: `playDash()`, `playPowerup()`, `playHazardWarning()`, `playShockwave()`.
- **Level Selection & Save Progression System:**
  - Dynamic level locking: players start with Sector 01 and unlock subsequent sectors upon extraction.
  - Sector pills on Title screen indicate `locked` (padlock/dimmed), `available`, and `completed` (`✓` indicator).
  - `#sector-info-card` on Start screen updates dynamically with Sector Title, Difficulty badge (`EASY`, `MEDIUM`, `HARD`), and mission objective briefing.
  - Schema v1 persistence tracks `unlockedLevel` and `completedLevels` across reloads with robust error recovery.
- **Verification & Testing:**
  - 25/25 automated unit/bot/level self-tests passing.
  - 17/17 comprehensive acceptance tests passing.
  - 100% offline file:// compatibility with zero external CDN dependencies.

---

## [v5.0.0] - Master Upgrade: 10 Full Sectors, Cyberpunk Overhaul, Difficulty & Fullscreen

### Fixed
- **Root Cause of 10 Levels Failure Identified & Resolved:**
  - `LEVELS` array in `game.js` was previously truncated to only 3 sectors; expanded to 10 fully configured and verified sectors.
  - Replaced hardcoded `if (currentLevel >= 2) setState('WON')` with dynamic `if (currentLevel >= LEVELS.length - 1) setState('WON')` so campaign progresses smoothly through all 10 sectors.
  - Updated `NeonLogic.validateLevels()` and `NeonLogic.analyzeLevels()` to dynamically handle 10-sector configurations with tailored target bounds.
  - Fixed HUD and overlay labels hardcoded to `/ 3` (now dynamically shows `/ LEVELS.length`).
  - Adjusted Level 4, 8, 9, 10 fragment and drone spawn coordinates to guarantee $>150\text{ px}$ safe distance from player spawn, $\ge 80\text{ px}$ from extraction portal, and strictly controlled drone path proximity.

### Added
- **10 Full Playable Sectors (Campaign & Sandbox):**
  - Sectors 01 to 10 featuring progressive fragment counts (6 through 15), drone counts (3 through 8), and calibrated velocities (100 px/s to 195 px/s).
  - All 10 levels pass 100% of fairness constraints (0 layout violations) and route/speed targets.
- **Difficulty Selection System:**
  - Added **Basic**, **Normal**, and **Hard** difficulty modes on the title screen with interactive pill selectors and live description updates.
  - Implemented `NeonLogic.getDifficultyModifiers(difficulty)`:
    - `Basic`: +25% time, -20% drone speed, -25 pts & -3s penalties, 1.8s cooldown.
    - `Normal`: 1.0x baseline, -50 pts & -5s penalties, 1.5s cooldown.
    - `Hard`: -15% time, +15% drone speed, -75 pts & -6s penalties, 1.2s cooldown.
  - Persisted difficulty in `saveRecord.settings.difficulty` with backward-compatible migration.
- **Direct Sector Deployment Pills (01–10):**
  - Added interactive sector pills on the Title screen allowing direct deployment to any sector from 01 to 10, updating the launch button (`DEPLOY TO SECTOR XX`).
- **Fullscreen Capability:**
  - Implemented `toggleFullscreen()` and `updateFullscreenUI()` supporting browser fullscreen API with fallback.
  - Added fullscreen toggle buttons in the HUD bar (`#btn-fullscreen`), on all modal screens (`.btn-toggle-fs`), and on the mobile touch bar (`#touch-btn-fullscreen`).
  - Added `KeyF` shortcut for instant fullscreen toggling.
- **Professional Cyberpunk Aesthetic:**
  - Modern native system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) with monospace accents for crystal-clear readability.
  - Neon cyan (`#00f5ff`), hot magenta (`#ff33cc`), and lime green (`#39ff14`) palette with glowing borders, hover states, and WCAG AAA/AA compliance.
- **Test Suite Enhancements:**
  - Added Unit Test T23: 10 Levels Campaign Fairness Validation (0 violations).
  - Added Unit Test T24: 10 Levels Balance & Route Analysis (10/10 passed).
  - Added Unit Test T25: Difficulty Modifiers System (Basic/Normal/Hard calibration).
  - Added Acceptance Tests U1, U2, U3 to `verify_acceptance.js`.
  - Total tests passing: **25/25 Unit Tests**, **15/15 Cross-Checks**, **17/17 Acceptance Suites**.

### Added
- **Mobile Touch Controls Subsystem:**
  - On-screen glowing neon virtual joystick (`#joystick-base` and `#joystick-knob`) with cardinal direction cues (▲, ▼, ◀, ▶).
  - Pure vector math helper `NeonLogic.calculateJoystickVector(deltaX, deltaY, maxRadius, deadZone)` providing smooth 360° steering with an 6 px deadzone and 48 px max radius clamp.
  - Dedicated on-screen touch pause button (`#touch-btn-pause`) with neon cyan outline and instantaneous pause/resume toggle.
  - Automatic touch detection via `@media (pointer: coarse)` and window touch events (`has-touch` class).
  - Desktop mouse fallback for virtual joystick allowing testing on laptops without physical touchscreens or emulation.
- **Responsive Viewport & Canvas Adaptation:**
  - Viewport meta tag updated with `viewport-fit=cover` and mobile scaling protection (`user-scalable=no`).
  - Dynamic aspect-ratio canvas scaling (`aspect-ratio: 960 / 600`) preserving exact internal 960×600 game logic and physics across viewports from 360 px mobile phones to 4K desktop screens.
  - Full-screen scrollable dialogs on mobile (`@media (max-width: 768px)`) with generous touch padding and centered content.
  - All touch targets comply with WCAG 2.1 touch target minimums ($\ge 44 \times 44\text{ px}$).
  - `touch-action: none` on gameplay canvas and touch controls layer, preventing mobile pull-to-refresh, page dragging, and pinch-zoom interference.
- **Local Network Wi-Fi Detection:**
  - Enhanced `server.js` to inspect `os.networkInterfaces()` and display local Wi-Fi LAN IP addresses (e.g. `http://192.168.1.X:8000/index.html`) on server launch for one-click testing on physical mobile phones.
- **Automated Verification:**
  - Added Unit Test T22 (`calculateJoystickVector` deadzone, cardinal, diagonal normalization, radius clamping) to `tests.html` and `run_tests_headless.js` (22/22 unit tests passing).
  - Added Acceptance Test M1 (Mobile & Touch Controls Integration) to `verify_acceptance.js` (14/14 acceptance suites passing).

---

## [Consolidation Pass] - Update: Consolidate, Simplify, Tune, Verify

### Fixed
- **Same-Frame Precedence:** Updated `update(dt)` in `game.js` so reaching the extraction point takes precedence over timer expiration when both occur on the same frame; skips timer tick and prevent defeat on winning frames.
- **Error Recovery Loop Integrity:** Refactored `startLoop(isRecovery)` and `#btn-restart-error` click handler to preserve `stats.loopStarts === 1`, eliminating duplicate requestAnimationFrame chains during error recovery.
- **Announcer Deduplication:** Added `lastAnnouncedText` cache to `doAnnounce()` in `game.js` to ensure the same text string is never announced twice consecutively to screen readers.
- **Key State Reset on Level Load:** Added `clearKeys()` call to `loadLevel()` to ensure held keys do not carry over across level transitions or cause unwanted drift.

### Simplified
- **Expanding Rings Cap:** Added a hard cap of `MAX_RINGS: 4` in `effects.js` using `expandingRings.shift()` when saturated, preventing unbounded ring growth during fast-paced play.
- **Particle & Text Pools:** Confirmed pre-allocated object pools (`MAX_PARTICLES: 80`, `MAX_TEXTS: 8`) prevent per-frame memory allocations or GC spikes.
- **Accessibility Styles:** Kept Windows High Contrast / System Colors overrides concise (~25 lines in `style.css`), relying on standard CSS system tokens (`ButtonText`, `Highlight`, `HighlightText`).

### Tuned
- **Phase 3 Balance Verification:** Implemented `NeonLogic.analyzeLevels()` calculating tour distance, ideal time, route time ratio, drone speed ratio, start clearance, and frags near drone paths across all 3 sectors:
  - Level 1: Time ratio 0.125 ($\le 0.40$), speed ratio 0.500 ($\le 0.60$), start dist 170 px ($\ge 150$), 1 frag near path ($\le 2$), winnable after 3 hits: YES.
  - Level 2: Time ratio 0.110 ($\le 0.50$), speed ratio 0.614 ($\le 0.70$), start dist 170 px ($\ge 150$), 2 frags near path ($\le 2$), winnable after 3 hits: YES.
  - Level 3: Time ratio 0.113 ($\le 0.60$), speed ratio 0.727 ($\le 0.75$), start dist 170 px ($\ge 150$), 2 frags near path ($\le 3$), winnable after 3 hits: YES.
- **Deterministic Bot Simulation:** Implemented `NeonLogic.simulateBot()` in `logic.js` (60 Hz headless simulation with drone repulsion). Tested across 10 random seeds per level:
  - Level 1: 10/10 clears (target $\ge 8/10$).
  - Level 2: 10/10 clears (target $\ge 8/10$).
  - Level 3: 10/10 clears (target $\ge 6/10$).

### Added
- Pure analytical functions `NeonLogic.analyzeLevels()` and `NeonLogic.simulateBot()` in `logic.js`.
- Automated test T20 (Phase 3 balance targets verification) and T21 (deterministic bot simulation) in `tests.html` and `run_tests_headless.js`.
- Acceptance test matrix aligned to R0, S1, G1-G5, B1, K1, P1, A1, F1, E1, X1-X4, L1, Z1 in `TESTING.md`.
- `PROMPT_FEEDBACK.md` documenting ambiguities and constraints across build prompts.
- Owner Tuning Guide and Playtest Checklist in `README.md`.

---

## [v3.0.0] - Day 3 v2: Audio, Animation, Accessibility, Robustness & QA

### Added
- **Modular Architecture:** Split codebase into clean decoupled layers loaded via plain `<script>` tags:
  - `logic.js`: Pure mathematical and data functions (collision geometry, input normalization, score clamping, state transitions, save data sanitization, Mulberry32 PRNG, level fairness validation).
  - `audio.js`: Procedural Web Audio API engine (4 concurrent voices, compressor + master gain, volume control, throttling, mute state, debug fallbacks).
  - `effects.js`: Lightweight time-based visual effects subsystem (particle pool, floating text pool, hit flash vignette, rings, Mulberry32 PRNG, reduced-motion listener).
  - `game.js`: Game configuration, data-driven levels, state machine, physics, keyboard input hardening, focus management, error boundary, HUD write caching, and canvas rendering.
- **Advanced Audio Subsystem:**
  - 4-voice polyphony with automatic cleanup on voice end.
  - DynamicsCompressorNode preventing acoustic distortion and clipping.
  - Discrete procedural sound designs for Fragment pickup, Drone hit, Extraction online, Level complete, Victory fanfare, Mission failure, and UI button click.
  - Master volume slider (0–100%, default 50%) in Settings box on Title screen.
  - 60 ms audio throttle preventing rapid-fire sound stutter.
  - 150 ms suspension delay on pause/blur.
  - `?debug&noaudio` test flag to simulate audio-disabled environments.
- **Visual Effects & Animation:**
  - Pre-allocated object pools: 80 particles, 8 floating score texts, zero per-frame garbage collector stutter.
  - Visual fragment vertical bobbing ($\pm 3\text{ px}$) and 1.5 Hz glow pulsing with unshifted logical collision hitboxes.
  - Drone rotors with spinning rings and eye offsets toward direction of motion.
  - Player idle pulsation (1 Hz) and physical perimeter directional notch indicating travel vector.
  - Hit flash vignette with capped opacity ($\le 0.35$) and brief duration ($0.25\text{ s}$).
  - Mulberry32 deterministic seeded RNG (`?debug&seed=N`) for reproducible testing.
  - Settings dropdown allowing players to toggle Effects between Auto (System), Full Motion, and Reduced Motion.
- **Controls & Navigation Hardening:**
  - "Title Screen" buttons added to Paused, Mission Complete, and Mission Failed dialogs to return cleanly to START state without page reload.
  - Opposite key cancellation (A+D=0, W+S=0) and diagonal input normalization ($1/\sqrt{2}$).
  - Ignored game shortcuts when `Ctrl`, `Meta`, or `Alt` is held to preserve native browser shortcuts (e.g. `Ctrl+R` to reload).
  - Double-action prevention when Space or Enter is pressed on active HTML buttons.
  - Automatic focus management restoring focus to `#game-container` on dialog close.
- **Robustness & Error Boundary:**
  - Global `window.onerror` and `window.addEventListener('unhandledrejection')` error handlers.
  - Master game loop wrapped in `try / catch` boundary to halt loops cleanly and display a user-friendly `#screen-error` ("System Malfunction") dialog.
  - Restart Mission button allowing one-click recovery without closing the tab.
  - `?debug&throwtest` URL parameter simulating an unexpected crash on frame 2 to verify error boundary behavior.
  - Debounced (100 ms) window resize and `devicePixelRatio` change listener.
- **Accessibility & Contrast:**
  - Full WCAG 2.1 AAA/AA contrast compliance across all text and UI components against `#050a14`.
  - Windows High Contrast / System Colors support via `@media (forced-colors: active)`.
  - Screen reader live region (`#announcer`) with 400 ms message joining for rapid events.
  - Modal dialog focus trapping with background `inert` and `aria-hidden="true"`.
  - 3px high-contrast focus rings (`:focus-visible`).
- **Automated Self-Tests & QA:**
  - `tests.html`: Interactive browser-based test suite with real-time pass/fail indicators.
  - `run_tests_headless.js`: Node.js CLI test runner verifying 19 test cases across 10 functional categories.
  - Test evidence generated and stored in `docs/test-evidence/self-tests.txt` and `docs/test-evidence/syntax-check.txt`.

### Changed
- Migrated LocalStorage schema to Schema v1 (`version: 1`, `bestScore`, `settings: { muted, volume, effects }`) with backwards compatibility for Day 2 saves.
- HUD DOM updates cached to eliminate unnecessary per-frame string assignments.

---

## [v2.0.0] - Day 2: Progression, Scoring, Persistence & Polish

### Added
- **Multi-Level Progression:** 3 data-driven sectors (`LEVELS` array) with escalating difficulty (6, 8, 10 fragments; 3, 4, 5 drones; speeds 110, 135, 160 px/s).
- **Persistent High Scores:** LocalStorage persistence under key `neonRelic.v1` tracking `bestScore` across sessions.
- **Scoring System:** +100 per fragment, +250 sector clear bonus, -50 drone collision penalty with 0 score clamping.
- **Basic Audio:** Web Audio tone synthesis with mute toggle (HUD button and `M` hotkey).
- **Victory & Failure Screens:** Final victory screen after Level 3 and failure screen with Level reached.
- **New Record Badge:** "★ NEW RECORD! ★" celebratory notification when beating best score.
- **Level Fairness Validator:** Automated `validateLevels()` verifying drone patrol paths, player clearance, and fragment positions.

---

## [v1.0.0] - Day 1: Playable Prototype

### Added
- Core top-down 2D canvas arena (960 x 600) with HiDPI scaling.
- Player character with 8-direction keyboard movement.
- 6 Energy Fragments with diamond rendering.
- 3 Security Drones with distinct patrol patterns (horizontal, vertical, rectangular).
- Extraction portal activating upon fragment collection.
- 90-second countdown timer.
- Collision detection with hit invulnerability cooldown.
- Pause/resume state machine.
