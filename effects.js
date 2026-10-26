/* ============================================================
   NEON RELIC: THE LAST SIGNAL — effects.js (Day 3 v2)
   Lightweight visual effects & animation subsystem:
   - Seeded RNG (Mulberry32) for reproducible visual particle spreads
   - Time-based animation (clock / dt, never frame counts)
   - Particle pool (capped at 80)
   - Floating text pool (capped at 8, oldest replaced if full)
   - Hit flash vignette (opacity <= 0.35, 0.25s)
   - Player facing cue, hit blink (3 Hz, 0.45-1.0), idle pulse
   - Fragment bob (+-3px, 2s) & glow pulse (1.5 Hz)
   - Drone rotor & directional eye offset, dashed path hints
   - Extraction rotating ring & lock icon
   - Effects setting support: 'auto' | 'full' | 'reduced'
   ============================================================ */

var fx = (function () {
  var FX_CONFIG = {
    MAX_PARTICLES: 80,
    MAX_TEXTS: 8,
    MAX_RINGS: 4,
    HIT_VIGNETTE_DURATION: 0.25,
    BURST_PARTICLE_COUNT: 10,
    BURST_DURATION: 0.4
  };

  // Pools
  var particles = [];
  var floatingTexts = [];
  var expandingRings = [];
  var hitFlashTimer = 0;
  var clock = 0;

  // Effects mode: 'auto' | 'full' | 'reduced'
  var effectsMode = 'auto';

  // OS prefers-reduced-motion media query
  var osReducedMotion = false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    var mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    osReducedMotion = !!mql.matches;
    var onMqlChange = function (e) {
      osReducedMotion = !!e.matches;
      updateMotionState();
    };
    if (mql.addEventListener) {
      mql.addEventListener('change', onMqlChange);
    } else if (mql.addListener) {
      mql.addListener(onMqlChange);
    }
  }

  // Debug query params
  var initialSeed = 123456789;
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    if (window.location.search.indexOf('reducedmotion') !== -1) {
      effectsMode = 'reduced';
    }
    var seedMatch = window.location.search.match(/[?&]seed=(\d+)/);
    if (seedMatch) {
      initialSeed = parseInt(seedMatch[1], 10);
    }
  }

  // Seeded RNG function
  var rng = (typeof NeonLogic !== 'undefined' && NeonLogic.createSeededRNG)
    ? NeonLogic.createSeededRNG(initialSeed)
    : function () { return Math.random(); };

  function reseed(s) {
    if (typeof NeonLogic !== 'undefined' && NeonLogic.createSeededRNG) {
      rng = NeonLogic.createSeededRNG(s);
    }
  }

  function isReducedMotionActive() {
    if (effectsMode === 'reduced') return true;
    if (effectsMode === 'full') return false;
    return osReducedMotion;
  }

  function updateMotionState() {
    // Synchronize setting select if present in DOM
    var sel = document.getElementById('setting-effects');
    if (sel && sel.value !== effectsMode) {
      sel.value = effectsMode;
    }
  }

  function setEffectsMode(mode) {
    if (mode === 'auto' || mode === 'full' || mode === 'reduced') {
      effectsMode = mode;
      updateMotionState();
    }
  }

  function reset() {
    particles = [];
    floatingTexts = [];
    expandingRings = [];
    hitFlashTimer = 0;
  }

  function triggerHitFlash() {
    if (isReducedMotionActive()) return;
    hitFlashTimer = FX_CONFIG.HIT_VIGNETTE_DURATION;
  }

  function spawnBurst(x, y, color) {
    if (isReducedMotionActive()) return;

    // Expanding ring (capped at MAX_RINGS)
    if (expandingRings.length >= FX_CONFIG.MAX_RINGS) {
      expandingRings.shift();
    }
    expandingRings.push({
      x: x, y: y,
      radius: 10,
      maxRadius: 36,
      life: FX_CONFIG.BURST_DURATION,
      maxLife: FX_CONFIG.BURST_DURATION,
      color: color || '#39ff14'
    });

    // Particles (up to MAX_PARTICLES)
    var toSpawn = Math.min(FX_CONFIG.BURST_PARTICLE_COUNT, FX_CONFIG.MAX_PARTICLES - particles.length);
    for (var i = 0; i < toSpawn; i++) {
      var angle = (Math.PI * 2 * i) / toSpawn + (rng() - 0.5) * 0.5;
      var speed = 70 + rng() * 80;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + rng() * 2,
        life: FX_CONFIG.BURST_DURATION,
        maxLife: FX_CONFIG.BURST_DURATION,
        color: color || '#39ff14'
      });
    }
  }

  function spawnText(x, y, text, color) {
    // If pool is full, replace the oldest text (index 0)
    if (floatingTexts.length >= FX_CONFIG.MAX_TEXTS) {
      floatingTexts.shift();
    }
    floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color || '#00f5ff',
      life: 0.8,
      maxLife: 0.8
    });
  }

  function update(dt) {
    clock += dt;

    if (hitFlashTimer > 0) {
      hitFlashTimer = Math.max(0, hitFlashTimer - dt);
    }

    // Update particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.life <= 0) {
        particles.splice(p, 1);
      }
    }

    // Update expanding rings
    for (var r = expandingRings.length - 1; r >= 0; r--) {
      var rg = expandingRings[r];
      rg.life -= dt;
      if (rg.life <= 0) {
        expandingRings.splice(r, 1);
      }
    }

    // Update floating texts
    for (var t = floatingTexts.length - 1; t >= 0; t--) {
      var ft = floatingTexts[t];
      ft.life -= dt;
      ft.y -= 26 * dt; // upward drift
      if (ft.life <= 0) {
        floatingTexts.splice(t, 1);
      }
    }
  }

  function renderParticles(ctx) {
    if (isReducedMotionActive()) return;
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      var alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      ctx.restore();
    }
  }

  function renderRings(ctx) {
    if (isReducedMotionActive()) return;
    for (var i = 0; i < expandingRings.length; i++) {
      var rg = expandingRings[i];
      var progress = 1 - (rg.life / rg.maxLife);
      var currentR = rg.radius + (rg.maxRadius - rg.radius) * progress;
      var alpha = Math.max(0, rg.life / rg.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = rg.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rg.x, rg.y, currentR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function renderTexts(ctx) {
    for (var i = 0; i < floatingTexts.length; i++) {
      var ft = floatingTexts[i];
      var alpha = Math.max(0, ft.life / ft.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px "Consolas", "Courier New", monospace';
      ctx.textAlign = 'center';
      if (!isReducedMotionActive()) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = ft.color;
      }
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  function renderHitVignette(ctx, width, height) {
    if (isReducedMotionActive() || hitFlashTimer <= 0) return;
    var alpha = (hitFlashTimer / FX_CONFIG.HIT_VIGNETTE_DURATION) * 0.35;

    ctx.save();
    ctx.globalAlpha = alpha;
    var grad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.25,
      width / 2, height / 2, width * 0.65
    );
    grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(255, 0, 0, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 30, 30, 0.7)';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, width, height);
    ctx.restore();
  }

  return {
    get clock() { return clock; },
    get count() { return particles.length + floatingTexts.length; },
    get hitFlashTimer() { return hitFlashTimer; },
    get effectsMode() { return effectsMode; },
    isReducedMotion: isReducedMotionActive,
    setEffectsMode: setEffectsMode,
    reseed: reseed,
    reset: reset,
    triggerHitFlash: triggerHitFlash,
    spawnBurst: spawnBurst,
    spawnText: spawnText,
    update: update,
    renderParticles: renderParticles,
    renderRings: renderRings,
    renderTexts: renderTexts,
    renderHitVignette: renderHitVignette
  };
})();
