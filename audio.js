/* ============================================================
   NEON RELIC: THE LAST SIGNAL — audio.js (Day 3 v2)
   Web Audio API sound system:
   - Voice cap: max 4 concurrent voices
   - DynamicsCompressor + Master Gain (0.5 * volume)
   - Disconnect in onended
   - Throttle: >= 60 ms between repeats of same sound
   - Volume slider support (0.0 to 1.0, default 0.5)
   - Click-then-pause (150 ms delay)
   - Mute + volume persistence
   - Debug log (last 50 sounds) & active voice tracking
   ============================================================ */

var audio = (function () {
  var ctx = null;
  var masterGain = null;
  var compressor = null;

  var activeVoices = 0;
  var MAX_VOICES = 4;
  var THROTTLE_MS = 60;

  var lastPlayed = {};
  var soundLog = [];
  var MAX_LOG = 50;

  var isMuted = false;
  var userVolume = 0.5; // 0.0 to 1.0
  var isUnavailable = false;
  var suspendTimer = null;

  // Check immediately if noaudio debug flag is active or if AudioContext is missing
  if (typeof window !== 'undefined' && window.location && window.location.search && window.location.search.indexOf('noaudio') !== -1) {
    isUnavailable = true;
  }

  function initContext() {
    if (ctx) return true;
    if (isUnavailable) return false;

    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        isUnavailable = true;
        updateUI();
        return false;
      }
      ctx = new AudioCtx();

      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      masterGain = ctx.createGain();
      applyMasterGain();

      masterGain.connect(compressor);
      compressor.connect(ctx.destination);
      return true;
    } catch (e) {
      isUnavailable = true;
      updateUI();
      return false;
    }
  }

  function applyMasterGain() {
    if (!masterGain || !ctx) return;
    var effectiveGain = (isMuted || userVolume <= 0) ? 0 : (0.5 * userVolume);
    try {
      masterGain.gain.setValueAtTime(effectiveGain, ctx.currentTime);
    } catch (e) {}
  }

  function logSound(name) {
    var now = (ctx && ctx.currentTime) ? ctx.currentTime : Date.now() / 1000;
    soundLog.push({ name: name, t: parseFloat(now.toFixed(3)) });
    if (soundLog.length > MAX_LOG) {
      soundLog.shift();
    }
  }

  function canPlay(name) {
    if (isMuted || isUnavailable || userVolume <= 0) return false;
    if (!initContext()) return false;

    if (activeVoices >= MAX_VOICES) {
      return false;
    }

    var nowMs = Date.now();
    if (lastPlayed[name] && (nowMs - lastPlayed[name]) < THROTTLE_MS) {
      return false;
    }
    lastPlayed[name] = nowMs;
    return true;
  }

  function resumeContext() {
    if (suspendTimer) {
      clearTimeout(suspendTimer);
      suspendTimer = null;
    }
    if (ctx && ctx.state === 'suspended') {
      try {
        ctx.resume();
      } catch (e) {}
    }
  }

  function suspendContext(delayMs) {
    if (suspendTimer) clearTimeout(suspendTimer);
    var delay = delayMs !== undefined ? delayMs : 150;
    suspendTimer = setTimeout(function () {
      if (ctx && ctx.state === 'running') {
        try {
          ctx.suspend();
        } catch (e) {}
      }
    }, delay);
  }

  function createVoice() {
    activeVoices++;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    var cleaned = false;
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      activeVoices = Math.max(0, activeVoices - 1);
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (e) {}
    }

    osc.onended = cleanup;
    return { osc: osc, gain: gain, cleanup: cleanup };
  }

  // --- Sound Designs ---

  function playFragment() {
    if (!canPlay('fragment')) return;
    resumeContext();
    logSound('fragment');

    var now = ctx.currentTime;
    var v1 = createVoice();
    v1.osc.type = 'triangle';
    v1.osc.frequency.setValueAtTime(880, now);
    v1.gain.gain.setValueAtTime(0.15, now);
    v1.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    v1.osc.start(now);
    v1.osc.stop(now + 0.06);

    var v2 = createVoice();
    v2.osc.type = 'triangle';
    v2.osc.frequency.setValueAtTime(1320, now + 0.06);
    v2.gain.gain.setValueAtTime(0.15, now + 0.06);
    v2.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    v2.osc.start(now + 0.06);
    v2.osc.stop(now + 0.12);
  }

  function playHit() {
    if (!canPlay('hit')) return;
    resumeContext();
    logSound('hit');

    var now = ctx.currentTime;
    var v = createVoice();
    v.osc.type = 'sawtooth';
    v.osc.frequency.setValueAtTime(220, now);
    v.osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
    v.gain.gain.setValueAtTime(0.20, now);
    v.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    v.osc.start(now);
    v.osc.stop(now + 0.18);
  }

  function playExtractionOnline() {
    if (!canPlay('extractionOnline')) return;
    resumeContext();
    logSound('extractionOnline');

    var notes = [440, 660, 880];
    var now = ctx.currentTime;
    notes.forEach(function (freq, i) {
      var t = now + i * 0.1;
      var v = createVoice();
      v.osc.type = 'sine';
      v.osc.frequency.setValueAtTime(freq, t);
      v.gain.gain.setValueAtTime(0.15, t);
      v.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      v.osc.start(t);
      v.osc.stop(t + 0.12);
    });
  }

  function playLevelComplete() {
    if (!canPlay('levelComplete')) return;
    resumeContext();
    logSound('levelComplete');

    var notes = [440, 554, 659, 880];
    var now = ctx.currentTime;
    notes.forEach(function (freq, i) {
      var t = now + i * 0.11;
      var v = createVoice();
      v.osc.type = 'sine';
      v.osc.frequency.setValueAtTime(freq, t);
      v.gain.gain.setValueAtTime(0.18, t);
      v.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      v.osc.start(t);
      v.osc.stop(t + 0.14);
    });
  }

  function playWin() {
    if (!canPlay('win')) return;
    resumeContext();
    logSound('win');

    var notes = [523, 659, 784, 659, 784, 1047];
    var now = ctx.currentTime;
    notes.forEach(function (freq, i) {
      var t = now + i * 0.14;
      var v = createVoice();
      v.osc.type = 'sine';
      v.osc.frequency.setValueAtTime(freq, t);
      v.gain.gain.setValueAtTime(0.18, t);
      v.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
      v.osc.start(t);
      v.osc.stop(t + 0.20);
    });
  }

  function playLose() {
    if (!canPlay('lose')) return;
    resumeContext();
    logSound('lose');

    var notes = [220, 196, 164];
    var now = ctx.currentTime;
    notes.forEach(function (freq, i) {
      var t = now + i * 0.18;
      var v = createVoice();
      v.osc.type = 'sawtooth';
      v.osc.frequency.setValueAtTime(freq, t);
      v.gain.gain.setValueAtTime(0.18, t);
      v.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      v.osc.start(t);
      v.osc.stop(t + 0.22);
    });
  }

  function playClick() {
    if (isMuted || isUnavailable || userVolume <= 0) return;
    if (!initContext()) return;
    resumeContext();
    logSound('click');

    var now = ctx.currentTime;
    var v = createVoice();
    v.osc.type = 'sine';
    v.osc.frequency.setValueAtTime(1000, now);
    v.gain.gain.setValueAtTime(0.08, now);
    v.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    v.osc.start(now);
    v.osc.stop(now + 0.03);
  }

  function playDash() {
    if (!canPlay('dash')) return;
    resumeContext();
    logSound('dash');

    var now = ctx.currentTime;
    var v = createVoice();
    v.osc.type = 'sine';
    v.osc.frequency.setValueAtTime(450, now);
    v.osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    v.gain.gain.setValueAtTime(0.16, now);
    v.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    v.osc.start(now);
    v.osc.stop(now + 0.14);
  }

  function playPowerup() {
    if (!canPlay('powerup')) return;
    resumeContext();
    logSound('powerup');

    var now = ctx.currentTime;
    var notes = [587, 880, 1174];
    notes.forEach(function (freq, i) {
      var t = now + i * 0.06;
      var v = createVoice();
      v.osc.type = 'triangle';
      v.osc.frequency.setValueAtTime(freq, t);
      v.gain.gain.setValueAtTime(0.14, t);
      v.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
      v.osc.start(t);
      v.osc.stop(t + 0.10);
    });
  }

  function playHazardWarning() {
    if (!canPlay('hazardWarning')) return;
    resumeContext();
    logSound('hazardWarning');

    var now = ctx.currentTime;
    var v = createVoice();
    v.osc.type = 'sawtooth';
    v.osc.frequency.setValueAtTime(320, now);
    v.osc.frequency.exponentialRampToValueAtTime(260, now + 0.10);
    v.gain.gain.setValueAtTime(0.10, now);
    v.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
    v.osc.start(now);
    v.osc.stop(now + 0.10);
  }

  function playShockwave() {
    if (!canPlay('shockwave')) return;
    resumeContext();
    logSound('shockwave');

    var now = ctx.currentTime;
    var v = createVoice();
    v.osc.type = 'sine';
    v.osc.frequency.setValueAtTime(140, now);
    v.osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
    v.gain.gain.setValueAtTime(0.22, now);
    v.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    v.osc.start(now);
    v.osc.stop(now + 0.25);
  }

  function updateUI() {
    var btnMuteList = [document.getElementById('btn-mute'), document.getElementById('btn-sound-toggle')];
    var slider = document.getElementById('setting-volume');
    var sliderContainer = document.getElementById('volume-control-container');
    var valDisplay = document.getElementById('volume-val');

    btnMuteList.forEach(function (btn) {
      if (!btn) return;
      if (isUnavailable) {
        btn.textContent = 'Sound: unavailable';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-disabled', 'true');
        btn.disabled = true;
        btn.classList.add('disabled');
      } else {
        btn.textContent = isMuted ? 'Sound: Off' : 'Sound: On';
        btn.setAttribute('aria-pressed', isMuted ? 'false' : 'true');
        btn.removeAttribute('aria-disabled');
        btn.disabled = false;
        btn.classList.remove('disabled');
      }
    });

    if (slider) {
      slider.value = Math.round(userVolume * 100);
      slider.disabled = isUnavailable;
    }
    if (valDisplay) {
      valDisplay.textContent = Math.round(userVolume * 100) + '%';
    }
    if (sliderContainer) {
      sliderContainer.style.display = isUnavailable ? 'none' : '';
    }
  }

  function setMuted(val) {
    isMuted = !!val;
    applyMasterGain();
    updateUI();
  }

  function setVolume(vol) {
    userVolume = Math.max(0, Math.min(1, vol));
    applyMasterGain();
    updateUI();
  }

  function toggleMute() {
    if (isUnavailable) return isMuted;
    setMuted(!isMuted);
    return isMuted;
  }

  function resetAudio() {
    activeVoices = 0;
    resumeContext();
  }

  return {
    init: initContext,
    resume: resumeContext,
    suspend: suspendContext,
    reset: resetAudio,
    setMuted: setMuted,
    setVolume: setVolume,
    toggleMute: toggleMute,
    updateUI: updateUI,
    isMuted: function () { return isMuted; },
    getVolume: function () { return userVolume; },
    isUnavailable: function () { return isUnavailable; },
    play: function (soundName) {
      switch (soundName) {
        case 'fragment':         return playFragment();
        case 'hit':              return playHit();
        case 'extractionOnline': return playExtractionOnline();
        case 'levelComplete':    return playLevelComplete();
        case 'win':              return playWin();
        case 'lose':             return playLose();
        case 'click':            return playClick();
        case 'dash':             return playDash();
        case 'powerup':          return playPowerup();
        case 'hazardWarning':    return playHazardWarning();
        case 'shockwave':        return playShockwave();
      }
    },
    get activeVoices() { return activeVoices; },
    get log() { return soundLog; }
  };
})();
