# NEON RELIC: THE LAST SIGNAL — Master Meta-Verified Upgrade

A verified, accessible, polished 2D top-down cyberpunk survival game built with vanilla HTML5, CSS3, Web Audio API, and JavaScript Canvas.  
Infiltrate 10 security sectors, collect energy fragments, avoid hostile patrolling drones, activate extraction portals, and escape before the countdown timer runs out.

Playable seamlessly on **both Laptops (Keyboard & Mouse)** and **Mobile Phones (Touch Controls)**, featuring a **Clean Multi-Screen Architecture**, **Authoritative Difficulty System (Basic / Medium / Hard)**, and direct **Sector Deployment (01–10)**.

---

## 🖥️ Clean Multi-Screen UI Architecture

The interface has been separated into dedicated, uncluttered screens with reliable transitions and single-screen visibility:

1. **Main Menu (`#screen-start`):** Striking brand title (`NEON RELIC: THE LAST SIGNAL`), official lore description, animated taglines, best score display, and clear navigation buttons (`START GAME`, `SETTINGS`, `CONTROLS`, `QUIT GAME`, `FULLSCREEN`).
2. **Difficulty Selection (`#screen-difficulty`):** Three interactive challenge cards (`BASIC`, `MEDIUM`, `HARD`) with descriptive badges and modifier telemetry, 10-sector deployment selector pills (`01`–`10`), and `DEPLOY TO SECTOR` launch button.
3. **Dedicated Settings (`#screen-settings`):** Accessible from both Main Menu and Pause Menu. Clean categorized sections for Audio (Master, Music, SFX volume sliders, Mute toggle), Visuals & Motion (Reduced Motion, Screen Shake, CRT Scanlines, Fullscreen), and Mission Data Management (Reset score, Restore Defaults).
4. **Tactical Directives & Controls (`#screen-controls`):** Field manual detailing locomotions, Cyber Dash evasion, keyboard hotkeys, and mobile touch layout.
5. **Quit Confirmation (`#screen-quit`):** Confirmation dialog preventing accidental abandonment of active mission sessions.
6. **Active Gameplay (`#canvas-wrapper` + `#hud`):** Minimalist HUD showing Sector Level, Fragments, Score, Best, Cyber Dash cooldown meter, Active Difficulty Profile tag, Pause, Restart, Fullscreen, Mute, and Countdown Timer.
7. **Pause Overlay (`#screen-paused`):** Halts drones, timers, and simulation; displays active difficulty badge; provides `RESUME`, `RESTART LEVEL`, `SETTINGS`, `MAIN MENU`, and `FULLSCREEN`.
8. **Level Completion (`#screen-level-complete`):** Sector cleared briefing, bonus points telemetry, total score, and next sector progression.
9. **Victory Accomplished (`#screen-won`):** Full 10-sector campaign cleared celebration, final score, record indicator, elapsed time, and replay options.
10. **Game Over (`#screen-lost`):** Mission termination summary, sector reached, final score, try again, and main menu navigation.
11. **System Malfunction Recovery (`#screen-error`):** Graceful recovery screen caught by the error boundary with single-click mission restart.

### Verified State Transition Flows (Phase 13):
- `MAIN MENU` $\to$ `START GAME` $\to$ `DIFFICULTY SELECTION` $\to$ `GAMEPLAY`
- `MAIN MENU` $\to$ `SETTINGS` $\to$ `MAIN MENU`
- `GAMEPLAY` $\to$ `PAUSE` $\to$ `RESUME` $\to$ `GAMEPLAY`
- `GAMEPLAY` $\to$ `PAUSE` $\to$ `SETTINGS` $\to$ `PAUSE`
- `GAMEPLAY` $\to$ `PAUSE` $\to$ `RESTART LEVEL` $\to$ `GAMEPLAY`
- `GAMEPLAY` $\to$ `LEVEL COMPLETE` $\to$ `NEXT LEVEL` $\to$ `GAMEPLAY`
- `GAMEPLAY` $\to$ `GAME OVER` $\to$ `RESTART` / `MAIN MENU`
- `MAIN MENU` $\to$ `QUIT CONFIRMATION` $\to$ `CANCEL (RETURN)` / `CONFIRM (ABORT)`

---

## 🎮 Overview & Gameplay Objectives

- **Mission:** Clear ten escalating security sectors by collecting all energy fragments to unlock each sector's extraction portal, then navigate to the portal before the countdown expires.
- **Difficulty Modes:**
  - **Basic:** Recruits enjoy +25% countdown time, slower drones (-20%), and reduced collision penalties (-25 pts / -3s).
  - **Normal:** Standard tactical survival with calibrated drone velocity, balanced countdowns, and default penalties (-50 pts / -5s).
  - **Hard:** High intensity cyber operations with accelerated drones (+15%), tight timers (-15%), and harsh penalties (-75 pts / -6s).
- **Campaign & Sector Select:** Play through all 10 sectors in a continuous high-score campaign or deploy directly to any unlocked sector (01–10) using on-screen sector selection pills.
- **Fullscreen Capability:** Go full-screen instantly with one click/tap (`⛶ FULLSCREEN` / `🗗 EXIT FS` in HUD, modal dialogs, touch controls bar, or `F` hotkey).
- **Controls & Cross-Platform Support:**
  - **Laptop / Desktop:** Full keyboard navigation (`WASD`, arrow keys, hotkeys `P`, `R`, `M`, `F`, `Space`, `Enter`) and mouse clicks.
  - **Mobile Phone / Tablet:** On-screen glowing neon virtual joystick, dedicated touch buttons (Pause & Fullscreen) with zero touch lag and gesture protection.
- **Visual Design:** Professional cyberpunk neon aesthetic with vibrant electric cyan (`#00f5ff`), hot magenta (`#ff33cc`), and lime (`#39ff14`) accents on a deep cyber grid, using clean modern system fonts for crystal-clear readability.
- **Accessibility:** Screen reader announcements via ARIA live regions (`#announcer`), focus trapping on modal dialogs, non-color visual cues (shapes, labels, directional notches), and real-time reduced-motion & forced-colors support.
- **Robustness:** Zero external dependencies, global error boundary for graceful recovery, deterministic state machine, and localStorage schema validation with backward-compatible migration. Runs 100% offline via `file://`, on `localhost:8000`, and is ready for static web hosting (GitHub Pages, Vercel, Netlify).

---

## 📱 How to Run & Verify

### Method 1: On Laptop / Desktop (Localhost Server)
Run the included zero-dependency static file server:
```powershell
node server.js
```
The server will start at `http://localhost:8000` and automatically open your default browser.

### Method 2: On Your Mobile Phone (Wi-Fi)
1. Ensure your mobile phone and laptop are connected to the same Wi-Fi network.
2. Run `node server.js` on your laptop.
3. The terminal will automatically display your local network IP address:
   ```text
   > Laptop / Desktop:   http://localhost:8000/index.html
   > Mobile Phone (LAN): http://<your-lan-ip>:8000/index.html
   ```
4. Open that `http://<your-lan-ip>:8000/index.html` link on your mobile browser (Safari on iOS, Chrome on Android).
5. The game automatically recognizes touch input, adapts the viewport, and activates the on-screen neon virtual joystick and touch action buttons!

### Method 3: Mobile Phone Emulation on Laptop
You can also verify the mobile phone touch interface directly on your laptop without a physical phone:
1. Open `http://localhost:8000` in Google Chrome, Microsoft Edge, or Firefox.
2. Press `F12` to open DevTools, then press `Ctrl+Shift+M` (or `Cmd+Option+M` on Mac) to toggle Device Emulation.
3. Select a mobile device preset (e.g. **iPhone 14 Pro**, **Pixel 7**, or **Samsung Galaxy S20**).
4. Refresh the page or start the mission: click and drag the virtual joystick with your mouse to steer, and tap the on-screen PAUSE or FULLSCREEN buttons.

### Method 4: Direct Offline File Launch (`file://`)
1. Open this project folder in File Explorer or Finder.
2. Double-click **`index.html`** to launch directly in any modern browser via `file://`.
3. Open **`tests.html`** to run the browser-based automated self-test suite.
4. Runs 100% self-contained offline with zero network requests or build steps.

### Method 5: Online Web Hosting (GitHub Pages / Vercel / Netlify)
Push or upload this folder directly to any static web hosting provider. All paths are relative, assets are purely procedural/vector/SVG, and no compilation is required.

---

## 🕹️ Controls Guide

### Keyboard Controls (Laptop / Desktop)
All keys use `event.code` for complete international layout compatibility (QWERTY, AZERTY, Dvorak):

| Key | Action | Active States |
|---|---|---|
| `W A S D` or `Arrow Keys` | Move player (cancels opposing keys; diagonal normalized) | `PLAYING` |
| `Space` or `Shift` | Cyber Dash (speed boost, invulnerability, dodge drones/lasers/waves) | `PLAYING` |
| `P` or `Esc` | Toggle Pause / Resume | `PLAYING`, `PAUSED` |
| `R` | Restart run from Selected Sector | All states except `START` |
| `F` | Toggle Fullscreen Mode | Any state |
| `Enter` or `Space` | Primary Action (Deploy / Next Sector / Play Again) | `START`, `LEVEL_COMPLETE`, `WON`, `LOST` |
| `M` | Toggle Sound (Mute / Unmute) | Any state |

*Controls Hardening:* Browser shortcuts (e.g. `Ctrl+R` or `Cmd+R` reload) are never intercepted. Focused buttons do not double-fire when pressing Space/Enter.

### Touch Controls (Mobile Phone & Tablet)
Designed specifically for mobile ergonomics and one-thumb play:

| Control | Position | Behavior |
|---|---|---|
| **Virtual Joystick** | Bottom-Left | Touch and drag within the glowing neon cyan ring to steer in 360°. Features an 8 px deadzone to prevent drift and continuous vector normalization. Knob visually tracks thumb movement with a smooth cyan neon glow. |
| **Touch Action Buttons** | Bottom-Right | Stacked circular neon buttons: `⚡ DASH` triggers instant invulnerable Cyber Dash, `⛶ FULL` toggles browser fullscreen, and `⏸ PAUSE` opens the pause menu. |
| **Touch Targets** | Full Screen | All menu and dialog buttons (`DEPLOY TO SECTOR`, `RESUME`, `NEXT SECTOR`, `PLAY AGAIN`) meet WCAG touch target recommendations ($\ge 44 \times 44\text{ px}$) and respond instantly to touch without delay. |
| **Gesture Shield** | Canvas Area | Canvas and touch controls apply `touch-action: none;` to completely prevent accidental browser pull-to-refresh, page scrolling, or pinch-zooming during gameplay. |

---

## 🏢 System Architecture & File Structure

```text
├── index.html              # HTML5 markup, HUD, responsive canvas wrapper, 10-sector pills, difficulty selector, overlays
├── style.css               # Modern system typography, cyberpunk neon palette, responsive scaling, touch controls
├── logic.js                # Pure logic: collisions, input math, joystick vector, difficulty mods, save sanitizer, bot sim
├── audio.js                # Web Audio API engine: 4 voices, compressor, 6 sound designs, mute/volume
├── effects.js              # Visual effects subsystem: pooled particles/texts/rings, reduced-motion toggle
├── game.js                 # Central game engine: 10 levels, difficulty scaling, fullscreen, state machine, rAF loop, rendering
├── server.js               # Zero-dependency static dev server with auto-browser launch and Wi-Fi LAN detection
├── tests.html              # Browser-based test runner (25 unit tests + 15 cross-checks)
├── run_tests_headless.js   # Headless Node.js test runner for CI and terminal verification
├── verify_acceptance.js    # Comprehensive acceptance suite (17 suites: G1-G4, K1, P1, A1, F1, E1, X1, X2, L1, M1, Z1, U1-U3)
└── docs/test-evidence/     # Automated test logs and evidence files
```

- **Load Order:** Loaded via plain `<script>` tags without ES modules or build steps: `logic.js` $\to$ `audio.js` $\to$ `effects.js` $\to$ `game.js`.

---

## 🗺️ 10 Levels Campaign & Progression

| Sector | Title | Difficulty | Frags | Drones | Unique Sector Mechanics & Hazards | Time |
|---|---|---|---|---|---|---|
| **01** | `ENTRY PROTOCOL` | **EASY** | 6 | 3 (100 px/s) | Open layout, minimal pressure, beginner tutorial instructions | 90 s |
| **02** | `TRANSIT HUB` | **EASY** | 7 | 4 (115 px/s) | 2 Transit security pillars, obstacle route planning & cover | 95 s |
| **03** | `SECURITY BREACH` | **EASY** | 8 | 4 (125 px/s) | Facility alarm tension, tight patrols, cyan `OVERCLOCK` (+40% speed) | 100 s |
| **04** | `PRESSURE ZONE` | **MEDIUM** | 9 | 5 (135 px/s) | Central blast divider wall with narrow middle transit breach passage | 105 s |
| **05** | `HUNTER PROTOCOL` | **MEDIUM** | 10 | 5 (145 px/s) | **Hunter Pursuit Drone** (active chase), 4 tactical cover pillars, `OVERCLOCK` | 110 s |
| **06** | `HAZARD SECTOR` | **MEDIUM** | 11 | 6 (155 px/s) | **Telegraphed Laser Hazard** (blinking yellow warning $\to$ lethal red beam) | 115 s |
| **07** | `COLLAPSE SEQUENCE` | **MEDIUM** | 12 | 6 (165 px/s) | Combined Hunter drone, patrol drones, horizontal laser, golden `SHIELD` | 120 s |
| **08** | `BLACKOUT` | **HARD** | 13 | 7 (175 px/s) | **Atmospheric Blackout** (195px localized spotlight, radar blips), `CHRONO` | 125 s |
| **09** | `OVERLOAD` | **HARD** | 14 | 7 (185 px/s) | **Dual Hunter Drones**, crossing laser conduit grid, multi-pillar maze | 130 s |
| **10** | `CORE BREACH` | **HARD** | 15 | 8 (195 px/s) | **Overlord Neural Core Boss**: 3 rotating shields, expanding shockwaves, overload | 140 s |

### Fairness Guarantees (`NeonLogic.validateLevels`)
- **Safe Zone:** No drone spawns or patrols within 150 px of the player start position `(60, 60)`.
- **Wall & Extraction Margins:** All fragments maintain $\ge 40\text{ px}$ from arena walls, $\ge 80\text{ px}$ from player start, and $\ge 80\text{ px}$ from extraction portal.
- **Risk/Reward Balance:** Controlled drone patrol proximity ensures no unclimbable hazard choke-points.
- **Winnable After Multiple Hits:** All sectors provide sufficient surplus countdown time to clear the sector even after 3 full collisions.

---

## 🏆 Scoring Rules & Balance

| Event | Points / Penalty | Guard Condition |
|---|---|---|
| **Energy Fragment** | `+100` | Once per fragment (`fragment.collected` boolean guard) |
| **Sector Clear Bonus** | `+250` | Once per sector (`levelBonusAwarded` idempotency flag) |
| **Drone Collision** | `-25` (Basic) / `-50` (Normal) / `-75` (Hard) | Score strictly clamped $\ge 0$; invulnerability cooldown active |
| **Collision Time Loss** | `-3 s` (Basic) / `-5 s` (Normal) / `-6 s` (Hard) | Time deducted from countdown timer |

- **Maximum Clean Campaign Score:**  
  $$\text{Fragments: } (6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15) \times 100 = 10,500$$  
  $$\text{Sector Bonuses: } 10 \times 250 = 2,500$$  
  $$\textbf{Maximum Theoretical Clean Score: } 10,500 + 2,500 = \mathbf{13,000}$$
- **Score Clamping:** Hits taken at 0 points still deduct the countdown time penalty without producing negative scores.

---

## 🧪 Automated Testing & Verification

Run all test suites locally with Node.js:
```powershell
# 1. Syntax check all files
node --check logic.js audio.js effects.js game.js run_tests_headless.js verify_acceptance.js verify_multiscreen_flows.js server.js

# 2. Run automated self-tests (25 unit tests + 15 cross-checks)
node run_tests_headless.js

# 3. Run comprehensive acceptance verification suite (17 suites)
node verify_acceptance.js

# 4. Run multi-screen architecture and state flow verifications (12 suites)
node verify_multiscreen_flows.js
```

### Test Results Summary:
- **Unit Tests:** **25 Passed, 0 Failed** (covering geometry collisions, 80% forgiving drone hitbox, keyboard cancellation, joystick deadzone/clamping/normalization, score clamping, corrupt save recovery, 10 levels fairness validation, 10 levels balance analytics, Mulberry32 PRNG, difficulty modifiers, and deterministic bot simulation).
- **Session Cross-Checks:** **15 Verified, 0 Failed**.
- **Acceptance Suites:** **17 Verified, 0 Failed** (G1–G4, K1, P1, A1, F1, E1, X1, X2, L1, M1, Z1, U1–U3).
- **Multi-Screen Flow Suites:** **12 Verified, 0 Failed** (F01–F12: screen modularity, navigation flows 1–8, difficulty locking, HUD telemetry, and responsive layout).
- **Total Tests Passing:** **69 / 69 (100% Pass Rate)**.
- **Test Evidence:** Saved to `docs/test-evidence/self-tests.txt` and `docs/test-evidence/acceptance-tests.txt`.

---

## 🎨 Cyberpunk Visual Polish & Accessibility Features

1. **Cyberpunk Aesthetic:** Deep dark space background (`#060a14`) paired with electric neon cyan (`#00f5ff`), lime green (`#39ff14`), hot magenta (`#ff33cc`), and gold (`#ffd700`).
2. **Modern System Fonts:** Modern native typography stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) with monospace accents for crisp readability at all resolutions.
3. **Object Pooling:** Pre-allocated particle pool (capped at 80), floating score texts (capped at 8), and expanding ring pulses (capped at 4) to ensure a rock-solid 60 FPS without garbage collection spikes.
4. **Responsive Scaling:** HTML5 Canvas maintains its crisp 960×600 internal coordinate system while dynamically scaling to fit any mobile phone viewport, tablet screen, or laptop window.
5. **WCAG AAA/AA Contrast:** All text and critical UI elements exceed WCAG AAA/AA ratios (White 19.8:1, Cyan 14.6:1, Lime 14.6:1, Gold 14.1:1, Magenta 6.2:1, Urgent Red 5.5:1).
6. **Reduced Motion & Forced Colors:** Real-time support for OS `prefers-reduced-motion` and `@media (forced-colors: active)`. Toggling "Reduced Motion" in settings instantly removes bobbing, particles, and flashes while preserving full gameplay readability.

---
## Live Website Page  
[Game Link ](https://neon-relicgames.vercel.app/)

## 📄 License & Credits
- **Project:** NEON RELIC: THE LAST SIGNAL
- **Author:** Developed for game-development internship portfolio (October 2026).
- **Zero Dependencies:** Pure HTML5, CSS3, JavaScript, Web Audio API, and HTML5 Canvas.
