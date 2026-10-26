/* ============================================================
   NEON RELIC: THE LAST SIGNAL — game.js (Day 3)
   Core game logic, state machine, physics, and canvas rendering
   ============================================================ */

/* ============================================================
   1. CONFIG and LEVELS
   ============================================================ */

var CONFIG = {
  ARENA_W: 960,
  ARENA_H: 600,

  PLAYER_SIZE: 28,
  PLAYER_SPEED: 220,
  PLAYER_START_X: 60,
  PLAYER_START_Y: 60,

  FRAGMENT_RADIUS: 10,
  FRAGMENT_SCORE: 100,

  DRONE_RADIUS: 15,

  PENALTY_SCORE: 50,
  PENALTY_TIME: 5,
  HIT_COOLDOWN: 1.5,

  MAX_DT: 0.05,
  LEVEL_BONUS: 250,

  EXTRACT_W: 70,
  EXTRACT_H: 70,
  EXTRACT_X: 870,
  EXTRACT_Y: 510,

  SAVE_KEY: 'neonRelic.v1',
  DEBUG_TIME: 20
};

var LEVELS = [
  /* ── Level 1: ENTRY PROTOCOL (EASY) ── */
  {
    id: 1,
    name: 'SECTOR 01: ENTRY GRID',
    displayName: "SECTOR 01: ENTRY PROTOCOL",
    title: "ENTRY PROTOCOL",
    difficulty: "EASY",
    objective: "Infiltrate simple security grid. Gather 6 energy fragments and reach the extraction zone.",
    instructions: "Use WASD / Arrows or Touch Joystick to move. Press Space / Shift or on-screen button to Dash.",
    timeLimit: 90,
    obstacles: [],
    hazards: [],
    powerups: [],
    fragments: [
      { x: 540, y: 420 },
      { x: 260, y: 540 },
      { x: 340, y: 100 },
      { x: 700, y: 180 },
      { x: 420, y: 300 },
      { x: 140, y: 420 }
    ],
    drones: [
      { patternType: 'A', x: 250, y: 230, speed: 100, vx: 100, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 600, y: 80, speed: 100, vx: 0, vy: 100, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 650, y: 350, speed: 100, vx: 0, vy: 0, loopX1: 620, loopY1: 330, loopX2: 820, loopY2: 480, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  },

  /* ── Level 2: TRANSIT HUB (EASY) ── */
  {
    id: 2,
    name: 'SECTOR 02: TRANSIT HUB',
    displayName: "SECTOR 02: TRANSIT HUB",
    title: "TRANSIT HUB",
    difficulty: "EASY",
    objective: "Navigate transit terminal columns. Plan routes around obstacles and patrol sweeps.",
    instructions: "Maneuver around security columns to break line-of-sight and plan safe fragment collection.",
    timeLimit: 95,
    obstacles: [
      {
            "x": 300,
            "y": 180,
            "w": 50,
            "h": 220,
            "type": "pillar"
      },
      {
            "x": 620,
            "y": 220,
            "w": 50,
            "h": 220,
            "type": "pillar"
      }
],
    hazards: [],
    powerups: [],
    fragments: [
      { x: 820, y: 300 },
      { x: 540, y: 420 },
      { x: 340, y: 100 },
      { x: 700, y: 180 },
      { x: 140, y: 420 },
      { x: 180, y: 340 },
      { x: 580, y: 60 }
    ],
    drones: [
      { patternType: 'A', x: 300, y: 230, speed: 115, vx: 115, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 750, y: 90, speed: 115, vx: 0, vy: 115, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 450, y: 320, speed: 115, vx: 0, vy: 0, loopX1: 450, loopY1: 320, loopX2: 650, loopY2: 460, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'A', x: 200, y: 530, speed: 115, vx: -115, vy: 0, bounds: { minX: 15, maxX: 780, minY: 15, maxY: 585 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  },

  /* ── Level 3: SECURITY BREACH (EASY) ── */
  {
    id: 3,
    name: 'SECTOR 03: POWER CONDUIT',
    displayName: "SECTOR 03: SECURITY BREACH",
    title: "SECURITY BREACH",
    difficulty: "EASY",
    objective: "Facility alarm triggered! Tighter patrol sweeps. Grab the OVERCLOCK speed boost pod.",
    instructions: "Collect the cyan OVERCLOCK pod for temporary +40% speed boost to outrun drones.",
    timeLimit: 100,
    obstacles: [
      {
            "x": 440,
            "y": 150,
            "w": 80,
            "h": 80,
            "type": "pillar"
      },
      {
            "x": 440,
            "y": 370,
            "w": 80,
            "h": 80,
            "type": "pillar"
      }
],
    hazards: [],
    powerups: [
      {
            "type": "OVERCLOCK",
            "x": 500,
            "y": 260,
            "radius": 12,
            "collected": false
      }
],
    fragments: [
      { x: 820, y: 300 },
      { x: 340, y: 100 },
      { x: 700, y: 180 },
      { x: 140, y: 420 },
      { x: 660, y: 540 },
      { x: 180, y: 340 },
      { x: 580, y: 60 },
      { x: 300, y: 460 }
    ],
    drones: [
      { patternType: 'A', x: 350, y: 230, speed: 125, vx: 125, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 780, y: 100, speed: 125, vx: 0, vy: 125, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 450, y: 300, speed: 125, vx: 0, vy: 0, loopX1: 450, loopY1: 300, loopX2: 650, loopY2: 450, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 250, y: 200, speed: 125, vx: 0, vy: -125, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  },

  /* ── Level 4: PRESSURE ZONE (MEDIUM) ── */
  {
    id: 4,
    name: "SECTOR 04: NEON DEPOT",
    displayName: "SECTOR 04: PRESSURE ZONE",
    title: "PRESSURE ZONE",
    difficulty: "MEDIUM",
    objective: "Central blast partition splits the sector. Navigate the breach passage under heavy pressure.",
    instructions: "A central barrier restricts east-west traversal. Time your passage through the center opening.",
    timeLimit: 105,
    obstacles: [
      {
            "x": 470,
            "y": 60,
            "w": 20,
            "h": 180,
            "type": "wall"
      },
      {
            "x": 470,
            "y": 340,
            "w": 20,
            "h": 180,
            "type": "wall"
      }
],
    hazards: [],
    powerups: [],
    fragments: [
      { x: 830, y: 280 },
      { x: 340, y: 100 },
      { x: 680, y: 180 },
      { x: 150, y: 400 },
      { x: 640, y: 520 },
      { x: 200, y: 320 },
      { x: 580, y: 70 },
      { x: 320, y: 470 },
      { x: 460, y: 220 }
    ],
    drones: [
      { patternType: 'A', x: 320, y: 210, speed: 135, vx: 135, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 760, y: 120, speed: 135, vx: 0, vy: 135, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 420, y: 320, speed: 135, vx: 0, vy: 0, loopX1: 420, loopY1: 320, loopX2: 620, loopY2: 460, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'A', x: 240, y: 530, speed: 135, vx: -135, vy: 0, bounds: { minX: 15, maxX: 800, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 260, y: 260, speed: 135, vx: 0, vy: 135, bounds: { minX: 15, maxX: 945, minY: 200, maxY: 560 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  },

  /* ── Level 5: HUNTER PROTOCOL (MEDIUM) ── */
  {
    id: 5,
    name: "SECTOR 05: SYNAPSE ARRAYS",
    displayName: "SECTOR 05: HUNTER PROTOCOL",
    title: "HUNTER PROTOCOL",
    difficulty: "MEDIUM",
    objective: "CRITICAL ALERT: Hunter drone deployed! Evade relentless pursuit using 4 cover pillars.",
    instructions: "Hunter drones actively pursue your position. Use pillars to block their path and Cyber Dash to evade.",
    timeLimit: 110,
    obstacles: [
      {
            "x": 260,
            "y": 160,
            "w": 60,
            "h": 60,
            "type": "pillar"
      },
      {
            "x": 640,
            "y": 160,
            "w": 60,
            "h": 60,
            "type": "pillar"
      },
      {
            "x": 260,
            "y": 380,
            "w": 60,
            "h": 60,
            "type": "pillar"
      },
      {
            "x": 640,
            "y": 380,
            "w": 60,
            "h": 60,
            "type": "pillar"
      }
],
    hazards: [],
    powerups: [
      {
            "type": "OVERCLOCK",
            "x": 450,
            "y": 270,
            "radius": 12,
            "collected": false
      }
],
    fragments: [
      { x: 820, y: 300 },
      { x: 340, y: 100 },
      { x: 700, y: 180 },
      { x: 140, y: 420 },
      { x: 660, y: 540 },
      { x: 180, y: 340 },
      { x: 580, y: 60 },
      { x: 100, y: 140 },
      { x: 180, y: 60 },
      { x: 300, y: 460 }
    ],
    drones: [
      { patternType: 'H', x: 350, y: 230, speed: 145, vx: 145, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 780, y: 100, speed: 145, vx: 0, vy: 145, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 450, y: 300, speed: 145, vx: 0, vy: 0, loopX1: 450, loopY1: 300, loopX2: 650, loopY2: 450, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 250, y: 200, speed: 145, vx: 0, vy: -145, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'D', x: 380, y: 360, speed: 145, vx: 102, vy: 102, bounds: { minX: 300, maxX: 420, minY: 320, maxY: 480 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  },

  /* ── Level 6: HAZARD SECTOR (MEDIUM) ── */
  {
    id: 6,
    name: "SECTOR 06: DATA VAULT",
    displayName: "SECTOR 06: HAZARD SECTOR",
    title: "HAZARD SECTOR",
    difficulty: "MEDIUM",
    objective: "Telegraphed laser hazard online! Yellow dashed beam warns of imminent lethal red pulse.",
    instructions: "When laser conduit flashes yellow with audio cue, prepare to clear the beam axis or dash through.",
    timeLimit: 115,
    obstacles: [
      {
            "x": 320,
            "y": 240,
            "w": 70,
            "h": 120,
            "type": "pillar"
      },
      {
            "x": 570,
            "y": 240,
            "w": 70,
            "h": 120,
            "type": "pillar"
      }
],
    hazards: [
      {
            "id": "h1",
            "x1": 480,
            "y1": 30,
            "x2": 480,
            "y2": 570,
            "warningDuration": 1.2,
            "activeDuration": 1.8,
            "idleDuration": 3.2,
            "timer": 0,
            "state": "IDLE"
      }
],
    powerups: [],
    fragments: [
      { x: 810, y: 290 },
      { x: 340, y: 90 },
      { x: 690, y: 170 },
      { x: 140, y: 410 },
      { x: 650, y: 530 },
      { x: 190, y: 330 },
      { x: 570, y: 70 },
      { x: 110, y: 150 },
      { x: 190, y: 70 },
      { x: 310, y: 450 },
      { x: 460, y: 210 }
    ],
    drones: [
      { patternType: 'A', x: 360, y: 220, speed: 155, vx: 155, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 770, y: 100, speed: 155, vx: 0, vy: 155, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 440, y: 310, speed: 155, vx: 0, vy: 0, loopX1: 440, loopY1: 310, loopX2: 640, loopY2: 450, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 260, y: 210, speed: 155, vx: 0, vy: -155, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'A', x: 220, y: 520, speed: 155, vx: -155, vy: 0, bounds: { minX: 15, maxX: 790, minY: 15, maxY: 585 } },
      { patternType: 'D', x: 390, y: 350, speed: 155, vx: 110, vy: 110, bounds: { minX: 300, maxX: 430, minY: 310, maxY: 470 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  },

  /* ── Level 7: COLLAPSE SEQUENCE (MEDIUM) ── */
  {
    id: 7,
    name: "SECTOR 07: SUB-ORBITAL RELAY",
    displayName: "SECTOR 07: COLLAPSE SEQUENCE",
    title: "COLLAPSE SEQUENCE",
    difficulty: "MEDIUM",
    objective: "Combined hazard alert: Hunter pursuit, intersecting patrols, and horizontal laser grid!",
    instructions: "Collect the SHIELD powerup to absorb an enemy hit or laser strike without penalty.",
    timeLimit: 120,
    obstacles: [
      {
            "x": 280,
            "y": 160,
            "w": 60,
            "h": 60,
            "type": "pillar"
      },
      {
            "x": 620,
            "y": 160,
            "w": 60,
            "h": 60,
            "type": "pillar"
      },
      {
            "x": 450,
            "y": 270,
            "w": 60,
            "h": 60,
            "type": "pillar"
      }
],
    hazards: [
      {
            "id": "h1",
            "x1": 70,
            "y1": 300,
            "x2": 890,
            "y2": 300,
            "warningDuration": 1.2,
            "activeDuration": 1.8,
            "idleDuration": 3.5,
            "timer": 1,
            "state": "IDLE"
      }
],
    powerups: [
      {
            "type": "SHIELD",
            "x": 480,
            "y": 140,
            "radius": 12,
            "collected": false
      }
],
    fragments: [
      { x: 800, y: 280 },
      { x: 330, y: 100 },
      { x: 680, y: 170 },
      { x: 130, y: 400 },
      { x: 640, y: 520 },
      { x: 180, y: 320 },
      { x: 560, y: 70 },
      { x: 110, y: 140 },
      { x: 180, y: 70 },
      { x: 300, y: 440 },
      { x: 450, y: 200 },
      { x: 740, y: 390 }
    ],
    drones: [
      { patternType: 'H', x: 370, y: 230, speed: 165, vx: 165, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 760, y: 110, speed: 165, vx: 0, vy: 165, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 430, y: 320, speed: 165, vx: 0, vy: 0, loopX1: 430, loopY1: 320, loopX2: 630, loopY2: 450, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 270, y: 220, speed: 165, vx: 0, vy: -165, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'A', x: 210, y: 530, speed: 165, vx: -165, vy: 0, bounds: { minX: 15, maxX: 800, minY: 15, maxY: 585 } },
      { patternType: 'D', x: 400, y: 360, speed: 165, vx: 117, vy: 117, bounds: { minX: 310, maxX: 440, minY: 320, maxY: 480 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  },

  /* ── Level 8: BLACKOUT (HARD) ── */
  {
    id: 8,
    name: "SECTOR 08: CYBER CHASM",
    displayName: "SECTOR 08: BLACKOUT",
    title: "BLACKOUT",
    difficulty: "HARD",
    objective: "Sector darkness blackout! Rely on localized spotlight radius and tactical radar blips.",
    instructions: "Vision is confined to your immediate radius. Track faint radar blips for drones and relics.",
    timeLimit: 125,
    isBlackout: true,
    obstacles: [
      {
            "x": 350,
            "y": 180,
            "w": 60,
            "h": 60,
            "type": "pillar"
      },
      {
            "x": 550,
            "y": 360,
            "w": 60,
            "h": 60,
            "type": "pillar"
      }
],
    hazards: [],
    powerups: [
      {
            "type": "CHRONO",
            "x": 450,
            "y": 270,
            "radius": 12,
            "collected": false
      }
],
    fragments: [
      { x: 810, y: 270 },
      { x: 350, y: 90 },
      { x: 670, y: 160 },
      { x: 130, y: 390 },
      { x: 630, y: 510 },
      { x: 170, y: 310 },
      { x: 550, y: 60 },
      { x: 100, y: 130 },
      { x: 170, y: 60 },
      { x: 290, y: 430 },
      { x: 440, y: 170 },
      { x: 680, y: 380 },
      { x: 500, y: 380 }
    ],
    drones: [
      { patternType: 'A', x: 380, y: 240, speed: 175, vx: 175, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 750, y: 100, speed: 175, vx: 0, vy: 175, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 420, y: 310, speed: 175, vx: 0, vy: 0, loopX1: 420, loopY1: 310, loopX2: 620, loopY2: 440, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 280, y: 230, speed: 175, vx: 0, vy: -175, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'A', x: 200, y: 520, speed: 175, vx: -175, vy: 0, bounds: { minX: 15, maxX: 810, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 680, y: 240, speed: 175, vx: 0, vy: 0, loopX1: 670, loopY1: 220, loopX2: 830, loopY2: 340, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'D', x: 410, y: 370, speed: 175, vx: 124, vy: 124, bounds: { minX: 320, maxX: 450, minY: 330, maxY: 480 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  },

  /* ── Level 9: OVERLOAD (HARD) ── */
  {
    id: 9,
    name: "SECTOR 09: MAINFRAME NEXUS",
    displayName: "SECTOR 09: OVERLOAD",
    title: "OVERLOAD",
    difficulty: "HARD",
    objective: "Extreme alert: Dual Hunter drones and cross-hair laser grid conduits online!",
    instructions: "Two hunters track your position simultaneously while crossing lasers pulse. Use Cyber Dash precisely.",
    timeLimit: 130,
    obstacles: [
      {
            "x": 250,
            "y": 150,
            "w": 50,
            "h": 140,
            "type": "pillar"
      },
      {
            "x": 660,
            "y": 150,
            "w": 50,
            "h": 140,
            "type": "pillar"
      },
      {
            "x": 450,
            "y": 320,
            "w": 60,
            "h": 140,
            "type": "pillar"
      }
],
    hazards: [
      {
            "id": "h1",
            "x1": 480,
            "y1": 30,
            "x2": 480,
            "y2": 570,
            "warningDuration": 1.2,
            "activeDuration": 1.8,
            "idleDuration": 3.5,
            "timer": 0,
            "state": "IDLE"
      },
      {
            "id": "h2",
            "x1": 70,
            "y1": 300,
            "x2": 890,
            "y2": 300,
            "warningDuration": 1.2,
            "activeDuration": 1.8,
            "idleDuration": 3.5,
            "timer": 1.8,
            "state": "IDLE"
      }
],
    powerups: [
      {
            "type": "OVERCLOCK",
            "x": 480,
            "y": 100,
            "radius": 12,
            "collected": false
      },
      {
            "type": "SHIELD",
            "x": 480,
            "y": 500,
            "radius": 12,
            "collected": false
      }
],
    fragments: [
      { x: 800, y: 260 },
      { x: 320, y: 80 },
      { x: 660, y: 150 },
      { x: 120, y: 380 },
      { x: 620, y: 500 },
      { x: 160, y: 300 },
      { x: 540, y: 50 },
      { x: 110, y: 140 },
      { x: 160, y: 50 },
      { x: 280, y: 420 },
      { x: 430, y: 180 },
      { x: 720, y: 370 },
      { x: 490, y: 370 },
      { x: 360, y: 320 }
    ],
    drones: [
      { patternType: 'H', x: 390, y: 250, speed: 185, vx: 185, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'H', x: 740, y: 90, speed: 185, vx: 0, vy: 185, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 410, y: 300, speed: 185, vx: 0, vy: 0, loopX1: 410, loopY1: 300, loopX2: 610, loopY2: 430, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 290, y: 240, speed: 185, vx: 0, vy: -185, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'A', x: 190, y: 510, speed: 185, vx: -185, vy: 0, bounds: { minX: 15, maxX: 820, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 670, y: 230, speed: 185, vx: 0, vy: 0, loopX1: 660, loopY1: 210, loopX2: 820, loopY2: 330, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'D', x: 420, y: 380, speed: 185, vx: 131, vy: 131, bounds: { minX: 330, maxX: 460, minY: 340, maxY: 480 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  },

  /* ── Level 10: CORE BREACH (HARD) ── */
  {
    id: 10,
    name: 'SECTOR 10: OVERLORD SINGULARITY',
    displayName: "SECTOR 10: CORE BREACH",
    title: "CORE BREACH",
    difficulty: "HARD",
    objective: "FINAL SHOWDOWN: Overlord Neural Core. Survive 3 combat phases, dodge expanding shockwaves, and transmit The Last Signal!",
    instructions: "Phase 1: Outer Firewall. Phase 2 (at 6 frags): Radial shockwaves expand from core — use Dash to bypass waves! Phase 3 (at 11 frags): Overload!",
    timeLimit: 140,
    isBoss: true,
    obstacles: [
      {
            "x": 440,
            "y": 260,
            "w": 80,
            "h": 80,
            "type": "core"
      }
],
    hazards: [],
    powerups: [
      {
            "type": "SHIELD",
            "x": 200,
            "y": 270,
            "radius": 12,
            "collected": false
      },
      {
            "type": "CHRONO",
            "x": 760,
            "y": 270,
            "radius": 12,
            "collected": false
      }
],
    fragments: [
      { x: 800, y: 190 },
      { x: 370, y: 70 },
      { x: 650, y: 140 },
      { x: 120, y: 370 },
      { x: 610, y: 490 },
      { x: 150, y: 320 },
      { x: 530, y: 50 },
      { x: 110, y: 140 },
      { x: 150, y: 50 },
      { x: 270, y: 410 },
      { x: 420, y: 170 },
      { x: 710, y: 360 },
      { x: 480, y: 360 },
      { x: 350, y: 310 },
      { x: 600, y: 320 }
    ],
    drones: [
      { patternType: 'A', x: 400, y: 250, speed: 195, vx: 195, vy: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 730, y: 80, speed: 195, vx: 0, vy: 195, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 400, y: 290, speed: 195, vx: 0, vy: 0, loopX1: 400, loopY1: 290, loopX2: 600, loopY2: 420, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 300, y: 250, speed: 195, vx: 0, vy: -195, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'A', x: 180, y: 500, speed: 195, vx: -195, vy: 0, bounds: { minX: 15, maxX: 830, minY: 15, maxY: 585 } },
      { patternType: 'C', x: 660, y: 220, speed: 195, vx: 0, vy: 0, loopX1: 650, loopY1: 200, loopX2: 810, loopY2: 320, loopPhase: 0, bounds: { minX: 15, maxX: 945, minY: 15, maxY: 585 } },
      { patternType: 'B', x: 500, y: 150, speed: 195, vx: 0, vy: 195, bounds: { minX: 15, maxX: 945, minY: 120, maxY: 500 } },
      { patternType: 'D', x: 430, y: 390, speed: 195, vx: 138, vy: 138, bounds: { minX: 340, maxX: 470, minY: 350, maxY: 480 } }
    ],
    extraction: { x: CONFIG.EXTRACT_X, y: CONFIG.EXTRACT_Y, w: CONFIG.EXTRACT_W, h: CONFIG.EXTRACT_H }
  }
];

/* ============================================================
   2. SAVE / PERSISTENCE (Schema v1)
   ============================================================ */

var saveRecord = {
  version: 1,
  bestScore: 0,
  settings: {
    muted: false,
    volume: 0.5,
    effects: 'auto',
    difficulty: 'normal'
  }
};
var storageAvailable = true;

var selectedStartLevel = 0;
var activePenaltyScore = CONFIG.PENALTY_SCORE;
var activePenaltyTime  = CONFIG.PENALTY_TIME;
var activeHitCooldown  = CONFIG.HIT_COOLDOWN;

/* ── New Gameplay Subsystems State ── */
var dashState = {
  active: false,
  timer: 0,
  cooldown: 0,
  duration: 0.18,
  maxCooldown: 2.0,
  speedMult: 2.6
};

var currentObstacles = [];
var currentHazards   = [];
var currentPowerups  = [];
var activePowerups   = {
  overclockTimer: 0,
  shieldActive: false,
  chronoTimer: 0
};

var bossState = {
  active: false,
  phase: 1,
  x: 480,
  y: 300,
  radius: 42,
  rotation: 0,
  shieldAngle: 0,
  shockwaveTimer: 0,
  shockwaves: []
};

var DIFF_DESCRIPTIONS = {
  basic: 'Generous countdown timer (+25%), reduced drone velocity (-20%), and lower collision penalty (-25 pts / -3s).',
  normal: 'Standard survival challenge with balanced drone speed, 5s / -50 pts penalties, and default timers.',
  hard: 'High intensity survival! Fast drone patrols (+15%), tight countdown timers (-15%), harsh hit penalties (-75 pts / -6s).'
};

function setDifficulty(diff) {
  if (['basic', 'normal', 'hard'].indexOf(diff) === -1) diff = 'normal';
  if (!saveRecord.settings) saveRecord.settings = {};
  saveRecord.settings.difficulty = diff;
  saveData();

  var diffBtns = document.querySelectorAll('.diff-btn');
  for (var i = 0; i < diffBtns.length; i++) {
    var b = diffBtns[i];
    var active = b.getAttribute('data-diff') === diff;
    if (active) {
      b.classList.add('active');
      b.setAttribute('aria-checked', 'true');
    } else {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    }
  }

  var diffCards = document.querySelectorAll('.diff-card');
  for (var c = 0; c < diffCards.length; c++) {
    var card = diffCards[c];
    var isCardActive = card.getAttribute('data-diff') === diff;
    if (isCardActive) {
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');
    } else {
      card.classList.remove('active');
      card.setAttribute('aria-checked', 'false');
    }
  }

  var hudDiff = document.getElementById('hud-diff');
  if (hudDiff) {
    var label = diff === 'normal' ? 'MEDIUM' : diff.toUpperCase();
    hudDiff.textContent = label;
    hudDiff.className = 'hud-diff-tag ' + diff;
  }

  var pauseDiffBadge = document.getElementById('pause-diff-badge');
  if (pauseDiffBadge) {
    var pauseLabel = diff === 'normal' ? 'MEDIUM' : diff.toUpperCase();
    pauseDiffBadge.textContent = pauseLabel;
    pauseDiffBadge.className = 'sector-diff-badge ' + (diff === 'basic' ? 'diff-easy' : (diff === 'hard' ? 'diff-hard' : 'diff-normal'));
  }

  var descEl = document.getElementById('diff-desc') || document.getElementById('diff-description');
  if (descEl && DIFF_DESCRIPTIONS[diff]) {
    descEl.textContent = DIFF_DESCRIPTIONS[diff];
  }
  updateHUD();
}

function updateSectorPillsUI() {
  var unlockedThreshold = Math.max(1, (saveRecord && saveRecord.unlockedLevel) || 1);
  var completedList = (saveRecord && saveRecord.completedLevels) || [];
  var pills = document.querySelectorAll('.sector-pill');

  for (var i = 0; i < pills.length; i++) {
    var p = pills[i];
    var sIdx = parseInt(p.getAttribute('data-sector'), 10);
    var isLocked = !DEBUG_MODE && (sIdx + 1 > unlockedThreshold);
    var isCompleted = completedList.indexOf(sIdx) !== -1;

    if (isLocked) {
      p.classList.add('locked');
      p.setAttribute('aria-disabled', 'true');
    } else {
      p.classList.remove('locked');
      p.removeAttribute('aria-disabled');
    }

    if (isCompleted) {
      p.classList.add('completed');
    } else {
      p.classList.remove('completed');
    }
  }
}

function setSelectedSector(sectorIdx) {
  var unlockedThreshold = Math.max(1, (saveRecord && saveRecord.unlockedLevel) || 1);
  if (!DEBUG_MODE && (sectorIdx + 1 > unlockedThreshold)) {
    announce('Sector ' + (sectorIdx + 1) + ' locked. Clear Sector ' + unlockedThreshold + ' to unlock.');
    return;
  }

  selectedStartLevel = Math.max(0, Math.min(LEVELS.length - 1, sectorIdx));
  var pills = document.querySelectorAll('.sector-pill');
  for (var i = 0; i < pills.length; i++) {
    var p = pills[i];
    var idx = parseInt(p.getAttribute('data-sector'), 10);
    if (idx === selectedStartLevel) {
      p.classList.add('active');
      p.setAttribute('aria-pressed', 'true');
    } else {
      p.classList.remove('active');
      p.setAttribute('aria-pressed', 'false');
    }
  }

  var btnStart = document.getElementById('btn-start');
  if (btnStart) {
    var numStr = (selectedStartLevel + 1 < 10 ? '0' : '') + (selectedStartLevel + 1);
    btnStart.textContent = 'DEPLOY TO SECTOR ' + numStr;
  }

  // Update Sector Info Card in Start Screen
  var lvl = LEVELS[selectedStartLevel];
  if (lvl) {
    var titleEl = document.getElementById('sector-card-title');
    if (titleEl) titleEl.textContent = lvl.displayName || lvl.name;

    var diffEl = document.getElementById('sector-card-diff');
    if (diffEl) {
      diffEl.textContent = lvl.difficulty || 'NORMAL';
      diffEl.className = 'sector-diff-badge ' + (lvl.difficulty === 'EASY' ? 'diff-easy' : (lvl.difficulty === 'HARD' ? 'diff-hard' : 'diff-medium'));
    }

    var descEl = document.getElementById('sector-card-desc');
    if (descEl) descEl.textContent = lvl.objective || '';
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    var root = document.documentElement;
    if (root.requestFullscreen) {
      root.requestFullscreen().catch(function () {});
    } else if (root.webkitRequestFullscreen) {
      root.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function updateFullscreenUI() {
  var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  var fsBtns = document.querySelectorAll('.btn-toggle-fs, #btn-fullscreen');
  for (var i = 0; i < fsBtns.length; i++) {
    var b = fsBtns[i];
    b.textContent = isFs ? '🗗 EXIT FS' : '⛶ FULLSCREEN';
    b.setAttribute('aria-label', isFs ? 'Exit Fullscreen' : 'Enter Fullscreen');
  }
  var touchFs = document.getElementById('touch-btn-fullscreen') || document.getElementById('touch-fs');
  if (touchFs) {
    var iconEl = touchFs.querySelector('.touch-icon');
    if (iconEl) {
      iconEl.textContent = isFs ? '🗗' : '⛶';
    } else {
      touchFs.textContent = isFs ? '🗗' : '⛶';
    }
    touchFs.setAttribute('aria-label', isFs ? 'Exit Fullscreen' : 'Enter Fullscreen');
  }
}

function loadSave() {
  try {
    if (typeof localStorage === 'undefined') {
      storageAvailable = false;
      return;
    }
    var raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return;

    if (typeof NeonLogic !== 'undefined' && NeonLogic.sanitizeSave) {
      saveRecord = NeonLogic.sanitizeSave(raw);
    } else {
      var parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        if (typeof parsed.bestScore === 'number' && isFinite(parsed.bestScore) && parsed.bestScore >= 0) {
          saveRecord.bestScore = Math.floor(parsed.bestScore);
        }
        if (parsed.settings && typeof parsed.settings === 'object') {
          if (typeof parsed.settings.muted === 'boolean') saveRecord.settings.muted = parsed.settings.muted;
          if (typeof parsed.settings.volume === 'number' && isFinite(parsed.settings.volume)) {
            saveRecord.settings.volume = Math.max(0, Math.min(1, parsed.settings.volume));
          }
          if (['auto', 'full', 'reduced'].indexOf(parsed.settings.effects) !== -1) {
            saveRecord.settings.effects = parsed.settings.effects;
          }
          if (['basic', 'normal', 'hard'].indexOf(parsed.settings.difficulty) !== -1) {
            saveRecord.settings.difficulty = parsed.settings.difficulty;
          }
        }
      }
    }
  } catch (e) {
    storageAvailable = false;
    saveRecord = { version: 1, bestScore: 0, settings: { muted: false, volume: 0.5, effects: 'auto', difficulty: 'normal' } };
  }
}

function saveData() {
  if (debugScoreModified) return;
  try {
    if (typeof localStorage === 'undefined') {
      storageAvailable = false;
      return;
    }
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(saveRecord));
  } catch (e) {
    storageAvailable = false;
  }
}

function resetBest() {
  if (!confirm('Reset best score to 0?')) return;
  saveRecord.bestScore = 0;
  saveData();
  updateStartScreen();
  updateHUD();
  announce('Best score reset to zero.');
}

/* ============================================================
   3. STATE & STATS
   ============================================================ */

var gameState = 'START';

var VALID_TRANSITIONS = (typeof NeonLogic !== 'undefined' && NeonLogic.VALID_TRANSITIONS) || {
  START:          ['PLAYING'],
  PLAYING:        ['PAUSED', 'LEVEL_COMPLETE', 'WON', 'LOST', 'PLAYING', 'ERROR'],
  PAUSED:         ['PLAYING', 'START', 'ERROR'],
  LEVEL_COMPLETE: ['PLAYING', 'START', 'ERROR'],
  WON:            ['PLAYING', 'START', 'ERROR'],
  LOST:           ['PLAYING', 'START', 'ERROR'],
  ERROR:          ['PLAYING', 'START']
};

function canTransition(from, to) {
  if (typeof NeonLogic !== 'undefined' && NeonLogic.canTransition) {
    return NeonLogic.canTransition(from, to);
  }
  var allowed = VALID_TRANSITIONS[from];
  return !!(allowed && allowed.indexOf(to) !== -1);
}

var currentLevel = 0;

var player = {};
var fragments = [];
var drones = [];
var extraction = { active: false, pulseT: 0 };

var score = 0;
var timeRemaining = 0;
var elapsedPlayTime = 0;
var fragmentsCollected = 0;
var levelBonusAwarded = false;

var hitCooldownTimer = 0;
var banner = null;
var showHint = true;

var rafHandle = null;
var lastTimestamp = null;
var totalFrames = 0;

var stats = {
  loopStarts: 0
};

var DEBUG_MODE = (typeof window !== 'undefined' && window.location && window.location.search.indexOf('debug') !== -1);

// Debug overrides
var debugStartLevel    = undefined;
var debugTimeOverride  = 0;
var debugScoreStart    = 0;
var debugScoreModified = false;
var debugFpsCap        = 0; // 0 = uncapped (normal RAF)
var debugFps = 0, debugFrameCount = 0, debugFpsTimer = 0;

// Run record detection
var runStartBest = 0;

/* ============================================================
   4. ACCESSIBILITY: Live Announcer & Focus Trap
   ============================================================ */

var lastAnnouncementTime = 0;
var ANNOUNCE_THROTTLE_MS = 400;
var pendingAnnounceText = '';
var announceTimer = null;

function announce(text, urgent) {
  if (urgent) {
    if (announceTimer) { clearTimeout(announceTimer); announceTimer = null; }
    pendingAnnounceText = '';
    lastAnnouncementTime = Date.now();
    doAnnounce(text);
    return;
  }

  var now = Date.now();
  if (now - lastAnnouncementTime < ANNOUNCE_THROTTLE_MS) {
    if (typeof NeonLogic !== 'undefined' && NeonLogic.joinAnnouncements) {
      pendingAnnounceText = NeonLogic.joinAnnouncements(pendingAnnounceText, text);
    } else {
      pendingAnnounceText = pendingAnnounceText ? (pendingAnnounceText + '. ' + text) : text;
    }
    if (!announceTimer) {
      announceTimer = setTimeout(function () {
        announceTimer = null;
        lastAnnouncementTime = Date.now();
        var msg = pendingAnnounceText;
        pendingAnnounceText = '';
        doAnnounce(msg);
      }, ANNOUNCE_THROTTLE_MS - (now - lastAnnouncementTime));
    }
    return;
  }

  lastAnnouncementTime = now;
  pendingAnnounceText = '';
  doAnnounce(text);
}

var lastAnnouncedText = '';

function doAnnounce(text) {
  if (!text || text === lastAnnouncedText) return;
  lastAnnouncedText = text;
  var el = document.getElementById('announcer');
  if (!el) return;
  el.textContent = '';
  // Force screen reader update
  setTimeout(function () {
    el.textContent = text;
  }, 20);
}

function manageFocusForOverlay(screenName) {
  var hud = document.getElementById('hud');
  var gameCanvas = document.getElementById('game-canvas');
  var container = document.getElementById('game-container');

  if (screenName === null) {
    // Overlay closed
    if (hud) {
      hud.removeAttribute('inert');
      hud.removeAttribute('aria-hidden');
    }
    if (gameCanvas) {
      gameCanvas.removeAttribute('inert');
      gameCanvas.removeAttribute('aria-hidden');
    }
    if (container) container.focus();
    return;
  }

  // Overlay opened — trap focus / inert background elements (do NOT make canvasWrapper inert as it contains #overlay)
  if (hud) {
    hud.setAttribute('inert', '');
    hud.setAttribute('aria-hidden', 'true');
  }
  if (gameCanvas) {
    gameCanvas.setAttribute('inert', '');
    gameCanvas.setAttribute('aria-hidden', 'true');
  }

  var primaryBtn = null;
  switch (screenName) {
    case 'start':          primaryBtn = document.getElementById('btn-menu-start') || document.getElementById('btn-start'); break;
    case 'difficulty':     primaryBtn = document.getElementById('btn-start'); break;
    case 'settings':       primaryBtn = document.getElementById('btn-settings-back'); break;
    case 'controls':       primaryBtn = document.getElementById('btn-controls-back'); break;
    case 'quit':           primaryBtn = document.getElementById('btn-quit-cancel'); break;
    case 'paused':         primaryBtn = document.getElementById('btn-resume'); break;
    case 'level-complete': primaryBtn = document.getElementById('btn-next-level'); break;
    case 'won':            primaryBtn = document.getElementById('btn-restart-won'); break;
    case 'lost':           primaryBtn = document.getElementById('btn-restart-lost'); break;
    case 'error':          primaryBtn = document.getElementById('btn-restart-error'); break;
  }
  if (primaryBtn) {
    try { primaryBtn.focus(); } catch (e) {}
  }
}

/* ============================================================
   4b. ERROR BOUNDARY
   ============================================================ */

function handleFatalError(err) {
  if (DEBUG_MODE) {
    console.error('[FATAL ERROR BOUNDARY]', err);
  }
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle);
    rafHandle = null;
  }
  if (typeof audio !== 'undefined') {
    try { audio.suspend(); } catch (e) {}
  }
  gameState = 'ERROR';
  showHUD(false);
  showOverlay('error');
  manageFocusForOverlay('error');
  announce('A system error occurred. Press restart to try again.', true);
}

if (typeof window !== 'undefined') {
  window.onerror = function (msg, url, line, col, err) {
    handleFatalError(err || msg);
    return false;
  };
  window.addEventListener('unhandledrejection', function (e) {
    handleFatalError(e.reason || e);
  });
}

/* ============================================================
   5. INIT & CANVAS SETUP
   ============================================================ */

var canvas, ctx, canvasWrapper;

function init() {
  canvas        = document.getElementById('game-canvas');
  ctx           = canvas ? canvas.getContext('2d') : null;
  canvasWrapper = document.getElementById('canvas-wrapper');

  if (!canvas || !ctx) {
    console.error('NEON RELIC: Canvas context not available.');
    return;
  }

  setupCanvas();
  loadSave();

  // Apply saved audio setting and volume
  if (typeof audio !== 'undefined') {
    audio.setMuted(saveRecord.settings.muted);
    if (typeof saveRecord.settings.volume === 'number') {
      audio.setVolume(saveRecord.settings.volume);
    }
    audio.updateUI();
  }

  // Apply saved effects setting
  if (typeof fx !== 'undefined' && saveRecord.settings.effects) {
    fx.setEffectsMode(saveRecord.settings.effects);
  }

  // Populate settings panel controls from saveRecord
  var settingVol = document.getElementById('setting-volume');
  if (settingVol) {
    settingVol.value = Math.round((saveRecord.settings.volume !== undefined ? saveRecord.settings.volume : 0.5) * 100);
  }
  var settingFx = document.getElementById('setting-effects');
  if (settingFx) {
    settingFx.value = saveRecord.settings.effects || 'auto';
  }

  // Parse debug URL parameters
  if (DEBUG_MODE) {
    var search = window.location.search;

    var levelMatch = search.match(/[?&]level=(\d+)/);
    if (levelMatch) {
      var lv = parseInt(levelMatch[1], 10) - 1;
      debugStartLevel = Math.max(0, Math.min(LEVELS.length - 1, lv));
    }

    var timeMatch = search.match(/[?&]time=(\d+)/);
    if (timeMatch) {
      debugTimeOverride = Math.max(1, parseInt(timeMatch[1], 10));
    }

    var scoreMatch = search.match(/[?&]score=(\d+)/);
    if (scoreMatch) {
      debugScoreStart = Math.max(0, parseInt(scoreMatch[1], 10));
    }

    var fpsMatch = search.match(/[?&]fpscap=(\d+)/);
    if (fpsMatch) {
      debugFpsCap = Math.max(10, Math.min(60, parseInt(fpsMatch[1], 10)));
    }

    console.info('[DEBUG] Active. Level:', debugStartLevel,
      '| Time override:', debugTimeOverride, '| Score start:', debugScoreStart,
      '| FPS Cap:', debugFpsCap);
  }

  registerEventListeners();
  initTouchControls();

  if (typeof window !== 'undefined') {
    if (DEBUG_MODE) validateLevels();
    Object.defineProperty(window, '__game', {
      configurable: true,
      get: function () {
        return {
          state: gameState,
          score: score,
          currentLevel: currentLevel,
          timeRemaining: timeRemaining,
          elapsedPlayTime: elapsedPlayTime,
          player: player,
          fragments: fragments,
          drones: drones,
          extraction: extraction,
          saveRecord: saveRecord,
          CONFIG: CONFIG,
          LEVELS: LEVELS,
          audio: (typeof audio !== 'undefined') ? audio : null,
          fx: (typeof fx !== 'undefined') ? fx : null,
          stats: stats,
          circleVsRect: circleVsRect,
          rectVsRect: rectVsRect,
          addScore: addScore,
          validateLevels: validateLevels,
          setState: setState,
          startNewRun: startNewRun,
          loadLevel: loadLevel,
          setDifficulty: setDifficulty,
          setSelectedSector: setSelectedSector,
          toggleFullscreen: toggleFullscreen,
          init: init,
          touchState: touchState,
          resetTouchControls: resetTouchControls
        };
      }
    });
  }

  buildInitialGameObjects();
  showOverlay('start');
  updateStartScreen();
  setDifficulty((saveRecord && saveRecord.settings && saveRecord.settings.difficulty) || 'normal');
  setSelectedSector(selectedStartLevel);
  updateFullscreenUI();
  if (typeof audio !== 'undefined') audio.updateUI();
  startLoop();
}

function setupCanvas() {
  // Cap devicePixelRatio at 2 for optimal performance
  var rawDpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  var dpr = Math.min(2, rawDpr);

  canvas.width  = CONFIG.ARENA_W * dpr;
  canvas.height = CONFIG.ARENA_H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Responsive scaling to fit window width while preserving 960x600 aspect ratio
  var winW = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : CONFIG.ARENA_W;
  var maxW = Math.max(300, Math.min(CONFIG.ARENA_W, winW - 16));
  var displayW = maxW;
  var displayH = Math.round(displayW * (CONFIG.ARENA_H / CONFIG.ARENA_W));

  canvas.style.width  = displayW + 'px';
  canvas.style.height = displayH + 'px';

  if (canvasWrapper) {
    canvasWrapper.style.width  = displayW + 'px';
    canvasWrapper.style.height = displayH + 'px';
  }
  var hud = document.getElementById('hud');
  if (hud) hud.style.maxWidth = displayW + 'px';
}

var resizeDebounceTimer = null;
function onWindowResize() {
  if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
  resizeDebounceTimer = setTimeout(function () {
    resizeDebounceTimer = null;
    setupCanvas();
  }, 100);
}

/* ============================================================
   6. INPUT (Controls hardening)
   ============================================================ */

var keys = {};

function registerEventListeners() {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup',   onKeyUp);
  window.addEventListener('blur',      onWindowBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide',  saveData);
  window.addEventListener('resize',    onWindowResize);

  // ── 1. MAIN MENU buttons ──
  var btnMenuStart = document.getElementById('btn-menu-start');
  if (btnMenuStart) {
    btnMenuStart.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      showOverlay('difficulty');
      manageFocusForOverlay('difficulty');
      announce('Difficulty and Sector selection.', true);
    });
  }

  var btnMenuSettings = document.getElementById('btn-menu-settings');
  if (btnMenuSettings) {
    btnMenuSettings.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      overlaySource = 'start';
      updateSettingsUI();
      showOverlay('settings');
      manageFocusForOverlay('settings');
      announce('Settings menu.', true);
    });
  }

  var btnMenuControls = document.getElementById('btn-menu-controls');
  if (btnMenuControls) {
    btnMenuControls.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      showOverlay('controls');
      manageFocusForOverlay('controls');
      announce('Tactical directives and controls guide.', true);
    });
  }

  var btnMenuQuit = document.getElementById('btn-menu-quit');
  if (btnMenuQuit) {
    btnMenuQuit.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      overlaySource = 'start';
      showOverlay('quit');
      manageFocusForOverlay('quit');
      announce('Quit confirmation prompt.', true);
    });
  }

  // ── 2. DIFFICULTY SELECTION screen buttons ──
  var btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      if (gameState === 'START') startNewRun();
    });
  }

  var btnDiffBack = document.getElementById('btn-diff-back');
  if (btnDiffBack) {
    btnDiffBack.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      showOverlay('start');
      manageFocusForOverlay('start');
      announce('Returned to main menu.', true);
    });
  }

  // Difficulty cards interaction
  var diffCards = document.querySelectorAll('.diff-card');
  for (var dc = 0; dc < diffCards.length; dc++) {
    diffCards[dc].addEventListener('click', function () {
      var d = this.getAttribute('data-diff');
      if (d) {
        if (typeof audio !== 'undefined') audio.play('click');
        setDifficulty(d);
      }
    });
    diffCards[dc].addEventListener('keydown', function (e) {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (e.preventDefault) e.preventDefault();
        var d = this.getAttribute('data-diff');
        if (d) {
          if (typeof audio !== 'undefined') audio.play('click');
          setDifficulty(d);
        }
      }
    });
  }

  // Difficulty selection buttons (child buttons or standalone)
  var diffBtns = document.querySelectorAll('.diff-btn');
  for (var db = 0; db < diffBtns.length; db++) {
    diffBtns[db].addEventListener('click', function (e) {
      if (e && e.stopPropagation) e.stopPropagation();
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      var d = this.getAttribute('data-diff');
      setDifficulty(d);
    });
  }

  // ── 3. SETTINGS screen buttons & inputs ──
  var btnPauseSettings = document.getElementById('btn-pause-settings');
  if (btnPauseSettings) {
    btnPauseSettings.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      overlaySource = 'paused';
      updateSettingsUI();
      showOverlay('settings');
      manageFocusForOverlay('settings');
      announce('Settings menu opened from pause.', true);
    });
  }

  var btnSettingsBack = document.getElementById('btn-settings-back');
  if (btnSettingsBack) {
    btnSettingsBack.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      var targetScreen = overlaySource || 'start';
      showOverlay(targetScreen);
      manageFocusForOverlay(targetScreen);
      announce('Returned to ' + (targetScreen === 'paused' ? 'pause menu' : 'main menu') + '.', true);
    });
  }

  var btnSettingsDefaults = document.getElementById('btn-settings-defaults');
  if (btnSettingsDefaults) {
    btnSettingsDefaults.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      saveRecord.settings.volume = 0.5;
      saveRecord.settings.music = 0.6;
      saveRecord.settings.sfx = 0.7;
      saveRecord.settings.muted = false;
      saveRecord.settings.effects = 'auto';
      saveRecord.settings.shake = true;
      saveRecord.settings.crt = true;
      if (typeof audio !== 'undefined') {
        audio.setVolume(0.5);
        audio.setMuted(false);
      }
      if (typeof fx !== 'undefined') {
        fx.setEffectsMode('auto');
      }
      saveData();
      updateSettingsUI();
      announce('Settings restored to defaults.', true);
    });
  }

  var btnResetBest = document.getElementById('btn-reset-best');
  if (btnResetBest) {
    btnResetBest.addEventListener('click', function (e) {
      if (e && e.preventDefault) e.preventDefault();
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      resetBest();
      var settingsBest = document.getElementById('settings-best-val');
      if (settingsBest) settingsBest.textContent = '0';
    });
  }

  var settingVol = document.getElementById('setting-volume');
  if (settingVol) {
    settingVol.addEventListener('input', function () {
      var vol = parseFloat(this.value) / 100;
      saveRecord.settings.volume = Math.max(0, Math.min(1, vol));
      if (typeof audio !== 'undefined') audio.setVolume(vol);
      var valDisplay = document.getElementById('volume-val');
      if (valDisplay) valDisplay.textContent = Math.round(vol * 100) + '%';
      saveData();
    });
  }

  var settingMusic = document.getElementById('setting-music');
  if (settingMusic) {
    settingMusic.addEventListener('input', function () {
      var val = parseFloat(this.value) / 100;
      if (!saveRecord.settings) saveRecord.settings = {};
      saveRecord.settings.music = Math.max(0, Math.min(1, val));
      var valDisplay = document.getElementById('music-val');
      if (valDisplay) valDisplay.textContent = Math.round(val * 100) + '%';
      saveData();
    });
  }

  var settingSfx = document.getElementById('setting-sfx');
  if (settingSfx) {
    settingSfx.addEventListener('input', function () {
      var val = parseFloat(this.value) / 100;
      if (!saveRecord.settings) saveRecord.settings = {};
      saveRecord.settings.sfx = Math.max(0, Math.min(1, val));
      var valDisplay = document.getElementById('sfx-val');
      if (valDisplay) valDisplay.textContent = Math.round(val * 100) + '%';
      saveData();
    });
  }

  var btnSettingMute = document.getElementById('btn-setting-mute');
  if (btnSettingMute) {
    btnSettingMute.addEventListener('click', function () {
      this.blur();
      toggleMute();
      updateSettingsUI();
    });
  }

  var settingFx = document.getElementById('setting-effects');
  if (settingFx) {
    settingFx.addEventListener('change', function () {
      var mode = this.value;
      if (['auto', 'full', 'reduced'].indexOf(mode) !== -1) {
        saveRecord.settings.effects = mode;
        if (typeof fx !== 'undefined') fx.setEffectsMode(mode);
        saveData();
      }
    });
  }

  var btnSettingShake = document.getElementById('btn-setting-shake');
  if (btnSettingShake) {
    btnSettingShake.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      if (!saveRecord.settings) saveRecord.settings = {};
      saveRecord.settings.shake = !(saveRecord.settings.shake !== false);
      saveData();
      updateSettingsUI();
    });
  }

  var btnSettingCrt = document.getElementById('btn-setting-crt');
  if (btnSettingCrt) {
    btnSettingCrt.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      if (!saveRecord.settings) saveRecord.settings = {};
      saveRecord.settings.crt = !(saveRecord.settings.crt !== false);
      saveData();
      updateSettingsUI();
    });
  }

  // ── 4. CONTROLS screen buttons ──
  var btnControlsBack = document.getElementById('btn-controls-back');
  if (btnControlsBack) {
    btnControlsBack.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      showOverlay('start');
      manageFocusForOverlay('start');
      announce('Returned to main menu.', true);
    });
  }

  // ── 5. QUIT screen buttons ──
  var btnQuitCancel = document.getElementById('btn-quit-cancel');
  if (btnQuitCancel) {
    btnQuitCancel.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      var targetScreen = overlaySource || 'start';
      showOverlay(targetScreen);
      manageFocusForOverlay(targetScreen);
      announce('Quit cancelled.', true);
    });
  }

  var btnQuitConfirm = document.getElementById('btn-quit-confirm');
  if (btnQuitConfirm) {
    btnQuitConfirm.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      setState('START');
      showOverlay('start');
      manageFocusForOverlay('start');
      announce('Mission aborted. Returned to main menu.', true);
    });
  }

  // ── 6. HUD Pause / Restart / Mute ──
  var btnPause = document.getElementById('btn-pause');
  if (btnPause) {
    btnPause.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      if (gameState === 'PLAYING') setState('PAUSED');
      else if (gameState === 'PAUSED') setState('PLAYING');
    });
  }

  var btnRestartHud = document.getElementById('btn-restart-hud');
  if (btnRestartHud) {
    btnRestartHud.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      startNewRun();
    });
  }

  var btnMute = document.getElementById('btn-mute');
  if (btnMute) {
    btnMute.addEventListener('click', function () {
      this.blur();
      toggleMute();
      updateSettingsUI();
    });
  }

  // ── 7. PAUSED overlay ──
  var btnResume = document.getElementById('btn-resume');
  if (btnResume) {
    btnResume.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      if (gameState === 'PAUSED') setState('PLAYING');
    });
  }
  var btnRestartPause = document.getElementById('btn-restart-pause');
  if (btnRestartPause) {
    btnRestartPause.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      restartCurrentLevel();
    });
  }
  var btnTitlePause = document.getElementById('btn-title-pause');
  if (btnTitlePause) {
    btnTitlePause.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      setState('START');
    });
  }

  // ── 8. LEVEL_COMPLETE overlay ──
  var btnNextLevel = document.getElementById('btn-next-level');
  if (btnNextLevel) {
    btnNextLevel.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      if (gameState === 'LEVEL_COMPLETE') loadNextLevel();
    });
  }
  var btnRestartLc = document.getElementById('btn-restart-lc');
  if (btnRestartLc) {
    btnRestartLc.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      startNewRun();
    });
  }

  // ── 9. WON overlay ──
  var btnRestartWon = document.getElementById('btn-restart-won');
  if (btnRestartWon) {
    btnRestartWon.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      startNewRun();
    });
  }
  var btnTitleWon = document.getElementById('btn-title-won');
  if (btnTitleWon) {
    btnTitleWon.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      setState('START');
    });
  }

  // ── 10. LOST overlay ──
  var btnRestartLost = document.getElementById('btn-restart-lost');
  if (btnRestartLost) {
    btnRestartLost.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      startNewRun();
    });
  }
  var btnTitleLost = document.getElementById('btn-title-lost');
  if (btnTitleLost) {
    btnTitleLost.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      setState('START');
    });
  }

  // ── 11. ERROR overlay ──
  var btnRestartError = document.getElementById('btn-restart-error');
  if (btnRestartError) {
    btnRestartError.addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      startNewRun();
    });
  }

  // Difficulty selection buttons
  var diffBtns = document.querySelectorAll('.diff-btn');
  for (var db = 0; db < diffBtns.length; db++) {
    diffBtns[db].addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      var d = this.getAttribute('data-diff');
      setDifficulty(d);
    });
  }

  // Sector deployment selection pills
  var sectorPills = document.querySelectorAll('.sector-pill');
  for (var sp = 0; sp < sectorPills.length; sp++) {
    sectorPills[sp].addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      var sIdx = parseInt(this.getAttribute('data-sector'), 10);
      setSelectedSector(sIdx);
    });
  }

  // Fullscreen toggles
  var fsBtns = document.querySelectorAll('.btn-toggle-fs, #btn-fullscreen, #touch-fs');
  for (var fb = 0; fb < fsBtns.length; fb++) {
    fsBtns[fb].addEventListener('click', function () {
      this.blur();
      if (typeof audio !== 'undefined') audio.play('click');
      toggleFullscreen();
    });
  }
  document.addEventListener('fullscreenchange', updateFullscreenUI);
  document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
}

function onKeyDown(e) {
  // CRITICAL: Ignore shortcuts when Ctrl, Meta, or Alt is held so browser shortcuts (Ctrl+R, Cmd+R) work
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }

  // Prevent key-repeat firing for toggle / action keys
  var toggleKeys = ['KeyP', 'Escape', 'KeyR', 'KeyM', 'KeyF', 'Space', 'Enter'];
  if (e.repeat && toggleKeys.indexOf(e.code) !== -1) return;

  keys[e.code] = true;

  // Prevent arrow key and Space page scrolling
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) !== -1) {
    if (e.preventDefault) e.preventDefault();
  }

  // Primary action keys — ignore if a button is currently focused to avoid double-action
  if (e.code === 'Space' || e.code === 'Enter') {
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
    if (gameState === 'START') {
      startNewRun();
    } else if (gameState === 'LEVEL_COMPLETE') {
      loadNextLevel();
    } else if (gameState === 'WON' || gameState === 'LOST') {
      startNewRun();
    } else if (gameState === 'PLAYING' && e.code === 'Space') {
      triggerDash();
    }
  }

  // Shift triggers Cyber Dash during PLAYING
  if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && gameState === 'PLAYING') {
    triggerDash();
  }

  // Toggle pause
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (gameState === 'PLAYING') setState('PAUSED');
    else if (gameState === 'PAUSED') setState('PLAYING');
  }

  // Restart run (from any state except START)
  if (e.code === 'KeyR' && gameState !== 'START') {
    startNewRun();
  }

  // Mute toggle
  if (e.code === 'KeyM') {
    toggleMute();
  }

  // Fullscreen toggle (KeyF)
  if (e.code === 'KeyF') {
    toggleFullscreen();
  }
}

function onKeyUp(e) {
  keys[e.code] = false;
}

function clearKeys() {
  keys = {};
  resetTouchControls();
}

function onWindowBlur() {
  if (gameState === 'PLAYING') setState('PAUSED');
  clearKeys();
  if (typeof audio !== 'undefined') audio.suspend();
}

function onVisibilityChange() {
  if (document.hidden) {
    if (gameState === 'PLAYING') setState('PAUSED');
    clearKeys();
    if (typeof audio !== 'undefined') audio.suspend();
  } else {
    // Reset frame timestamp to prevent dt spike when returning to tab
    lastTimestamp = null;
    if (gameState === 'PLAYING' && typeof audio !== 'undefined') audio.resume();
  }
}

function toggleMute() {
  if (typeof audio === 'undefined') return;
  var newMuted = audio.toggleMute();
  saveRecord.settings.muted = newMuted;
  saveData();
  announce(newMuted ? 'Sound muted.' : 'Sound unmuted.');
}

/* ============================================================
   6b. MOBILE TOUCH CONTROLS (Virtual Joystick & Touch Pause)
   ============================================================ */

var touchState = {
  active: false,
  touchId: null,
  dx: 0,
  dy: 0,
  dist: 0
};

var joystickZone = null;
var joystickBase = null;
var joystickKnob = null;
var touchBtnPause = null;
var isMouseDownOnJoystick = false;

function initTouchControls() {
  if (typeof document === 'undefined') return;

  joystickZone  = document.getElementById('touch-joystick-zone');
  joystickBase  = document.getElementById('joystick-base');
  joystickKnob  = document.getElementById('joystick-knob');
  touchBtnPause = document.getElementById('touch-btn-pause');

  var isTouchCapable = (typeof window !== 'undefined') &&
                       (('ontouchstart' in window) ||
                        (navigator.maxTouchPoints > 0) ||
                        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));

  if (isTouchCapable && document.body) {
    document.body.classList.add('has-touch');
  }

  // Detect first touch anywhere on screen
  if (typeof window !== 'undefined') {
    window.addEventListener('touchstart', function onFirstTouch() {
      if (document.body) document.body.classList.add('has-touch');
      window.removeEventListener('touchstart', onFirstTouch);
    }, { passive: true, once: true });
  }

  if (joystickZone) {
    // Touch start on joystick zone
    joystickZone.addEventListener('touchstart', function (e) {
      if (touchState.active) return;
      var t = e.changedTouches[0];
      touchState.active = true;
      touchState.touchId = t.identifier;
      updateJoystickFromTouch(t.clientX, t.clientY);
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    // Desktop mouse fallback for testing
    joystickZone.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      isMouseDownOnJoystick = true;
      touchState.active = true;
      updateJoystickFromTouch(e.clientX, e.clientY);
      if (e.cancelable) e.preventDefault();
    });
  }

  if (typeof window !== 'undefined') {
    // Global touchmove & touchend on window for smooth tracking even when thumb leaves zone
    window.addEventListener('touchmove', function (e) {
      if (!touchState.active || touchState.touchId === null) return;
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (t.identifier === touchState.touchId) {
          updateJoystickFromTouch(t.clientX, t.clientY);
          if (e.cancelable) e.preventDefault();
          break;
        }
      }
    }, { passive: false });

    var onTouchEnd = function (e) {
      if (!touchState.active || touchState.touchId === null) return;
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (t.identifier === touchState.touchId) {
          resetTouchControls();
          break;
        }
      }
    };

    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // Desktop mousemove / mouseup fallback
    window.addEventListener('mousemove', function (e) {
      if (!isMouseDownOnJoystick) return;
      updateJoystickFromTouch(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', function (e) {
      if (isMouseDownOnJoystick) {
        isMouseDownOnJoystick = false;
        resetTouchControls();
      }
    });
  }

  // Touch Pause Button
  if (touchBtnPause) {
    var handleTouchPause = function (e) {
      if (e && e.cancelable) e.preventDefault();
      if (typeof audio !== 'undefined') audio.play('click');
      if (gameState === 'PLAYING' || gameState === 'PAUSED') {
        togglePause();
      }
    };
    touchBtnPause.addEventListener('click', handleTouchPause);
    touchBtnPause.addEventListener('touchstart', handleTouchPause, { passive: false });
  }

  var touchBtnDash = document.getElementById('touch-btn-dash');
  if (touchBtnDash) {
    var handleTouchDash = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (gameState === 'PLAYING') {
        triggerDash();
      }
    };
    touchBtnDash.addEventListener('click', handleTouchDash);
    touchBtnDash.addEventListener('touchstart', handleTouchDash, { passive: false });
  }
}

function updateJoystickFromTouch(clientX, clientY) {
  if (!joystickBase) return;
  var rect = joystickBase.getBoundingClientRect();
  var centerX = rect.left + rect.width / 2;
  var centerY = rect.top + rect.height / 2;
  var deltaX = clientX - centerX;
  var deltaY = clientY - centerY;

  var maxRadius = (rect.width / 2) - 12; // clamp knob within rim (e.g. 48px)
  var deadZone = 6;

  var vec;
  if (typeof NeonLogic !== 'undefined' && NeonLogic.calculateJoystickVector) {
    vec = NeonLogic.calculateJoystickVector(deltaX, deltaY, maxRadius, deadZone);
  } else {
    var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (dist < deadZone) {
      vec = { dx: 0, dy: 0, dist: dist, clampedDist: 0, active: false };
    } else {
      var normX = deltaX / dist;
      var normY = deltaY / dist;
      var clamped = Math.min(dist, maxRadius);
      vec = { dx: normX, dy: normY, dist: dist, clampedDist: clamped, active: true };
    }
  }

  touchState.dx = vec.dx;
  touchState.dy = vec.dy;
  touchState.dist = vec.clampedDist;

  if (joystickKnob) {
    var knobX = vec.dx * vec.clampedDist;
    var knobY = vec.dy * vec.clampedDist;
    joystickKnob.style.transform = 'translate(' + knobX.toFixed(1) + 'px, ' + knobY.toFixed(1) + 'px)';
  }
}

function resetTouchControls() {
  touchState.active = false;
  touchState.touchId = null;
  touchState.dx = 0;
  touchState.dy = 0;
  touchState.dist = 0;
  isMouseDownOnJoystick = false;
  if (joystickKnob) {
    joystickKnob.style.transform = 'translate(0px, 0px)';
  }
}

/* ============================================================
   7. UPDATE (Scoring, Movement, Drones, Collisions, Timers)
   ============================================================ */

/* ── 7a. Centralized scoring ── */
function addScore(amount, reason) {
  if (typeof NeonLogic !== 'undefined' && NeonLogic.clampScore) {
    score = NeonLogic.clampScore(score, amount);
  } else {
    score = Math.max(0, score + amount);
  }

  if (score > saveRecord.bestScore && !debugScoreModified) {
    saveRecord.bestScore = score;
  }
  updateHUD();
}


/* ── Dash / Dodge Ability ── */
function triggerDash() {
  if (gameState !== 'PLAYING') return;
  if (dashState.cooldown > 0 || dashState.active) return;

  dashState.active = true;
  dashState.timer = dashState.duration;
  dashState.cooldown = dashState.maxCooldown;

  if (typeof audio !== 'undefined') audio.play('dash');
  if (typeof fx !== 'undefined') {
    fx.spawnBurst(player.x, player.y, '#00f5ff', 14, 110, 2);
  }
  updateHUD();
}

function updateDash(dt) {
  if (dashState.timer > 0) {
    dashState.timer -= dt;
    if (dashState.timer <= 0) {
      dashState.active = false;
    }
  }

  if (dashState.cooldown > 0) {
    dashState.cooldown = Math.max(0, dashState.cooldown - dt);
  }
}

/* ── Hazards System ── */
function updateHazards(dt) {
  if (!currentHazards || currentHazards.length === 0) return;

  for (var i = 0; i < currentHazards.length; i++) {
    var h = currentHazards[i];
    h.timer += dt;

    if (h.state === 'IDLE') {
      if (h.timer >= (h.idleDuration || 3.0)) {
        h.state = 'WARNING';
        h.timer = 0;
        if (typeof audio !== 'undefined') audio.play('hazardWarning');
      }
    } else if (h.state === 'WARNING') {
      if (h.timer >= (h.warningDuration || 1.2)) {
        h.state = 'ACTIVE';
        h.timer = 0;
      }
    } else if (h.state === 'ACTIVE') {
      if (h.timer >= (h.activeDuration || 1.8)) {
        h.state = 'IDLE';
        h.timer = 0;
      } else {
        // Collision test against active beam
        if (!dashState.active && hitCooldownTimer <= 0) {
          if (typeof NeonLogic !== 'undefined' && NeonLogic.pointToSegmentDist) {
            var dist = NeonLogic.pointToSegmentDist(player.x, player.y, h.x1, h.y1, h.x2, h.y2);
            if (dist < (CONFIG.PLAYER_SIZE / 2 + 5)) {
              if (activePowerups.shieldActive) {
                activePowerups.shieldActive = false;
                hitCooldownTimer = 1.0;
                if (typeof audio !== 'undefined') audio.play('hit');
                if (typeof fx !== 'undefined') {
                  fx.spawnBurst(player.x, player.y, '#ffd700', 16, 140, 3);
                  fx.spawnText(player.x, player.y - 14, 'SHIELD BROKEN', '#ffd700');
                }
                announce('Shield absorbed laser strike!');
              } else {
                applyHitPenalty(player.x, player.y);
              }
            }
          }
        }
      }
    }
  }
}

/* ── Powerups System ── */
function updatePowerups(dt) {
  if (activePowerups.overclockTimer > 0) {
    activePowerups.overclockTimer = Math.max(0, activePowerups.overclockTimer - dt);
  }
  if (activePowerups.chronoTimer > 0) {
    activePowerups.chronoTimer = Math.max(0, activePowerups.chronoTimer - dt);
  }

  if (!currentPowerups || currentPowerups.length === 0) return;

  var psHalf = CONFIG.PLAYER_SIZE / 2;
  for (var i = 0; i < currentPowerups.length; i++) {
    var p = currentPowerups[i];
    if (p.collected) continue;

    var dist = Math.hypot(player.x - p.x, player.y - p.y);
    if (dist < (psHalf + (p.radius || 12) + 4)) {
      p.collected = true;
      applyPowerup(p.type, p.x, p.y);
    }
  }
}

function applyPowerup(type, px, py) {
  if (typeof audio !== 'undefined') audio.play('powerup');

  if (type === 'OVERCLOCK') {
    activePowerups.overclockTimer = 6.0;
    if (typeof fx !== 'undefined') {
      fx.spawnBurst(px, py, '#00f5ff', 16, 130, 3);
      fx.spawnText(px, py - 12, '+OVERCLOCK', '#00f5ff');
    }
    announce('Overclock active: +40% speed for 6s!');
  } else if (type === 'SHIELD') {
    activePowerups.shieldActive = true;
    if (typeof fx !== 'undefined') {
      fx.spawnBurst(px, py, '#ffd700', 16, 130, 3);
      fx.spawnText(px, py - 12, '+SHIELD', '#ffd700');
    }
    announce('Shield active: Absorbs next hit!');
  } else if (type === 'CHRONO') {
    timeRemaining += 15.0;
    activePowerups.chronoTimer = 5.0;
    if (typeof fx !== 'undefined') {
      fx.spawnBurst(px, py, '#39ff14', 16, 130, 3);
      fx.spawnText(px, py - 12, '+15s CHRONO', '#39ff14');
    }
    announce('Chrono boost: +15s added! Drones slowed.');
  }
  updateHUD();
}

/* ── Boss State Machine (Level 10) ── */
function updateBoss(dt) {
  if (!bossState || !bossState.active) return;

  bossState.rotation += 1.2 * dt;
  bossState.shieldAngle += 1.8 * dt;

  // Phase transitions based on fragments collected
  if (fragmentsCollected >= 11) {
    bossState.phase = 3; // Critical Overload
  } else if (fragmentsCollected >= 6) {
    bossState.phase = 2; // Radial Shockwaves
  } else {
    bossState.phase = 1; // Outer Firewall
  }

  // Shockwaves in Phase 2 and 3
  if (bossState.phase >= 2) {
    bossState.shockwaveTimer += dt;
    var interval = (bossState.phase === 3 ? 3.2 : 4.2);
    if (bossState.shockwaveTimer >= interval) {
      bossState.shockwaveTimer = 0;
      bossState.shockwaves.push({
        r: bossState.radius,
        maxR: 450,
        speed: (bossState.phase === 3 ? 210 : 160),
        hitPlayer: false
      });
      if (typeof audio !== 'undefined') audio.play('shockwave');
      if (typeof fx !== 'undefined') {
        fx.spawnBurst(bossState.x, bossState.y, '#ff0055', 18, 140, 3);
      }
    }
  }

  // Update expanding shockwaves
  if (bossState.shockwaves && bossState.shockwaves.length > 0) {
    var pDist = Math.hypot(player.x - bossState.x, player.y - bossState.y);
    for (var s = bossState.shockwaves.length - 1; s >= 0; s--) {
      var sw = bossState.shockwaves[s];
      sw.r += sw.speed * dt;

      if (!sw.hitPlayer && !dashState.active && hitCooldownTimer <= 0) {
        if (Math.abs(pDist - sw.r) < (CONFIG.PLAYER_SIZE / 2 + 8)) {
          sw.hitPlayer = true;
          if (activePowerups.shieldActive) {
            activePowerups.shieldActive = false;
            hitCooldownTimer = 1.0;
            if (typeof audio !== 'undefined') audio.play('hit');
            if (typeof fx !== 'undefined') {
              fx.spawnBurst(player.x, player.y, '#ffd700', 16, 140, 3);
              fx.spawnText(player.x, player.y - 14, 'SHIELD BROKEN', '#ffd700');
            }
            announce('Shield absorbed shockwave strike!');
          } else {
            applyHitPenalty(player.x, player.y);
          }
        }
      }

      if (sw.r >= sw.maxR) {
        bossState.shockwaves.splice(s, 1);
      }
    }
  }
}

/* ── 7b. Player movement (cancels opposing keys, tracks facing cue) ── */
function updatePlayer(dt) {
  var rawDx = 0, rawDy = 0;

  // Opposite keys held together cancel to zero
  if (keys['ArrowLeft']  || keys['KeyA']) rawDx -= 1;
  if (keys['ArrowRight'] || keys['KeyD']) rawDx += 1;
  if (keys['ArrowUp']    || keys['KeyW']) rawDy -= 1;
  if (keys['ArrowDown']  || keys['KeyS']) rawDy += 1;

  // Track facing direction (non-color accessible visual cue)
  if (rawDx !== 0 || rawDy !== 0) {
    player.facingDx = rawDx;
    player.facingDy = rawDy;
  }

  var dx = rawDx, dy = rawDy;

  // Touch joystick input (when no keyboard directional key is active)
  if (touchState.active && rawDx === 0 && rawDy === 0) {
    dx = touchState.dx;
    dy = touchState.dy;
  } else if (rawDx !== 0 || rawDy !== 0) {
    if (typeof NeonLogic !== 'undefined' && NeonLogic.normalizeInput) {
      var norm = NeonLogic.normalizeInput(rawDx, rawDy);
      dx = norm.dx;
      dy = norm.dy;
    } else if (dx !== 0 && dy !== 0) {
      var inv = 0.7071067811865476;
      dx *= inv;
      dy *= inv;
    }
  }

  var moveSpeed = CONFIG.PLAYER_SPEED;
  if (dashState.active) {
    moveSpeed *= dashState.speedMult;
  } else if (activePowerups.overclockTimer > 0) {
    moveSpeed *= 1.4;
  }

  player.x += dx * moveSpeed * dt;
  player.y += dy * moveSpeed * dt;

  // Resolve obstacles (AABB)
  if (currentObstacles && currentObstacles.length > 0 && typeof NeonLogic !== 'undefined' && NeonLogic.resolveObstacles) {
    var obsRes = NeonLogic.resolveObstacles(player.x, player.y, CONFIG.PLAYER_SIZE, currentObstacles);
    player.x = obsRes.x;
    player.y = obsRes.y;
  }

  // Clamp inside arena bounds
  var half = CONFIG.PLAYER_SIZE / 2;
  player.x = Math.max(half, Math.min(CONFIG.ARENA_W - half, player.x));
  player.y = Math.max(half, Math.min(CONFIG.ARENA_H - half, player.y));
}

/* ── 7c. Drones ── */
function updateDrones(dt) {
  var droneDt = dt;
  if (activePowerups.chronoTimer > 0) {
    droneDt *= 0.75; // 25% drone slowdown during Chrono powerup
  }
  for (var i = 0; i < drones.length; i++) {
    moveDrone(drones[i], droneDt);
  }
}

function moveDrone(d, dt) {
  if (d.patternType === 'H') {
    if (typeof NeonLogic !== 'undefined' && NeonLogic.stepHunterDrone) {
      var obs = currentObstacles || [];
      var nextH = NeonLogic.stepHunterDrone(d, player.x, player.y, obs, dt, CONFIG.ARENA_W, CONFIG.ARENA_H);
      d.x = nextH.x;
      d.y = nextH.y;
      d.vx = nextH.vx;
      d.vy = nextH.vy;
      return;
    }
  }

  if (typeof NeonLogic !== 'undefined' && NeonLogic.stepDronePattern) {
    var next = NeonLogic.stepDronePattern(d, dt, CONFIG.ARENA_W, CONFIG.ARENA_H);
    d.x = next.x;
    d.y = next.y;
    d.vx = next.vx;
    d.vy = next.vy;
    d.loopPhase = next.loopPhase;
    return;
  }

  var r = d.radius;
  var b = d.bounds || { minX: r, maxX: CONFIG.ARENA_W - r, minY: r, maxY: CONFIG.ARENA_H - r };
  var minX = b.minX, maxX = b.maxX;
  var minY = b.minY, maxY = b.maxY;

  if (d.patternType === 'A') {
    d.x += d.vx * dt;
    if (d.x <= minX) { d.x = minX; d.vx =  Math.abs(d.vx); }
    if (d.x >= maxX) { d.x = maxX; d.vx = -Math.abs(d.vx); }

  } else if (d.patternType === 'B') {
    d.y += d.vy * dt;
    if (d.y <= minY) { d.y = minY; d.vy =  Math.abs(d.vy); }
    if (d.y >= maxY) { d.y = maxY; d.vy = -Math.abs(d.vy); }

  } else if (d.patternType === 'C') {
    var sp  = d.speed * dt;
    var lx1 = d.loopX1, ly1 = d.loopY1;
    var lx2 = d.loopX2, ly2 = d.loopY2;

    if (d.loopPhase === 0) {
      d.x += sp;
      if (d.x >= lx2) { d.x = lx2; d.loopPhase = 1; }
    } else if (d.loopPhase === 1) {
      d.y += sp;
      if (d.y >= ly2) { d.y = ly2; d.loopPhase = 2; }
    } else if (d.loopPhase === 2) {
      d.x -= sp;
      if (d.x <= lx1) { d.x = lx1; d.loopPhase = 3; }
    } else {
      d.y -= sp;
      if (d.y <= ly1) { d.y = ly1; d.loopPhase = 0; }
    }

  } else if (d.patternType === 'D') {
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (d.x <= minX) { d.x = minX; d.vx =  Math.abs(d.vx); }
    if (d.x >= maxX) { d.x = maxX; d.vx = -Math.abs(d.vx); }
    if (d.y <= minY) { d.y = minY; d.vy =  Math.abs(d.vy); }
    if (d.y >= maxY) { d.y = maxY; d.vy = -Math.abs(d.vy); }
  }

  // Visual rotor angle
  d.spinAngle = (d.spinAngle || 0) + dt * 3.0;

  d.x = Math.max(minX, Math.min(maxX, d.x));
  d.y = Math.max(minY, Math.min(maxY, d.y));
}

/* ── 7d. Pure collision helpers ── */
function circleVsRect(cx, cy, cr, rx, ry, rw, rh) {
  if (typeof NeonLogic !== 'undefined' && NeonLogic.circleRect) {
    return NeonLogic.circleRect(cx, cy, cr, rx, ry, rw, rh);
  }
  var halfW = rw / 2, halfH = rh / 2;
  var nearX = Math.max(rx - halfW, Math.min(cx, rx + halfW));
  var nearY = Math.max(ry - halfH, Math.min(cy, ry + halfH));
  var dx = cx - nearX, dy = cy - nearY;
  return (dx * dx + dy * dy) < (cr * cr);
}

function rectVsRect(ax, ay, aw, ah, bx, by, bw, bh) {
  if (typeof NeonLogic !== 'undefined' && NeonLogic.rectRect) {
    return NeonLogic.rectRect(ax, ay, aw, ah, bx, by, bw, bh);
  }
  return Math.abs(ax - bx) < (aw + bw) / 2 &&
         Math.abs(ay - by) < (ah + bh) / 2;
}

/* ── 7e. Fragment collection ── */
function updateFragmentCollection() {
  var ps  = CONFIG.PLAYER_SIZE;
  var px  = player.x, py = player.y;
  var lvl = currentLevelData();

  for (var i = 0; i < fragments.length; i++) {
    var f = fragments[i];
    if (f.collected) continue;

    // Hitbox stays at logical (f.x, f.y) position regardless of visual bob
    if (circleVsRect(f.x, f.y, f.radius, px, py, ps, ps)) {
      f.collected = true;
      fragmentsCollected++;
      addScore(CONFIG.FRAGMENT_SCORE, 'fragment');

      if (typeof fx !== 'undefined') {
        fx.spawnText(f.x, f.y - 16, '+' + CONFIG.FRAGMENT_SCORE, '#39ff14');
        fx.spawnBurst(f.x, f.y, '#39ff14');
      }
      if (typeof audio !== 'undefined') audio.play('fragment');

      announce('Fragment ' + fragmentsCollected + ' of ' + lvl.fragments.length);

      if (fragmentsCollected >= lvl.fragments.length) {
        extraction.active = true;
        showHint = false;
        spawnBanner('EXTRACTION ONLINE', 2.5);
        if (typeof audio !== 'undefined') audio.play('extractionOnline');
        announce('Extraction online. Proceed to bottom-right portal.');
      }
    }
  }
}

/* ── 7f. Drone collision ── */
function updateDroneCollisions() {
  if (dashState.active) return; // Invulnerable during Cyber Dash!
  if (hitCooldownTimer > 0) return;

  var ps = CONFIG.PLAYER_SIZE;
  var px = player.x, py = player.y;

  for (var i = 0; i < drones.length; i++) {
    var d = drones[i];
    var effectiveR = d.radius * 0.8; // 80% forgiving hitbox

    if (circleVsRect(d.x, d.y, effectiveR, px, py, ps, ps)) {
      if (activePowerups.shieldActive) {
        activePowerups.shieldActive = false;
        hitCooldownTimer = 1.0;
        if (typeof audio !== 'undefined') audio.play('hit');
        if (typeof fx !== 'undefined') {
          fx.spawnBurst(player.x, player.y, '#ffd700', 16, 140, 3);
          fx.spawnText(d.x, d.y - 20, 'SHIELD BROKEN', '#ffd700');
        }
        announce('Shield absorbed enemy hit!');
        updateHUD();
        return;
      }
      applyHitPenalty(d.x, d.y);
      return;
    }
  }
}

function applyHitPenalty(hx, hy) {
  addScore(-activePenaltyScore, 'hit');
  timeRemaining -= activePenaltyTime;
  hitCooldownTimer = activeHitCooldown;

  if (typeof fx !== 'undefined') {
    fx.triggerHitFlash();
    fx.spawnText(hx, hy - 20,
      '-' + activePenaltyScore + ' / -' + activePenaltyTime + 's',
      '#ff4444');
  }
  if (typeof audio !== 'undefined') audio.play('hit');

  announce('Drone collision! -' + activePenaltyScore + ' points, -' + activePenaltyTime + ' seconds.');
  updateHUD();

  if (timeRemaining <= 0) {
    timeRemaining = 0;
    setState('LOST');
  }
}

/* ── 7g. Extraction contact ── */
function updateExtractionContact() {
  if (!extraction.active) return;
  if (gameState !== 'PLAYING') return;
  var lvl = currentLevelData();
  var ex  = lvl.extraction;
  var ps  = CONFIG.PLAYER_SIZE;

  if (rectVsRect(
        player.x, player.y, ps, ps,
        ex.x + ex.w / 2, ex.y + ex.h / 2, ex.w, ex.h)) {
    completeLevel();
  }
}

function completeLevel() {
  if (levelBonusAwarded) return;
  levelBonusAwarded = true;

  addScore(CONFIG.LEVEL_BONUS, 'level-complete');
  if (typeof fx !== 'undefined') {
    fx.spawnText(CONFIG.ARENA_W / 2, CONFIG.ARENA_H / 2, '+' + CONFIG.LEVEL_BONUS, '#39ff14');
  }
  if (typeof audio !== 'undefined') audio.play('levelComplete');

  var nextLvl = currentLevel + 1;
  if (nextLvl < LEVELS.length) {
    saveRecord.unlockedLevel = Math.max(saveRecord.unlockedLevel || 1, nextLvl + 1);
  }
  if (!saveRecord.completedLevels) saveRecord.completedLevels = [];
  if (saveRecord.completedLevels.indexOf(currentLevel) === -1) {
    saveRecord.completedLevels.push(currentLevel);
  }
  saveData();
  updateSectorPillsUI();

  if (currentLevel >= LEVELS.length - 1) {
    setState('WON');
  } else {
    setState('LEVEL_COMPLETE');
  }
}

/* ── 7h. Effects & Timers ── */
function updateEffects(dt) {
  if (hitCooldownTimer > 0) {
    hitCooldownTimer = Math.max(0, hitCooldownTimer - dt);
  }

  if (banner) {
    banner.timer -= dt;
    if (banner.timer <= 0) banner = null;
  }

  if (extraction.active) {
    extraction.pulseT += dt;
  }

  if (typeof fx !== 'undefined') {
    fx.update(dt);
  }
}

function updateTimer(dt) {
  if (gameState !== 'PLAYING') return;
  elapsedPlayTime += dt;
  timeRemaining   -= dt;

  if (timeRemaining <= 0) {
    timeRemaining = 0;
    updateHUD();
    setState('LOST');
    return;
  }

  var hudTime = document.getElementById('hud-time');
  var hudLowTime = document.getElementById('hud-low-time');
  if (hudTime) {
    if (timeRemaining < 15) {
      hudTime.classList.add('urgent');
      if (hudLowTime) hudLowTime.style.display = '';
    } else {
      hudTime.classList.remove('urgent');
      if (hudLowTime) hudLowTime.style.display = 'none';
    }
  }

  updateHUD();
}

/* ── 7i. Master update ── */
function updateCollisions() {
  updateFragmentCollection();
  updateDroneCollisions();
  updateExtractionContact();
}

function update(dt) {
  dt = Math.min(dt, CONFIG.MAX_DT);
  if (dt <= 0) return;
  if (gameState !== 'PLAYING') return;

  updateDash(dt);
  updatePlayer(dt);
  updateDrones(dt);
  updateHazards(dt);
  updatePowerups(dt);
  updateBoss(dt);
  updateCollisions();
  // Tie-break: if extraction completed the level on this frame, skip timer update so success wins
  if (gameState !== 'PLAYING') return;
  updateEffects(dt);
  updateTimer(dt);
}

/* ============================================================
   8. STATE TRANSITIONS
   ============================================================ */

function currentLevelData() {
  return LEVELS[currentLevel];
}

function setState(newState) {
  if (newState === gameState && newState !== 'PLAYING') return;

  if (!canTransition(gameState, newState)) {
    return;
  }

  var from = gameState;
  gameState = newState;

  if (from === 'PLAYING') clearKeys();

  switch (newState) {
    case 'PLAYING':
      showHUD(true);
      showOverlay(null);
      updateHUD();
      manageFocusForOverlay(null);
      var btnPause = document.getElementById('btn-pause');
      if (btnPause) btnPause.textContent = 'PAUSE';
      if (from === 'PAUSED') {
        announce('Game resumed.', true);
        if (typeof audio !== 'undefined') audio.resume();
      }
      break;

    case 'PAUSED':
      showHUD(true);
      showOverlay('paused');
      manageFocusForOverlay('paused');
      announce('Game paused.', true);
      if (typeof audio !== 'undefined') audio.suspend();
      break;

    case 'LEVEL_COMPLETE':
      showHUD(false);
      var nextLvl = LEVELS[currentLevel + 1];
      var lcScore = document.getElementById('lc-score');
      var lcBonus = document.getElementById('lc-bonus');
      var lcNext  = document.getElementById('lc-next-label');
      var btnNext = document.getElementById('btn-next-level');
      if (lcScore) lcScore.textContent = score;
      if (lcBonus) lcBonus.textContent = '+' + CONFIG.LEVEL_BONUS;
      if (lcNext)  lcNext.textContent  = 'NEXT: ' + (nextLvl ? nextLvl.name : 'ALL SECTORS CLEARED');
      if (btnNext) btnNext.textContent = 'PROCEED TO SECTOR ' + ((currentLevel + 2 < 10 ? '0' : '') + (currentLevel + 2));
      showOverlay('level-complete');
      manageFocusForOverlay('level-complete');
      announce('Sector complete. Sector bonus 250 points awarded. Total score ' + score + '.', true);
      break;

    case 'WON':
      showHUD(false);
      saveData();
      var wonScore  = document.getElementById('won-score');
      var wonTime   = document.getElementById('won-time');
      var wonBest   = document.getElementById('won-best');
      var wonRecord = document.getElementById('won-record');
      if (wonScore)  wonScore.textContent  = score;
      if (wonTime)   wonTime.textContent   = formatElapsed(elapsedPlayTime);
      if (wonBest)   wonBest.textContent   = saveRecord.bestScore;
      if (wonRecord) wonRecord.style.display = (score > runStartBest && score > 0) ? '' : 'none';
      showOverlay('won');
      manageFocusForOverlay('won');
      if (typeof audio !== 'undefined') audio.play('win');
      announce('Mission complete. You won! Final score: ' + score + '.', true);
      break;

    case 'LOST':
      showHUD(false);
      saveData();
      var lostScore  = document.getElementById('lost-score');
      var lostReason = document.getElementById('lost-reason');
      var lostLevel  = document.getElementById('lost-level');
      var lostBest   = document.getElementById('lost-best');
      var lostRecord = document.getElementById('lost-record');
      if (lostScore)  lostScore.textContent  = score;
      if (lostReason) lostReason.textContent = 'Time ran out.';
      if (lostLevel)  lostLevel.textContent  = 'SECTOR ' + (currentLevel + 1) + ' / ' + LEVELS.length;
      if (lostBest)   lostBest.textContent   = saveRecord.bestScore;
      if (lostRecord) lostRecord.style.display = (score > runStartBest && score > 0) ? '' : 'none';
      showOverlay('lost');
      manageFocusForOverlay('lost');
      if (typeof audio !== 'undefined') audio.play('lose');
      announce('Mission failed. Time ran out. Score: ' + score + '.', true);
      break;

    case 'START':
      showHUD(false);
      buildInitialGameObjects();
      showOverlay('start');
      manageFocusForOverlay('start');
      updateStartScreen();
      setDifficulty((saveRecord && saveRecord.settings && saveRecord.settings.difficulty) || 'normal');
      setSelectedSector(selectedStartLevel);
      updateFullscreenUI();
      announce('Returned to title screen.', true);
      break;

    case 'ERROR':
      showHUD(false);
      showOverlay('error');
      manageFocusForOverlay('error');
      break;
  }
}

/* ============================================================
   9. LEVEL LOADING
   ============================================================ */

function loadLevel(index) {
  currentLevel = index;
  var lvl = LEVELS[index];

  var diff = (saveRecord && saveRecord.settings && saveRecord.settings.difficulty) || 'normal';
  var diffMods = (typeof NeonLogic !== 'undefined' && NeonLogic.getDifficultyModifiers)
    ? NeonLogic.getDifficultyModifiers(diff)
    : { timeMultiplier: 1.0, droneSpeedMultiplier: 1.0, penaltyScore: 50, penaltyTime: 5, hitCooldown: 1.5 };

  activePenaltyScore = diffMods.penaltyScore;
  activePenaltyTime  = diffMods.penaltyTime;
  activeHitCooldown  = diffMods.hitCooldown;

  player = {
    x: CONFIG.PLAYER_START_X,
    y: CONFIG.PLAYER_START_Y,
    facingDx: 0,
    facingDy: 1
  };

  fragments = lvl.fragments.map(function (p, i) {
    return {
      x: p.x,
      y: p.y,
      radius: CONFIG.FRAGMENT_RADIUS,
      collected: false,
      phase: i * 1.05 // desynchronized bob phase
    };
  });

  var spdMult = diffMods.droneSpeedMultiplier || 1.0;
  drones = lvl.drones.map(function (d) {
    var scaledSpd = Math.round(d.speed * spdMult);
    return {
      patternType: d.patternType,
      x: d.x,
      y: d.y,
      speed: scaledSpd,
      vx: (d.vx !== undefined ? Math.sign(d.vx) * scaledSpd : 0),
      vy: (d.vy !== undefined ? Math.sign(d.vy) * scaledSpd : 0),
      radius: CONFIG.DRONE_RADIUS,
      spinAngle: Math.random() * Math.PI * 2,
      bounds: d.bounds ? { minX: d.bounds.minX, maxX: d.bounds.maxX, minY: d.bounds.minY, maxY: d.bounds.maxY } : undefined,
      loopX1: d.loopX1,
      loopY1: d.loopY1,
      loopX2: d.loopX2,
      loopY2: d.loopY2,
      loopPhase: (d.loopPhase !== undefined ? d.loopPhase : 0)
    };
  });

  extraction = { active: false, pulseT: 0 };
  fragmentsCollected = 0;
  levelBonusAwarded  = false;
  hitCooldownTimer   = 0;
  showHint           = true;
  banner             = null;

  if (typeof fx !== 'undefined') fx.reset();

  var tl = Math.round(lvl.timeLimit * (diffMods.timeMultiplier || 1.0));
  if (DEBUG_MODE && debugTimeOverride > 0) tl = debugTimeOverride;
  timeRemaining = tl;

  // Initialize level subsystems
  currentObstacles = (lvl.obstacles || []).map(function (o) { return Object.assign({}, o); });
  currentHazards   = (lvl.hazards || []).map(function (h) { return Object.assign({}, h, { timer: 0, state: 'IDLE' }); });
  currentPowerups  = (lvl.powerups || []).map(function (p) { return Object.assign({}, p, { collected: false }); });

  dashState.active = false;
  dashState.timer = 0;
  dashState.cooldown = 0;

  activePowerups = {
    overclockTimer: 0,
    shieldActive: false,
    chronoTimer: 0
  };

  if (lvl.isBoss) {
    bossState.active = true;
    bossState.phase = 1;
    bossState.shockwaveTimer = 0;
    bossState.shockwaves = [];
  } else {
    bossState.active = false;
    bossState.shockwaves = [];
  }

  updateHUD();
}

function startNewRun() {
  runStartBest = saveRecord.bestScore;

  score = 0;
  elapsedPlayTime = 0;
  debugScoreModified = false;

  var hudTime = document.getElementById('hud-time');
  if (hudTime) hudTime.classList.remove('urgent');
  var hudLowTime = document.getElementById('hud-low-time');
  if (hudLowTime) hudLowTime.style.display = 'none';

  clearKeys();

  if (DEBUG_MODE && debugStartLevel !== undefined) {
    currentLevel = debugStartLevel;
  } else if (typeof selectedStartLevel === 'number' && selectedStartLevel >= 0 && selectedStartLevel < LEVELS.length) {
    currentLevel = selectedStartLevel;
  } else {
    currentLevel = 0;
  }

  if (DEBUG_MODE && debugScoreStart > 0) {
    score = debugScoreStart;
    debugScoreModified = true;
  }

  if (typeof audio !== 'undefined') {
    audio.reset();
  }

  loadLevel(currentLevel);
  setState('PLAYING');
  if (rafHandle === null) {
    startLoop(true);
  }
  spawnBanner(LEVELS[currentLevel].name, 2.5);
  announce(LEVELS[currentLevel].name + ' started.');
}

function loadNextLevel() {
  clearKeys();
  currentLevel++;
  if (typeof audio !== 'undefined') {
    audio.reset();
  }

  loadLevel(currentLevel);
  setState('PLAYING');
  if (rafHandle === null) {
    startLoop(true);
  }
  spawnBanner(LEVELS[currentLevel].name, 2.5);
  announce(LEVELS[currentLevel].name + ' started.');
}

function resetGame() {
  startNewRun();
}

/* ============================================================
   10. RENDER (Visual polish & Accessibility cues)
   ============================================================ */

function render() {
  if (!ctx) return;
  ctx.clearRect(0, 0, CONFIG.ARENA_W, CONFIG.ARENA_H);

  renderArena();
  renderDronePathHints();
  renderObstacles();
  renderHazards();
  renderPowerups();
  renderBoss();
  renderExtractionZone();
  renderFragments();
  renderDrones();
  renderPlayer();

  if (LEVELS[currentLevel] && LEVELS[currentLevel].isBlackout) {
    renderBlackout();
  }

  if (typeof fx !== 'undefined') {
    fx.renderRings(ctx);
    fx.renderParticles(ctx);
    fx.renderTexts(ctx);
    fx.renderHitVignette(ctx, CONFIG.ARENA_W, CONFIG.ARENA_H);
  }

  renderBanner();

  if (DEBUG_MODE) renderDebug();
}


/* ── Render Obstacles ── */
function renderObstacles() {
  if (!currentObstacles || currentObstacles.length === 0) return;
  var isRedMotion = (typeof fx !== 'undefined' && fx.isReducedMotion());

  ctx.save();
  for (var i = 0; i < currentObstacles.length; i++) {
    var ob = currentObstacles[i];

    // Dark tactical foundation
    ctx.fillStyle = '#081220';
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

    // Tech border with cyan or magenta glow
    var borderColor = (ob.type === 'core') ? '#ff0055' : '#00f5ff';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    if (!isRedMotion) {
      ctx.shadowColor = borderColor;
      ctx.shadowBlur = 8;
    }
    ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);

    // Corner chamfers
    ctx.fillStyle = borderColor;
    var cs = Math.min(5, ob.w / 4, ob.h / 4);
    ctx.fillRect(ob.x, ob.y, cs, cs);
    ctx.fillRect(ob.x + ob.w - cs, ob.y, cs, cs);
    ctx.fillRect(ob.x, ob.y + ob.h - cs, cs, cs);
    ctx.fillRect(ob.x + ob.w - cs, ob.y + ob.h - cs, cs, cs);

    // Interior tech circuit accent
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ob.x + 4, ob.y + ob.h / 2);
    ctx.lineTo(ob.x + ob.w - 4, ob.y + ob.h / 2);
    ctx.stroke();
  }
  ctx.restore();
}

/* ── Render Hazards ── */
function renderHazards() {
  if (!currentHazards || currentHazards.length === 0) return;
  var isRedMotion = (typeof fx !== 'undefined' && fx.isReducedMotion());
  var clockTime = (typeof fx !== 'undefined') ? fx.clock : (Date.now() / 1000);

  ctx.save();
  for (var i = 0; i < currentHazards.length; i++) {
    var h = currentHazards[i];

    // Terminal emitters at endpoints
    var termColor = h.state === 'ACTIVE' ? '#ff0055' : (h.state === 'WARNING' ? '#ffb700' : '#00f5ff');
    ctx.fillStyle = '#051020';
    ctx.strokeStyle = termColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(h.x1, h.y1, 6, 0, Math.PI * 2);
    ctx.arc(h.x2, h.y2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (h.state === 'WARNING') {
      // Blinking yellow warning conduit
      var blink = Math.sin(clockTime * Math.PI * 8) > 0;
      ctx.strokeStyle = blink ? 'rgba(255, 183, 0, 0.95)' : 'rgba(255, 183, 0, 0.3)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(h.x1, h.y1);
      ctx.lineTo(h.x2, h.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (h.state === 'ACTIVE') {
      // Lethal bright red laser beam with glow
      if (!isRedMotion) {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 18;
      }
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(h.x1, h.y1);
      ctx.lineTo(h.x2, h.y2);
      ctx.stroke();

      // White-hot core beam line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Faint standby guideline
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(h.x1, h.y1);
      ctx.lineTo(h.x2, h.y2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ── Render Powerups ── */
function renderPowerups() {
  if (!currentPowerups || currentPowerups.length === 0) return;
  var isRedMotion = (typeof fx !== 'undefined' && fx.isReducedMotion());
  var clockTime = (typeof fx !== 'undefined') ? fx.clock : (Date.now() / 1000);

  ctx.save();
  for (var i = 0; i < currentPowerups.length; i++) {
    var p = currentPowerups[i];
    if (p.collected) continue;

    var bob = isRedMotion ? 0 : Math.sin(clockTime * 3 + i) * 3;
    var py = p.y + bob;

    var color = '#00f5ff';
    var icon = '⚡';
    if (p.type === 'SHIELD') { color = '#ffd700'; icon = '🛡'; }
    else if (p.type === 'CHRONO') { color = '#39ff14'; icon = '⏱'; }

    // Outer rotating aura ring
    if (!isRedMotion) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, py, (p.radius || 12) + 3, 0, Math.PI * 2);
    ctx.stroke();

    // Inner core disc
    ctx.fillStyle = '#061224';
    ctx.beginPath();
    ctx.arc(p.x, py, p.radius || 12, 0, Math.PI * 2);
    ctx.fill();

    // Icon symbol
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, p.x, py);
  }
  ctx.restore();
}

/* ── Render Boss Encounter (Overlord Neural Core) ── */
function renderBoss() {
  if (!bossState || !bossState.active) return;
  var isRedMotion = (typeof fx !== 'undefined' && fx.isReducedMotion());
  var clockTime = (typeof fx !== 'undefined') ? fx.clock : (Date.now() / 1000);

  ctx.save();
  var bx = bossState.x, by = bossState.y;

  // Render expanding shockwaves
  if (bossState.shockwaves && bossState.shockwaves.length > 0) {
    for (var s = 0; s < bossState.shockwaves.length; s++) {
      var sw = bossState.shockwaves[s];
      var swAlpha = Math.max(0, 1 - sw.r / sw.maxR);
      ctx.strokeStyle = 'rgba(255, 0, 85, ' + swAlpha.toFixed(2) + ')';
      ctx.lineWidth = 4;
      if (!isRedMotion) {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(bx, by, sw.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Draw 3 rotating orbital shield nodes
  var nodeR = bossState.radius + 28;
  for (var n = 0; n < 3; n++) {
    var na = bossState.shieldAngle + (n * Math.PI * 2 / 3);
    var nx = bx + Math.cos(na) * nodeR;
    var ny = by + Math.sin(na) * nodeR;

    ctx.fillStyle = '#0d2238';
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    if (!isRedMotion) {
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 8;
    }
    ctx.beginPath();
    ctx.arc(nx, ny, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Central Neural Core chassis
  ctx.translate(bx, by);
  ctx.rotate(bossState.rotation);

  // Outer armor ring
  ctx.fillStyle = '#061020';
  ctx.strokeStyle = bossState.phase === 3 ? '#ff0055' : (bossState.phase === 2 ? '#ffb700' : '#00f5ff');
  ctx.lineWidth = 3;
  if (!isRedMotion) {
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 16;
  }
  ctx.beginPath();
  for (var a = 0; a < 8; a++) {
    var ang = a * Math.PI / 4;
    var px = Math.cos(ang) * bossState.radius;
    var py = Math.sin(ang) * bossState.radius;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pulsating red/amber central core eye
  var coreR = 14 + (isRedMotion ? 0 : Math.sin(clockTime * 6) * 3);
  ctx.fillStyle = bossState.phase === 3 ? '#ff0055' : '#ff3344';
  ctx.beginPath();
  ctx.arc(0, 0, coreR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ── Render Blackout Mask ── */
function renderBlackout() {
  if (!ctx) return;
  var px = player.x, py = player.y;

  ctx.save();
  // Radial spotlight gradient centered on player
  var spotR = 195;
  var grad = ctx.createRadialGradient(px, py, 60, px, py, spotR);
  grad.addColorStop(0, 'rgba(3, 7, 17, 0)');
  grad.addColorStop(0.65, 'rgba(3, 7, 17, 0.45)');
  grad.addColorStop(1, 'rgba(3, 7, 17, 0.96)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CONFIG.ARENA_W, CONFIG.ARENA_H);

  // Draw faint tactical radar blips for fragments outside spotlight
  ctx.fillStyle = 'rgba(57, 255, 20, 0.45)';
  for (var f = 0; f < fragments.length; f++) {
    var frag = fragments[f];
    if (frag.collected) continue;
    var fDist = Math.hypot(frag.x - px, frag.y - py);
    if (fDist > spotR) {
      ctx.beginPath();
      ctx.arc(frag.x, frag.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw faint radar blips for drones outside spotlight
  ctx.fillStyle = 'rgba(255, 0, 128, 0.4)';
  for (var d = 0; d < drones.length; d++) {
    var drone = drones[d];
    var dDist = Math.hypot(drone.x - px, drone.y - py);
    if (dDist > spotR) {
      ctx.beginPath();
      ctx.arc(drone.x, drone.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function renderArena() {
  // Deep tactical slate background with subtle radial gradient
  var grad = ctx.createRadialGradient(
    CONFIG.ARENA_W / 2, CONFIG.ARENA_H / 2, 80,
    CONFIG.ARENA_W / 2, CONFIG.ARENA_H / 2, 550
  );
  grad.addColorStop(0, '#061022');
  grad.addColorStop(1, '#030711');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CONFIG.ARENA_W, CONFIG.ARENA_H);

  // Subtle tactical grid (60px interval)
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.08)';
  ctx.lineWidth = 1;
  var gs = 60;
  for (var gx = gs; gx < CONFIG.ARENA_W; gx += gs) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CONFIG.ARENA_H); ctx.stroke();
  }
  for (var gy = gs; gy < CONFIG.ARENA_H; gy += gs) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CONFIG.ARENA_W, gy); ctx.stroke();
  }

  // Crosshairs at grid intersections
  ctx.fillStyle = 'rgba(0, 245, 255, 0.16)';
  for (var cx = gs * 2; cx < CONFIG.ARENA_W; cx += gs * 2) {
    for (var cy = gs * 2; cy < CONFIG.ARENA_H; cy += gs * 2) {
      ctx.fillRect(cx - 2, cy - 0.5, 4, 1);
      ctx.fillRect(cx - 0.5, cy - 2, 1, 4);
    }
  }

  // Tactical coordinate tick marks & labels every 120px
  ctx.save();
  ctx.fillStyle = 'rgba(0, 245, 255, 0.3)';
  ctx.font = '9px "Consolas", monospace';
  ctx.textAlign = 'center';
  for (var tx = 120; tx < CONFIG.ARENA_W; tx += 120) {
    ctx.fillRect(tx - 0.5, 0, 1, 5);
    ctx.fillRect(tx - 0.5, CONFIG.ARENA_H - 5, 1, 5);
    ctx.fillText('X.' + (tx / 10), tx, 14);
  }
  ctx.textAlign = 'left';
  for (var ty = 120; ty < CONFIG.ARENA_H; ty += 120) {
    ctx.fillRect(0, ty - 0.5, 5, 1);
    ctx.fillRect(CONFIG.ARENA_W - 5, ty - 0.5, 5, 1);
    ctx.fillText('Y.' + (ty / 10), 8, ty + 3);
  }

  // Corner tactical brackets ┌ ┐ └ ┘
  var bSize = 16;
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.5)';
  ctx.lineWidth = 2;
  // Top-left
  ctx.beginPath(); ctx.moveTo(4, 4 + bSize); ctx.lineTo(4, 4); ctx.lineTo(4 + bSize, 4); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(CONFIG.ARENA_W - 4 - bSize, 4); ctx.lineTo(CONFIG.ARENA_W - 4, 4); ctx.lineTo(CONFIG.ARENA_W - 4, 4 + bSize); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(4, CONFIG.ARENA_H - 4 - bSize); ctx.lineTo(4, CONFIG.ARENA_H - 4); ctx.lineTo(4 + bSize, CONFIG.ARENA_H - 4); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(CONFIG.ARENA_W - 4 - bSize, CONFIG.ARENA_H - 4); ctx.lineTo(CONFIG.ARENA_W - 4, CONFIG.ARENA_H - 4); ctx.lineTo(CONFIG.ARENA_W - 4, CONFIG.ARENA_H - 4 - bSize); ctx.stroke();

  // Subtle low-time emergency pulse (periphery border)
  if (timeRemaining <= 15 && gameState === 'PLAYING') {
    var isRedMotion = (typeof fx !== 'undefined' && fx.isReducedMotion());
    var alertPulse = isRedMotion ? 0.4 : (0.3 + 0.35 * Math.sin(Date.now() / 150));
    ctx.strokeStyle = 'rgba(255, 51, 51, ' + alertPulse + ')';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, CONFIG.ARENA_W - 4, CONFIG.ARENA_H - 4);
  }
  ctx.restore();

  if (gameState === 'PLAYING' || gameState === 'PAUSED') {
    var lvl = currentLevelData();
    ctx.save();
    ctx.font      = 'bold 12px "Consolas", "Courier New", monospace';
    ctx.fillStyle = 'rgba(0, 245, 255, 0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('// ' + lvl.name + ' //', CONFIG.ARENA_W / 2, 22);
    ctx.restore();
  }

  if (gameState === 'PLAYING' && showHint && !extraction.active) {
    ctx.save();
    ctx.font      = '13px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(0, 245, 255, 0.65)';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION DIRECTIVE: Collect all energy fragments to unlock extraction terminal',
      CONFIG.ARENA_W / 2, CONFIG.ARENA_H - 16);
    ctx.restore();
  }
}

/* ── Drone path hints (faint dashed lines, ~15% opacity) ── */
function renderDronePathHints() {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 0, 204, 0.15)';
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 6]);

  for (var i = 0; i < drones.length; i++) {
    var d = drones[i];
    var b = d.bounds || { minX: d.radius, maxX: CONFIG.ARENA_W - d.radius, minY: d.radius, maxY: CONFIG.ARENA_H - d.radius };

    ctx.beginPath();
    if (d.patternType === 'A') {
      ctx.moveTo(b.minX, d.y);
      ctx.lineTo(b.maxX, d.y);
    } else if (d.patternType === 'B') {
      ctx.moveTo(d.x, b.minY);
      ctx.lineTo(d.x, b.maxY);
    } else if (d.patternType === 'C') {
      ctx.strokeRect(d.loopX1, d.loopY1, d.loopX2 - d.loopX1, d.loopY2 - d.loopY1);
    } else if (d.patternType === 'D') {
      ctx.strokeRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/* ── Extraction zone (Accessible: lock icon + dashed vs solid + text) ── */
function renderExtractionZone() {
  var lvl = currentLevelData();
  var ex  = lvl.extraction;
  var ew  = ex.w, eh = ex.h;
  var cx  = ex.x + ew / 2;
  var cy  = ex.y + eh / 2;

  ctx.save();
  var isRedMotion = (typeof fx !== 'undefined' && fx.isReducedMotion());

  if (extraction.active) {
    var pulse = isRedMotion ? 1 : (0.75 + 0.25 * Math.sin(extraction.pulseT * 3));
    ctx.shadowBlur  = isRedMotion ? 0 : (20 * pulse);
    ctx.shadowColor = '#00f5ff';
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth   = 2.5;
    ctx.globalAlpha = pulse;

    // Solid outline
    drawHexagon(ctx, cx, cy, ew * 0.48);
    ctx.stroke();

    // Inner glowing fill
    ctx.globalAlpha = 0.18 * pulse;
    ctx.fillStyle   = '#00f5ff';
    drawHexagon(ctx, cx, cy, ew * 0.45);
    ctx.fill();

    // Concentric rotating rings & alignment glyphs (if motion enabled)
    if (!isRedMotion) {
      ctx.globalAlpha = 0.8 * pulse;
      var ringAngle = extraction.pulseT * 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, ew * 0.54, ringAngle, ringAngle + Math.PI * 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, ew * 0.54, ringAngle + Math.PI, ringAngle + Math.PI * 2.2);
      ctx.stroke();

      // Energy conduit rays
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.35)';
      ctx.lineWidth = 1;
      for (var r = 0; r < 4; r++) {
        var rayAng = ringAngle + (Math.PI / 2) * r;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rayAng) * (ew * 0.2), cy + Math.sin(rayAng) * (ew * 0.2));
        ctx.lineTo(cx + Math.cos(rayAng) * (ew * 0.5), cy + Math.sin(rayAng) * (ew * 0.5));
        ctx.stroke();
      }
    }

    ctx.globalAlpha  = 1;
    ctx.shadowBlur   = 0;
    ctx.fillStyle    = '#ffffff';
    ctx.font         = 'bold 11px "Consolas", "Courier New", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXTRACT', cx, cy);

  } else {
    // Locked: dim, dashed hexagon with tactical lock icon
    ctx.strokeStyle = 'rgba(0, 180, 210, 0.45)';
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([4, 4]);
    drawHexagon(ctx, cx, cy, ew * 0.45);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(0, 150, 180, 0.1)';
    drawHexagon(ctx, cx, cy, ew * 0.45);
    ctx.fill();

    // Draw tactical lock icon
    ctx.strokeStyle = 'rgba(0, 220, 240, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 5, Math.PI, 0); // shackle
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 200, 220, 0.55)';
    ctx.fillRect(cx - 6, cy - 8, 12, 8); // body

    ctx.fillStyle    = 'rgba(0, 220, 240, 0.8)';
    ctx.font         = 'bold 10px "Consolas", "Courier New", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOCKED', cx, cy + 9);
  }

  ctx.restore();
}

function drawHexagon(context, cx, cy, r) {
  context.beginPath();
  for (var i = 0; i < 6; i++) {
    var angle = (Math.PI / 3) * i - Math.PI / 6;
    var hx = cx + r * Math.cos(angle);
    var hy = cy + r * Math.sin(angle);
    if (i === 0) context.moveTo(hx, hy); else context.lineTo(hx, hy);
  }
  context.closePath();
}

/* ── Fragments (green diamonds + vertical bob ±3px + glow pulse 1.5 Hz) ── */
function renderFragments() {
  var isRedMotion = (typeof fx !== 'undefined' && fx.isReducedMotion());
  var clockTime = (typeof fx !== 'undefined') ? fx.clock : (Date.now() / 1000);

  for (var i = 0; i < fragments.length; i++) {
    var f = fragments[i];
    if (f.collected) continue;

    var r = f.radius;

    // Visual vertical bob ±3px with 2s period (hitbox untouched)
    var visualY = f.y;
    if (!isRedMotion) {
      visualY += Math.sin((clockTime * Math.PI) + (f.phase || 0)) * 3;
    }

    // Glow pulse: 1.5 Hz, radius 8 to 15 px
    var glowRadius = 10;
    if (!isRedMotion) {
      glowRadius = 8 + 7 * (0.5 + 0.5 * Math.sin(clockTime * Math.PI * 3 + i));
    }

    ctx.save();
    if (!isRedMotion) {
      ctx.shadowBlur  = glowRadius;
      ctx.shadowColor = '#39ff14';
    }

    // Outer orbiting data facets / energy ring
    if (!isRedMotion) {
      var orbAngle = clockTime * 2.2 + i;
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(f.x, visualY, r + 4, orbAngle, orbAngle + Math.PI * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(f.x, visualY, r + 4, orbAngle + Math.PI, orbAngle + Math.PI * 1.8);
      ctx.stroke();
    }

    // Main diamond crystal hull
    ctx.fillStyle   = '#052a12';
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth   = 1.8;

    ctx.beginPath();
    ctx.moveTo(f.x,     visualY - r);
    ctx.lineTo(f.x + r, visualY);
    ctx.lineTo(f.x,     visualY + r);
    ctx.lineTo(f.x - r, visualY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner glowing quantum relic kernel
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = isRedMotion ? 0 : 6;
    ctx.beginPath();
    ctx.arc(f.x, visualY, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* ── Drones (spinning rotor, eye offset toward travel direction) ── */
function renderDrones() {
  var isRedMotion = (typeof fx !== 'undefined' && fx.isReducedMotion());

  for (var i = 0; i < drones.length; i++) {
    var d = drones[i];
    var r = d.radius;
    var isHeavy = (d.patternType === 'D');
    var isHunter = (d.patternType === 'H');
    var themeColor = isHeavy ? '#ffd700' : '#ff00cc';
    var themeFill  = isHeavy ? '#261700' : '#220033';

    ctx.save();
    if (!isRedMotion) {
      ctx.shadowBlur  = isHeavy ? 16 : 14;
      ctx.shadowColor = themeColor;
    }

    // Drone chassis (hexagonal for heavy D, armored circular for A/B/C)
    ctx.fillStyle   = themeFill;
    ctx.strokeStyle = themeColor;
    ctx.lineWidth   = 2;

    if (isHeavy) {
      drawHexagon(ctx, d.x, d.y, r);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Rotating sensor telemetry sweep rings
    if (!isRedMotion) {
      var ang = d.spinAngle || 0;
      ctx.strokeStyle = isHeavy ? 'rgba(255, 215, 0, 0.7)' : 'rgba(255, 0, 204, 0.65)';
      ctx.lineWidth   = 1.2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, r + 4, ang, ang + Math.PI * 1.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(d.x, d.y, r + 4, ang + Math.PI, ang + Math.PI * 2.1);
      ctx.stroke();
    }

    // Directional vector
    var eyeDx = 0, eyeDy = 0;
    var sp = Math.hypot(d.vx || 0, d.vy || 0);
    if (sp > 0) {
      eyeDx = (d.vx / sp) * 3.5;
      eyeDy = (d.vy / sp) * 3.5;

      // Subtle forward scanning sensor cone arc
      if (!isRedMotion) {
        var travelAngle = Math.atan2(d.vy, d.vx);
        ctx.save();
        ctx.fillStyle = isHeavy ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 0, 204, 0.08)';
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.arc(d.x, d.y, r + 24, travelAngle - 0.35, travelAngle + 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Central targeting optical core
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(d.x + eyeDx, d.y + eyeDy, r * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = isHeavy ? '#ffffff' : '#ff44ee';
    ctx.fill();
    ctx.strokeStyle = isHeavy ? '#ffd700' : '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Debug hitbox
    if (DEBUG_MODE) {
      ctx.strokeStyle = 'rgba(255,255,0,0.5)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

/* ── Player (idle pulse 1 Hz, facing notch cue, hit blink 3 Hz 0.45-1.0) ── */
function renderPlayer() {
  var ps   = CONFIG.PLAYER_SIZE;
  var half = ps / 2;
  var px   = player.x - half;
  var py   = player.y - half;

  var isRedMotion = (typeof fx !== 'undefined' && fx.isReducedMotion());
  var clockTime = (typeof fx !== 'undefined') ? fx.clock : (Date.now() / 1000);

  var opacity = 1.0;
  if (hitCooldownTimer > 0) {
    // 3 Hz blink between 0.45 and 1.0 (never full on/off flicker)
    var blinkWave = 0.5 + 0.5 * Math.sin(clockTime * Math.PI * 6); // 3 Hz
    opacity = isRedMotion ? 0.75 : (0.45 + 0.55 * blinkWave);
  }

  // Idle glow pulse: 12 to 20 px at 1 Hz
  var idleGlow = isRedMotion ? 12 : (12 + 8 * (0.5 + 0.5 * Math.sin(clockTime * Math.PI * 2)));

  ctx.save();
  ctx.globalAlpha = opacity;

  // Steady outline / barrier ring during cooldown
  if (hitCooldownTimer > 0) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, half + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Golden Shield generator ring
  if (activePowerups.shieldActive) {
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    if (!isRedMotion) {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.arc(player.x, player.y, half + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Dash blur / trail effect
  if (dashState.active && !isRedMotion) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    var trailDist = 18;
    var tdx = player.facingDx || 0;
    var tdy = player.facingDy || 1;
    var tmag = Math.hypot(tdx, tdy) || 1;
    ctx.moveTo(player.x - (tdx / tmag) * trailDist, player.y - (tdy / tmag) * trailDist);
    ctx.lineTo(player.x, player.y);
    ctx.stroke();
    ctx.restore();
  }

  // Direction angle
  var fdx = player.facingDx !== undefined ? player.facingDx : 0;
  var fdy = player.facingDy !== undefined ? player.facingDy : 1;
  var angle = Math.atan2(fdy, fdx);

  // Check if moving for thruster plumes
  var isMoving = (player.vx !== 0 || player.vy !== 0 ||
                  keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown'] ||
                  keys['KeyA'] || keys['KeyD'] || keys['KeyW'] || keys['KeyS'] ||
                  (touchState && touchState.active));

  ctx.translate(player.x, player.y);
  ctx.rotate(angle);

  // Thruster exhaust plumes (at rear: x = -half)
  if (isMoving && !isRedMotion) {
    var plumeLen = 6 + 4 * Math.random();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f5ff';
    ctx.beginPath();
    ctx.moveTo(-half + 2, -4);
    ctx.lineTo(-half - plumeLen, -2);
    ctx.lineTo(-half + 2, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-half + 2, 0);
    ctx.lineTo(-half - plumeLen, 2);
    ctx.lineTo(-half + 2, 4);
    ctx.fill();
  }

  // Main tactical interceptor hull
  if (!isRedMotion) {
    ctx.shadowBlur  = idleGlow;
    ctx.shadowColor = '#00f5ff';
  }
  ctx.fillStyle   = '#05192c';
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth   = 1.8;

  ctx.beginPath();
  ctx.moveTo(half - 1, 0);             // Nose
  ctx.lineTo(-half + 2, -half + 2);    // Left wingtip
  ctx.lineTo(-half + 5, 0);            // Engine notch
  ctx.lineTo(-half + 2, half - 2);     // Right wingtip
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cyber chassis panel lines
  ctx.strokeStyle = '#60eaff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(half - 5, 0);
  ctx.lineTo(-half + 5, -5);
  ctx.moveTo(half - 5, 0);
  ctx.lineTo(-half + 5, 5);
  ctx.stroke();

  // Cockpit sensor core (brilliant cyan / white)
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = isRedMotion ? 0 : 8;
  ctx.beginPath();
  ctx.arc(1, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  // Nose beacon (white facing cue for accessibility)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(half - 4, -1.5, 3, 3);

  ctx.restore();

  // Debug hitbox (exact 24x24 rect)
  if (DEBUG_MODE) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(px, py, ps, ps);
    ctx.restore();
  }
}

function renderBanner() {
  if (!banner) return;

  var fadeOut = Math.min(1, banner.timer / 0.4);
  var fadeIn  = Math.min(1, (banner.maxTime - banner.timer) / 0.3);
  var alpha   = Math.min(fadeOut, fadeIn);

  ctx.save();
  ctx.globalAlpha  = alpha;
  ctx.fillStyle    = '#39ff14';
  ctx.font         = 'bold 22px "Bahnschrift", "Segoe UI", sans-serif';
  ctx.textAlign    = 'center';
  ctx.shadowBlur   = 16;
  ctx.shadowColor  = '#39ff14';
  ctx.fillText(banner.text, CONFIG.ARENA_W / 2, CONFIG.ARENA_H / 2 - 30);
  ctx.restore();
}

function renderDebug() {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,0,0.9)';
  ctx.font      = '12px "Consolas", monospace';
  ctx.textAlign = 'left';
  var fxCount = (typeof fx !== 'undefined') ? fx.count : 0;
  var vCount  = (typeof audio !== 'undefined') ? audio.activeVoices : 0;
  ctx.fillText(
    'DEBUG | FPS:' + debugFps +
    ' | state:' + gameState +
    ' | lvl:' + (currentLevel + 1) +
    ' | frags:' + fragmentsCollected +
    ' | cool:' + hitCooldownTimer.toFixed(2) +
    ' | fx:' + fxCount +
    ' | voices:' + vCount,
    8, 18
  );
  ctx.restore();
}

/* ============================================================
   11. RESET & BUILD HELPERS
   ============================================================ */

function buildInitialGameObjects() {
  currentLevel    = 0;
  score           = 0;
  elapsedPlayTime = 0;
  banner          = null;
  runStartBest    = saveRecord.bestScore;
  loadLevel(0);
}

function showHUD(visible) {
  var hud = document.getElementById('hud');
  if (!hud) return;
  if (visible) hud.classList.add('visible');
  else         hud.classList.remove('visible');
}

var hudCache = {
  level: '',
  fragments: '',
  score: '',
  best: '',
  time: ''
};

function updateHUD() {
  var lvl = currentLevelData();

  var diff = (saveRecord && saveRecord.settings && saveRecord.settings.difficulty) || 'normal';
  var diffTag = diff === 'basic' ? ' [BASIC]' : (diff === 'hard' ? ' [HARD]' : '');
  var levelStr = 'LVL ' + (currentLevel + 1) + '/' + LEVELS.length + diffTag;
  if (hudCache.level !== levelStr) {
    hudCache.level = levelStr;
    var hudLevel = document.getElementById('hud-level');
    if (hudLevel) hudLevel.textContent = levelStr;
  }

  var fragsStr = 'FRAGMENTS: ' + fragmentsCollected + '/' + (lvl ? lvl.fragments.length : 0);
  if (hudCache.fragments !== fragsStr) {
    hudCache.fragments = fragsStr;
    var hudFrags = document.getElementById('hud-fragments');
    if (hudFrags) hudFrags.textContent = fragsStr;
  }

  var scoreStr = 'SCORE: ' + score;
  if (hudCache.score !== scoreStr) {
    hudCache.score = scoreStr;
    var hudScore = document.getElementById('hud-score');
    if (hudScore) hudScore.textContent = scoreStr;
  }

  var bestScoreVal = Math.max(saveRecord.bestScore, score);
  var bestStr = 'BEST: ' + bestScoreVal;
  if (hudCache.best !== bestStr) {
    hudCache.best = bestStr;
    var hudBest = document.getElementById('hud-best');
    if (hudBest) hudBest.textContent = bestStr;
  }

  var timeStr = 'TIME: ' + formatTime(timeRemaining);
  if (hudCache.time !== timeStr) {
    hudCache.time = timeStr;
    var hudTime = document.getElementById('hud-time');
    if (hudTime) hudTime.textContent = timeStr;
  }

  var hudDash = document.getElementById('hud-dash');
  if (hudDash) {
    if (dashState.active) {
      hudDash.className = 'badge-dash active';
      hudDash.textContent = 'DASH: BOOST';
    } else if (dashState.cooldown > 0) {
      hudDash.className = 'badge-dash cooldown';
      hudDash.textContent = 'DASH: ' + dashState.cooldown.toFixed(1) + 's';
    } else {
      hudDash.className = 'badge-dash';
      hudDash.textContent = 'DASH: READY';
    }
  }

  var touchBtnDash = document.getElementById('touch-btn-dash');
  if (touchBtnDash) {
    if (dashState.cooldown > 0 && !dashState.active) {
      touchBtnDash.classList.add('cooldown');
    } else {
      touchBtnDash.classList.remove('cooldown');
    }
  }
}

function updateStartScreen() {
  var startBest = document.getElementById('start-best');
  if (startBest) startBest.textContent = saveRecord.bestScore;

  var settingsBest = document.getElementById('settings-best-val');
  if (settingsBest) settingsBest.textContent = saveRecord.bestScore;

  var startNoSave = document.getElementById('start-no-save');
  if (startNoSave) startNoSave.style.display = storageAvailable ? 'none' : '';

  updateSectorPillsUI();
  setSelectedSector(selectedStartLevel);
  updateSettingsUI();
}

function updateSettingsUI() {
  var vol = (saveRecord && saveRecord.settings && typeof saveRecord.settings.volume === 'number')
    ? saveRecord.settings.volume : 0.5;
  var musicVol = (saveRecord && saveRecord.settings && typeof saveRecord.settings.music === 'number')
    ? saveRecord.settings.music : 0.6;
  var sfxVol = (saveRecord && saveRecord.settings && typeof saveRecord.settings.sfx === 'number')
    ? saveRecord.settings.sfx : 0.7;
  var isMuted = (saveRecord && saveRecord.settings && saveRecord.settings.muted === true);
  var fxMode = (saveRecord && saveRecord.settings && saveRecord.settings.effects) || 'auto';
  var isShake = !(saveRecord && saveRecord.settings && saveRecord.settings.shake === false);
  var isCrt = !(saveRecord && saveRecord.settings && saveRecord.settings.crt === false);

  var settingVol = document.getElementById('setting-volume');
  var volDisplay = document.getElementById('volume-val');
  if (settingVol) settingVol.value = Math.round(vol * 100);
  if (volDisplay) volDisplay.textContent = Math.round(vol * 100) + '%';

  var settingMusic = document.getElementById('setting-music');
  var musicDisplay = document.getElementById('music-val');
  if (settingMusic) settingMusic.value = Math.round(musicVol * 100);
  if (musicDisplay) musicDisplay.textContent = Math.round(musicVol * 100) + '%';

  var settingSfx = document.getElementById('setting-sfx');
  var sfxDisplay = document.getElementById('sfx-val');
  if (settingSfx) settingSfx.value = Math.round(sfxVol * 100);
  if (sfxDisplay) sfxDisplay.textContent = Math.round(sfxVol * 100) + '%';

  var btnSettingMute = document.getElementById('btn-setting-mute');
  if (btnSettingMute) {
    btnSettingMute.textContent = isMuted ? 'SOUND: OFF (MUTED)' : 'SOUND: ON';
    btnSettingMute.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
  }

  var settingFx = document.getElementById('setting-effects');
  if (settingFx) settingFx.value = fxMode;

  var btnShake = document.getElementById('btn-setting-shake');
  if (btnShake) {
    btnShake.textContent = isShake ? 'SHAKE: ON' : 'SHAKE: OFF';
    btnShake.setAttribute('aria-pressed', isShake ? 'true' : 'false');
  }

  var btnCrt = document.getElementById('btn-setting-crt');
  if (btnCrt) {
    btnCrt.textContent = isCrt ? 'SCANLINES: ON' : 'SCANLINES: OFF';
    btnCrt.setAttribute('aria-pressed', isCrt ? 'true' : 'false');
  }

  var settingsBestVal = document.getElementById('settings-best-val');
  if (settingsBestVal) settingsBestVal.textContent = saveRecord.bestScore;
}

function restartCurrentLevel() {
  clearKeys();
  if (typeof audio !== 'undefined') {
    audio.reset();
  }
  loadLevel(currentLevel);
  setState('PLAYING');
  if (rafHandle === null) {
    startLoop(true);
  }
  announce('Level restarted. Sector ' + (currentLevel + 1) + '.', true);
}

var overlaySource = 'start';
var currentOverlayScreen = 'start';

function showOverlay(screen) {
  var overlay  = document.getElementById('overlay');
  if (!overlay) return;
  var allNames = ['start', 'difficulty', 'settings', 'controls', 'quit', 'paused', 'won', 'lost', 'level-complete', 'error'];

  currentOverlayScreen = screen;

  if (screen === null) {
    overlay.classList.remove('visible');
    if (document.body) document.body.classList.remove('overlay-active');
    allNames.forEach(function (s) {
      var el = document.getElementById('screen-' + s);
      if (el) el.style.display = 'none';
    });
    return;
  }

  overlay.classList.add('visible');
  if (document.body) document.body.classList.add('overlay-active');
  allNames.forEach(function (s) {
    var el = document.getElementById('screen-' + s);
    if (el) el.style.display = (s === screen) ? '' : 'none';
  });
}

function spawnBanner(text, duration) {
  banner = { text: text, timer: duration, maxTime: duration };
}

function formatTime(seconds) {
  if (typeof NeonLogic !== 'undefined' && NeonLogic.formatTime) {
    return NeonLogic.formatTime(seconds);
  }
  var s   = Math.max(0, Math.ceil(seconds));
  var m   = Math.floor(s / 60);
  var sec = s % 60;
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

function formatElapsed(seconds) {
  if (typeof NeonLogic !== 'undefined' && NeonLogic.formatTime) {
    return NeonLogic.formatTime(seconds);
  }
  var s   = Math.max(0, Math.floor(seconds));
  var m   = Math.floor(s / 60);
  var sec = s % 60;
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

/* ============================================================
   12. MAIN LOOP (Guarded single RAF loop & fpscap test hook)
   ============================================================ */

var frameInterval = 0;
var lastFrameTime = 0;

function loop(timestamp) {
  rafHandle = requestAnimationFrame(loop);

  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
    lastFrameTime = timestamp;
  }

  // Handle fpscap parameter in debug mode
  if (debugFpsCap > 0) {
    frameInterval = 1000 / debugFpsCap;
    var elapsedSinceLast = timestamp - lastFrameTime;
    if (elapsedSinceLast < frameInterval) {
      return; // Skip frame to match capped FPS
    }
    lastFrameTime = timestamp - (elapsedSinceLast % frameInterval);
  }

  var dt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  totalFrames++;

  // Throwtest hook for QA error overlay verification
  if (DEBUG_MODE && typeof window !== 'undefined' && window.location &&
      window.location.search.indexOf('throwtest') !== -1 && totalFrames === 2) {
    throw new Error('Simulated throwtest crash for error overlay verification');
  }

  if (DEBUG_MODE) {
    debugFrameCount++;
    debugFpsTimer += dt;
    if (debugFpsTimer >= 1.0) {
      debugFps        = debugFrameCount;
      debugFrameCount = 0;
      debugFpsTimer  -= 1.0;
    }
  }

  try {
    update(dt);
    render();
  } catch (err) {
    if (rafHandle !== null) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
    }
    handleFatalError(err);
  }
}

function startLoop(isRecovery) {
  if (!isRecovery) {
    stats.loopStarts++;
  }
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle);
    rafHandle = null;
  }
  lastTimestamp = null;
  rafHandle = requestAnimationFrame(loop);
}

/* ── DOM ready bootstrap ── */
if (typeof window !== 'undefined' && window.__NEON_TEST__) {
  // Test harness mode: do not auto-run init or main RAF loop
} else if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

/* ============================================================
   DEBUG ONLY — validateLevels()
   ============================================================ */

function validateLevels() {
  var expectedFragmentCounts = [6, 8, 10];
  var expectedDroneCounts    = [3, 4, 5];
  var expectedSpeeds         = [110, 135, 160];
  var exCenterX = CONFIG.EXTRACT_X + CONFIG.EXTRACT_W / 2;
  var exCenterY = CONFIG.EXTRACT_Y + CONFIG.EXTRACT_H / 2;

  function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  function distPointToSegment(p, a, b) {
    var l2 = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    if (l2 === 0) return dist(p, a);
    var t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt(Math.pow(p.x - (a.x + t * (b.x - a.x)), 2) + Math.pow(p.y - (a.y + t * (b.y - a.y)), 2));
  }

  function getDronePathSegments(d) {
    var segs = [];
    var b = d.bounds || { minX: CONFIG.DRONE_RADIUS, maxX: CONFIG.ARENA_W - CONFIG.DRONE_RADIUS, minY: CONFIG.DRONE_RADIUS, maxY: CONFIG.ARENA_H - CONFIG.DRONE_RADIUS };
    if (d.patternType === 'A') {
      segs.push({ a: { x: b.minX, y: d.y }, b: { x: b.maxX, y: d.y } });
    } else if (d.patternType === 'B') {
      segs.push({ a: { x: d.x, y: b.minY }, b: { x: d.x, y: b.maxY } });
    } else if (d.patternType === 'C') {
      segs.push({ a: { x: d.loopX1, y: d.loopY1 }, b: { x: d.loopX2, y: d.loopY1 } });
      segs.push({ a: { x: d.loopX2, y: d.loopY1 }, b: { x: d.loopX2, y: d.loopY2 } });
      segs.push({ a: { x: d.loopX2, y: d.loopY2 }, b: { x: d.loopX1, y: d.loopY2 } });
      segs.push({ a: { x: d.loopX1, y: d.loopY2 }, b: { x: d.loopX1, y: d.loopY1 } });
    } else if (d.patternType === 'D') {
      segs.push({ a: { x: b.minX, y: b.minY }, b: { x: b.maxX, y: b.maxY } });
      segs.push({ a: { x: b.minX, y: b.maxY }, b: { x: b.maxX, y: b.minY } });
      segs.push({ a: { x: b.minX, y: b.minY }, b: { x: b.maxX, y: b.minY } });
      segs.push({ a: { x: b.maxX, y: b.minY }, b: { x: b.maxX, y: b.maxY } });
      segs.push({ a: { x: b.maxX, y: b.maxY }, b: { x: b.minX, y: b.maxY } });
      segs.push({ a: { x: b.minX, y: b.maxY }, b: { x: b.minX, y: b.minY } });
    }
    return segs;
  }

  function minDroneDistanceToPoint(d, p) {
    var segs = getDronePathSegments(d);
    var minD = Infinity;
    for (var s = 0; s < segs.length; s++) {
      minD = Math.min(minD, distPointToSegment(p, segs[s].a, segs[s].b));
    }
    return minD;
  }

  var violations = 0;

  LEVELS.forEach(function (lvl, li) {
    var tag = '[validateLevels] Level ' + (li + 1);

    if (lvl.fragments.length !== expectedFragmentCounts[li]) {
      console.warn(tag + ' fragment count mismatch: expected ' + expectedFragmentCounts[li] + ', got ' + lvl.fragments.length);
      violations++;
    }
    if (lvl.drones.length !== expectedDroneCounts[li]) {
      console.warn(tag + ' drone count mismatch: expected ' + expectedDroneCounts[li] + ', got ' + lvl.drones.length);
      violations++;
    }

    lvl.drones.forEach(function (d, di) {
      if (d.speed !== expectedSpeeds[li]) {
        console.warn(tag + ' drone ' + di + ' speed mismatch: ' + d.speed + ' != ' + expectedSpeeds[li]);
        violations++;
      }
      var pStart = { x: CONFIG.PLAYER_START_X, y: CONFIG.PLAYER_START_Y };
      var startDist = dist(d, pStart);
      if (startDist < 150) {
        console.warn(tag + ' drone ' + di + ' start position too close to player: ' + startDist.toFixed(1) + ' < 150px');
        violations++;
      }
      var pathDist = minDroneDistanceToPoint(d, pStart);
      if (pathDist < 150) {
        console.warn(tag + ' drone ' + di + ' patrol path comes within 150px of player start: ' + pathDist.toFixed(1) + 'px');
        violations++;
      }
      var b = d.bounds || { minX: CONFIG.DRONE_RADIUS, maxX: CONFIG.ARENA_W - CONFIG.DRONE_RADIUS, minY: CONFIG.DRONE_RADIUS, maxY: CONFIG.ARENA_H - CONFIG.DRONE_RADIUS };
      if (b.minX < CONFIG.DRONE_RADIUS || b.maxX > CONFIG.ARENA_W - CONFIG.DRONE_RADIUS ||
          b.minY < CONFIG.DRONE_RADIUS || b.maxY > CONFIG.ARENA_H - CONFIG.DRONE_RADIUS) {
        console.warn(tag + ' drone ' + di + ' bounds outside arena');
        violations++;
      }
    });

    var fragsNearDronePaths = 0;
    lvl.fragments.forEach(function (f, fi) {
      if (f.x < 40 || f.x > CONFIG.ARENA_W - 40 ||
          f.y < 40 || f.y > CONFIG.ARENA_H - 40) {
        console.warn(tag + ' fragment ' + fi + ' within 40px of wall (' + f.x + ',' + f.y + ')');
        violations++;
      }
      var distPS = dist(f, { x: CONFIG.PLAYER_START_X, y: CONFIG.PLAYER_START_Y });
      if (distPS < 80) {
        console.warn(tag + ' fragment ' + fi + ' within 80px of player start: ' + distPS.toFixed(1) + 'px');
        violations++;
      }
      var distEx = dist(f, { x: exCenterX, y: exCenterY });
      if (distEx < 80) {
        console.warn(tag + ' fragment ' + fi + ' within 80px of extraction center: ' + distEx.toFixed(1) + 'px');
        violations++;
      }

      var minPathDist = Infinity;
      lvl.drones.forEach(function (d) {
        minPathDist = Math.min(minPathDist, minDroneDistanceToPoint(d, f));
      });
      if (minPathDist < 60) {
        fragsNearDronePaths++;
      }
    });

    if (fragsNearDronePaths > 2) {
      console.warn(tag + ' too many fragments near drone paths: ' + fragsNearDronePaths + ' (max 2)');
      violations++;
    }
  });

  if (violations === 0) {
    console.info('[validateLevels] All level layouts satisfy fairness rules (0 violations).');
  } else {
    console.warn('[validateLevels] Found ' + violations + ' layout violations.');
  }
}
