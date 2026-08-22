/* ══════════ ቅዳሴ መልመጃ — app.js ══════════ */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const S = KIDASE.sections;
  const LS = 'kidase.v1';

  /* ---------- state ---------- */
  const state = Object.assign({
    sec: 0, geez: true, amh: true, eng: false,
    role: 'all', fs: 16, done: []
  }, load());

  function load() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }

  /* ---------- helpers ---------- */
  const roleClass = r => 'r-' + String(r).replace(/\s+/g, '-');
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function lineHTML(ln, opts) {
    opts = opts || {};
    const isNote = ln.r === 'ማስታወሻ';
    let body = '';
    if (state.geez && ln.g) body += '<div class="txt tg">' + esc(ln.g) + '</div>';
    if (state.amh && ln.a) body += '<div class="txt ta">' + esc(ln.a) + '</div>';
    if (state.eng && ln.e) body += '<div class="txt te">' + esc(ln.e) + '</div>';
    if (!body) { // fallback so a line is never empty
      body = '<div class="txt tg">' + esc(ln.g || ln.a || ln.e || '') + '</div>';
    }
    const dim = (!isNote && state.role !== 'all' && !String(ln.r).includes(state.role)) ? ' dim' : '';
    const hid = opts.hide ? ' hidden-line' : '';
    return '<div class="line ' + roleClass(ln.r) + dim + hid + '">' +
             '<span class="role">' + esc(ln.r) + '</span>' + body +
           '</div>';
  }

  /* ══════════ READ VIEW ══════════ */
  function renderRead() {
    const s = S[state.sec];
    $('secTitle').textContent = s.title;
    $('secCount').textContent = 'ክፍል ' + (state.sec + 1) + ' ከ ' + S.length;
    $('secNote').textContent = s.note || '';
    $('lines').innerHTML = s.lines.map(ln => lineHTML(ln)).join('');
    if (s.star) {
      [].forEach.call($('lines').children, el => el.classList.add('star'));
    }
    $('markDone').checked = state.done.indexOf(s.id) >= 0;
    $('prevSec').disabled = state.sec === 0;
    $('nextSec').disabled = state.sec === S.length - 1;
    renderSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderSidebar() {
    $('sectionList').innerHTML = S.map((s, i) =>
      '<li data-i="' + i + '" class="' + (i === state.sec ? 'cur' : '') + '">' +
        '<span>' + (i + 1) + '. ' + esc(s.title) + '</span>' +
        (state.done.indexOf(s.id) >= 0 ? '<span class="tick">✓</span>' : '') +
      '</li>').join('');
    const n = state.done.length;
    $('pfill').style.width = (n / S.length * 100) + '%';
    $('ptext').textContent = n + ' / ' + S.length + ' ተጠናቀዋል';
  }

  $('sectionList').addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;
    state.sec = +li.dataset.i; save(); renderRead(); closeSide();
  });

  $('prevSec').onclick = () => { if (state.sec > 0) { state.sec--; save(); renderRead(); } };
  $('nextSec').onclick = () => { if (state.sec < S.length - 1) { state.sec++; save(); renderRead(); } };

  $('markDone').onchange = e => {
    const id = S[state.sec].id, i = state.done.indexOf(id);
    if (e.target.checked) { if (i < 0) state.done.push(id); }
    else if (i >= 0) state.done.splice(i, 1);
    save(); renderSidebar();
  };

  $('resetProgress').onclick = () => {
    if (confirm('እድገትህ በሙሉ ይጠፋል። እርግጠኛ ነህ?')) {
      state.done = []; save(); renderRead();
    }
  };

  /* ══════════ TOOLBAR ══════════ */
  function bindChk(id, key) {
    const el = $(id); el.checked = state[key];
    el.onchange = () => { state[key] = el.checked; save(); refresh(); };
  }
  bindChk('showGeez', 'geez'); bindChk('showAmh', 'amh'); bindChk('showEng', 'eng');

  $('roleSelect').value = state.role;
  $('roleSelect').onchange = e => { state.role = e.target.value; save(); refresh(); };

  function setFS(v) {
    state.fs = Math.max(13, Math.min(24, v)); save();
    document.documentElement.style.setProperty('--fs', state.fs + 'px');
  }
  $('fontUp').onclick = () => setFS(state.fs + 1);
  $('fontDown').onclick = () => setFS(state.fs - 1);
  setFS(state.fs);

  /* ══════════ SIDEBAR TOGGLE ══════════ */
  const openSide = () => { $('sidebar').classList.add('open'); $('overlay').classList.add('show'); };
  const closeSide = () => { $('sidebar').classList.remove('open'); $('overlay').classList.remove('show'); };
  $('menuBtn').onclick = openSide;
  $('closeSide').onclick = closeSide;
  $('overlay').onclick = closeSide;

  /* ══════════ TABS ══════════ */
  let curView = 'read';
  $('tabs').addEventListener('click', e => {
    const t = e.target.closest('.tab'); if (!t) return;
    curView = t.dataset.view;
    [].forEach.call(document.querySelectorAll('.tab'), b => b.classList.toggle('active', b === t));
    [].forEach.call(document.querySelectorAll('.view'), v =>
      v.classList.toggle('active', v.id === 'view-' + curView));
    $('toolbar').classList.toggle('hide', curView === 'flash' || curView === 'quiz');
    if (curView === 'flash') renderFlash();
    if (curView === 'quiz') nextQuestion();
    window.scrollTo({ top: 0 });
  });

  function refresh() {
    renderRead();
    if (curView === 'practice' && pracActive) renderPractice();
  }

  /* ══════════ PRACTICE ══════════ */
  let pracActive = false;
  $('pracSection').innerHTML = S.map((s, i) =>
    '<option value="' + i + '">' + (i + 1) + '. ' + esc(s.title) + '</option>').join('');

  function renderPractice() {
    const idx = +$('pracSection').value;
    const hideRole = $('pracRole').value;
    const s = S[idx];
    $('pracLines').innerHTML = s.lines.map(ln =>
      lineHTML(ln, { hide: ln.r !== 'ማስታወሻ' && String(ln.r).includes(hideRole) })
    ).join('');
  }

  $('pracStart').onclick = () => { pracActive = true; renderPractice(); };
  $('pracSection').onchange = () => { if (pracActive) renderPractice(); };
  $('pracRole').onchange = () => { if (pracActive) renderPractice(); };
  $('pracRevealAll').onclick = () => {
    [].forEach.call($('pracLines').querySelectorAll('.hidden-line'), el => el.classList.add('shown'));
  };
  $('pracLines').addEventListener('click', e => {
    const l = e.target.closest('.hidden-line'); if (l) l.classList.toggle('shown');
  });

  /* ══════════ FLASHCARDS ══════════ */
  let deck = QUICK_PAIRS.slice(), fi = 0;

  function renderFlash() {
    const c = deck[fi];
    $('fcInner').classList.remove('flip');
    $('fcWho').textContent = c.who;
    $('fcQ').textContent = c.c;
    $('fcA').textContent = c.r;
    $('fcCount').textContent = (fi + 1) + ' / ' + deck.length;
  }
  $('flashcard').onclick = () => $('fcInner').classList.toggle('flip');
  $('fcNext').onclick = () => { fi = (fi + 1) % deck.length; renderFlash(); };
  $('fcPrev').onclick = () => { fi = (fi - 1 + deck.length) % deck.length; renderFlash(); };
  $('fcShuffle').onclick = () => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    fi = 0; renderFlash();
  };

  /* ══════════ QUIZ ══════════ */
  let qGood = 0, qBad = 0, qCur = null, qLast = -1;

  function nextQuestion() {
    $('qNext').hidden = true;
    $('qFeedback').textContent = '';
    $('qFeedback').className = 'q-feedback';

    let i;
    do { i = Math.floor(Math.random() * QUICK_PAIRS.length); }
    while (QUICK_PAIRS.length > 1 && i === qLast);
    qLast = i;
    qCur = QUICK_PAIRS[i];

    // 3 distractors
    const pool = QUICK_PAIRS.filter((p, k) => k !== i);
    for (let k = pool.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      const t = pool[k]; pool[k] = pool[j]; pool[j] = t;
    }
    const opts = [qCur.r].concat(pool.slice(0, 3).map(p => p.r));
    for (let k = opts.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      const t = opts[k]; opts[k] = opts[j]; opts[j] = t;
    }

    $('qWho').textContent = qCur.who.split('→')[0].trim() + ' ይላል፦';
    $('qText').textContent = qCur.c;
    $('qOptions').innerHTML = opts.map(o =>
      '<button class="q-opt">' + esc(o) + '</button>').join('');
  }

  $('qOptions').addEventListener('click', e => {
    const b = e.target.closest('.q-opt'); if (!b || b.disabled) return;
    const all = [].slice.call($('qOptions').children);
    all.forEach(x => { x.disabled = true; if (x.textContent === qCur.r) x.classList.add('correct'); });
    if (b.textContent === qCur.r) {
      qGood++; $('qFeedback').textContent = '✓ ትክክል ነው! በርታ።';
      $('qFeedback').className = 'q-feedback ok';
    } else {
      qBad++; b.classList.add('wrong');
      $('qFeedback').textContent = '✗ ትክክለኛው መልስ ከላይ በአረንጓዴ ተመልክቷል።';
      $('qFeedback').className = 'q-feedback bad';
    }
    $('qGood').textContent = qGood; $('qBad').textContent = qBad;
    $('qNext').hidden = false;
  });
  $('qNext').onclick = nextQuestion;
  $('qReset').onclick = () => {
    qGood = qBad = 0; $('qGood').textContent = 0; $('qBad').textContent = 0; nextQuestion();
  };

  /* ══════════ KEYBOARD ══════════ */
  document.addEventListener('keydown', e => {
    if (/input|select|textarea/i.test(e.target.tagName)) return;
    if (curView === 'read') {
      if (e.key === 'ArrowLeft') $('nextSec').click();
      if (e.key === 'ArrowRight') $('prevSec').click();
    }
    if (curView === 'flash') {
      if (e.key === 'ArrowLeft') $('fcNext').click();
      if (e.key === 'ArrowRight') $('fcPrev').click();
      if (e.key === ' ') { e.preventDefault(); $('flashcard').click(); }
    }
  });

  /* ══════════ INIT ══════════ */
  if (state.sec >= S.length) state.sec = 0;
  renderRead();
  renderFlash();
})();
