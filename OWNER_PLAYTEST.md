# OWNER PLAYTEST PROTOCOL & TUNING GUIDE — NEON RELIC

This document outlines the standard playtest protocol, tuning guidelines, and human checklist for evaluating tactile difficulty feel and subjective presentation in a live browser.

> [!IMPORTANT]
> Difficulty feel, player frustration/satisfaction, and acoustic timbre cannot be verified by automated test runners or code inspection alone. They must be evaluated directly by the owner using this protocol.

---

## 1. Playtest Protocol

1. **Practice Run:** Play through Sector 01 once to warm up and familiarize yourself with the keyboard controls (`WASD` / `Arrow Keys`).
2. **Recorded Trials:** Play each level up to **5 times** (reloading or restarting cleanly between attempts).
3. **Log Results:** Record the following for each trial in the tables below:
   - Outcome: **Win** or **Lose**
   - **Hits Taken** (number of drone collisions)
   - **Seconds Left** on the mission timer upon extraction (or `0s` if timeout)

### Level 1: Sector 01 (Entry Grid)
| Attempt | Outcome (Win / Lose) | Hits Taken | Seconds Left | Notes |
|:---:|:---:|:---:|:---:|---|
| Trial 1 | | | | |
| Trial 2 | | | | |
| Trial 3 | | | | |
| Trial 4 | | | | |
| Trial 5 | | | | |

### Level 2: Sector 02 (Transit Hub)
| Attempt | Outcome (Win / Lose) | Hits Taken | Seconds Left | Notes |
|:---:|:---:|:---:|:---:|---|
| Trial 1 | | | | |
| Trial 2 | | | | |
| Trial 3 | | | | |
| Trial 4 | | | | |
| Trial 5 | | | | |

### Level 3: Sector 03 (Core Breach)
| Attempt | Outcome (Win / Lose) | Hits Taken | Seconds Left | Notes |
|:---:|:---:|:---:|:---:|---|
| Trial 1 | | | | |
| Trial 2 | | | | |
| Trial 3 | | | | |
| Trial 4 | | | | |
| Trial 5 | | | | |

---

## 2. Expected Feel (Target Difficulty Curve)

- **Level 1 (Sector 01):** Won on most first tries (teaches movement, safe corridors, and extraction mechanics without high failure risk).
- **Level 2 (Sector 02):** Won about **3 of 5** tries (introduces faster drone patrols and moderate route timing pressure).
- **Level 3 (Sector 03):** Won about **2–3 of 5** tries (tests mastery with 5 drones, diagonal bouncing drone D, and tight extraction timing).

---

## 3. Tuning Table (Calibrating Difficulty)

If your recorded results differ from the expected feel, change **only that one value** in `LEVELS` or `CONFIG` in `game.js`, then replay:

| Observed Symptom during 5 Trials | Recommended Parameter Adjustment | File & Line Location |
|---|---|---|
| **L1 lost more than 2 of 5** | Increase Level 1 `timeLimit` by **+5 seconds** (e.g., 90 $\to$ 95 s) | `LEVELS[0].timeLimit` (`game.js`) |
| **L1 won 5/5 with $\ge 15\text{ s}$ left every time** | Decrease Level 1 `timeLimit` by **-3 seconds** (e.g., 90 $\to$ 87 s) | `LEVELS[0].timeLimit` (`game.js`) |
| **L2 or L3 won 5/5** | Decrease that level's `timeLimit` by **-3 seconds** (or increase `droneSpeed` by **+10 px/s**) | `LEVELS[i].timeLimit` or `drones[j].speed` (`game.js`) |
| **L2 or L3 won 0–1 of 5** | Increase that level's `timeLimit` by **+4 seconds** (or decrease `droneSpeed` by **-10 px/s**) | `LEVELS[i].timeLimit` or `drones[j].speed` (`game.js`) |
| **Hits feel unfair** | Decrease that level's `droneSpeed` by **-10 px/s** | `LEVELS[i].drones[j].speed` (`game.js`) |
| **Drones feel irrelevant** | Increase hit time penalty from **5 $\to$ 7 seconds** | `CONFIG.PENALTY_TIME = 7` (`game.js`) |

> [!CAUTION]
> **Balance Verification Guard:** After any parameter adjustment, open **`tests.html`** or run `node run_tests_headless.js`. All automated balance bands (T20: route ratio $\le 0.40/0.50/0.60$, drone speed ratio $\le 0.60/0.70/0.75$, min start distance $\ge 150\text{ px}$, frags near paths $\le 2/2/3$, winnable after 3 hits) must still pass!

---

## 4. Human Quality & Polish Checklist (~2 Minutes)

Subjective auditory and visual criteria that only a human reviewer can verify:

- [ ] **Sounds distinct and not harsh:** Procedural tones are clearly recognizable per event (chime for fragments, punchy hit sweep, bright victory fanfare) without acoustic distortion or clipping.
- [ ] **Animations smooth:** Visual fragment diamond bobbing ($\pm 3\text{ px}$) and particle bursts move fluidly at 60 FPS without stutter or tearing.
- [ ] **HUD readable:** Score, timer, fragment count, and best score remain legible at a glance during fast movement; "LOW TIME" badge is immediately noticeable at 14s.
- [ ] **Paths readable:** Faint dashed magenta patrol lines clearly signal drone trajectories and turning points before entering danger zones.
- [ ] **Screen-reader pass (if available):** NVDA / JAWS / VoiceOver announces sector entry, fragment collections, drone hits, and extraction online cleanly via the polite `#announcer` live region.
