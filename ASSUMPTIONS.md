# ASSUMPTIONS & DESIGN DECISIONS — NEON RELIC: THE LAST SIGNAL

Logged in accordance with the Conflict Rule: follow priority order (correct and stable > fair and balanced > accessible > audio > visual polish), make the smallest reasonable choice, and log as one line each without blocking.

1. **Architecture Preservation:** Kept the modular split (`logic.js`, `audio.js`, `effects.js`, `game.js`) as `game.js` would otherwise exceed 1,000 lines, ensuring clean separation of pure logic from rendering and audio.
2. **Optional UI Features:** Kept working volume slider, Effects selector, and "Back to Title" buttons as they are fully tested and functional with no bugs.
3. **Same-Frame Precedence:** Prioritized extraction contact before timeout tick within the same frame update: if extraction completes a sector, timer update is skipped for that frame.
4. **Bot Simulation Scope:** Implemented the Phase 3 bot simulation as a deterministic headless simulation in `logic.js` tested across 10 random seeds per level to verify winnability without requiring canvas DOM rendering.
