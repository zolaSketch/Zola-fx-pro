/* ብራና — the alignment engine, in the browser.
   Same logic as align_proof.py, so you can watch it run step by step. */

const ETHIOPIC_START = 0x1200;
const ETHIOPIC_END   = 0x137f;

/* In Ethiopic, a consonant takes 7 vowel orders laid out contiguously in
   Unicode (ሀ ሁ ሂ ሃ ሄ ህ ሆ). They differ only by a tiny stroke, which is
   exactly why OCR confuses them. Dividing by 7 recovers the family. */
function vowelFamily(ch) {
  const cp = ch.codePointAt(0);
  if (cp < ETHIOPIC_START || cp > ETHIOPIC_END) return null;
  const base = ETHIOPIC_START + Math.floor((cp - ETHIOPIC_START) / 7) * 7;
  const fam = [];
  for (let i = 0; i < 7; i++) fam.push(String.fromCodePoint(base + i));
  return fam;
}

const LOOKALIKE = { "ሀ":"ዐ", "ዐ":"ሀ", "ሉ":"ሱ", "ሱ":"ሲ", "ሲ":"ሉ", "በ":"ነ", "ነ":"በ" };

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Corrupt text the way a weak Ge'ez OCR model really fails:
   mostly vowel-order confusion, some lookalikes, some drops and blots. */
function simulateOCR(text, cer, rand) {
  let out = "";
  for (const ch of text) {
    if (rand() >= cer) { out += ch; continue; }
    const roll = rand();
    const fam = vowelFamily(ch);
    if (roll < 0.70 && fam)      out += fam[Math.floor(rand() * 7)];
    else if (roll < 0.85)        out += (LOOKALIKE[ch] || ch);
    else if (roll < 0.95)        { /* dropped by faded ink */ }
    else { out += ch; if (fam)   out += fam[Math.floor(rand() * 7)]; }
  }
  return out;
}

/* Scribes vary punctuation freely; it carries no identifying signal. */
function normalize(s) {
  return s.replace(/[፡።፣፤፥፦፧፨\s]/g, "");
}

/* Similarity via longest common subsequence ratio. */
function similarity(a, b) {
  a = normalize(a); b = normalize(b);
  if (!a.length || !b.length) return 0;
  const m = a.length, n = b.length;
  let prev = new Uint16Array(n + 1), cur = new Uint16Array(n + 1);
  for (let i = 1; i <= m; i++) {
    cur.fill(0);
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    [prev, cur] = [cur, prev];
  }
  return (2 * prev[n]) / (m + n);
}

/* THE CORE OPERATION.
   A manuscript page is a contiguous, in-order passage of a known book.
   That monotonic constraint is what makes this work: we are not matching
   each line independently, we are finding one consistent path. */
function align(ocrLines, canonical, window = 6) {
  let bestOffset = 0, bestScore = -1;
  const maxOffset = Math.max(1, canonical.length - ocrLines.length + 1);
  for (let off = 0; off < maxOffset; off++) {
    let s = 0;
    const lim = Math.min(ocrLines.length, canonical.length - off);
    for (let i = 0; i < lim; i++) s += similarity(ocrLines[i], canonical[off + i]);
    if (s > bestScore) { bestScore = s; bestOffset = off; }
  }

  const pairs = [];
  let cursor = bestOffset;
  for (const line of ocrLines) {
    let best = -1, bestJ = null;
    for (let j = cursor; j < Math.min(cursor + window, canonical.length); j++) {
      const s = similarity(line, canonical[j]);
      if (s > best) { best = s; bestJ = j; }
    }
    pairs.push({ ocr: line, idx: bestJ, score: best < 0 ? 0 : best });
    if (bestJ !== null) cursor = bestJ + 1;
  }
  return pairs;
}
