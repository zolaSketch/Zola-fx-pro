/* =========================================================================
   የቅዳሴ መልመጃ አፕ — Application Logic v2
   ኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን
   ========================================================================= */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const LS_KEY = 'kidase-app-state-v2';

  const defaultState = () => ({
    liturgy: 'sunday',
    section: 0,
    readingMode: { ge: true, am: true, tr: false, en: false },
    fontSize: 20,
    theme: 'light',
    autoScroll: false,
    autoScrollSpeed: 60,
    zemaMode: 'geez',          // chant mode for playback
    zemaEnabled: true,
    practice: { mode: 'none' },
    bookmarks: [],
    progress: {},
    stats: { sessions: 0, totalTimeSec: 0, quizCorrect: 0, quizTotal: 0, lastVisit: null, daily: {} },
  });

  let state = loadState();
  let ui = 'home';

  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? deepMerge(defaultState(), JSON.parse(raw)) : defaultState();
    } catch (e) { return defaultState(); }
  }
  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function deepMerge(base, over) {
    const out = Object.assign({}, base);
    for (const k in over) {
      if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k] && typeof base[k] === 'object') {
        out[k] = deepMerge(base[k], over[k]);
      } else out[k] = over[k];
    }
    return out;
  }

  const getLiturgy = () => QIDASSE_DATA.liturgies[state.liturgy];
  const getSection = () => getLiturgy().sections[state.section];
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const todayKey = (d = new Date()) => {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  };

  let toastTimer = null;
  function toast(msg, type) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast'; }, 2400);
  }

  /* ── Router ────────────────────────────────────────────────────────── */
  function setView(view) {
    ui = view;
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    ({ home: renderHome, practice: renderPractice, readings: renderReadings,
       quiz: renderQuiz, progress: renderProgress, settings: renderSettings })[view]();
    const c = $('#content'); if (c) c.scrollTop = 0;
  }

  function applyTheme() {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
    document.body.classList.add('theme-' + state.theme);
    document.documentElement.style.setProperty('--read-font', state.fontSize + 'px');
  }

  /* ── HOME ──────────────────────────────────────────────────────────── */
  function renderHome() {
    const eth = window.EthDate.fromDate(new Date());
    const season = window.EthDate.season(eth);
    const liturgy = getLiturgy();
    const done = Object.keys(state.progress).length;
    const total = liturgy.sections.length;
    const mastery = total ? Math.round(done / total * 100) : 0;
    const s = state.stats;

    const cards = [
      { icon:'☀️', label:'ቅዳሴ', value: liturgy.title.split(' ')[1] || 'ቅዳሴ', sub: liturgy.tone.am + ' ዜማ', act:'practice' },
      { icon:'✍️', label:'የተለመደ', value:`${done}/${total}`, sub:`${mastery}%`, act:'progress' },
      { icon:'🔥', label:'ተከታታይ', value: calcStreak(), sub:'ቀናት', act:'progress' },
    ];

    $('#content').innerHTML = `
      <div class="hero">
        <div class="hero-orn">☩</div>
        <div class="hero-badge">${esc(liturgy.icon)}</div>
        <h1>የቅዳሴ መልመጃ</h1>
        <p class="hero-sub">ኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን</p>
        <div class="hero-date">
          <span class="eth-date">${eth.day} ${eth.monthName} ${eth.year} ዓ.ም.</span>
          <span class="eth-week">${eth.weekdayName}${eth.isSunday ? ' · ☀️ እሑድ' : ''}</span>
        </div>
        <div class="season-chip">${esc(season.name)} — ${esc(season.desc)}</div>
        <button class="btn btn-hero" data-act="practice">ማለመድ ጀምር <span>→</span></button>
      </div>

      <div class="liturgy-switch">
        <button class="ls-btn ${state.liturgy==='sunday'?'on':''}" data-lit="sunday">☀️ የእሁድ ቅዳሴ</button>
        <button class="ls-btn ${state.liturgy==='lent'?'on':''}" data-lit="lent">✝️ የጾም ቅዳሴ</button>
      </div>

      <div class="stats-row">
        ${cards.map(c=>`<div class="stat-card" data-act="${c.act}"><div class="stat-icon">${c.icon}</div><div class="stat-value">${esc(c.value)}</div><div class="stat-label">${esc(c.label)}</div><div class="stat-sub">${esc(c.sub)}</div></div>`).join('')}
      </div>

      <section class="panel">
        <h2 class="panel-title">${esc(liturgy.icon)} ዛሬ የሚቀደሰው</h2>
        <p class="panel-text">${esc(liturgy.intro)}</p>
        <div class="tone-row">
          <button class="chip" data-tone-preview="${liturgy.tone.id}">🎵 ዜማ ስማ፦ ${esc(liturgy.tone.am)}</button>
        </div>
      </section>

      <section class="panel">
        <h2 class="panel-title">📚 ክፍሎች (${liturgy.sections.length})</h2>
        <div class="section-list">
          ${liturgy.sections.map((sec,i)=>{
            const prog=state.progress[sec.id]; const mark=state.bookmarks.includes(sec.id);
            return `<div class="section-row ${prog?'done':''}" data-sel="${i}">
              <div class="sr-num">${i+1}</div>
              <div class="sr-body"><div class="sr-title">${esc(sec.title)} ${prog?'✓':''}</div><div class="sr-desc">${esc(sec.titleGe)} · ${esc(sec.speaker.am)}</div></div>
              ${mark?'<div class="sr-bookmark">🔖</div>':''}<div class="sr-go">›</div></div>`;
          }).join('')}
        </div>
      </section>
    `;
    bindHome();
  }
  function bindHome() {
    $$('[data-act]').forEach(el=>el.addEventListener('click',()=>{ if(el.dataset.act==='practice')setView('practice'); if(el.dataset.act==='progress')setView('progress'); }));
    $$('[data-lit]').forEach(el=>el.addEventListener('click',()=>{ state.liturgy=el.dataset.lit; state.section=0; saveState(); renderHome(); toast('ተመርጧል፦ '+getLiturgy().title,'ok'); }));
    $$('[data-sel]').forEach(el=>el.addEventListener('click',()=>{ state.section=parseInt(el.dataset.sel,10); saveState(); setView('practice'); }));
    $$('[data-tone-preview]').forEach(el=>el.addEventListener('click',()=>{ window.Zema.preview(el.dataset.tonePreview); }));
  }

  /* ── PRACTICE ──────────────────────────────────────────────────────── */
  let activeLine = 0;
  let activeLines = [];
  let zemaTimer = null;
  let zemaActive = false;
  let scrollTimer = null;
  let revealMap = {};

  function renderPractice() {
    const sec = getSection(); const liturgy = getLiturgy();
    activeLines = sec.lines; activeLine = Math.min(activeLine, activeLines.length-1);
    const rm = state.readingMode;
    const pm = state.practice;
    const show=(k)=>rm[k]?' on':'';

    $('#content').innerHTML = `
      <div class="p-top">
        <div class="crumbs">${esc(liturgy.icon)} ${esc(liturgy.title)} · <b>${state.section+1}/${liturgy.sections.length}</b></div>
        <h1 class="p-title">${esc(sec.title)}</h1>
        <div class="p-sub">${esc(sec.titleGe)} · ${esc(sec.speaker.am)} · 🎵 ${esc(liturgy.tone.am)}</div>
        ${sec.desc?`<div class="p-desc">${esc(sec.desc)}</div>`:''}
      </div>
      <div class="progressbar"><div class="progressbar-fill" style="width:${Math.round((state.section+1)/liturgy.sections.length*100)}%"></div></div>

      <div class="modebar">
        <span class="mb-label">ትርጉም፦</span>
        <button class="chip ${show('ge')}" data-mode="ge">ግዕዝ</button>
        <button class="chip ${show('am')}" data-mode="am">አማርኛ</button>
        <button class="chip ${show('tr')}" data-mode="tr">ላቲን</button>
        <button class="chip ${show('en')}" data-mode="en">ENG</button>
        <button class="chip ${show('ph')}" data-mode="ph" title="አነባበብ (ፎነቲክ)">🗣 ፎነቲክ</button>
      </div>

      <div class="practice-bar">
        <button class="chip ${pm.mode==='none'?'on':''}" data-pmode="none">🎧 ንባብ</button>
        <button class="chip ${pm.mode==='reveal'?'on':''}" data-pmode="reveal">✨ መግለጥ</button>
        <button class="chip ${pm.mode==='focus'?'on':''}" data-pmode="focus">🎯 ማድመቅ</button>
        <button class="chip ${pm.mode==='hidden'?'on':''}" data-pmode="hidden">🙈 ደብቅ</button>
      </div>

      <div id="reader" class="reader"></div>

      <div class="playbar">
        <button class="btn btn-play ${zemaActive?'playing':''}" data-act="zema">${zemaActive?'⏹ አቁም':'🎵 ዜማ አጫወት'}</button>
        <button class="btn btn-play" data-act="tts">🗣 አንብብ</button>
        <button class="btn btn-play" data-act="auto">${state.autoScroll?'⏸ አቁም':'⏬ አውቶ'}</button>
      </div>

      <div class="practice-actions">
        <button class="btn btn-ghost" data-act="bookmark">${state.bookmarks.includes(sec.id)?'🔖 ተደርሷል':'🔖 ምልክት'}</button>
        <button class="btn btn-ghost" data-act="mark">✓ ተለምዶአል</button>
      </div>

      <div class="section-nav">
        <button class="btn btn-nav" data-act="prev" ${state.section===0?'disabled':''}>‹ ቀዳሚ</button>
        <span class="nav-count" id="lineCount">1 / ${activeLines.length}</span>
        <button class="btn btn-nav" data-act="next" ${state.section===liturgy.sections.length-1?'disabled':''}>ቀጣይ ›</button>
      </div>

      <div class="speed-row">
        <span class="mb-label">⚡ ፍጥነት</span>
        <input type="range" id="speed" min="20" max="120" value="${state.autoScrollSpeed}">
        <span id="speedVal">${state.autoScrollSpeed}</span>
      </div>
    `;
    renderReader();
    bindPractice();
  }

  function lineHTML(line, i) {
    const rm = state.readingMode;
    const active = i===activeLine;
    let ge = `<div class="line-ge">${esc(line.ge)}</div>`;
    if (rm.ph) ge += `<div class="line-ph">${esc(window.Geez.phonetic(line.ge))}</div>`;
    let out = `<div class="line">${ge}`;
    if (rm.am) out += `<div class="line-am">${esc(line.am)}</div>`;
    if (rm.tr) out += `<div class="line-tr">${esc(line.tr)}</div>`;
    if (rm.en) out += `<div class="line-en">${esc(line.en)}</div>`;
    out += `</div>`;
    return `<div class="reader-line ${active?'active':''}" data-line="${i}">${out}</div>`;
  }

  function renderReader() {
    const r = $('#reader'); if(!r) return;
    const pm = state.practice;
    let html;
    if (pm.mode==='none') html = activeLines.map(lineHTML).join('');
    else if (pm.mode==='reveal') html = activeLines.map((l,i)=> i<=activeLine?lineHTML(l,i):`<div class="reader-line hidden" data-line="${i}"><div class="line-blank">••••••</div></div>`).join('');
    else if (pm.mode==='focus') html = activeLines.map((l,i)=> `<div class="reader-line ${i===activeLine?'active':'dimmed'}" data-line="${i}"><div class="line-ge">${esc(l.ge)}</div>${state.readingMode.am?`<div class="line-am">${esc(l.am)}</div>`:''}</div>`).join('');
    else { // hidden word-game
      html = activeLines.map((l,i)=>{
        const words=l.ge.split(/\s+/);
        const reveal=revealMap[i]||0;
        return `<div class="reader-line ${i===activeLine?'active':''}" data-line="${i}">
          <div class="line-ge wordgame">${words.map((w,wi)=>`<span class="word" data-l="${i}" data-w="${wi}">${i<activeLine||(i===activeLine&&wi<=reveal)?esc(w):'▮'}</span>`).join(' ')}</div>
          ${state.readingMode.am?`<div class="line-am">${esc(l.am)}</div>`:''}</div>`;
      }).join('');
    }
    r.innerHTML = html;
    const line=$(`.reader-line[data-line="${activeLine}"]`);
    if(line&&line.scrollIntoView)line.scrollIntoView({block:'center',behavior:'smooth'});
    const lc=$('#lineCount'); if(lc)lc.textContent=`${activeLine+1} / ${activeLines.length}`;
  }

  function goLine(dir) {
    const max=activeLines.length-1;
    activeLine=Math.max(0,Math.min(max,activeLine+dir));
    if(state.practice.mode==='hidden'&&dir>0)revealMap[activeLine]=0;
    renderReader(); logProgress(1);
  }
  function revealWord() {
    const line=activeLines[activeLine]; if(!line)return;
    const words=line.ge.split(/\s+/);
    const cur=revealMap[activeLine]||0;
    if(cur<words.length-1){ revealMap[activeLine]=cur+1; renderReader(); }
    else goLine(1);
    logProgress(1);
  }

  function bindPractice() {
    $$('[data-mode]').forEach(el=>el.addEventListener('click',()=>{ state.readingMode[el.dataset.mode]=!state.readingMode[el.dataset.mode]; saveState(); renderPractice(); }));
    $$('[data-pmode]').forEach(el=>el.addEventListener('click',()=>{ state.practice.mode=el.dataset.pmode; revealMap={}; activeLine=0; saveState(); renderPractice(); }));
    $$('[data-act]').forEach(el=>el.addEventListener('click',()=>{
      const a=el.dataset.act;
      if(a==='zema') toggleZema();
      if(a==='tts') toggleTTS();
      if(a==='auto') toggleAuto();
      if(a==='bookmark') toggleBookmark();
      if(a==='mark') markDone();
      if(a==='prev') gotoSection(state.section-1);
      if(a==='next') gotoSection(state.section+1);
    }));
    const r=$('#reader');
    r.addEventListener('click',(e)=>{
      const w=e.target.closest('.word');
      if(w&&state.practice.mode==='hidden'){ revealWord(); return; }
      const line=e.target.closest('.reader-line');
      if(line){ activeLine=parseInt(line.dataset.line,10); renderReader(); }
    });
    const sp=$('#speed'); if(sp)sp.addEventListener('input',(e)=>{ state.autoScrollSpeed=parseInt(e.target.value,10); saveState(); const v=$('#speedVal'); if(v)v.textContent=state.autoScrollSpeed; });
    document.addEventListener('keydown', keyHandler);
  }

  function keyHandler(e) {
    if(ui!=='practice')return;
    if(['ArrowDown','ArrowRight',' ','Enter'].includes(e.key)){
      if(e.key===' '&&['BUTTON','INPUT'].includes(e.target.tagName))return;
      e.preventDefault();
      if(state.practice.mode==='hidden')revealWord(); else goLine(1);
    } else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){ e.preventDefault(); if(state.practice.mode!=='hidden')goLine(-1); }
  }

  function gotoSection(i){ const n=getLiturgy().sections.length; if(i<0||i>=n)return; stopZema(); state.section=i; activeLine=0; saveState(); renderPractice(); }
  function toggleBookmark(){ const id=getSection().id; const i=state.bookmarks.indexOf(id); if(i>=0)state.bookmarks.splice(i,1); else state.bookmarks.push(id); saveState(); renderPractice(); }
  function markDone(){ const id=getSection().id; const p=state.progress[id]||{practiced:0,last:0}; p.practiced+=1; p.last=Date.now(); state.progress[id]=p; saveState(); toast('✓ "'+getSection().title+'" ተለምዶአል','ok'); renderPractice(); }
  function logProgress(words){ const id=getSection().id; const p=state.progress[id]||{practiced:0,last:0}; p.last=Date.now(); state.progress[id]=p; const dk=todayKey(); if(!state.stats.daily[dk])state.stats.daily[dk]={sec:0,words:0}; state.stats.daily[dk].words+=words||1; saveState(); }

  /* ── ZEMA (chant) playback ─────────────────────────────────────────── */
  function toggleZema(){
    if(zemaActive){ stopZema(); return; }
    const started=window.Zema.start(state.zemaMode, 120, 120);
    if(!started){ toast('ድምጽ በዚህ መሣሪያ አይገኝም','err'); return; }
    zemaActive=true;
    // advance lines with karaoke highlight
    zemaTimer=setInterval(()=>{
      if(!zemaActive)return;
      if(activeLine>=activeLines.length-1){ activeLine=0; } else activeLine++;
      renderReader(); logProgress(1);
    }, 3000);
    renderPractice();
    toast('🎵 ዜማ እየተጫወተ ነው፦ '+QIDASSE_DATA.zema[state.zemaMode].am,'ok');
  }
  function stopZema(){
    zemaActive=false;
    if(zemaTimer)clearInterval(zemaTimer); zemaTimer=null;
    window.Zema.stop();
    renderPractice();
  }

  /* ── TTS playback ──────────────────────────────────────────────────── */
  let ttsPlaying=false;
  function toggleTTS(){
    if(!('speechSynthesis' in window)){ toast('ንባብ አይገኝም','err'); return; }
    if(ttsPlaying){ window.speechSynthesis.cancel(); ttsPlaying=false; return; }
    const line=activeLines[activeLine]; if(!line)return;
    const text=state.readingMode.ph?window.Geez.phonetic(line.ge):(state.readingMode.am?line.am:line.ge);
    const u=new SpeechSynthesisUtterance(text);
    u.lang='am-ET'; u.rate=0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    ttsPlaying=true;
    u.onend=()=>{ ttsPlaying=false; };
    toast('🗣 እያነበበ ነው…','ok');
  }

  /* ── Auto scroll ───────────────────────────────────────────────────── */
  function toggleAuto(){
    state.autoScroll=!state.autoScroll; saveState();
    if(state.autoScroll){ if(scrollTimer)clearInterval(scrollTimer); scrollTimer=setInterval(()=>{ if(activeLine>=activeLines.length-1){ toggleAuto(); return; } goLine(1); }, Math.max(500,4000-state.autoScrollSpeed*30)); }
    else { if(scrollTimer)clearInterval(scrollTimer); scrollTimer=null; }
    renderPractice();
  }

  /* ── READINGS (የዕለት ንባብ + አንፆራዎች + መጠቀሚያ ቃላት) ───────────── */
  function renderReadings(){
    const eth=window.EthDate.fromDate(new Date());
    const season=window.EthDate.season(eth);
    // pick a reading set matching the season (fallback first)
    const rd=QIDASSE_DATA.dailyReadings.find(r=>season.name.includes(r.months.split('/')[0].trim())||season.name.includes(r.months.replace(/\/.*/,'')))||QIDASSE_DATA.dailyReadings[0];
    $('#content').innerHTML=`
      <h1 class="page-title">📖 የዕለት ንባብ</h1>
      <section class="panel season-hero">
        <div class="season-chip big">${esc(season.name)}</div>
        <p class="panel-text">${eth.day} ${eth.monthName} ${eth.year} ዓ.ም. · ${eth.weekdayName}</p>
      </section>
      <section class="panel">
        <h2 class="panel-title">📜 ንባባት</h2>
        <div class="read-item"><span class="rd-icon">📖</span><div><b>ወንጌል</b><div class="rd-text">${esc(rd.gospel)}</div></div></div>
        <div class="read-item"><span class="rd-icon">✉️</span><div><b>መልእክት</b><div class="rd-text">${esc(rd.epistle)}</div></div></div>
        <div class="read-item"><span class="rd-icon">🎶</span><div><b>መዝሙር</b><div class="rd-text">${esc(rd.psalm)}</div></div></div>
        <div class="read-item"><span class="rd-icon">📕</span><div><b>ኦሪት</b><div class="rd-text">${esc(rd.ot)}</div></div></div>
        <p class="note-text">* ትክክለኛውን የዕለቱን ንባብ ከቤተ ክርስቲያን መርሐ ግብር ያረጋግጡ።</p>
      </section>

      <section class="panel">
        <h2 class="panel-title">🕊 ዐሥራ አራቱ አንፆራዎች</h2>
        <div class="ana-list">
          ${QIDASSE_DATA.anaphoras.map(a=>`<div class="ana-row"><b>${esc(a.name)}</b><span>${esc(a.note)}</span></div>`).join('')}
        </div>
      </section>

      <section class="panel">
        <h2 class="panel-title">🔎 መጠቀሚያ ቃላት</h2>
        <input class="search" id="glossarySearch" placeholder="ፈልግ፦ ቅዳሴ፣ ሳንቅቱስ…">
        <div class="gloss-list" id="glossList">
          ${QIDASSE_DATA.glossary.map(g=>`<div class="gloss-row"><div class="gloss-ge">${esc(g.ge)}</div><div class="gloss-am">${esc(g.am)}</div><div class="gloss-en">${esc(g.en)}</div></div>`).join('')}
        </div>
      </section>
    `;
    const gs=$('#glossarySearch');
    if(gs)gs.addEventListener('input',(e)=>{
      const q=e.target.value.toLowerCase();
      const list=QIDASSE_DATA.glossary.filter(g=>(g.ge+g.am+g.en).toLowerCase().includes(q));
      $('#glossList').innerHTML=list.map(g=>`<div class="gloss-row"><div class="gloss-ge">${esc(g.ge)}</div><div class="gloss-am">${esc(g.am)}</div><div class="gloss-en">${esc(g.en)}</div></div>`).join('')||'<div class="panel-text">አልተገኘም</div>';
    });
  }

  /* ── QUIZ ──────────────────────────────────────────────────────────── */
  let quizIdx=0;
  function renderQuiz(){
    const q=QIDASSE_DATA.quiz;
    if(quizIdx>=q.length){
      const c=state.stats.quizCorrect, t=state.stats.quizTotal, pct=t?Math.round(c/t*100):0;
      $('#content').innerHTML=`<div class="quiz-done"><div class="quiz-done-icon">🎉</div><h1>እንኳን ደስ አለህ!</h1><p>ውጤት፦ <b>${c}/${t}</b> (${pct}%)</p><div class="pct-ring" style="--p:${pct}%">${pct}%</div>
        <button class="btn btn-hero" data-act="qr">ዳግም ጀምር</button><br><br><button class="btn btn-ghost" data-act="qh">ወደ መነሻ</button></div>`;
      $$('[data-act]').forEach(el=>el.addEventListener('click',()=>{ if(el.dataset.act==='qr'){quizIdx=0;renderQuiz();} if(el.dataset.act==='qh')setView('home'); }));
      return;
    }
    const item=q[quizIdx];
    $('#content').innerHTML=`
      <div class="quiz-top"><span class="chip on">🧠 ፈተና</span><span class="quiz-count">${quizIdx+1}/${q.length}</span></div>
      <div class="progressbar"><div class="progressbar-fill" style="width:${Math.round(quizIdx/q.length*100)}%"></div></div>
      <div class="quiz-card"><h2 class="quiz-q">${esc(item.q)}</h2><div class="quiz-opts">
        ${item.options.map((o,i)=>`<button class="quiz-opt" data-opt="${i}">${esc(o)}</button>`).join('')}
      </div><div id="quizNote" class="quiz-note"></div></div>`;
    $$('.quiz-opt').forEach(el=>el.addEventListener('click',()=>{
      if(el.disabled)return;
      const chosen=parseInt(el.dataset.opt,10);
      const correct=chosen===item.answer;
      if(correct)state.stats.quizCorrect++;
      state.stats.quizTotal++; saveState();
      $$('.quiz-opt').forEach(b=>{ const bi=parseInt(b.dataset.opt,10); if(bi===item.answer)b.classList.add('right'); else if(bi===chosen)b.classList.add('wrong'); b.disabled=true; });
      $('#quizNote').innerHTML=correct?`<div class="quiz-note ok">✓ ትክክል! ${esc(item.note||'')}</div>`:`<div class="quiz-note bad">✗ ትክክል አይደለም። ${esc(item.note||'')}</div>`;
      setTimeout(()=>{quizIdx++;renderQuiz();},1400);
    }));
  }

  /* ── PROGRESS ──────────────────────────────────────────────────────── */
  function calcStreak(){
    const days=Object.keys(state.stats.daily).sort().reverse();
    let streak=0; const cur=new Date();
    for(const d of days){ if(d===todayKey(cur)){streak++;cur.setDate(cur.getDate()-1);continue;} break; }
    return streak;
  }
  function renderProgress(){
    const liturgy=getLiturgy(); const total=liturgy.sections.length;
    const done=Object.keys(state.progress).length;
    const mastery=total?Math.round(done/total*100):0;
    const s=state.stats;
    $('#content').innerHTML=`
      <h1 class="page-title">📊 የመልመጃ ሂደት</h1>
      <div class="stats-grid">
        <div class="stat-panel"><span class="sp-value">${mastery}%</span><span class="sp-label">ክፍሎች</span></div>
        <div class="stat-panel"><span class="sp-value">${done}/${total}</span><span class="sp-label">የተለመዱ</span></div>
        <div class="stat-panel"><span class="sp-value">${fmtTime(s.totalTimeSec)}</span><span class="sp-label">ጠቅላላ ጊዜ</span></div>
        <div class="stat-panel"><span class="sp-value">${calcStreak()}🔥</span><span class="sp-label">ተከታታይ</span></div>
        <div class="stat-panel"><span class="sp-value">${s.quizCorrect}/${s.quizTotal}</span><span class="sp-label">የፈተና ውጤት</span></div>
        <div class="stat-panel"><span class="sp-value">${s.sessions}</span><span class="sp-label">ክፍለ ጊዜ</span></div>
      </div>
      <section class="panel"><h2 class="panel-title">✍️ የክፍሎች መልመጃ</h2>
        <div class="prog-list">
          ${liturgy.sections.map((sec,i)=>{const p=state.progress[sec.id];const mark=state.bookmarks.includes(sec.id);
            return `<div class="prog-row" data-sel="${i}"><div class="prog-num">${i+1}</div>
            <div class="prog-info"><div class="prog-title">${esc(sec.title)} ${mark?'🔖':''}</div><div class="prog-sub">${esc(sec.titleGe)}</div></div>
            <div class="prog-right"><div class="prog-times">×${p?p.practiced:0}</div><div class="prog-bar"><div class="prog-fill" style="width:${Math.min(100,(p?p.practiced:0)*33)}%"></div></div></div></div>`;}).join('')}
        </div>
      </section>
      <button class="btn btn-ghost block" data-act="reset">🗑 ሂደት ሁሉ አጥፋ</button>`;
    $$('[data-sel]').forEach(el=>el.addEventListener('click',()=>{ state.section=parseInt(el.dataset.sel,10); saveState(); setView('practice'); }));
    $$('[data-act]').forEach(el=>el.addEventListener('click',()=>{ if(el.dataset.act==='reset'&&confirm('እርግጠኛ ነህ?')){ state.progress={}; state.stats.quizCorrect=0; state.stats.quizTotal=0; saveState(); renderProgress(); toast('ሂደት ተደምስሷል','ok'); } }));
  }
  function fmtTime(sec){ sec=Math.round(sec); const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60; const p=[]; if(h)p.push(h+'ሰ'); if(h||m)p.push(m+'ደ'); p.push(s+'ጥ'); return p.join(' '); }

  /* ── SETTINGS ──────────────────────────────────────────────────────── */
  function renderSettings(){
    $('#content').innerHTML=`
      <h1 class="page-title">⚙️ ቅንብሮች</h1>
      <section class="panel"><h2 class="panel-title">🎨 ገጽታ</h2>
        <div class="chip-row">
          <button class="chip ${state.theme==='light'?'on':''}" data-theme="light">☀️ ብርሃን</button>
          <button class="chip ${state.theme==='dark'?'on':''}" data-theme="dark">🌙 ጨለማ</button>
          <button class="chip ${state.theme==='sepia'?'on':''}" data-theme="sepia">📜 ሴፒያ</button>
        </div>
      </section>
      <section class="panel"><h2 class="panel-title">🎵 ዜማ</h2>
        <p class="panel-text">የዜማ ሁነታን ይምረጡ፦</p>
        <div class="chip-row">
          ${Object.values(QIDASSE_DATA.zema).map(z=>`<button class="chip ${state.zemaMode===z.id?'on':''}" data-zema="${z.id}" title="${esc(z.desc)}">${esc(z.am)}</button>`).join('')}
        </div>
        <div class="tone-row" style="margin-top:8px">
          ${Object.values(QIDASSE_DATA.zema).map(z=>`<button class="chip" data-tone="${z.id}">▶ ${esc(z.am)} ስማ</button>`).join('')}
        </div>
      </section>
      <section class="panel"><h2 class="panel-title">🔤 የፊደል መጠን</h2>
        <div class="font-row"><button class="btn btn-ghost" data-font="-">A−</button>
        <input type="range" id="fontRange" min="14" max="34" value="${state.fontSize}">
        <button class="btn btn-ghost" data-font="+">A+</button></div>
        <div class="font-preview" style="font-size:${state.fontSize}px">በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ</div>
      </section>
      <section class="panel"><h2 class="panel-title">ℹ️ ስለ አፕ</h2>
        <p class="panel-text">የቅዳሴ መልመጃ አፕ — v${QIDASSE_DATA.version}</p>
        <p class="panel-text">ዜማው በWeb Audio ቴክኖሎጂ የተመሰለ ነው፤ ለትክክለኛው ዜማ የቤተ ክርስቲያን ቅዱስ ያሬድ ዜማ ትምህርት ይመልከቱ።</p>
      </section>`;
    $$('[data-theme]').forEach(el=>el.addEventListener('click',()=>{ state.theme=el.dataset.theme; saveState(); applyTheme(); renderSettings(); }));
    $$('[data-zema]').forEach(el=>el.addEventListener('click',()=>{ state.zemaMode=el.dataset.zema; saveState(); renderSettings(); }));
    $$('[data-tone]').forEach(el=>el.addEventListener('click',()=>{ window.Zema.preview(el.dataset.tone); }));
    $$('[data-font]').forEach(el=>el.addEventListener('click',()=>{ state.fontSize=Math.max(14,Math.min(34,state.fontSize+(el.dataset.font==='+'?2:-2))); saveState(); applyTheme(); renderSettings(); }));
    $('#fontRange').addEventListener('input',(e)=>{ state.fontSize=parseInt(e.target.value,10); saveState(); applyTheme(); renderSettings(); });
  }

  /* ── Init ──────────────────────────────────────────────────────────── */
  function init(){
    $$('.nav-item').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
    const dk=todayKey();
    if(state.stats.lastVisit!==dk){ state.stats.sessions+=1; state.stats.lastVisit=dk; }
    saveState();
    applyTheme();
    if(window.EthDate.fromDate(new Date()).isSunday)state.liturgy='sunday';
    saveState();
    setView('home');
    if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
    $('#app').classList.add('ready');
  }

  window.__KIDASE__={ state, setState:s=>{state=s;}, save:saveState, setView, getLiturgy, getSection };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();
