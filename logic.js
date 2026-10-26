/* ============================================================
   NEON RELIC: THE LAST SIGNAL — logic.js (Day 3 v2)
   Pure game logic & utilities namespace: window.NeonLogic
   Zero DOM, storage, or audio dependencies.
   Can be exercised in browsers and headless test runners.
   ============================================================ */

(function (root) {
  var NeonLogic = {};

  // --- 1. Seeded Random Number Generator (Mulberry32) ---
  NeonLogic.createSeededRNG = function (seed) {
    var s = (seed === undefined ? 123456789 : seed) >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // --- 2. Collision Detection (Pure) ---
  NeonLogic.circleRect = function (cx, cy, cr, rx, ry, rw, rh) {
    var halfW = rw / 2;
    var halfH = rh / 2;
    var nearX = Math.max(rx - halfW, Math.min(cx, rx + halfW));
    var nearY = Math.max(ry - halfH, Math.min(cy, ry + halfH));
    var dx = cx - nearX;
    var dy = cy - nearY;
    return (dx * dx + dy * dy) < (cr * cr);
  };

  NeonLogic.rectRect = function (ax, ay, aw, ah, bx, by, bw, bh) {
    return Math.abs(ax - bx) < (aw + bw) / 2 &&
           Math.abs(ay - by) < (ah + bh) / 2;
  };

  // --- 3. Input Normalization & Opposite Key Cancellation ---
  NeonLogic.normalizeInput = function (rawDx, rawDy) {
    var dx = rawDx;
    var dy = rawDy;

    // Normalize diagonal so diagonal velocity equals cardinal velocity
    if (dx !== 0 && dy !== 0) {
      var inv = 0.7071067811865476; // 1/√2
      dx *= inv;
      dy *= inv;
    }
    return { dx: dx, dy: dy };
  };

  // --- 3b. Joystick / Touch Vector Calculation (Pure) ---
  NeonLogic.calculateJoystickVector = function (deltaX, deltaY, maxRadius, deadZone) {
    var maxR = (typeof maxRadius === 'number' && maxRadius > 0) ? maxRadius : 45;
    var dead = (typeof deadZone === 'number' && deadZone >= 0) ? deadZone : 6;
    var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (dist < dead) {
      return {
        dx: 0,
        dy: 0,
        dist: dist,
        clampedDist: 0,
        active: false
      };
    }

    var normX = deltaX / dist;
    var normY = deltaY / dist;
    var clampedDist = Math.min(dist, maxR);

    return {
      dx: normX,
      dy: normY,
      dist: dist,
      clampedDist: clampedDist,
      active: true
    };
  };

  // --- 4. Drone Step Physics (Pure) ---
  NeonLogic.stepDronePattern = function (d, dt, arenaW, arenaH) {
    var r = d.radius || 15;
    var b = d.bounds || { minX: r, maxX: arenaW - r, minY: r, maxY: arenaH - r };
    var minX = b.minX, maxX = b.maxX;
    var minY = b.minY, maxY = b.maxY;

    var nx = d.x;
    var ny = d.y;
    var nvx = d.vx || 0;
    var nvy = d.vy || 0;
    var phase = d.loopPhase || 0;

    if (d.patternType === 'A') {
      nx += nvx * dt;
      if (nx <= minX) { nx = minX; nvx = Math.abs(nvx); }
      if (nx >= maxX) { nx = maxX; nvx = -Math.abs(nvx); }

    } else if (d.patternType === 'B') {
      ny += nvy * dt;
      if (ny <= minY) { ny = minY; nvy = Math.abs(nvy); }
      if (ny >= maxY) { ny = maxY; nvy = -Math.abs(nvy); }

    } else if (d.patternType === 'C') {
      var sp = (d.speed || 110) * dt;
      var lx1 = d.loopX1, ly1 = d.loopY1;
      var lx2 = d.loopX2, ly2 = d.loopY2;

      if (phase === 0) {
        nx += sp;
        if (nx >= lx2) { nx = lx2; phase = 1; }
      } else if (phase === 1) {
        ny += sp;
        if (ny >= ly2) { ny = ly2; phase = 2; }
      } else if (phase === 2) {
        nx -= sp;
        if (nx <= lx1) { nx = lx1; phase = 3; }
      } else {
        ny -= sp;
        if (ny <= ly1) { ny = ly1; phase = 0; }
      }

    } else if (d.patternType === 'D') {
      nx += nvx * dt;
      ny += nvy * dt;
      if (nx <= minX) { nx = minX; nvx = Math.abs(nvx); }
      if (nx >= maxX) { nx = maxX; nvx = -Math.abs(nvx); }
      if (ny <= minY) { ny = minY; nvy = Math.abs(nvy); }
      if (ny >= maxY) { ny = maxY; nvy = -Math.abs(nvy); }
    }

    // Strict boundary safety clamp
    nx = Math.max(minX, Math.min(maxX, nx));
    ny = Math.max(minY, Math.min(maxY, ny));

    return {
      x: nx,
      y: ny,
      vx: nvx,
      vy: nvy,
      loopPhase: phase
    };
  };

  // --- 4b. Hunter Drone Pursuit Physics (Pure) ---
  NeonLogic.stepHunterDrone = function (drone, targetX, targetY, obstacles, dt, arenaW, arenaH) {
    var r = drone.radius || 15;
    var spd = drone.speed || 135;
    var dx = targetX - drone.x;
    var dy = targetY - drone.y;
    var dist = Math.hypot(dx, dy);
    var vx = drone.vx || 0;
    var vy = drone.vy || 0;

    if (dist > 5) {
      var desiredVx = (dx / dist) * spd;
      var desiredVy = (dy / dist) * spd;
      var steerRate = 3.5;
      vx += (desiredVx - vx) * Math.min(1, steerRate * dt);
      vy += (desiredVy - vy) * Math.min(1, steerRate * dt);
    }

    // Repulsion from obstacles
    if (obstacles && obstacles.length > 0) {
      for (var i = 0; i < obstacles.length; i++) {
        var ob = obstacles[i];
        var ocx = ob.x + ob.w / 2;
        var ocy = ob.y + ob.h / 2;
        var odx = drone.x - ocx;
        var ody = drone.y - ocy;
        var oDist = Math.hypot(odx, ody);
        var thresh = (Math.max(ob.w, ob.h) / 2) + r + 25;
        if (oDist < thresh && oDist > 0) {
          var repForce = (thresh - oDist) / thresh * (spd * 1.5);
          vx += (odx / oDist) * repForce * dt;
          vy += (ody / oDist) * repForce * dt;
        }
      }
    }

    var nx = drone.x + vx * dt;
    var ny = drone.y + vy * dt;
    nx = Math.max(r, Math.min(arenaW - r, nx));
    ny = Math.max(r, Math.min(arenaH - r, ny));

    return { x: nx, y: ny, vx: vx, vy: vy };
  };

  // --- 4c. Obstacle Collision Resolution (AABB Pure) ---
  NeonLogic.resolveObstacles = function (px, py, ps, obstacles) {
    var half = ps / 2;
    var nx = px;
    var ny = py;
    var collided = false;

    if (!obstacles || obstacles.length === 0) return { x: nx, y: ny, collided: false };

    for (var i = 0; i < obstacles.length; i++) {
      var ob = obstacles[i];
      var left = ob.x, right = ob.x + ob.w;
      var top = ob.y, bottom = ob.y + ob.h;

      var pLeft = nx - half, pRight = nx + half;
      var pTop = ny - half, pBottom = ny + half;

      if (pRight > left && pLeft < right && pBottom > top && pTop < bottom) {
        collided = true;
        var overlapLeft = pRight - left;
        var overlapRight = right - pLeft;
        var overlapTop = pBottom - top;
        var overlapBottom = bottom - pTop;

        var minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapLeft) {
          nx = left - half;
        } else if (minOverlap === overlapRight) {
          nx = right + half;
        } else if (minOverlap === overlapTop) {
          ny = top - half;
        } else {
          ny = bottom + half;
        }
      }
    }

    return { x: nx, y: ny, collided: collided };
  };

  // --- 4d. Distance to Line Segment (Pure) ---
  NeonLogic.pointToSegmentDist = function (px, py, x1, y1, x2, y2) {
    var l2 = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    var t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    var projX = x1 + t * (x2 - x1);
    var projY = y1 + t * (y2 - y1);
    return Math.hypot(px - projX, py - projY);
  };

  // --- 5. Scoring Math ---
  NeonLogic.clampScore = function (currentScore, delta) {
    return Math.max(0, currentScore + delta);
  };

  // --- 6. State Machine Transition Validation ---
  NeonLogic.VALID_TRANSITIONS = {
    START:          ['PLAYING'],
    PLAYING:        ['PAUSED', 'LEVEL_COMPLETE', 'WON', 'LOST', 'PLAYING'],
    PAUSED:         ['PLAYING', 'START'],
    LEVEL_COMPLETE: ['PLAYING'],
    WON:            ['PLAYING', 'START'],
    LOST:           ['PLAYING', 'START']
  };

  NeonLogic.canTransition = function (fromState, toState) {
    if (fromState === toState && toState !== 'PLAYING') return false;
    var allowed = NeonLogic.VALID_TRANSITIONS[fromState];
    return !!(allowed && allowed.indexOf(toState) !== -1);
  };

  // --- 7. Save Data Sanitization & Migration ---
  NeonLogic.sanitizeSave = function (rawInput, defaultRecord) {
    var def = defaultRecord || {
      version: 1,
      bestScore: 0,
      settings: {
        muted: false,
        volume: 0.5,
        effects: 'auto',
        difficulty: 'normal'
      }
    };

    if (!rawInput) return JSON.parse(JSON.stringify(def));

    var parsed;
    if (typeof rawInput === 'string') {
      try {
        parsed = JSON.parse(rawInput);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          return JSON.parse(JSON.stringify(def));
        }
      } catch (e) {
        return JSON.parse(JSON.stringify(def));
      }
    } else if (typeof rawInput === 'object' && rawInput !== null && !Array.isArray(rawInput)) {
      parsed = rawInput;
    } else {
      return JSON.parse(JSON.stringify(def));
    }

    var result = {
      version: 1,
      bestScore: def.bestScore,
      unlockedLevel: (typeof parsed.unlockedLevel === 'number' && parsed.unlockedLevel >= 1 && parsed.unlockedLevel <= 10)
        ? Math.floor(parsed.unlockedLevel)
        : (def.unlockedLevel || 1),
      completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels.slice(0, 10) : (def.completedLevels || []),
      settings: {
        muted: def.settings.muted,
        volume: def.settings.volume,
        effects: def.settings.effects,
        difficulty: def.settings.difficulty || 'normal'
      }
    };

    // Validate bestScore: finite number >= 0 (floored)
    if (typeof parsed.bestScore === 'number' && isFinite(parsed.bestScore) && parsed.bestScore >= 0) {
      result.bestScore = Math.floor(parsed.bestScore);
    }

    // Validate settings object
    if (parsed.settings && typeof parsed.settings === 'object') {
      if (typeof parsed.settings.muted === 'boolean') {
        result.settings.muted = parsed.settings.muted;
      }
      if (typeof parsed.settings.volume === 'number' && isFinite(parsed.settings.volume)) {
        result.settings.volume = Math.max(0, Math.min(1, parsed.settings.volume));
      }
      if (parsed.settings.effects === 'auto' || parsed.settings.effects === 'full' || parsed.settings.effects === 'reduced') {
        result.settings.effects = parsed.settings.effects;
      }
      if (parsed.settings.difficulty === 'basic' || parsed.settings.difficulty === 'normal' || parsed.settings.difficulty === 'hard' || parsed.settings.difficulty === 'medium') {
        result.settings.difficulty = parsed.settings.difficulty === 'medium' ? 'normal' : parsed.settings.difficulty;
      }
      if (typeof parsed.settings.music === 'number' && isFinite(parsed.settings.music)) {
        result.settings.music = Math.max(0, Math.min(1, parsed.settings.music));
      }
      if (typeof parsed.settings.sfx === 'number' && isFinite(parsed.settings.sfx)) {
        result.settings.sfx = Math.max(0, Math.min(1, parsed.settings.sfx));
      }
      if (typeof parsed.settings.shake === 'boolean') {
        result.settings.shake = parsed.settings.shake;
      }
      if (typeof parsed.settings.crt === 'boolean') {
        result.settings.crt = parsed.settings.crt;
      }
    }

    return result;
  };

  // --- 8. Time Formatting ---
  NeonLogic.formatTime = function (seconds, isElapsed) {
    var s = isElapsed ? Math.max(0, Math.floor(seconds)) : Math.max(0, Math.ceil(seconds));
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  };

  // --- 9. Announcement Joining ---
  NeonLogic.joinAnnouncements = function (pending, newMessage, isCritical) {
    if (isCritical) {
      return Array.isArray(pending) ? [newMessage] : newMessage;
    }
    if (!newMessage) return pending || (Array.isArray(pending) ? [] : '');
    if (!pending || (Array.isArray(pending) && pending.length === 0)) {
      return Array.isArray(pending) ? [newMessage] : newMessage;
    }

    if (Array.isArray(pending)) {
      var list = pending.slice();
      list.push(newMessage);
      if (list.length > 3) list = list.slice(list.length - 3);
      return list;
    }

    // String mode
    var p = String(pending).trim();
    var n = String(newMessage).trim();
    if (!n) return p;
    if (!p) return n;
    if (/[.!?]$/.test(p)) {
      return p + ' ' + n;
    }
    return p + '. ' + n;
  };

  // --- 10. Level Fairness Validator (Pure) ---
  NeonLogic.validateLevels = function (levels, config) {
    var pStart = { x: (config && config.PLAYER_START_X) || 60, y: (config && config.PLAYER_START_Y) || 60 };
    var arenaW = (config && config.ARENA_W) || 960;
    var arenaH = (config && config.ARENA_H) || 600;
    var extractW = (config && config.EXTRACT_W) || 70;
    var extractH = (config && config.EXTRACT_H) || 70;
    var extractX = (config && config.EXTRACT_X) || 870;
    var extractY = (config && config.EXTRACT_Y) || 510;
    var exCenterX = extractX + extractW / 2;
    var exCenterY = extractY + extractH / 2;

    var expectedFrags = (levels.length === 3)
      ? [6, 8, 10]
      : [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    var expectedDroneCounts = (levels.length === 3)
      ? [3, 4, 5]
      : [3, 4, 4, 5, 5, 6, 6, 7, 7, 8];
    var expectedSpeeds = (levels.length === 3)
      ? [110, 135, 160]
      : [100, 115, 125, 135, 145, 155, 165, 175, 185, 195];

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

    function getDroneSegments(d) {
      var segs = [];
      var b = d.bounds || { minX: 15, maxX: arenaW - 15, minY: 15, maxY: arenaH - 15 };
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
      } else if (d.patternType === 'H') {
        segs.push({ a: { x: d.x, y: d.y }, b: { x: d.x + 1, y: d.y + 1 } });
      }
      return segs;
    }

    var violations = [];

    levels.forEach(function (lvl, li) {
      var tag = 'Level ' + (li + 1);

      if (lvl.fragments.length !== expectedFrags[li]) {
        violations.push(tag + ' fragment count mismatch: expected ' + expectedFrags[li] + ', got ' + lvl.fragments.length);
      }
      if (lvl.drones.length !== expectedDroneCounts[li]) {
        violations.push(tag + ' drone count mismatch: expected ' + expectedDroneCounts[li] + ', got ' + lvl.drones.length);
      }

      lvl.drones.forEach(function (d, di) {
        if (d.speed !== expectedSpeeds[li]) {
          violations.push(tag + ' drone ' + di + ' speed mismatch: ' + d.speed + ' != ' + expectedSpeeds[li]);
        }
        var startDist = dist(d, pStart);
        if (startDist < 150) {
          violations.push(tag + ' drone ' + di + ' start position within 150px of player: ' + startDist.toFixed(1) + 'px');
        }
        var segs = getDroneSegments(d);
        var minPathDist = Infinity;
        for (var s = 0; s < segs.length; s++) {
          minPathDist = Math.min(minPathDist, distPointToSegment(pStart, segs[s].a, segs[s].b));
        }
        if (minPathDist < 150) {
          violations.push(tag + ' drone ' + di + ' path within 150px of player: ' + minPathDist.toFixed(1) + 'px');
        }
      });

      var fragsNearDrone = 0;
      lvl.fragments.forEach(function (f, fi) {
        if (f.x < 40 || f.x > arenaW - 40 || f.y < 40 || f.y > arenaH - 40) {
          violations.push(tag + ' fragment ' + fi + ' within 40px of wall (' + f.x + ',' + f.y + ')');
        }
        var dPS = dist(f, pStart);
        if (dPS < 80) {
          violations.push(tag + ' fragment ' + fi + ' within 80px of player start: ' + dPS.toFixed(1) + 'px');
        }
        var dEx = dist(f, { x: exCenterX, y: exCenterY });
        if (dEx < 80) {
          violations.push(tag + ' fragment ' + fi + ' within 80px of extraction: ' + dEx.toFixed(1) + 'px');
        }

        var minPath = Infinity;
        lvl.drones.forEach(function (d) {
          var segs = getDroneSegments(d);
          for (var s = 0; s < segs.length; s++) {
            minPath = Math.min(minPath, distPointToSegment(f, segs[s].a, segs[s].b));
          }
        });
        if (minPath < 60) {
          fragsNearDrone++;
        }
      });

      var maxFragsNearPath = (levels.length === 3)
        ? (li === 2 ? 3 : 2)
        : (li <= 1 ? 2 : (li <= 4 ? 3 : (li <= 7 ? 5 : 8)));
      if (fragsNearDrone > maxFragsNearPath) {
        violations.push(tag + ' too many fragments near drone paths: ' + fragsNearDrone + ' (max ' + maxFragsNearPath + ')');
      }
    });

    return {
      valid: violations.length === 0,
      violations: violations
    };
  };

  // --- 11. Level Balance Analyzer (Pure) ---
  NeonLogic.analyzeLevels = function (levels, config) {
    var pStart = { x: (config && config.PLAYER_START_X) || 60, y: (config && config.PLAYER_START_Y) || 60 };
    var exCenter = {
      x: ((config && config.EXTRACT_X) || 870) + ((config && config.EXTRACT_W) || 70) / 2,
      y: ((config && config.EXTRACT_Y) || 510) + ((config && config.EXTRACT_H) || 70) / 2
    };
    var pSpeed = (config && config.PLAYER_SPEED) || 220;
    var arenaW = (config && config.ARENA_W) || 960;
    var arenaH = (config && config.ARENA_H) || 600;

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

    function getDroneSegments(d) {
      var segs = [];
      var b = d.bounds || { minX: 15, maxX: arenaW - 15, minY: 15, maxY: arenaH - 15 };
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
      } else if (d.patternType === 'H') {
        segs.push({ a: { x: d.x, y: d.y }, b: { x: d.x + 1, y: d.y + 1 } });
      }
      return segs;
    }

    var targets = [
      { maxRatio: 0.40, maxSpeedRatio: 0.60, maxFragsNearPath: 2 },
      { maxRatio: 0.50, maxSpeedRatio: 0.70, maxFragsNearPath: 2 },
      { maxRatio: 0.60, maxSpeedRatio: 0.75, maxFragsNearPath: 3 }
    ];

    var results = [];
    var allPassed = true;

    levels.forEach(function (lvl, li) {
      var current = { x: pStart.x, y: pStart.y };
      var remaining = lvl.fragments.map(function (f) { return { x: f.x, y: f.y }; });
      var routeLength = 0;

      while (remaining.length > 0) {
        var nearestIdx = 0;
        var nearestDist = Infinity;
        for (var i = 0; i < remaining.length; i++) {
          var d = dist(current, remaining[i]);
          if (d < nearestDist) {
            nearestDist = d;
            nearestIdx = i;
          }
        }
        routeLength += nearestDist;
        current = remaining[nearestIdx];
        remaining.splice(nearestIdx, 1);
      }
      routeLength += dist(current, exCenter);

      var routeTime = routeLength / pSpeed;
      var timeRatio = routeTime / lvl.timeLimit;

      var maxDroneSpeed = 0;
      var minDroneDistToStart = Infinity;

      lvl.drones.forEach(function (d) {
        if (d.speed > maxDroneSpeed) maxDroneSpeed = d.speed;
        var segs = getDroneSegments(d);
        for (var s = 0; s < segs.length; s++) {
          minDroneDistToStart = Math.min(minDroneDistToStart, distPointToSegment(pStart, segs[s].a, segs[s].b));
        }
      });

      var speedRatio = maxDroneSpeed / pSpeed;

      var fragsNearPath = 0;
      lvl.fragments.forEach(function (f) {
        var minD = Infinity;
        lvl.drones.forEach(function (d) {
          var segs = getDroneSegments(d);
          for (var s = 0; s < segs.length; s++) {
            minD = Math.min(minD, distPointToSegment(f, segs[s].a, segs[s].b));
          }
        });
        if (minD < 60) fragsNearPath++;
      });

      var timeAfter3Hits = lvl.timeLimit - 15;
      var winnableAfter3Hits = timeAfter3Hits > routeTime;

      var tgt = targets[li] || { maxRatio: 0.65, maxSpeedRatio: 0.95, maxFragsNearPath: (li <= 4 ? 3 : (li <= 7 ? 5 : 8)) };
      var pass = (
        timeRatio <= tgt.maxRatio &&
        speedRatio <= tgt.maxSpeedRatio &&
        minDroneDistToStart >= 150 &&
        fragsNearPath <= tgt.maxFragsNearPath &&
        winnableAfter3Hits
      );

      if (!pass) allPassed = false;

      results.push({
        level: li + 1,
        name: lvl.name,
        routeLength: Math.round(routeLength * 10) / 10,
        routeTime: Math.round(routeTime * 100) / 100,
        timeLimit: lvl.timeLimit,
        timeRatio: Math.round(timeRatio * 1000) / 1000,
        speedRatio: Math.round(speedRatio * 1000) / 1000,
        minDroneDistToStart: Math.round(minDroneDistToStart * 10) / 10,
        fragsNearDronePath: fragsNearPath,
        timeAfter3Hits: timeAfter3Hits,
        winnableAfter3Hits: winnableAfter3Hits,
        targetsPass: pass
      });
    });

    return {
      allPassed: allPassed,
      levels: results
    };
  };

  // --- 12. Deterministic Bot Simulator (Pure) ---
  NeonLogic.simulateBot = function (level, config, seed) {
    var pStart = { x: (config && config.PLAYER_START_X) || 60, y: (config && config.PLAYER_START_Y) || 60 };
    var ex = {
      x: ((config && config.EXTRACT_X) || 870) + ((config && config.EXTRACT_W) || 70) / 2,
      y: ((config && config.EXTRACT_Y) || 510) + ((config && config.EXTRACT_H) || 70) / 2
    };
    var ps = (config && config.PLAYER_SIZE) || 28;
    var pSpeed = (config && config.PLAYER_SPEED) || 220;
    var arenaW = (config && config.ARENA_W) || 960;
    var arenaH = (config && config.ARENA_H) || 600;
    var penaltyTime = (config && config.PENALTY_TIME) || 5;
    var hitCooldownDuration = (config && config.HIT_COOLDOWN) || 1.5;

    var player = { x: pStart.x, y: pStart.y };
    var fragments = level.fragments.map(function (f) {
      return { x: f.x, y: f.y, collected: false, radius: (config && config.FRAGMENT_RADIUS) || 10 };
    });
    var drones = level.drones.map(function (d) {
      return {
        patternType: d.patternType,
        x: d.x,
        y: d.y,
        speed: d.speed,
        vx: d.vx !== undefined ? d.vx : 0,
        vy: d.vy !== undefined ? d.vy : 0,
        radius: (config && config.DRONE_RADIUS) || 15,
        bounds: d.bounds ? { minX: d.bounds.minX, maxX: d.bounds.maxX, minY: d.bounds.minY, maxY: d.bounds.maxY } : undefined,
        loopX1: d.loopX1, loopY1: d.loopY1, loopX2: d.loopX2, loopY2: d.loopY2, loopPhase: d.loopPhase || 0
      };
    });

    var fragsCollected = 0;
    var extractionActive = false;
    var timeRemaining = level.timeLimit;
    var hitCooldown = 0;
    var hitsTaken = 0;
    var won = false;

    var dt = 1 / 60;
    var maxSteps = Math.ceil(level.timeLimit / dt);

    for (var step = 0; step < maxSteps; step++) {
      timeRemaining -= dt;
      if (timeRemaining <= 0) break;
      if (hitCooldown > 0) hitCooldown = Math.max(0, hitCooldown - dt);

      // Target selection
      var target = ex;
      if (fragsCollected < fragments.length) {
        var nearestDist = Infinity;
        for (var fi = 0; fi < fragments.length; fi++) {
          var f = fragments[fi];
          if (!f.collected) {
            var dFrag = Math.sqrt(Math.pow(f.x - player.x, 2) + Math.pow(f.y - player.y, 2));
            if (dFrag < nearestDist) {
              nearestDist = dFrag;
              target = f;
            }
          }
        }
      }

      // Steering toward target
      var dirX = target.x - player.x;
      var dirY = target.y - player.y;
      var distToTarget = Math.sqrt(dirX * dirX + dirY * dirY);
      if (distToTarget > 0) {
        dirX /= distToTarget;
        dirY /= distToTarget;
      }

      // Repulsion from nearby drones (within 70px)
      for (var di = 0; di < drones.length; di++) {
        var dr = drones[di];
        var dDist = Math.sqrt(Math.pow(player.x - dr.x, 2) + Math.pow(player.y - dr.y, 2));
        if (dDist < 70 && dDist > 0) {
          var repX = (player.x - dr.x) / dDist;
          var repY = (player.y - dr.y) / dDist;
          var repWeight = (70 - dDist) / 70 * 1.8;
          dirX += repX * repWeight;
          dirY += repWeight * repY;
        }
      }

      var mag = Math.sqrt(dirX * dirX + dirY * dirY);
      if (mag > 0) {
        dirX /= mag;
        dirY /= mag;
      }

      player.x += dirX * pSpeed * dt;
      player.y += dirY * pSpeed * dt;
      var half = ps / 2;
      player.x = Math.max(half, Math.min(arenaW - half, player.x));
      player.y = Math.max(half, Math.min(arenaH - half, player.y));

      for (var dj = 0; dj < drones.length; dj++) {
        NeonLogic.stepDronePattern(drones[dj], dt, arenaW, arenaH);
      }

      for (var fk = 0; fk < fragments.length; fk++) {
        var frag = fragments[fk];
        if (!frag.collected && NeonLogic.circleRect(frag.x, frag.y, frag.radius, player.x, player.y, ps, ps)) {
          frag.collected = true;
          fragsCollected++;
          if (fragsCollected >= fragments.length) {
            extractionActive = true;
          }
        }
      }

      if (hitCooldown <= 0) {
        for (var dm = 0; dm < drones.length; dm++) {
          var drone = drones[dm];
          if (NeonLogic.circleRect(drone.x, drone.y, drone.radius * 0.8, player.x, player.y, ps, ps)) {
            hitsTaken++;
            timeRemaining -= penaltyTime;
            hitCooldown = hitCooldownDuration;
            if (timeRemaining <= 0) break;
          }
        }
      }
      if (timeRemaining <= 0) break;

      if (extractionActive) {
        var exW = (config && config.EXTRACT_W) || 70;
        var exH = (config && config.EXTRACT_H) || 70;
        if (NeonLogic.rectRect(player.x, player.y, ps, ps, ex.x, ex.y, exW, exH)) {
          won = true;
          break;
        }
      }
    }

    return {
      won: won,
      clearTime: Math.round((level.timeLimit - timeRemaining) * 100) / 100,
      hitsTaken: hitsTaken
    };
  };

  // --- 13. Difficulty System (Basic, Normal, Hard) ---
  NeonLogic.getDifficultyModifiers = function (difficulty) {
    var mode = (difficulty || 'normal').toLowerCase();
    if (mode === 'medium') mode = 'normal';
    switch (mode) {
      case 'basic':
        return {
          id: 'basic',
          name: 'Basic',
          description: 'Recruit Infiltration: Slower drones (+25% time, -20% drone speed, -25 hit penalty).',
          timeMultiplier: 1.25,
          droneSpeedMultiplier: 0.80,
          penaltyScore: 25,
          penaltyTime: 3,
          hitCooldown: 1.8
        };
      case 'hard':
        return {
          id: 'hard',
          name: 'Hard',
          description: 'Ghost Protocol: Overclocked interceptors (-15% time, +15% drone speed, -75 hit penalty).',
          timeMultiplier: 0.85,
          droneSpeedMultiplier: 1.15,
          penaltyScore: 75,
          penaltyTime: 6,
          hitCooldown: 1.2
        };
      case 'normal':
      default:
        return {
          id: 'normal',
          name: 'Normal',
          description: 'Standard Operation: Calibrated drone velocity and balanced countdown timers.',
          timeMultiplier: 1.0,
          droneSpeedMultiplier: 1.0,
          penaltyScore: 50,
          penaltyTime: 5,
          hitCooldown: 1.5
        };
    }
  };

  // Export to window or CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeonLogic;
  }
  if (typeof root !== 'undefined') {
    root.NeonLogic = NeonLogic;
  }
})(typeof window !== 'undefined' ? window : this);
