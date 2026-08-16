/* =========================================================================
   የቅዳሴ መልመጃ አፕ — Application Logic
   ኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን
   ========================================================================= */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const LS_KEY = 'kidase-app-state-v1';

  /* ── Default state ─────────────────────────────────────────────────── */
  const defaultState = () => ({
    liturgy: 'sunday',        // 'sunday' | 'lent'
    section: 0,               // index of current section
    readingMode: {            // which texts are visible
      ge: true,
      am: true,
      tr: false,
      en: false,
    },
    fontSize: 20,             // px
    theme: 'light',           // 'light' | 'dark' | 'sepia'
    autoScroll: false,
    autoScrollSpeed: 60,      // 20..120 (higher = faster)
    highlight: true,          // guided highlight
    practice: {               // practice/memorization state
      mode: 'none',           // 'none' | 'reveal' | 'focus' | 'hidden'
      level: 0,               // 0..3
    },
    bookmarks: [],            // section ids
    progress: {},             // { sectionId: { practiced: n, last: ts } }
    stats: {
      totalTimeSec: 0,
      sessions: 0,
      wordsRead: 0,
      quizCorrect: 0,
      quizTotal: 0,
      streakDays: 0,
      lastVisit: null,
      daily: {},              // { 'YYYY-MM-DD': { sec, words } }
    },
  });

  let state = loadState();
  let ui = null; // active view: 'home' | 'practice' | 'quiz' | 'progress' | 'settings'

  /* ── persistence ───────────────────────────────────────────────────── */
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return deepMerge(defaultState(), parsed);
    } catch (e) {
      return defaultState();
    }
  }
  function saveState() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }
  function deepMerge(base, over) {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    for (const k in over) {
      if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) &&
          base[k] && typeof base[k] === 'object') {
        out[k] = deepMerge(base[k], over[k]);
      } else {
        out[k] = over[k];
      }
    }
    return out;
  }

  /* ── helpers ───────────────────────────────────────────────────────── */
  const getLiturgy = () => QIDASSE_DATA.liturgies[state.liturgy];
  const getSection = () => getLiturgy().sections[state.section];
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  function todayKey(d = new Date()) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  function fmtTime(sec) {
    sec = Math.round(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const parts = [];
    if (h) parts.push(h + 'ሰ');
    if (h || m) parts.push(m + 'ደ');
    parts.push(s + 'ጥ');
    return parts.join(' ');
  }
  function fmtClock(sec) {
    sec = Math.round(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const p = (n) => String(n).padStart(2, '0');
    return `${p(h)}:${p(m)}:${p(s)}`;
  }

  /* ── Ethiopian calendar-ish "today" helper (simplified) ────────────── */
  function ethiopianToday() {
    const d = new Date();
    const now = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + (3 * 3600000)); // EAT
    const p = (n) => String(n).padStart(2, '0');
    return {
      ethDate: `${p(now.getDate())}`, 
      dayOfWeek: now.getDay(),
      isSunday: now.getDay() === 0,
      dateStr: now.toDateString(),
    };
  }
  function suggestLiturgy() {
    // On Sunday → Sunday liturgy; otherwise if not Sunday we still let user pick.
    return ethiopianToday().isSunday ? 'sunday' : state.liturgy;
  }

  /* ── toast ─────────────────────────────────────────────────────────── */
  let toastTimer = null;
  function toast(msg, type) {
    let t = $('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast'; }, 2400);
  }

  /* ── Router / navigation ───────────────────────────────────────────── */
  function setView(view) {
    ui = view;
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    const map = {
      home: renderHome,
      practice: renderPractice,
      quiz: renderQuiz,
      progress: renderProgress,
      settings: renderSettings,
    };
    (map[view] || renderHome)();
    $('#content').scrollTop = 0;
  }

  /* ── theme + body classes ──────────────────────────────────────────── */
  function applyTheme() {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
    document.body.classList.add('theme-' + state.theme);
    document.documentElement.style.setProperty('--read-font', state.fontSize + 'px');
  }

  /* ── Home ──────────────────────────────────────────────────────────── */
  function renderHome() {
    const t = ethiopianToday();
    const liturgy = getLiturgy();
    const done = Object.keys(state.progress).length;
    const total = liturgy.sections.length;
    const streak = state.stats.streakDays;
    const mastery = total ? Math.round((done / total) * 100) : 0;

    const cards = [
      { icon: '📖', label: 'ዛሬ ቅዳሴ', value: t.isSunday ? 'እሁድ ቅዳሴ' : 'የጾም ቅዳሴ', sub: t.isSunday ? 'የትንሣኤ ቀን' : 'የእለት ቅዳሴ', act: 'start' },
      { icon: '✍️', label: 'የተለመደ', value: `${done}/${total}`, sub: `${mastery}% ተካፍለዋል`, act: 'progress' },
      { icon: '🔥', label: 'የተከታታይ ቀናት', value: streak, sub: 'የመልመጃ ጊዜ', act: 'progress' },
    ];

    $('#content').innerHTML = `
      <div class="home-hero">
        <div class="hero-badge">${esc(liturgy.icon)}</div>
        <h1 class="hero-title">የቅዳሴ መልመጃ</h1>
        <p class="hero-sub">${esc(liturgy.subtitle)}</p>
        <div class="hero-date">${esc(t.dateStr)}${t.isSunday ? ' · ☀️ እሁድ' : ''}</div>
        <button class="btn btn-hero" data-act="start">ማለመድ ጀምር <span>→</span></button>
      </div>

      <div class="liturgy-switch">
        <button class="ls-btn ${state.liturgy === 'sunday' ? 'on' : ''}" data-lit="sunday">☀️ የእሁድ ቅዳሴ</button>
        <button class="ls-btn ${state.liturgy === 'lent' ? 'on' : ''}" data-lit="lent">✝️ የጾም ቅዳሴ</button>
      </div>

      <div class="stats-row">
        ${cards.map(c => `
          <div class="stat-card" data-act="${c.act}">
            <div class="stat-icon">${c.icon}</div>
            <div class="stat-value">${esc(c.value)}</div>
            <div class="stat-label">${esc(c.label)}</div>
            <div class="stat-sub">${esc(c.sub)}</div>
          </div>`).join('')}
      </div>

      <section class="panel">
        <h2 class="panel-title">${esc(liturgy.icon)} ዛሬ የሚቀደሰው</h2>
        <p class="panel-text">${esc(liturgy.intro)}</p>
        <p class="panel-text">ዜማ፦ <b>${esc(liturgy.tone.am)}</b> — ${esc(liturgy.tone.desc)}</p>
      </section>

      <section class="panel">
        <h2 class="panel-title">📚 የቅዳሴው ክፍሎች (${liturgy.sections.length})</h2>
        <div class="section-list">
          ${liturgy.sections.map((s, i) => {
            const prog = state.progress[s.id];
            const mark = state.bookmarks.includes(s.id);
            return `
              <div class="section-row ${prog ? 'done' : ''}" data-sel="${i}">
                <div class="sr-num">${i + 1}</div>
                <div class="sr-body">
                  <div class="sr-title">${esc(s.title)} ${prog ? '✓' : ''}</div>
                  <div class="sr-desc">${esc(s.titleGe)} · ${esc(s.speaker.am)}</div>
                </div>
                ${mark ? '<div class="sr-bookmark">🔖</div>' : ''}
                <div class="sr-go">›</div>
              </div>`;
          }).join('')}
        </div>
      </section>
    `;

    bindHome();
  }

  function bindHome() {
    $$('[data-act]').forEach(el => el.addEventListener('click', () => {
      const act = el.dataset.act;
      if (act === 'start') setView('practice');
      if (act === 'progress') setView('progress');
    }));
    $$('[data-lit]').forEach(el => el.addEventListener('click', () => {
      state.liturgy = el.dataset.lit;
      state.section = 0;
      saveState();
      renderHome();
      toast('ተመርጧል፦ ' + getLiturgy().title, 'ok');
    }));
    $$('[data-sel]').forEach(el => el.addEventListener('click', () => {
      state.section = parseInt(el.dataset.sel, 10);
      saveState();
      setView('practice');
    }));
  }

  /* ── Practice ──────────────────────────────────────────────────────── */
  const practiceEls = {};
  let autoScrollTimer = null;
  let playInterval = null;
  let activeLine = 0;
  let activeLinesAll = [];   // flattened line objects for the whole section
  let lineStartIndex = 0;    // global index of section's first line
  let sectionTimerStart = 0;

  function flattenLines() {
    const sec = getSection();
    return sec.lines;
  }

  function renderPractice() {
    const sec = getSection();
    const liturgy = getLiturgy();
    activeLinesAll = flattenLines();
    lineStartIndex = 0;
    activeLine = 0;

    const rm = state.readingMode;
    const show = (k) => rm[k] ? ' on' : '';
    const pm = state.practice;

    const practiceChip = (id, label, on) =>
      `<button class="chip ${on ? 'on' : ''}" data-pmode="${id}">${label}</button>`;

    $('#content').innerHTML = `
      <div class="practice-top">
        <div class="crumbs">${esc(liturgy.icon)} ${esc(liturgy.title)} · <span class="crumb-sec">${state.section + 1} / ${liturgy.sections.length}</span></div>
        <h1 class="practice-title">${esc(sec.title)}</h1>
        <div class="practice-sub">${esc(sec.titleGe)} · ${esc(sec.speaker.am)}</div>
        ${sec.desc ? `<div class="practice-desc">${esc(sec.desc)}</div>` : ''}
      </div>

      <div class="progressbar"><div class="progressbar-fill" style="width:${Math.round((state.section + 1) / liturgy.sections.length * 100)}%"></div></div>

      <div class="modebar">
        <div class="mb-group">
          <span class="mb-label">ትርጉም</span>
          <button class="chip ${show('ge')}" data-mode="ge">ግዕዝ</button>
          <button class="chip ${show('am')}" data-mode="am">አማርኛ</button>
          <button class="chip ${show('tr')}" data-mode="tr">ላቲን</button>
          <button class="chip ${show('en')}" data-mode="en">ENG</button>
        </div>
      </div>

      <div class="practice-bar">
        ${practiceChip('none', '🎧 ንባብ', pm.mode === 'none')}
        ${practiceChip('reveal', '✨ አሳይ', pm.mode === 'reveal')}
        ${practiceChip('focus', '🎯 ማድመቅ', pm.mode === 'focus')}
        ${practiceChip('hidden', '🙈 ደብቅ', pm.mode === 'hidden')}
      </div>

      <div id="reader" class="reader"></div>

      <div class="practice-actions">
        <button class="btn btn-ghost" data-act="toggle-scroll">${state.autoScroll ? '⏸ ማሸብለል አቁም' : '⏬ አውቶማቲክ'}</button>
        <button class="btn btn-ghost" data-act="play">▶️ ማዳመጥ</button>
        <button class="btn btn-ghost" data-act="bookmark">${state.bookmarks.includes(sec.id) ? '🔖 ተደርሷል' : '🔖 ምልክት'}</button>
        <button class="btn btn-ghost" data-act="mark-done">✓ ተለምዶአል</button>
      </div>

      <div class="section-nav">
        <button class="btn btn-nav" data-act="prev" ${state.section === 0 ? 'disabled' : ''}>‹ ቀዳሚ</button>
        <span class="nav-count">${state.section + 1} / ${liturgy.sections.length}</span>
        <button class="btn btn-nav" data-act="next" ${state.section === liturgy.sections.length - 1 ? 'disabled' : ''}>ቀጣይ ›</button>
      </div>

      <div class="speed-row">
        <span class="mb-label">ፍጥነት</span>
        <input type="range" id="speed" min="20" max="120" value="${state.autoScrollSpeed}">
        <span id="speedVal" class="mb-label">${state.autoScrollSpeed}</span>
      </div>
    `;

    renderReader();
    bindPractice();
    applyReaderState();
  }

  function readerLineHTML(line, idx) {
    const rm = state.readingMode;
    const isActive = idx === activeLine;
    const parts = [];
    if (rm.ge) parts.push(`<div class="line-ge">${esc(line.ge)}</div>`);
    if (rm.am) parts.push(`<div class="line-am">${esc(line.am)}</div>`);
    if (rm.tr) parts.push(`<div class="line-tr">${esc(line.tr)}</div>`);
    if (rm.en) parts.push(`<div class="line-en">${esc(line.en)}</div>`);
    return `<div class="reader-line ${isActive ? 'active' : ''}" data-line="${idx}">${parts.join('')}</div>`;
  }

  function renderReader() {
    const reader = $('#reader');
    if (!reader) return;
    const pm = state.practice;
    let html = '';

    if (pm.mode === 'none') {
      html = activeLinesAll.map((l, i) => readerLineHTML(l, i)).join('');
    } else if (pm.mode === 'reveal') {
      // show lines progressively up to activeLine
      html = activeLinesAll.map((l, i) =>
        i <= activeLine ? readerLineHTML(l, i)
          : `<div class="reader-line hidden" data-line="${i}"><div class="line-blank">••••••</div></div>`
      ).join('');
    } else if (pm.mode === 'focus') {
      // blur everything except active line
      html = activeLinesAll.map((l, i) => {
        const cls = i === activeLine ? 'active' : 'dimmed';
        return `<div class="reader-line ${cls}" data-line="${i}">
          <div class="line-ge">${esc(l.ge)}</div>
          ${state.readingMode.am ? `<div class="line-am">${esc(l.am)}</div>` : ''}
        </div>`;
      }).join('');
    } else if (pm.mode === 'hidden') {
      // word-by-word hidden reveal: click to reveal next hidden word
      html = activeLinesAll.map((l, i) => {
        const words = l.ge.split(/\s+/);
        return `<div class="reader-line ${i === activeLine ? 'active' : ''}" data-line="${i}">
          <div class="line-ge word-game">${words.map((w, wi) =>
            `<span class="word" data-l="${i}" data-w="${wi}">${i < activeLine || (i === activeLine && wi <= revealWordCount()) ? esc(w) : '▮'}</span>`
          ).join(' ')}</div>
          ${state.readingMode.am ? `<div class="line-am">${esc(l.am)}</div>` : ''}
        </div>`;
      }).join('');
    }
    reader.innerHTML = html;
    syncActiveLine();
  }

  function revealWordCount() {
    // how many words revealed on active line in 'hidden' mode
    const key = `rw_${getSection().id}_${activeLine}`;
    return (state._reveal || {})[key] || 0;
  }
  function setRevealCount(n) {
    if (!state._reveal) state._reveal = {};
    state._reveal[`rw_${getSection().id}_${activeLine}`] = n;
    saveState();
  }

  function syncActiveLine() {
    const line = $(`.reader-line[data-line="${activeLine}"]`);
    if (line && line.scrollIntoView) {
      line.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    const t = $('#lineCounter');
    if (t) t.textContent = `${activeLine + 1} / ${activeLinesAll.length}`;
  }

  function advanceLine(dir) {
    const max = activeLinesAll.length - 1;
    activeLine = Math.max(0, Math.min(max, activeLine + dir));
    if (state.practice.mode === 'hidden') setRevealCount(0);
    renderReader();
    logPractice();
  }

  function revealNextWord() {
    const line = activeLinesAll[activeLine];
    const words = line.ge.split(/\s+/).length;
    const cur = revealWordCount();
    if (cur < words - 1) {
      setRevealCount(cur + 1);
      renderReader();
    } else {
      advanceLine(1);
    }
    logPractice();
  }

  function bindPractice() {
    // mode chips
    $$('[data-mode]').forEach(el => el.addEventListener('click', () => {
      state.readingMode[el.dataset.mode] = !state.readingMode[el.dataset.mode];
      saveState();
      renderPractice();
    }));
    $$('[data-pmode]').forEach(el => el.addEventListener('click', () => {
      state.practice.mode = el.dataset.pmode;
      state.practice.level = 0;
      activeLine = 0;
      if (state.practice.mode === 'hidden') setRevealCount(0);
      saveState();
      renderPractice();
      toast('የመልመጃ ሁነታ፦ ' + el.textContent.trim(), 'ok');
    }));
    $$('[data-act]').forEach(el => el.addEventListener('click', () => {
      const act = el.dataset.act;
      if (act === 'toggle-scroll') toggleAutoScroll();
      if (act === 'play') togglePlay();
      if (act === 'bookmark') toggleBookmark();
      if (act === 'mark-done') markDone();
      if (act === 'prev') gotoSection(state.section - 1);
      if (act === 'next') gotoSection(state.section + 1);
    }));
    // reader click
    $('#reader').addEventListener('click', (e) => {
      const w = e.target.closest('.word');
      if (w && state.practice.mode === 'hidden') {
        revealNextWord();
        return;
      }
      const line = e.target.closest('.reader-line');
      if (line) {
        if (state.practice.mode !== 'hidden') {
          const idx = parseInt(line.dataset.line, 10);
          activeLine = idx;
          renderReader();
        }
      }
    });
    $('#speed').addEventListener('input', (e) => {
      state.autoScrollSpeed = parseInt(e.target.value, 10);
      $('#speedVal').textContent = state.autoScrollSpeed;
      saveState();
    });
    // keyboard
    document.addEventListener('keydown', practiceKeyHandler);
    document.addEventListener('keyup', practiceKeyUp);
    // start session timer
    sectionTimerStart = Date.now();
    document.addEventListener('visibilitychange', onVisChange);
  }

  function practiceKeyHandler(e) {
    if (ui !== 'practice') return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
      if (e.key === ' ' && (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT')) return;
      e.preventDefault();
      if (state.practice.mode === 'hidden') revealNextWord(); else advanceLine(1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (state.practice.mode === 'hidden') { /* back handled by shift? */ } else advanceLine(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (state.practice.mode === 'hidden') revealNextWord(); else advanceLine(1);
    }
  }
  function practiceKeyUp() {}

  function onVisChange() {
    if (document.visibilityState === 'hidden') logPractice();
  }

  function gotoSection(i) {
    const n = getLiturgy().sections.length;
    if (i < 0 || i >= n) return;
    state.section = i;
    saveState();
    stopPlay();
    renderPractice();
  }

  function toggleBookmark() {
    const id = getSection().id;
    const i = state.bookmarks.indexOf(id);
    if (i >= 0) state.bookmarks.splice(i, 1);
    else state.bookmarks.push(id);
    saveState();
    renderPractice();
  }

  function markDone() {
    const id = getSection().id;
    const p = state.progress[id] || { practiced: 0, last: 0 };
    p.practiced += 1;
    p.last = Date.now();
    state.progress[id] = p;
    saveState();
    toast('✓ "' + getSection().title + '" ተለምዶአል', 'ok');
    renderPractice();
  }

  function logPractice() {
    // record progress while reading
    const id = getSection().id;
    const p = state.progress[id] || { practiced: 0, last: 0 };
    p.last = Date.now();
    state.progress[id] = p;
    // daily stats
    const dk = todayKey();
    if (!state.stats.daily[dk]) state.stats.daily[dk] = { sec: 0, words: 0 };
    state.stats.daily[dk].words += 1;
    state.stats.totalTimeSec = state.stats.totalTimeSec || 0;
    saveState();
  }

  /* ── Auto scroll ───────────────────────────────────────────────────── */
  function toggleAutoScroll() {
    state.autoScroll = !state.autoScroll;
    saveState();
    if (state.autoScroll) startAutoScroll(); else stopAutoScroll();
    renderPractice();
  }
  function startAutoScroll() {
    stopAutoScroll();
    const interval = Math.max(400, 4000 - state.autoScrollSpeed * 30);
    autoScrollTimer = setInterval(() => {
      if (activeLine >= activeLinesAll.length - 1) {
        stopAutoScroll();
        state.autoScroll = false;
        saveState();
        renderPractice();
        return;
      }
      advanceLine(1);
    }, interval);
  }
  function stopAutoScroll() {
    if (autoScrollTimer) clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }

  /* ── TTS Playback ──────────────────────────────────────────────────── */
  let voices = [];
  function initVoices() {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  }
  if (window.speechSynthesis) {
    initVoices();
    window.speechSynthesis.onvoiceschanged = initVoices;
  }
  function pickVoice(lang) {
    if (!voices.length) return null;
    const preferred = lang === 'ge' ? ['am-ET', 'am', 'en-US', 'en'] : ['am-ET', 'am', 'en-US', 'en'];
    for (const v of preferred) {
      const found = voices.find(vv => (vv.lang || '').toLowerCase().startsWith(v.toLowerCase()));
      if (found) return found;
    }
    return voices[0];
  }
  function togglePlay() {
    if (playInterval) { stopPlay(); return; }
    startPlay();
  }
  function startPlay() {
    if (!('speechSynthesis' in window)) {
      toast('ማዳመጥ በዚህ መሣሪያ አይገኝም', 'err');
      return;
    }
    if (state.practice.mode === 'hidden') state.practice.mode = 'none';
    speechSynthesis.cancel();
    playInterval = setInterval(playNextLine, 0);
    playNextLine();
    renderPractice();
  }
  function playNextLine() {
    if (!activeLinesAll.length) return;
    const line = activeLinesAll[activeLine];
    const text = state.readingMode.am ? line.am : line.ge;
    const u = new SpeechSynthesisUtterance(text);
    const lang = 'am-ET';
    u.lang = lang;
    u.rate = 0.9;
    const v = pickVoice(lang);
    if (v) u.voice = v;
    speechSynthesis.speak(u);
    renderReader();
    logPractice();
    // advance when speaking ends
    u.onend = () => {
      if (!playInterval) return;
      if (activeLine >= activeLinesAll.length - 1) { stopPlay(); return; }
      activeLine += 1;
      renderReader();
    };
  }
  function stopPlay() {
    if (playInterval) clearInterval(playInterval);
    playInterval = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  /* ── Quiz ──────────────────────────────────────────────────────────── */
  let quizIdx = 0;
  let quizCorrect = 0;
  let quizAnswered = false;

  function renderQuiz() {
    const q = QIDASSE_DATA.quiz;
    if (!q.length) { $('#content').innerHTML = '<p>ጥያቄ የለም</p>'; return; }
    if (quizIdx >= q.length) {
      const correct = state.stats.quizCorrect;
      const total = state.stats.quizTotal;
      const pct = total ? Math.round(correct / total * 100) : 0;
      $('#content').innerHTML = `
        <div class="quiz-done">
          <div class="quiz-done-icon">🎉</div>
          <h1>እንኳን ደስ አለህ!</h1>
          <p>ውጤትህ፦ <b>${correct} / ${total}</b> (${pct}%)</p>
          <div class="pct-ring" style="--p:${pct}%">${pct}%</div>
          <button class="btn btn-hero" data-act="quiz-restart">ዳግም ጀምር</button>
          <button class="btn btn-ghost" data-act="quiz-home">ወደ መነሻ</button>
        </div>`;
      $$('[data-act]').forEach(el => el.addEventListener('click', () => {
        if (el.dataset.act === 'quiz-restart') { quizIdx = 0; quizCorrect = 0; renderQuiz(); }
        if (el.dataset.act === 'quiz-home') setView('home');
      }));
      return;
    }
    const item = q[quizIdx];
    quizAnswered = false;
    $('#content').innerHTML = `
      <div class="quiz-top">
        <span class="chip on">ፈተና</span>
        <span class="quiz-count">${quizIdx + 1} / ${q.length}</span>
      </div>
      <div class="progressbar"><div class="progressbar-fill" style="width:${Math.round(quizIdx / q.length * 100)}%"></div></div>
      <div class="quiz-card">
        <h2 class="quiz-q">${esc(item.q)}</h2>
        <div class="quiz-opts">
          ${item.options.map((o, i) => `<button class="quiz-opt" data-opt="${i}">${esc(o)}</button>`).join('')}
        </div>
        <div id="quizNote" class="quiz-note"></div>
      </div>`;
    $$('.quiz-opt').forEach(el => el.addEventListener('click', () => {
      if (quizAnswered) return;
      quizAnswered = true;
      const chosen = parseInt(el.dataset.opt, 10);
      const correct = chosen === item.answer;
      if (correct) quizCorrect++;
      state.stats.quizTotal++;
      if (correct) state.stats.quizCorrect++;
      saveState();
      $$('.quiz-opt').forEach(b => {
        const bi = parseInt(b.dataset.opt, 10);
        if (bi === item.answer) b.classList.add('right');
        else if (bi === chosen) b.classList.add('wrong');
        b.disabled = true;
      });
      $('#quizNote').innerHTML = correct
        ? `<div class="quiz-note ok">✓ ትክክል ነው! ${esc(item.note || '')}</div>`
        : `<div class="quiz-note bad">✗ ትክክል አይደለም። ${esc(item.note || '')}</div>`;
      setTimeout(() => { quizIdx++; renderQuiz(); }, 1500);
    }));
  }

  /* ── Progress ──────────────────────────────────────────────────────── */
  function renderProgress() {
    const liturgy = getLiturgy();
    const total = liturgy.sections.length;
    const done = Object.keys(state.progress).length;
    const mastery = total ? Math.round(done / total * 100) : 0;
    const totalSec = state.stats.totalTimeSec;
    const streak = state.stats.streakDays;

    // streak computation
    let streakCalc = 0;
    const days = Object.keys(state.stats.daily).sort().reverse();
    let cursor = new Date();
    for (let d of days) {
      if (d === todayKey(cursor)) { streakCalc++; cursor.setDate(cursor.getDate() - 1); continue; }
      break;
    }

    const sectionsHtml = liturgy.sections.map((s, i) => {
      const p = state.progress[s.id];
      const practiced = p ? p.practiced : 0;
      const last = p && p.last ? new Date(p.last).toLocaleDateString() : '—';
      const mark = state.bookmarks.includes(s.id);
      return `
        <div class="prog-row" data-sel="${i}">
          <div class="prog-num">${i + 1}</div>
          <div class="prog-info">
            <div class="prog-title">${esc(s.title)} ${mark ? '🔖' : ''}</div>
            <div class="prog-sub">${esc(s.titleGe)}</div>
          </div>
          <div class="prog-right">
            <div class="prog-times">×${practiced}</div>
            <div class="prog-last">${esc(last)}</div>
            <div class="prog-bar"><div class="prog-fill" style="width:${Math.min(100, practiced * 33)}%"></div></div>
          </div>
        </div>`;
    }).join('');

    $('#content').innerHTML = `
      <h1 class="page-title">📊 የመልመጃ ሂደት</h1>
      <div class="stats-grid">
        <div class="stat-panel"><span class="sp-value">${mastery}%</span><span class="sp-label">ክፍሎች</span></div>
        <div class="stat-panel"><span class="sp-value">${done}/${total}</span><span class="sp-label">የተለመዱ</span></div>
        <div class="stat-panel"><span class="sp-value">${fmtTime(totalSec)}</span><span class="sp-label">ጠቅላላ ጊዜ</span></div>
        <div class="stat-panel"><span class="sp-value">${streakCalc}🔥</span><span class="sp-label">ተከታታይ</span></div>
      </div>
      <section class="panel">
        <h2 class="panel-title">✍️ የክፍሎች መልመጃ</h2>
        <div class="prog-list">${sectionsHtml}</div>
      </section>
      <button class="btn btn-ghost block" data-act="reset">🗑 ሁሉንም ሂደት አጥፋ</button>
    `;
    $$('[data-sel]').forEach(el => el.addEventListener('click', () => {
      state.section = parseInt(el.dataset.sel, 10);
      saveState();
      setView('practice');
    }));
    $$('[data-act]').forEach(el => el.addEventListener('click', () => {
      if (el.dataset.act === 'reset') {
        if (confirm('እርግጠኛ ነህ? የመልመጃ ሂደትህ ሁሉ ይጠፋል።')) {
          state.progress = {};
          state.stats.quizCorrect = 0;
          state.stats.quizTotal = 0;
          saveState();
          renderProgress();
          toast('ሂደት ተደምስሷል', 'ok');
        }
      }
    }));
  }

  /* ── Settings ──────────────────────────────────────────────────────── */
  function renderSettings() {
    $('#content').innerHTML = `
      <h1 class="page-title">⚙️ ቅንብሮች</h1>

      <section class="panel">
        <h2 class="panel-title">🎨 ገጽታ</h2>
        <div class="chip-row">
          <button class="chip ${state.theme === 'light' ? 'on' : ''}" data-theme="light">☀️ ብርሃን</button>
          <button class="chip ${state.theme === 'dark' ? 'on' : ''}" data-theme="dark">🌙 ጨለማ</button>
          <button class="chip ${state.theme === 'sepia' ? 'on' : ''}" data-theme="sepia">📜 ሴፒያ</button>
        </div>
      </section>

      <section class="panel">
        <h2 class="panel-title">🔤 የፊደል መጠን</h2>
        <div class="font-row">
          <button class="btn btn-ghost" data-font="-">A−</button>
          <input type="range" id="fontRange" min="14" max="34" value="${state.fontSize}">
          <button class="btn btn-ghost" data-font="+">A+</button>
        </div>
        <div class="font-preview" style="font-size:${state.fontSize}px">በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ</div>
      </section>

      <section class="panel">
        <h2 class="panel-title">🗣 ንባብ (ማዳመጥ)</h2>
        <p class="panel-text">አፕሊኬሽኑ የመሣሪያውን የንግግር ቴክኖሎጂ በመጠቀም ጸሎቱን ያነባል። ጥራቱ በመሣሪያ ይወሰናል።</p>
        <button class="btn btn-ghost" data-act="test-voice">🔊 ሙከራ ንባብ</button>
      </section>

      <section class="panel">
        <h2 class="panel-title">ℹ️ ስለ አፕ</h2>
        <p class="panel-text">የቅዳሴ መልመጃ አፕ — v${QIDASSE_DATA.version}</p>
        <p class="panel-text">ይህ ጸሎት ለመማርና ለመልመጃ የተዘጋጀ ነው። ለትክክለኛው ሥርዓት የቤተ ክርስቲያንን መጽሐፈ ቅዳሴ ይጠቀሙ።</p>
      </section>
    `;

    $$('[data-theme]').forEach(el => el.addEventListener('click', () => {
      state.theme = el.dataset.theme;
      saveState();
      applyTheme();
      renderSettings();
    }));
    $$('[data-font]').forEach(el => el.addEventListener('click', () => {
      state.fontSize = Math.max(14, Math.min(34, state.fontSize + (el.dataset.font === '+' ? 2 : -2)));
      saveState();
      applyTheme();
      renderSettings();
    }));
    $('#fontRange').addEventListener('input', (e) => {
      state.fontSize = parseInt(e.target.value, 10);
      saveState();
      applyTheme();
      renderSettings();
    });
    $$('[data-act]').forEach(el => el.addEventListener('click', () => {
      if (el.dataset.act === 'test-voice') {
        if (!('speechSynthesis' in window)) { toast('ንባብ አይገኝም', 'err'); return; }
        const u = new SpeechSynthesisUtterance('በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ።');
        u.lang = 'am-ET';
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      }
    }));
  }

  /* ── applyReaderState: keep reader in sync after re-render ─────────── */
  function applyReaderState() {
    // no-op, reader already rendered
  }

  /* ── Service worker registration ───────────────────────────────────── */
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  /* ── Init ──────────────────────────────────────────────────────────── */
  function init() {
    // navigation
    $$('.nav-item').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    // record a session on first load of the day
    const dk = todayKey();
    if (state.stats.lastVisit !== dk) {
      state.stats.sessions += 1;
      state.stats.lastVisit = dk;
    }
    saveState();
    applyTheme();
    // pick a sensible starting liturgy
    if (ethiopianToday().isSunday) state.liturgy = 'sunday';
    saveState();
    setView('home');
    registerSW();
    // SWA update marker
    document.getElementById('app').classList.add('ready');
  }

  // expose for debugging
  window.__KIDASE__ = {
    state,
    setState: (s) => { state = s; },
    save: saveState,
    setView,
    getLiturgy,
    getSection,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
