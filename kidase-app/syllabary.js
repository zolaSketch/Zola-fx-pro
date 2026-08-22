/* =========================================================================
   የግዕዝ ፊደል / Geez syllabary → phonetic transliteration + speech
   Helps learners pronounce Geez by syllable.
   ========================================================================= */
(function () {
  'use strict';

  // Base Geez letters (ሀይል) with phonetic base + the 7 order vowels.
  const FIDEL = [
    // base, order1..7 (phonetic syllables)
    ['ሀ',['ha','hu','hi','ha','he','he','ho']],
    ['ለ',['la','lu','li','la','le','le','lo']],
    ['ሐ',['ha','hu','hi','ha','he','he','ho']],
    ['መ',['ma','mu','mi','ma','me','me','mo']],
    ['ሠ',['sa','su','si','sa','se','se','so']],
    ['ረ',['ra','ru','ri','ra','re','re','ro']],
    ['ሰ',['sa','su','si','sa','se','se','so']],
    ['ሸ',['sha','shu','shi','sha','she','she','sho']],
    ['ቀ',['qa','qu','qi','qa','qe','qe','qo']],
    ['በ',['ba','bu','bi','ba','be','be','bo']],
    ['ተ',['ta','tu','ti','ta','te','te','to']],
    ['ቸ',['cha','chu','chi','cha','che','che','cho']],
    ['ኀ',['ha','hu','hi','ha','he','he','ho']],
    ['ነ',['na','nu','ni','na','ne','ne','no']],
    ['ኘ',['nya','nyu','nyi','nya','nye','nye','nyo']],
    ['አ',['a','u','i','a','e','e','o']],
    ['ከ',['ka','ku','ki','ka','ke','ke','ko']],
    ['ኸ',['kha','khu','khi','kha','khe','khe','kho']],
    ['ወ',['wa','wu','wi','wa','we','we','wo']],
    ['ዐ',['a','u','i','a','e','e','o']],
    ['ዘ',['za','zu','zi','za','ze','ze','zo']],
    ['ዠ',['zha','zhu','zhi','zha','zhe','zhe','zho']],
    ['የ',['ya','yu','yi','ya','ye','ye','yo']],
    ['ደ',['da','du','di','da','de','de','do']],
    ['ጀ',['ja','ju','ji','ja','je','je','jo']],
    ['ገ',['ga','gu','gi','ga','ge','ge','go']],
    ['ጠ',['ta','tu','ti','ta','te','te','to']],
    ['ጨ',['cha','chu','chi','cha','che','che','cho']],
    ['ጰ',['pa','pu','pi','pa','pe','pe','po']],
    ['ጸ',['sa','su','si','sa','se','se','so']],
    ['ፀ',['sa','su','si','sa','se','se','so']],
    ['ፈ',['fa','fu','fi','fa','fe','fe','fo']],
    ['ፐ',['pa','pu','pi','pa','pe','pe','po']],
    ['ጳ',['pa','pu','pi','pa','pe','pe','po']],
    ['ቨ',['va','vu','vi','va','ve','ve','vo']],
  ];

  // Map each Geez base char to its 7 orders array
  const BASE_MAP = {};
  FIDEL.forEach(([base, orders]) => {
    orders.forEach((phon, i) => {
      BASE_MAP[base + String.fromCharCode(0x1369 + i)] = phon; // combining ethiopic digit markers
    });
    // base (order 1 = ge'ez 'e' vowel) is the first
  });

  // The 7 vowel orders are the base letter's Unicode codepoint + 0..6
  // (e.g. ሀ=U+1200, ሁ=U+1201 ... ሆ=U+1206). Build a direct lookup.
  const SYLLABLE = {};
  FIDEL.forEach(([base, orders]) => {
    const baseCode = base.charCodeAt(0);
    orders.forEach((phon, i) => {
      const char = String.fromCharCode(baseCode + i);
      SYLLABLE[char] = phon;
    });
  });

  // Try to transliterate a Geez string syllable by syllable.
  function phonetic(text) {
    if (!text) return '';
    let out = [];
    let i = 0;
    while (i < text.length) {
      // try 2-char syllable first (base + vowel marker)
      const two = text.slice(i, i + 2);
      if (SYLLABLE[two]) { out.push(SYLLABLE[two]); i += 2; continue; }
      const one = text[i];
      if (SYLLABLE[one]) { out.push(SYLLABLE[one]); i += 1; continue; }
      // punctuation / ethiopic digits
      if (one === '።') { out.push('.'); i++; continue; }
      if (one === '፣' || one === '፥') { out.push(', '); i++; continue; }
      if (/[a-zA-Z0-9 .,;]/.test(one)) { out.push(one); i++; continue; }
      out.push(one); i++;
    }
    return out.join('');
  }

  // Speak a phrase syllable by syllable using TTS (Amharic voice reads phonetics)
  function speak(text, lang) {
    if (!('speechSynthesis' in window)) return false;
    const u = new SpeechSynthesisUtterance(phonetic(text));
    u.lang = lang || 'am-ET';
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  }

  window.Geez = { phonetic, speak, syllableCount: (t) => phonetic(t).split(/\s+/).filter(Boolean).length };
})();
