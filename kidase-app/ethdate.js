/* =========================================================================
   የኢትዮጵያ ዘመን አቆጣጠር — Ethiopian Calendar + Liturgical Utilities
   ========================================================================= */
(function () {
  'use strict';

  // Gregorian <-> Ethiopian date conversion (13-month Ethiopian calendar).

  const ETH_MONTHS = [
    'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
  ];
  const ETH_DAYS = [
    'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሑድ'
  ];

  function toGregorianDate(gy, gm, gd) {
    return new Date(Date.UTC(gy, gm - 1, gd));
  }

  // Convert a Gregorian Date (UTC) to Ethiopian {year, month(1-13), day}.
  function gregorianToEthiopian(gy, gm, gd) {
    // Algorithm constants
    const er = 5523; // 5500 + offset
    let y = gy - 8;
    if (gm <= 8) y = gy - 8;
    else y = gy - 8;

    // Days elapsed in Gregorian year
    const epoch = new Date(Date.UTC(1970, 0, 1));
    const date = new Date(Date.UTC(gy, gm - 1, gd));
    const julianDay = Math.floor(date.getTime() / 86400000) + 2440588;

    // Julian day of Ethiopian epoch (approx)
    let newYearDay = new Date(Date.UTC(gy, 8, 11)); // Sep 11 (Sep 12 on leap)
    const isLeap = gregorianIsLeap(gy);
    if (!isLeap) {
      // Ethiopian new year Sep 11 except year before Gregorian leap is Sep 12
    }
    // Use standard algorithm:
    // Eth new year = Sep 11 Gregorian (Sep 12 in the year preceding a Gregorian leap)
    let gNewYearSep = 11;
    // The Ethiopian year starts on Sep 11 (or 12). Compute offset.
    const jdnNewYear = new Date(Date.UTC(gy, 8, 11)).getTime() / 86400000 + 2440588;
    let days = julianDay - jdnNewYear;

    if (days < 0) {
      // belongs to previous Ethiopian year
      const prevNewYear = new Date(Date.UTC(gy, 8, 11)).getTime() / 86400000 + 2440588 - 366;
      days = julianDay - prevNewYear;
      y = gy - 9;
    }

    // months
    let month = Math.floor(days / 30) + 1;
    let day = days % 30 + 1;
    if (month > 13) {
      day = days - 390 + 1;
      month = 13;
    }
    return { year: y + (days >= 0 && month <= 13 ? 5500 : 5500), yearEth: (days >= 0 ? y + 5500 : y + 5500), month, day };
  }

  // Simplify: use the widely-used formula
  function etToJdn(y, m, d) {
    const r = y % 4 === 3 ? 366 : 365; // Ethiopian leap every 4 years, year%4==3
    return 1724220.5 + (y - 1) * 365 + Math.floor((y - 1) / 4) + (m - 1) * 30 + d - 1;
  }
  function jdnToGregorian(jdn) {
    const z = Math.floor(jdn + 0.5);
    const f = jdn + 0.5 - z;
    let A = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + A - Math.floor(A / 4);
    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);
    const day = B - D - Math.floor(30.6001 * E);
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;
    return { year, month, day };
  }
  function gregorianToJdn(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a;
    const mm = m + 12 * a - 3;
    let jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy
      + Math.floor(yy / 4) - Math.floor(yy / 100)
      + Math.floor(yy / 400) - 32045;
    return jdn;
  }
  function gregorianIsLeap(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }

  // Main public function: given a JS Date, return Ethiopian date info
  function ethFromDate(d) {
    const gy = d.getUTCFullYear();
    const gm = d.getUTCMonth() + 1;
    const gd = d.getUTCDate();
    const jdn = gregorianToJdn(gy, gm, gd);
    let ethYear = Math.floor((jdn - 1724220.5 - 1) / 365.25);
    // refine
    for (let i = 0; i < 3; i++) {
      const start = etToJdn(ethYear, 1, 1);
      const next = etToJdn(ethYear + 1, 1, 1);
      if (jdn < start) ethYear--;
      else if (jdn >= next) ethYear++;
      else break;
    }
    const mdn = jdn - etToJdn(ethYear, 1, 1); // day index 0-based
    const month = Math.floor(mdn / 30) + 1;
    const day = Math.floor(mdn % 30) + 1;
    // weekday (Mon=0 ... Sun=6). JDN mod 7: 0 = Monday
    const weekday = ((jdn + 1) % 7 + 7) % 7; // adjust
    return {
      year: ethYear,
      month, day,
      monthName: ETH_MONTHS[month - 1],
      weekday, weekdayName: ETH_DAYS[weekday],
      jdn,
      isSunday: weekday === 6,
    };
  }

  // Simplified liturgical season detection by Ethiopian month/day
  function seasonFor(e) {
    // Approximate by Ethiopian month ranges
    const m = e.month, d = e.day;
    if (m === 1) return { key: 'meskerem', name: 'ዘመነ መስቀል', desc: 'የመስቀል በዓል ወቅት' };
    if (m === 2 || m === 3) return { key: 'september', name: 'ዘመነ ክርስቶስ (ገና)', desc: 'ገናን የሚቀድሙ ቀናት' };
    if (m === 4) return { key: 'timket', name: 'ዘመነ ጥምቀት', desc: 'የጥምቀት ጾም' };
    if (m === 5 || m === 6) return { key: 'hudade', name: 'ዘመነ ሕማማት (ዐቢይ ጾም)', desc: '55 ቀናት የሕማማት ጾም' };
    if (m === 7 || m === 8) return { key: 'tinsae', name: 'ዘመነ ትንሣኤ', desc: '50 ቀናት ከትንሣኤ እስከ ሃምሳ' };
    if (m === 9 || m === 10) return { key: 'hawaryat', name: 'ዘመነ ሐዋርያት', desc: 'የሐዋርያት ጾም' };
    if (m === 11 || m === 12) return { key: 'filsata', name: 'ዘመነ ፍልሰታ', desc: 'የድንግል ማርያም ጾም' };
    return { key: 'pagume', name: 'ጳጉሜ', desc: 'የጳጉሜ ቀናት' };
  }

  window.EthDate = {
    fromDate: ethFromDate,
    season: seasonFor,
    months: ETH_MONTHS,
    days: ETH_DAYS,
  };
})();
