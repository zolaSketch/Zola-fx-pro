/* =========================================================================
   የዜማ ኢንጂን — Zema (Ethiopian liturgical chant) synthesis
   Web Audio API. Synthesizes the three classical modes:
     ግዕዝ Ge'ez, ዕዝል Ezel, አራራይ Araray
   Uses a drone (root + fifth) with a cantor melody drawn from the mode's
   just-intonation scale, giving a chant-like worship accompaniment.
   ========================================================================= */
(function () {
  'use strict';

  let ctx = null;
  let master = null;
  let droneNodes = [];
  let playing = false;

  // Just-intonation scales for the three modes (as multipliers from root).
  // Ge'ez mode (Yared tradition): heptatonic, ~ these ratios.
  const MODES = {
    geez: {
      am: 'ግዕዝ', rootFreq: 164.81, // E3
      scale: [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2], // major-ish pentatonic/hexatonic
    },
    ezel: {
      am: 'ዕዝል', rootFreq: 146.83, // D3
      scale: [1, 6/5, 4/3, 3/2, 8/5, 9/5, 2], // minor-ish (penitential)
    },
    araray: {
      am: 'አራራይ', rootFreq: 174.61, // F3
      scale: [1, 9/8, 5/4, 3/2, 5/3, 15/8, 2], // bright/joyful
    },
  };

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.0;
      master.connect(ctx.destination);
      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.3);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, t, dur, type, vol) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function startDrone(mode) {
    const m = MODES[mode];
    const root = m.rootFreq;
    const fifth = root * 3 / 2;
    // soft low drone on root + fifth
    [root / 2, root, fifth].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      // lowpass to soften
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 300; lp.Q.value = 1;
      g.gain.value = i === 0 ? 0.12 : 0.08;
      osc.connect(lp); lp.connect(g); g.connect(master);
      osc.start();
      droneNodes.push(osc);
    });
  }
  function stopDrone() {
    droneNodes.forEach(o => { try { o.stop(); } catch (e) {} });
    droneNodes = [];
  }

  // Play a short melodic phrase in the given mode, sync'd for ~seconds.
  // Returns a function to stop.
  function playPhrase(mode, durationSec, steps) {
    const m = MODES[mode];
    const root = m.rootFreq;
    const startT = ctx.currentTime + 0.05;
    const noteLen = Math.max(0.22, durationSec / Math.max(1, steps));
    let t = startT;
    // a gentle opening pickup + cadence feel
    const seq = [0, 3, 2, 4, 3, 5, 4, 3, 5, 4, 3, 2, 0];
    for (let i = 0; i < Math.min(steps, seq.length); i++) {
      const idx = seq[i % seq.length] % m.scale.length;
      const f = root * m.scale[idx];
      // vary type for chant feel
      tone(f, t, noteLen * 0.9, i % 3 === 0 ? 'triangle' : 'sine', 0.10);
      t += noteLen;
    }
    return { stop: stopAll };
  }

  function startZema(mode, durationSec, steps) {
    const c = ensureCtx();
    if (!c) return false;
    playing = true;
    startDrone(mode);
    playPhrase(mode, durationSec, steps);
    return true;
  }

  function stopAll() {
    playing = false;
    if (ctx) {
      try { stopDrone(); } catch (e) {}
    }
  }

  // Simple probe: play a single note (used for mode preview buttons)
  function preview(mode) {
    const c = ensureCtx();
    if (!c) return false;
    const m = MODES[mode];
    const root = m.rootFreq;
    const seq = [0, 3, 5, 4, 3, 2, 0];
    let t = ctx.currentTime + 0.05;
    seq.forEach(idx => {
      tone(root * m.scale[idx % m.scale.length], t, 0.35, 'triangle', 0.12);
      t += 0.4;
    });
    return true;
  }

  window.Zema = {
    modes: MODES,
    start: startZema,
    stop: stopAll,
    preview,
    get playing() { return playing; },
  };
})();
