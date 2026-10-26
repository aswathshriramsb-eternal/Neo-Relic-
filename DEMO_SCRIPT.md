# DEMO SCRIPT — NEON RELIC: THE LAST SIGNAL

A 2-minute reviewer walkthrough demonstrating core gameplay, audio synthesis, visual feedback, accessibility features, error handling, and automated self-tests.

---

## Prerequisites
- Any modern desktop web browser (Chrome, Edge, Firefox, or Safari).
- Audio output enabled on your device (headphones or speakers).
- No internet connection or build tools required.

---

## 2-Minute Walkthrough Steps

### 1. Title Screen & Audio Settings (0:00 – 0:25)
1. Double-click `index.html` to open in your browser.
2. Notice the cyberpunk vector layout, crisp typography, and high-contrast styling.
3. Test the **Settings Box**:
   - Drag the **Volume Slider** left and right (adjusts master procedural gain).
   - Change **Motion / FX** from *Auto (System)* to *Full Motion* or *Reduced Motion*.
   - Click the **Sound: ON** toggle button or press `M` on your keyboard (sound click feedback plays).
4. Press **Tab** to navigate through buttons; observe the bright cyan 3px `:focus-visible` outline.
5. Click **START MISSION** (or press `Enter` / `Space`).

### 2. Sector 01 Gameplay & Acoustic Feedback (0:25 – 0:55)
1. Use `W A S D` or `Arrow Keys` to pilot the cyan player drone.
   - Note the physical notch on the perimeter of the player square showing your movement direction.
2. Collect an Energy Fragment:
   - Notice the rising 2-note chime (880 Hz / 1320 Hz).
   - Notice the green particle burst and floating `+100` score label.
3. Observe the faint dashed pink lines across the arena showing drone patrol trajectories.
4. Collect all 6 fragments:
   - The extraction portal at the bottom-right pulses online with a 3-note chime.
   - Screen reader announcer registers: *"Extraction online. Proceed to bottom-right portal."*
5. Pilot into the bottom-right extraction hexagon:
   - A 4-note A-major victory fanfare plays.
   - Sector Bonus `+250` points is awarded.

### 3. Collision, Pause & Title Navigation (0:55 – 1:20)
1. Click **PROCEED TO LEVEL 2** (Sector 02).
2. Deliberately touch a red security drone:
   - Hear the punchy sawtooth descending hit sweep.
   - Notice the screen edge vignette and floating `"-50 / -5s"` text.
   - Note that your score is safely clamped at 0 (never negative) and player blinks at 3 Hz with a protective white ring.
3. Press `P` or `Esc` to pause the game:
   - Audio smoothly suspends.
   - Click **TITLE SCREEN**: the game transitions cleanly back to the main title screen, resetting the mission state.

### 4. Sector 03 Victory & Record Persistence (1:20 – 1:45)
1. Launch Sector 03 directly using the debug URL:
   ```
   index.html?debug&level=3&score=2000
   ```
2. Collect the 10 fragments in Sector 03 and enter the extraction portal.
3. Observe the **MISSION COMPLETE** victory screen:
   - Celebratory 6-note C-major victory fanfare plays.
   - **★ NEW RECORD! ★** badge is displayed.
   - Best score is permanently saved to `localStorage`.
4. Reload the page: notice your Best Score persists on the title screen.

### 5. Error Boundary & Automated Self-Tests (1:45 – 2:00)
1. Test the Error Recovery Boundary by appending `?debug&throwtest`:
   ```
   index.html?debug&throwtest
   ```
2. The game safely halts on frame 2 and displays the **SYSTEM MALFUNCTION** dialog without crashing the browser tab.
3. Click **RESTART MISSION**: the game recovers cleanly into Sector 01!
4. Finally, double-click **`tests.html`** in your file manager:
   - View the automated test runner verifying all 21 unit tests across geometry, physics, state transitions, save sanitization, seeded RNG, Phase 3 balance metrics, and deterministic bot simulations, along with the Session 2 cross-check table.
   - Result: **ALL TESTS PASSED (21/21)**.
