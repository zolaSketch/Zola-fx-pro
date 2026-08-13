/*
 * ሥርዓተ ቅዳሴ ወአኰቴተ ቁርባን ዘሐዋርያት
 * የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን
 *
 * r = ተራ (role)  | g = ግዕዝ | a = አማርኛ | e = English
 * n = ማስታወሻ / rubric (ሥርዓት መግለጫ)
 */

const ROLES = {
  KAHN: 'ካህን',
  KAHNAT: 'ካህናት',
  NKAHN: 'ንፍቅ ካህን',
  DIYAQON: 'ዲያቆን',
  DIYAQONAT: 'ዲያቆናት',
  NDIYAQON: 'ንፍቅ ዲያቆን',
  HIZB: 'ሕዝብ',
  NOTE: 'ማስታወሻ'
};

const K = ROLES.KAHN, KT = ROLES.KAHNAT, NK = ROLES.NKAHN,
      D = ROLES.DIYAQON, DT = ROLES.DIYAQONAT, ND = ROLES.NDIYAQON,
      H = ROLES.HIZB, N = ROLES.NOTE;

const KIDASE = {
  title: 'ሥርዓተ ቅዳሴ ወአኰቴተ ቁርባን ዘሐዋርያት',
  subtitle: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን',
  sections: [

  /* ============ 1 ============ */
  {
    id: 's01',
    title: 'መባቻ — ሚመጠን ግርምት',
    note: 'ቅዳሴው የሚጀመርበት። ካህኑ የዕለቱን ግርማ ይናገራል።',
    lines: [
      { r: N, a: 'በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ። አሜን።',
        g: 'በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ። አሜን።',
        e: 'In the Name of the Father, the Son, and the Holy Spirit, One God. Amen.' },

      { r: K,
        g: 'ሚመጠን ግርምት ዛቲ ዕለት ወዕፅብት ዛቲ ሰዓት እንተ ባቲ ይወርድ መንፈስ ቅዱስ እመልዕልተ ሰማያት ወይጼልሎ ለዝንቱ መሥዋዕት ወይቄድሶ።',
        a: 'ይህች ቀን ምን ያህል የምታስፈራ ናት? ይህችስ ሰዓት ምን ያህል የምታስጨንቅ ናት? መንፈስ ቅዱስ ከሰማያተ ሰማያት የሚወርድባት፤ ይህን መሥዋዕቱን የሚሠውርባትና የሚያከብርባት።',
        e: 'How awesome is this day and how marvelous this hour wherein the Holy Spirit will descend from Heaven and overshadow and hallow this sacrifice.' },

      { r: K,
        g: 'በጽሙና ወበፍርሀት ቁሙ ወጸልዩ ከመ ሰላሙ ለእግዚአብሔር የሀሉ ምስሌየ ወምስለ ኵልክሙ።',
        a: 'በጽሞናና በመፍራት ቁሙ፤ የእግዚአብሔር ሰላም ከእኔና ከእናንተ ጋራ ይሆን ዘንድ ጸልዩ።',
        e: 'In quietness and in fear, stand up and pray that the peace of God be with me and with all of you.' },

      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },

      { r: N, a: '— ዘወትር ከሰኞ እስከ ዓርብ —', e: 'On the days from Monday to Friday' },
      { r: H,
        g: 'እምነ በሀ ቅድስት ቤተ ክርስቲያን ሥርጉት ዓረፋቲሃ ወስእልት በዕንቍ ጳዝዮን። እምነ በሀ ቅድስት ቤተ ክርስቲያን።',
        a: 'እናታችን ቅድስት ቤተ ክርስቲያን ሰላም እንልሻለን። ግድግዳዎችዋ የተሸለሙና በጳዝዮን ዕንቍ ያጌጡ ናቸው። እናታችን ቅድስት ቤተ ክርስቲያን ሰላም እንልሻለን።',
        e: 'Peace be unto you, our mother, O honorable church. Your walls are embroidered with Topaz. Peace be unto you, our mother, O honorable church.' },

      { r: N, a: '— በዕለተ ቀዳሚት ሰንበት —', e: 'On Saturdays' },
      { r: H,
        g: 'መስቀል አብርሃ በከዋክብት አሠርገወ ሰማየ እምኵሉሰ ፀሐየ አርአየ። መስቀል አብርሃ! በከዋክብት አሠርገወ ሰማየ።',
        a: 'መስቀል አበራ ሰማይን በኮከቦች ሸለመ። ከሁሉም ይልቅ ፀሐይን አሳየ። መስቀል አበራ። በኮከቦች ሰማይን ሸለመ።',
        e: 'The cross shined and had the heavens embroidered with stars. Of all the sun is seen. The cross shined and had the heavens embroidered with stars.' },

      { r: N, a: '— በዕለተ እሑድ —', e: 'On Sundays' },
      { r: H,
        g: 'ኵሉ ዘገብራ ለጽድቅ ጻድቅ ውእቱ ወዘያከብር ሰንበተ፤ ኢይበል ፈላሲ ዘገብአ ኀበ እግዚአብሔር ይፈልጠኒኑ እምሕዝቡ።',
        a: 'በጎን የሚያደርግ፣ ሰንበትንም የሚያከብር ሁሉ ጻድቅ ነው። "ወደ እግዚአብሔር አምልኮ የገባ መጻተኛ ከሕዝቡ ሁሉ ይለየኝ ይሆንን?" አይበል።',
        e: 'Blessed is he who does blessed deeds and honors the Sabbath. Let him not question whether he will be outcast from the multitudes if he was to enter into the worship of God.' },

      { r: H,
        g: 'ሃሌ ሉያ እመቦ ብእሲ እምእመናን ዘቦአ ቤተ ክርስቲያን በጊዜ ቅዳሴ ወኢሰምዐ መጻሕፍተ ቅዱሳተ ወኢተዐገሠ እስከ ይፌጽሙ ጸሎተ ወቅዳሴ ወኢተመጠወ እምቍርባን ይሰደድ እምቤተ ክርስቲያን፤ እስመ አማሰነ ሕገ እግዚአብሔር ወአስተሐቀረ ቁመተ ቅድመ ንጉሥ ሰማያዊ ንጉሠ ሥጋ ወመንፈስ ከመዝ መሀሩነ ሐዋርያት በአብጥሊሶሙ።',
        a: 'ሃሌ ሉያ! በቅዳሴ ጊዜ ከምእመናን ወገን ወደ ቤተ ክርስቲያን የገባ ሰው ቢኖር ቅዱሳት መጻሕፍትን ሰምቶ የቅዳሴውን ጸሎት እስኪጨርሱ ባይታገሥ ከቍርባኑም ባይቀበል ከቤተ ክርስቲያን ይለይ፤ የእግዚአብሔርን ሕግ አፍርሷልና፤ የነፍስና የሥጋ ንጉሥ በሚሆን በሰማያዊ ንጉሥ ፊት መቆምን አቃሏልና፤ ሐዋርያት በሲኖዶሳቸው እንዲህ አስተማሩን።',
        e: 'Halleluia! If there be anyone of the faithful that has entered the church at the time of mass and has not heard the Holy Scriptures, and has not waited until they finish the prayer of the Mass, and has not received the Holy communion, let him be driven out of the church, for he has violated the law of God and disdained to stand before the heavenly King.' }
    ]
  },

  /* ============ 2 ============ */
  {
    id: 's02',
    title: 'ጸሎተ ወይን — ክርስቶስ አምላክነ',
    note: 'ወይኑ የሚባረክበት ጸሎት።',
    lines: [
      { r: K,
        g: 'ክርስቶስ አምላክነ ዘበአማን እግዚእነ ዘሖርከ ውስተ ከብካብ አመ ጸውዑከ በቃና ዘገሊላ ወባረከሎሙ ወረሰይኮ ለማይ ወይነ ከማሁ ረስዮ ለዝንቱ ወይን ዘክቡር በቅድሜከ።',
        a: 'እውነተኛ አምላካችን ጌታችን ክርስቶስ ሆይ! የገሊላ አውራጃ በምትሆን በቃና በጠሩህ ጊዜ ወደ ሠርግ የሄድህ፣ ውኃውንም ባርከህ ጠጅ ያደረግህላቸው፤ በፊትህ የተቀመጠ ይህንን ወይን እንደርሱ አድርገው።',
        e: 'Christ our God, truly our Lord, Who went to the wedding when they invited You in Cana of Galilee, and did bless for them the water and changed it into wine, You do in like manner unto this wine which is set before You.' },

      { r: K,
        g: 'ወይእዜኒ ባርኮ ወቀድሶ ወአንጽሖ ይኩን ለሕይወተ ነፍስነ ወሥጋነ ወመንፈስነ በኵሉ ጊዜ። ሀሉ ምስሌነ አብ ወወልድ ወመንፈስ ቅዱስ ወምላእ ወይነ ትፍሥሕት ወኀሤት ለሠናይ ወለሕይወት ወለመድኃኒት ወለሥርየተ ኃጢአት፤ ለልቡና ወለፈውስ ወለምክረ መንፈስ ቅዱስ ይእዜኒ ወዘልፈኒ ወለዓለመ ዓለም። አሜን።',
        a: 'አሁንም ባርከው አክብረውም፤ አንጻውም ሁልጊዜ የሥጋችንና የነፍሳችን የልቡናችንም ሕይወት ይሆን ዘንድ። አብ ወልድ መንፈስ ቅዱስ ከኛ ጋር ኑር። ለተድላና ለደስታ የሚሆን ወይኑንም ለበጎ ነገር ምላው። ለሕይወትና ለመድኃኒት፣ ለኃጢአትም ማስተሠረያ፣ ለማስተዋል፣ ለደኅንነት ለመንፈስ ቅዱስም ምክር ዛሬ ዘወትርም ለዘላለሙ አሜን።',
        e: 'Now also please bless it, hallow it and purify it, so that it may become the life of our soul, body, and spirit at all times. Father, Son and Holy Spirit, be with us; and fill the wine with joy and happiness, for goodness, for life, for salvation and for the remission of sin, for understanding, for healing, for the counsel of the Holy Spirit, both now and ever and world without end. Amen.' },

      { r: K,
        g: 'ንጹሕ ወጣዕም ወበረከት ለእለ ይሰትዩ እምደምከ ክቡር አላትዮን በአማን።',
        a: 'በእውነት ሰው የሆንህ አምላክ ሆይ፤ ከክቡር ደምህ ለሚጠጡ ንጹሕ ጣዕም በረከትም ይሁን።',
        e: 'Purity, sweetness and blessing be to them who honestly drink of Your precious blood.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' }
    ]
  },

  /* ============ 3 ============ */
  {
    id: 's03',
    title: 'ቡሩክ እግዚአብሔር አብ (፫ ጊዜ)',
    note: 'ይህ ቡራኬ ሦስት ጊዜ ይደገማል። ሕዝቡ በየመሐሉ "አሜን" ይላል።',
    repeat: 3,
    lines: [
      { r: K, g: 'ቡሩክ እግዚአብሔር አብ አኃዜ ኵሉ ዓለም አምላክነ።',
        a: 'ዓለሙን ሁሉ የያዘ እግዚአብሔር አብ አምላካችን ቡሩክ ነው።',
        e: 'Blessed be the Lord, Almighty Father, our God.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },
      { r: K, g: 'ወቡሩክ ወልድ ዋሕድ እግዚእነ ኢየሱስ ክርስቶስ መድኃኒነ።',
        a: 'ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ ወልድ ዋሕድም ቡሩክ ነው።',
        e: 'And blessed be the only Son, our Lord and our Savior Jesus Christ.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },
      { r: K, g: 'ወቡሩክ መንፈስ ቅዱስ ጰራቅሊጦስ መጽንዒ ወመንጽሔ ኵልነ።',
        a: 'ሁላችንን የሚያነጻና የሚያጸና መንፈስ ቅዱስም ቡሩክ ነው።',
        e: 'And blessed be the Holy Spirit, the Paraclete, the comforter and cleanser of us all.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },

      { r: K,
        g: 'ስብሐት ወክብር ይደሉ ለሥሉስ ቅዱስ፤ አብ ወወልድ ወመንፈስ ቅዱስ ዕሩይ ኵሎ ጊዜ ይእዜኒ ወዘልፈኒ ወለዓለመ ዓለም።',
        a: 'ልዩ ሦስት ለሚሆኑ ሁልጊዜም ለተካከሉ ለአብ፣ ለወልድ፣ ለመንፈስ ቅዱስም ክብር ምሥጋና ይገባል፤ ዛሬም ዘወትርም ለዘላለሙ።',
        e: 'Glory and honour are due to the Holy Trinity, the Father and the Son and the Holy Spirit always coequal, both now and ever and world without end.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },

      { r: K, g: 'ጸልዩ አበውየ ወአኃውየ ላዕሌየ ወላዕለ ዝንቱ መሥዋዕት።',
        a: 'አባቶቼና ወንድሞቼ በእኔ ላይ በመሥዋዕቱም ላይ ጸልዩ።',
        e: 'My fathers and my brothers, pray for me and for this sacrifice.' },
      { r: NK,
        g: 'እግዚአብሔር ይስማዕከ ኵሎ ዘሰአልከ፤ ወይትወከፍ መሥዋዕተከ ወቊርባነከ ከመ መሥዋዕተ መልከ ጼዴቅ፣ ወአሮን ወዘካርያስ ካህናተ ቤተ ክርስቲያኑ ለበኵር።',
        a: 'እግዚአብሔር የለመንከውን ሁሉ ይስማህ። የበኵር የቤተ ክርስቲያኑ ካህናቱ የሚሆኑ የመልከ ጼዴቅንና የአሮንን፣ የዘካርያስንም መሥዋዕት እንደተቀበለ መሥዋዕትህን ቍርባንህንም ይቀበልልህ።',
        e: 'May God hear you in all that you have asked and accept your sacrifice and offering like the sacrifice of Melchisedec and Aaron and Zacharias, the priests of the church of the first-born.' },
      { r: K, g: 'ተዘከረኒ ኦ አቡየ ቀሲስ በጸሎትከ ቅድስት።',
        a: 'ቄሱ አባቴ ሆይ ክብርት በምትሆን በጸሎትህ አስበኝ።',
        e: 'Remember me, my father priest, in your Holy prayers.' },
      { r: NK,
        g: 'እግዚአብሔር ይዕቀባ ለክህነትከ ወይትወከፍ መሥዋዕተከ ወቍርባነከ በብሩህ ገጽ። ሥመር እግዚኦ ከመ ታድኅነኒ።',
        a: 'እግዚአብሔር ክህነትህን ይጠብቃት። መሥዋዕትህንና ቊርባንህንም በቡሩህ ገጽ ይቀበልልህ። አቤቱ እኔን ታድነኝ ዘንድ ማዳንን ውደድ።',
        e: 'The Lord keep your priesthood and accept your sacrifice and offering with a cheerful countenance. Be pleased, Lord, to save me.' }
    ]
  },

  /* ============ 4 — ⭐ አሐዱ አብ ቅዱስ ============ */
  {
    id: 's04',
    title: '⭐ አሐዱ አብ ቅዱስ',
    star: true,
    note: 'በጣም የታወቀው ተሰጥኦ። ካህኑ "አሐዱ..." ሲል ሕዝቡ "በአማን..." ብሎ ይመልሳል።',
    lines: [
      { r: K,
        g: 'አሐዱ አብ ቅዱስ።\nአሐዱ ወልድ ቅዱስ።\nአሐዱ ውእቱ መንፈስ ቅዱስ።',
        a: 'አንዱ አብ ቅዱስ ነው።\nአንዱ ወልድ ቅዱስ ነው።\nአንዱ መንፈስ ቅዱስም ቅዱስ ነው።',
        e: 'One is the Holy Father,\nOne is the Holy Son,\nOne is the Holy Spirit.' },
      { r: H,
        g: 'በአማን አብ ቅዱስ።\nበአማን ወልድ ቅዱስ።\nበአማን ውእቱ መንፈስ ቅዱስ።',
        a: 'አብ በእውነት ቅዱስ ነው።\nወልድም በእውነት ቅዱስ ነው።\nመንፈስ ቅዱስም በእውነት ቅዱስ ነው።',
        e: 'Truly the Father is Holy,\nTruly the Son is Holy,\nTruly the Holy Spirit is Holy.' },

      { r: K, g: 'ሰብሕዎ ለእግዚአብሔር ኵልክሙ አሕዛብ።',
        a: 'ሁላችሁም ምዕመናን እግዚአብሔርን አመስግኑት።',
        e: 'Praise the Lord, all you nations.' },
      { r: H, g: 'ወሴብሕዎ ኵሎሙ ሕዝብ።',
        a: 'ሕዝብ ሁሉ ያመሰግኑታል።',
        e: 'And praise Him, all you people.' },
      { r: K, g: 'እስመ ጸንዐት ምሕረቱ ላዕሌነ።',
        a: 'ምሕረቱ በእኛ ላይ ጸንታለችና።',
        e: 'For His merciful kindness is great toward us.' },
      { r: H, g: 'ጽድቁሰ ለእግዚአብሔር ይሄሉ ለዓለም።',
        a: 'የእግዚአብሔርስ ቸርነት ለዘለዓለም ይኖራል።',
        e: 'And the Truth of the Lord endures for ever.' },

      { r: N, a: '— ካህኑን በመከተል እንበል —', e: 'Repeat after the priest' },
      { r: H,
        g: 'ስብሐት ለአብ፣ ወወልድ ወመንፈስ ቅዱስ። ይእዜኒ ወዘልፈኒ ወለዓለመ ዓለም አሜን ሃሌ ሉያ።',
        a: 'ለአብ፤ ለወልድ፤ ለመንፈስ ቅዱስም ምስጋና ይገባል። ዛሬም ዘወትርም ለዘለዓለሙ አሜን ሃሌሉያ።',
        e: 'Glory be to the Father and to the Son and to the Holy Spirit. Both now and world without end. Amen.' }
    ]
  },

  /* ============ 5 ============ */
  {
    id: 's05',
    title: 'ተንሥኡ ለጸሎት — መደበኛ ተሰጥኦ',
    note: 'ይህ ዑደት በቅዳሴው ውስጥ ብዙ ጊዜ ይደገማል። በደንብ ተለማመደው!',
    core: true,
    lines: [
      { r: D, g: 'ተንሥኡ ለጸሎት።', a: 'ለጸሎት ተነሡ።', e: 'Stand up for prayer.' },
      { r: H, g: 'እግዚኦ ተሣሃለነ።', a: 'አቤቱ ይቅር በለን።', e: 'Lord have mercy upon us.' },
      { r: K, g: 'ሰላም ለኵልክሙ።', a: 'ሰላም ለሁላችሁ ይሁን።', e: 'Peace be unto you all.' },
      { r: H, g: 'ምስለ መንፈስከ።', a: 'ከመንፈስህ ጋራ።', e: 'And with your spirit.' }
    ]
  },

  /* ============ 6 ============ */
  {
    id: 's06',
    title: 'ጸሎተ አኰቴት ዘቅዱስ ባስልዮስ',
    note: 'የምስጋና ጸሎት።',
    lines: [
      { r: K,
        g: 'ነአኲቶ ለገባሬ ሠናያት ላዕሌነ እግዚአብሔር መሐሪ አቡሁ ለእግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ እስመ ሠወረነ ወረድአነ ዐቀበነ ወአቅረበነ ወተወክፈነ ኀቤሁ። ወተማኅፀነነ፤ ወአጽንዐነ፤ ወአብጽሐነ እስከ ዛቲ ሰዓት።',
        a: 'ለእኛ በጎ ነገርን ያደረገ ይቅር ባይ እግዚአብሔርን እናመሰግነዋለን። ይቅር ባይ የጌታችን የአምላካችንና የመድኃኒታችን የኢየሱስ ክርስቶስ አባት ሠውሮናልና፤ ረድቶናልና፤ ጠብቆ አቅርቦናልና፤ ወደ እርሱም ተቀብሎናልና አጽንቶ ጠብቆናልና፤ እስከዚህም ሰዓት አድርሶናልና።',
        e: 'We give thanks unto the doer of good things unto us, the merciful God, the Father of our Lord and our God and our Savior Jesus Christ: for He has covered us and succored us, He has kept us and brought us nigh and received us unto Himself, and undertaken our defense, and strengthened us, and brought us unto this hour.' },
      { r: K,
        g: 'ንስአሎ እንከ ከመ ይዕቀበነ በዛቲ ዕለት ቅድስት ኵሎ መዋዕለ ሕይወትነ ወበኵሉ ሰላም አኃዜ ኵሉ እግዚአብሔር አምላክነ።',
        a: 'አሁንም ክብርት በምትሆን በዚህች ዕለት በሕይወታችን ዘመን ሁሉ በፍጹም ሰላም ሁሉን የሚይዝ አምላካችን እግዚአብሔር ይጠብቀን ዘንድ እንለምነው።',
        e: 'Let us therefore pray unto Him that the Almighty Lord our God keep us in this Holy day and all the days of our life in all peace.' },
      { r: D, g: 'ጸልዩ።', a: 'ጸልዩ።', e: 'You, pray.' },
      { r: D,
        g: 'ኅሡ ወአስተብቍዑ ከመ ይምሐረነ እግዚአብሔር ወይሣሀል ላዕሌነ፤ ወይትወከፍ ጸሎተ ወስእለተ እምነ ቅዱሳኒሁ በእንቲአነ በዘይሤኒ ኵሎ ጊዜ ይረስየነ ድልዋነ ከመ ንንሣእ እምሱታፌ ምሥጢር ቡሩክ ወይሥረይ ለነ ኃጣውኢነ።',
        a: 'እግዚአብሔር ይምረን ዘንድ በእኛም ላይ ይቅር ይል ዘንድ እሹ፤ ለምኑ። ስለእኛ ከቅዱሳን ጸሎትን ልመናን ይቀበል ዘንድ፤ ሁልጊዜ ባማረ ነገር ቡሩክ ከሚሆን ምሥጢር አንድነት እንድንቀበል የበቃን ያደርገን ዘንድ።',
        e: 'You entreat and beseech that the Lord have pity upon us and be merciful to us, receive prayer and supplication from His saints on our behalf, so that He may make us meet to partake of the communion of the blessed sacrament and forgive us our sins.' },
      { r: H, g: 'ኪርያላይሶን።', a: 'አቤቱ ይቅር በለን።', e: 'Kyrie eleison.' },
      { r: K,
        g: 'ኢታብአነ ውስተ መንሱት አላ አድኅነነ ወባልሐነ እምኵሉ እኩይ በጸጋ ወሣህል ዘለፍቅረ ሰብእ ዘበወልድከ ዋሕድ እግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ።',
        a: 'ወደ መከራ አታግባን ከክፉ አድነን እንጂ። አንድ ልጅህ ጌታችንና አምላካችን መድኃኒታችንም ኢየሱስ ክርስቶስ ለሰው ፍቅር ብሎ ባደረገው ቸርነትና ይቅርታ።',
        e: 'Lead us not into temptation, but deliver us and rescue us from all evil in the grace and loving-kindness, which were shown by the love towards mankind of Your only-begotten Son, our Lord, God, and our Saviour Jesus Christ.' }
    ]
  },

  /* ============ 7 ============ */
  {
    id: 's07',
    title: 'ጸሎተ መባእ ዘሐዋርያት',
    note: 'መባ ስለሚያገቡ ምእመናን የሚጸለይ።',
    lines: [
      { r: NK,
        g: 'ወካዕበ ናስተበቍዕ ዘኵሎ ይእኅዝ እግዚአብሔር አብ ለእግዚእ ወመድኃኒነ ኢየሱስ ክርስቶስ በእንተ እለ ያበውኡ መባአ በውስተ ቅድስት አሐቲ እንተ ላዕለ ኵሉ ቤተ ክርስቲያን፤ መስዋዕተ ቀዳማያተ ዐሥራተ አኰቴተ ተዝካር ዘብዙኅ ወዘኅዳጥ ዘኅቡእ ወዘገሃድ።',
        a: 'ዳግመኛም ሁሉን የሚይዝ የጌታችንንና የመድኃኒታችንን የኢየሱስ ክርስቶስን አባት እግዚአብሔርን እንማልዳለን። ከሁሉ በላይ በምትሆን በከበረች በአንዲት ቤተ ክርስቲያን መባ ስለሚያስገቡ፤ መስዋዕቱን፣ ቀዳምያቱን፣ ከአሥር አንዱን፣ የመታሰቢያ ምሥጋና፣ ብዙውንና ጥቂቱን፣ የተሠወረውንና የተገለጸውን።',
        e: 'And again let us beseech the Almighty Lord, the Father of the Lord our Savior Jesus Christ, on behalf of those who bring an oblation within the one Holy universal church, a sacrifice, first-fruits, tithes, a thank-offering, a memorial, whether much or little, in secret or openly.' },
      { r: ND, g: 'ጸልዩ በእንተ እለ ያበውኡ መባአ።',
        a: 'መባ ስለሚያገቡ ሰዎች ጸልዩ።',
        e: 'Pray for them who bring an oblation.' },
      { r: H,
        g: 'ተወከፍ መባኦሙ ለአኃው፤ ወተወከፍ መባኦን ለአኃት ለነኒ ተወከፍ መባአነ ወቍርባነነ።',
        a: 'የወንዶችን መባ ተቀበል። የሴቶችን መባ ተቀበል፤ የእኛንም መባችንንና ቍርባናችንን ተቀበል።',
        e: 'Accept the oblation of our brothers, accept the oblation of our sisters, and ours also, accept our oblation and our offering.' }
    ]
  },

  /* ============ 8 ============ */
  {
    id: 's08',
    title: 'ጸሎተ እንፎራ — የኅብስት ጸሎት',
    lines: [
      { r: K,
        g: 'ኦ ሊቅየ ኢየሱስ ክርስቶስ ሱታፌ ቀዳማዊ ቃለ አብ ንጹሕ ወቃለ መንፈስ ቅዱስ ማሕየዊ አንተ ውእቱ ኅብስተ ሕይወት ዘወረድከ እምሰማያት፤',
        a: 'መምህሬ ኢየሱስ ክርስቶስ ሆይ! ከቀዳማዊ አብ ጋር አንድ የምትሆን፣ ንፁሕ የሚሆን የአብ ቃል፤ የማሕየዊ መንፈስ ቅዱስም ቃል፤ ከሰማያት የወረድህ፤ የሕይወት ኅብስት አንተ ነህ።',
        e: 'O my Master, Jesus Christ, coeternal pure Word of the Father, and Word of the Holy Spirit, the life giver, You are the bread of life which did come down from heaven.' },
      { r: K,
        g: 'ኦ መፍቀሬ ሰብእ አርኢ ገጸከ ላዕለ ዝንቱ ኅብስት ወዲበ ዝንቱ ጽዋዕ ዘአንበርነ ላዕለ ዝንቱ ታቦት መንፈሳዊ ዘለከ፤ ባርኮ ለዝንቱ ኅብስት። ወቀድሶ ለዝንቱ ጽዋዕ። ወአንጽሖሙ ለክልኤሆሙ።',
        a: 'ሰው ወዳጅ ሆይ! ያንተ በሚሆን በዚህ በመንፈሳዊ ታቦት ላይ ባኖርነው በዚህ ኅብስት ላይና በዚህ ጽዋ ላይ ፊትህን ግለጽ። ይህን ኅብስት ባርከው። ይህንንም ጽዋ አክብረው። ሁለቱን አንጻቸው።',
        e: 'O lover of man, make Your face to shine upon this bread, and upon this cup, which we have set upon this spiritual ark of Yours: Bless this bread and hallow this cup and cleanse them both.' },
      { r: D,
        g: 'ትእዛዘ አበዊነ ሐዋርያት ኢያንብር ብእሲ ውስተ ልቡ ቂመ ወበቀለ ወቅንዓተ ወጽልአ ላዕለ ቢጹ ወኢላዕለ መኑሂ።',
        a: 'ይህ የአባቶቻችን የሐዋርያት ትእዛዝ ነው። ሰው በልቡናው ቂምና በቀልን፤ ቅንዓትንና ጠብን በባልንጀራው ላይ በማንም ላይ ቢሆን አይያዝ።',
        e: 'This is the order of our fathers the Apostles: Let none keep in his heart rancour or revenge or envy or hatred towards his neighbor, or towards any other body.' },
      { r: D, g: 'ስግዱ ለእግዚአብሔር በፍርሀት።',
        a: 'በፍርሃት ለእግዚአብሔር ስገዱ።',
        e: 'Worship the Lord with fear.' },
      { r: H, g: 'ቅድሜከ እግዚኦ ንሰግድ ወንሴብሐከ።',
        a: 'አቤቱ በፊትህ እንሰግዳለን፤ እናመሰግንሃለንም።',
        e: 'Before You, Lord, we worship, and we do glorify You.' }
    ]
  },

  /* ============ 9 ============ */
  {
    id: 's09',
    title: 'ፍትሐት ዘወልድ',
    lines: [
      { r: K,
        g: 'እግዚእ እግዚኦ ኢየሱስ ክርስቶስ ወልድ ዋሕድ ቃለ እግዚአብሔር አብ ዘበተከ እምኔነ ኵሉ ማእሠረ ኃጣውኢነ በሕማማቲከ ማሕየዊት ወመድኀኒት፤',
        a: 'አቤቱ ጌታችን ኢየሱስ ክርስቶስ ወልድ ዋሕድ የእግዚአብሔር አብ ቃል፣ ማሕየዊት መድኃኒትም በምትሆን በሕማምህ ከእኛ የኃጢአታችንን ሁሉ ማሠሪያ ያጠፋህ።',
        e: 'Master, Lord Jesus Christ, the only begotten Son, the word of God the Father, who have broken off from us all the bonds of our sins through Your life-giving and saving sufferings.' },
      { r: K,
        g: 'ዘነፋሕከ ውስተ ገጸ አርዳኢከ ቅዱሳን ወላእካኒከ ንጹሐን ወትቤሎሙ ንሥኡ መንፈሰ ቅዱሰ ለእለ ኀደግሙ ኃጢአት ይትኀደግሎሙ ወለእለ ኢኀደግሙ ኃጢአት ኢይትኀደግሎሙ።',
        a: 'ንጹሐን በሚሆኑ ደቀመዛሙርትህና በንጹሓን አገልጋዮችህ ፊት እፍ ያልህባቸው "መንፈስ ቅዱስን ተቀበሉ፤ ይቅር ላላችኋቸው ኃጢአታቸው ይቀርላቸዋል፤ ይቅር ላላችኋቸው ኃጢአታቸው አይቀርላቸውም" ያልካቸው።',
        e: 'Who did breathe upon the face of Your Holy disciples and pure ministers saying to them: "Receive the Holy Spirit: whatsoever men\'s sins you remit they are remitted unto them, and whatsoever sins you retain they are retained."' },
      { r: K,
        g: 'ኦ ኄር ወመፍቀሬ ዕጓለ እመሕያው ወእግዚአ ኵሉ ፍጥረት ጸግወነ ለነ እግዚኦ ሥርየተ ኃጣውኢነ። ባርከነ ወቀድሰነ ወአግዕዘነ ወአንጽሐነ ወረስየነ ፍቱሐነ ወግእዛነ ወለኵሉ ሕዝብከ ፍትሖሙ።',
        a: 'ቸር ሰው ወዳጅ ሆይ! የፍጥረቱ ሁሉ ጌታ አቤቱ የኃጢአታችንን ሥርየት ስጠን። ባርከን አክብረንም ነጻም አድርገን፤ አንጻን የተፈታን ነጻም የወጣን አድርገን፤ ሕዝቡንም ሁሉ ፍታቸው።',
        e: 'O good lover of man and Lord of all creation, grant us, O Lord, forgiveness of our sins, bless us and purify us and set us free and absolve all Your people.' }
    ]
  },

  /* ============ 10 ============ */
  {
    id: 's10',
    title: 'ምኵራብ — በእንተ … ናስተበቊዕ',
    note: 'ዲያቆኑ ስለ ሁሉ ይለምናል። ሕዝቡ በየምዕራፉ "አሜን ኪርያላይሶን" ይላል።',
    lines: [
      { r: N, a: 'በየምዕራፉ "አሜን ኪርያላይሶን፤ አቤቱ ይቅር በለን" እንበል።',
        e: 'We shall say after each clause: "Amen Kyrie eleison, Lord have mercy upon us."' },
      { r: D, g: 'በእንተ ቅድሳት ሰላማዊት ሰላመ ናስተበቊዕ ከመ እግዚአብሔር ያስተሳልመነ በሣህለ ዚአሁ።',
        a: 'አንድ ስለምታደርግ ሥጋውና ደሙ እግዚአብሔር በይቅርታው አንድ ያደርገን ዘንድ ሰላምን እንማልዳለን።',
        e: 'For the peaceful Holy things we beseech, that God may grant us peace through His Mercy.' },
      { r: D, g: 'በእንተ ሃይማኖትነ ናስተበቊዕ ከመ እግዚአብሔር የሀበነ እንቲአሁ ሃይማኖተ በንጹሕ ንዕቀብ።',
        a: 'እግዚአብሔር የእርሱን ሃይማኖት በንጹሕ እንድንጠብቅ ይሰጠን ዘንድ ስለ ሃይማኖታችን እንማልዳለን።',
        e: 'For our Faith we beseech, that God may grant us to keep the faith in purity.' },
      { r: D, g: 'በእንተ ማኅበረነ ናስተበቊዕ ከመ እግዚአብሔር እስከ ፍጻሜነ በኅብረተ መንፈስ ቅዱስ ይዕቀበነ።',
        a: 'እስከ ፍጻሜያችን ድረስ እግዚአብሔር በመንፈስ ቅዱስ አንድነት ይጠብቀን ዘንድ ስለ አንድነታችን እንማልዳለን።',
        e: 'For our congregation we beseech, that God may keep us unto the end in the communion of the Holy Spirit.' },
      { r: D, g: 'በእንተ ነቢያት ቅዱሳን ናስተበቊዕ ከመ እግዚአብሔር ምስሌሆሙ ይኈልቈነ።',
        a: 'ቅዱሳን ስለሚሆኑ ነቢያት ከሳቸው ጋራ እግዚአብሔር ይቈጥረን ዘንድ እንማልዳለን።',
        e: 'For the Holy prophets we beseech, that God may number us with them.' },
      { r: D, g: 'በእንተ ሐዋርያት ላዕካን ናስተበቊዕ ከመ እግዚአብሔር የሀበነ ናሥምር በከመ እሙንቱ አሥመርዎ ወመክፈልቶሙ ይክፍለነ።',
        a: 'እነሱ ደስ እንዳሰኙት ደስ ልናሰኘው እግዚአብሔር ማገልገሉን ይሰጠን ዘንድ፤ ዕድል ፈንታቸውንም ያድለን ዘንድ፤ አገልጋዮች ስለሚሆኑ ሐዋርያት እንማልዳለን።',
        e: 'For the ministering Apostles we beseech, that God may grant us to be well pleasing even as they were well pleasing, and apportion unto us a lot with them.' },
      { r: D, g: 'በእንተ መፍቀሪተ እግዚአብሔር ሀገሪትነ ኢትዮጵያ ናስተበቊዕ ከመ እግዚአብሔር ብዙኃ ሰላመ ይጸጉ በማዕከሌሃ።',
        a: 'ዘወትር ፍጹም ሰላምን እግዚአብሔር ይሰጣት ዘንድ፤ እግዚአብሔርን ስለምትወድ ስለ አገራችን ኢትዮጵያ እንማልዳለን።',
        e: 'For our country Ethiopia, lover of God, we beseech, that God may grant her peace.' },
      { r: D, g: 'በእንተ ሕሙማን ወድውያን ናስተበቊዕ ከመ እግዚአብሔር ፍጡነ ይፈውሶሙ ወይፈኑ ሣህለ ወምሕረተ ላዕሌሆሙ።',
        a: 'እግዚአብሔር ፈጥኖ ያድናቸው ዘንድ፤ ይቅርታውንና ቸርነቱንም ይልክላቸው ዘንድ፤ ስለ ታመሙትና ስለ ድውያኑ እንማልዳለን።',
        e: 'For the sick and the diseased we beseech, that God should heal them speedily and send upon them mercy and compassion.' },
      { r: D, g: 'በእንተ ዝናማት ናስተበቊዕ ከመ እግዚአብሔር ይፈኑ ዝናመ ኀበ ዘይትፈቀድ መካን።',
        a: 'በሚሻበት ቦታ እግዚአብሔር ዝናሙን ያዘንም ዘንድ፤ ስለ ዝናም እንማልዳለን።',
        e: 'For the rains we beseech, that God may send rain on the place that needs it.' },
      { r: D, g: 'በእንተ ፍሬ ምድር ናስተበቊዕ ከመ እግዚአብሔር የሀባ ፍሬሃ ለምድር ለዘርዕ ወለማዕረር።',
        a: 'ለዘርና ለመከር ሊሆን እግዚአብሔር ለምድር ፍሬዋን ይሰጣት ዘንድ፤ ስለ ምድር ፍሬ እንማልዳለን።',
        e: 'For the fruits of the earth we beseech, that God may grant to the earth her fruit for sowing and for harvest.' }
    ]
  },

  /* ============ 11 ============ */
  {
    id: 's11',
    title: 'ንስግድ ወሰላም ለኪ',
    lines: [
      { r: K, g: 'ንስግድ (፫ ጊዜ)', a: 'እንስገድ (ሦስት ጊዜ)', e: 'Let us worship (thrice)' },
      { r: H, g: 'ለአብ፣ ወወልድ፣ ወመንፈስ ቅዱስ እንዘ ሠለስቱ አሐዱ።',
        a: 'ሦስት ሲሆኑ አንድ ለሚሆኑ ለአብና ለወልድ ለመንፈስ ቅዱስም።',
        e: 'The Father and the Son and the Holy Spirit, three in one.' },
      { r: K, g: 'ሰላም ለኪ።', a: 'ሰላም ላንቺ ይሁን።', e: 'Peace be unto you:' },
      { r: H, g: 'ቅድስት ቤተ ክርስቲያን ማኅደረ መለኮት።',
        a: 'የመለኮት ማደሪያ ቅድስት ቤተ ክርስቲያን።',
        e: 'Holy church, dwelling-place of the Godhead.' },
      { r: K, g: 'ሰአሊ ለነ።', a: 'ለምኝልን።', e: 'Ask for us:' },
      { r: H, g: 'ድንግል ማርያም ወላዲተ አምላክ።',
        a: 'አምላክን የወለድሽ ድንግል ማርያም።',
        e: 'Virgin Mary, mother of God.' },
      { r: K, g: 'አንቲ ውእቱ።', a: 'አንቺ ነሽ።', e: 'You are:' },
      { r: H,
        g: 'ማዕጠንት ዘወርቅ እንተ ፆርኪ ፍሕመ እሳት ቡሩክ ዘነሥአ እመቅደስ። ዘይሠሪ ኃጢአተ ወይደመስስ ጌጋየ፤ ዝውእቱ ዘእግዚአብሔር ቃል ዘተሰብአ እምኔኪ።',
        a: 'ቡሩክ ከቤተ መቅደስ የተቀበላት የእሳትን ፍሕም የተሸከምሽ የወርቅ ጥና አንቺ ነሽ። ኃጢአትን የሚያስተሠርይ፤ በደልንም የሚያጠፋ፤ ይኸውም ካንቺ ሰው የሆነ የእግዚአብሔር ቃል ነው።',
        e: 'The golden censer which did bear the coal of fire which the blessed took from the sanctuary, and which forgives sin and blots out error, who is God\'s Word that was made man from You.' },
      { r: H,
        g: 'ንሰግድ ለከ ክርስቶስ ምስለ አቡከ ኄር ሰማያዊ ወመንፈስከ ቅዱስ ማሕየዊ እስመ መጻእከ ወአድኀንከነ።',
        a: 'ክርስቶስ ሆይ! ቸር ከሚሆን ከሰማያዊ አባትህ ጋራ፤ መድኃኒት ከሚሆን ከመንፈስ ቅዱስ ጋራ እንሰግድልሃለን፤ መጥተህ አድነኸናልና።',
        e: 'We worship You, Christ, with Your good heavenly Father and the Holy Spirit, the life-giver, for You did come and save us.' }
    ]
  },

  /* ============ 12 ============ */
  {
    id: 's12',
    title: 'መልእክተ ጳውሎስ',
    lines: [
      { r: D,
        g: 'በረከተ አብ ወፍቅረ ወልድ ወሀብተ መንፈስ ቅዱስ ዘወረደ ላዕለ ሐዋርያት በጽርሐ ጽዮን ቅድስት ከማሁ ይረድ ወይትመከዐብ ላዕሌየ ወላዕለ ኵልክሙ።',
        a: 'ቅድስት በምትሆን በጽርሐ ጽዮን በሐዋርያት ላይ የወረደው የአብ በረከት፣ የወልድም ፍቅር፣ የመንፈስ ቅዱስም ሀብት በሁላችሁም ላይ ይውረድ፤ ዕፅፍ ድርብም ይሁን።',
        e: 'The blessing of the Father and the love of the Son and the gift of the Holy Spirit which came down upon the apostles in the upper room of holy Zion, in like sort come down and be multiplied upon me and all of you.' },
      { r: H,
        g: 'ቅዱስ ሐዋርያ ጳውሎስ ሠናየ መልእክት ፈዋሴ ዱያን ዘነሣእከ አክሊለ ሰአል ወጸሊ በእንቲአነ ያድኅን ነፍሳተነ በብዝኀ ሣህሉ ወምሕረቱ በእንተ ስሙ ቅዱስ።',
        a: 'አክሊልን የተቀበልህ፤ ድውያንን የምታድን፤ መልእክትህ የበጀ፤ ክቡር የምትሆን ጳውሎስ ሆይ፤ በይቅርታውና ቸርነቱ ብዛት ስለቅዱስም ስሙ ሰውንታችንን ያድን ዘንድ ስለኛ ለምን፤ ጸልይም።',
        e: 'Holy Apostle Paul, good messenger, healer of the sick, who have received the crown, ask and pray for us in order that He may save our souls in the multitude of His mercies and in His pity for His Holy name\'s sake.' },
      { r: ND,
        g: 'ኦ አኃውየ ኢታፍቅርዎ ለዓለም ወኢዘሀሎ ውስተ ዓለም። ዓለሙኒ ኃላፊ ፍትወቱኒ ኀላፊ እስመ ኵሉ ኀላፊ ውእቱ።',
        a: 'ወንድሞቼ ይህን ዓለም አትውደዱት፤ በዓለሙ ውስጥ ያለውንም። ዓለሙም አላፊ ነው፤ ፈቃዱም አላፊ ነው፤ ሁሉም አላፊ ነውና።',
        e: 'O my brothers, love not the world neither the things that are in the world. The world passes away and the lust thereof, for all is passing.' },
      { r: H,
        g: 'ቅዱስ ሥሉስ ዘኅቡር ህላዌከ ዕቀብ ማኅበረነ በእንተ ቅዱሳን ኅሩያን አርዳኢከ ናዝዘነ በሣህልከ በእንተ ቅዱስ ስምከ።',
        a: 'ባሕርይህ አንድ የሚሆን ልዩ ሦስት ሆይ! አንድነታችንን ጠብቅ፤ ስለተመረጡ ክቡራን ደቀ መዛሙርትህ በይቅርታህ አጽናን፤ ክቡር ስለሚሆን ስለ ስምህ ብለህ።',
        e: 'Holy consubstantial Trinity, preserve our congregation for Your Holy elect disciples\' sake: comfort us in the mercy, for Your Holy name\'s sake.' },
      { r: NK,
        g: 'ነቅዕ ንጹሕ ዘእምአንቅዕተ ሕግ ንጹሐን ዝውእቱ ዜና ግብሮሙ ለሐዋርያት በረከተ ጸሎቶሙ የሀሉ ምስለ ኵልነ ሕዝበ ክርስቲያን ለዓለመ ዓለም አሜን።',
        a: 'ንጹሐን ከሚሆኑ ከሕግ ምንጮች የተገኘ ጥሩ ምንጭ ይኸውም የሐዋርያት የሥራቸው ነገር ነው። የጸሎታቸው በረከት ከሁላችን ጋራ ይሁን ለዘላለሙ አሜን።',
        e: 'A pure fountain which is from the pure fountains of the law, to wit the history of the acts of the apostles. The blessing of their prayer be with us all forever. Amen.' },
      { r: H,
        g: 'ቅዱስ ቅዱስ ቅዱስ አንተ አምላከ አብ አኃዜ ኵሉ። ቅዱስ ቅዱስ ቅዱስ አንተ ወልድ ዋሕድ ዘአንተ ቃለ አብ ሕያው። ቅዱስ ቅዱስ ቅዱስ አንተ መንፈስ ቅዱስ ዘተአምር ኵሎ።',
        a: 'ሁሉን የያዝህ አብ ሆይ ቅዱስ ቅዱስ ቅዱስ አንተ ነህ። ሕያው የአብ ቃል የምትሆን ወልድ ዋሕድ ሆይ ቅዱስ ቅዱስ ቅዱስ አንተ ነህ። ሁሉን የምታውቅ መንፈስ ቅዱስ ሆይ ቅዱስ ቅዱስ ቅዱስ አንተ ነህ።',
        e: 'Holy Holy Holy are You, Father Almighty. Holy Holy Holy are You, only-begotten who are the Word of the living Father. Holy Holy Holy are You, Holy Spirit who knows all things.' }
    ]
  },

  /* ============ 13 ============ */
  {
    id: 's13',
    title: 'ዕጣን — ዝውእቱ ጊዜ ባርኮት',
    lines: [
      { r: KT,
        g: 'ዝውእቱ ጊዜ ባርኮት ወዝ ውእቱ ጊዜ ዕጣን ኅሩይ ጊዜ ሰብሖቱ ለመድኃኒነ መፍቀሬ ሰብእ ክርስቶስ።',
        a: 'የማመስገን ጊዜ ይህ ነው። የተመረጠ የዕጣን ጊዜም ይህ ነው። ሰው ወዳጅ መድኃኒታችንን ክርስቶስን ማመስገኛ ነው።',
        e: 'This is the time of blessing; this is the time of chosen incense, the time of the praise of our Savior, lover of man, Christ.' },
      { r: H,
        g: 'ዕጣን ይእቲ ማርያም፤ ዕጣን ውእቱ እስመ ዘውስተ ከርሣ ዘይትሜዐዝ እምኵሉ ዕጣን ዘወለደቶ መጽአ ወአድኀነነ።',
        a: 'ማርያም ዕጣን ናት። ዕጣን እርሱ ነው፤ በማኅጸንዋ ያደረው ከተመረጠ ዕጣን ሁሉ የሚሸት ነውና። የወለደችው መጥቶ አዳነን።',
        e: 'Mary is the incense, and the incense is He, because He who was in her womb is more fragrant than all chosen incense. He whom she bare came and saved us.' },
      { r: KT,
        g: 'ዕፍረት ምዑዝ ኢየሱስ ክርስቶስ ንዑ ንስግድ ሎቱ ወንዕቀብ ትእዛዛቲሁ ከመ ይሥረይ ለነ ኃጣውኢነ።',
        a: 'ኢየሱስ ክርስቶስ መዓዛ ያለው ሽቱ ነው። ኑ እንስገድለት፤ ትእዛዞቹንም እንጠብቅ፤ ኃጢአታችንን ያስተሠርይልን ዘንድ።',
        e: 'The fragrant ointment is Jesus Christ. O come let us worship Him and keep His commandments that He may forgive us our sins.' },
      { r: H,
        g: 'ተውህቦ ምሕረት ለሚካኤል፤ ወብሥራት ለገብርኤል፤ ወሀብተ ሰማያት ለማርያም ድንግል።',
        a: 'ለሚካኤል ምሕረት ተሰጠው። ለገብርኤልም ማብሠር፤ ለድንግል ማርያምም ወደ መንግሥተ ሰማያት የምትገባበት ሀብት ተሰጣት።',
        e: 'To Michael was given mercy, and glad tidings to Gabriel, and a heavenly gift to the Virgin Mary.' },
      { r: KT,
        g: 'ተውህቦ ልቡና ለዳዊት፤ ወጥበብ ለሰሎሞን፤ ወቀርነ ቅብዕ ለሳሙኤል እስመ ውእቱ ዘይቀብዕ ነገሥተ።',
        a: 'ለዳዊት ልቡና፤ ለሰሎሞን ጥበብ፤ ለሳሙኤልም ነገሥታቱን የቀባ እርሱ ነውና የሽቱ ቀንድ ተሰጠው።',
        e: 'To David was given understanding, and wisdom to Solomon, and an horn of oil to Samuel for he was the anointer of kings.' },
      { r: H,
        g: 'ተውህቦ መራኁት ለአቡነ ጴጥሮስ፤ ወድንግልና ለዮሐንስ፤ ወመልእክት ለአቡነ ጳውሎስ እስመ ውእቱ ብርሃና ለቤተ ክርስቲያን።',
        a: 'ለአባታችን ለጴጥሮስ መክፈቻ፤ ለዮሐንስም ድንግልና፤ ለአባታችን ለጳውሎስም የቤተ ክርስቲያን ብርሃኗ እርሱ ነውና መልእክት ተሰጠው።',
        e: 'To our father Peter were given the keys, and virginity to John, and apostleship to our father Paul, for he was the light of the church.' },
      { r: KT,
        g: 'ሱራፌል ይሰግዱ ሎቱ፤ ወኪሩቤል ይሴብሕዎ ይጸርሑ እንዘ ይብሉ።',
        a: 'ሱራፌል ይሰግዱለታል፤ ኪሩቤልም ያመሰግኑታል። እንዲህም እያሉ እየጠሩት።',
        e: 'The Seraphim worship Him, and Cherubim praise Him and cry saying:' },
      { r: H,
        g: 'ቅዱስ ቅዱስ ቅዱስ እግዚአብሔር በኀበ አእላፍ ወክቡር በውስተ ረበዋት። አንተ ውእቱ ዕጣን ኦ መድኃኒነ እስመ መጻእከ ወአድኃንከነ ተሣሃለነ።',
        a: 'እግዚአብሔር በአእላፍ መላእክት ዘንድ ቅዱስ ቅዱስ ቅዱስ ነው። በአለቆችም ዘንድ ክቡር ነው። መድኃኒታችን ሆይ ዕጣን አንተ ነህ፤ መጥተህ አድነኸናልና ይቅር በለን።',
        e: 'Holy Holy Holy is the Lord among the thousands and honored among the tens of thousands. You are the incense, O our savior, for You did come and save us. Have mercy upon us.' }
    ]
  },

  /* ============ 14 ============ */
  {
    id: 's14',
    title: 'ቅዱስ እግዚአብሔር (ትሪሳግዮን)',
    core: true,
    lines: [
      { r: K, g: 'ቅዱስ።', a: 'ቅዱስ።', e: 'Holy.' },
      { r: H,
        g: 'እግዚአብሔር፤ ቅዱስ ኃያል፤ ቅዱስ ሕያው ዘኢይመውት፤ ዘተወልደ እምማርያም እምቅድስት ድንግል ተሣሃለነ እግዚኦ።',
        a: 'እግዚአብሔር ቅዱስ፤ ኃያል ቅዱስ፤ ሕያው የማይሞት ቅዱስ፤ ከቅድስት ድንግል ማርያም የተወለደ፤ አቤቱ ይቅር በለን።',
        e: 'God, Holy Mighty, Holy Living Immortal, who was born from the Holy Virgin Mary, have mercy upon us, Lord.' },
      { r: H,
        g: 'ቅዱስ እግዚአብሔር ቅዱስ ኃያል ቅዱስ ሕያው ዘኢይመውት ዘተጠምቀ በዮርዳኖስ ወተሰቅለ ዲበ ዕፀ መስቀል ተሣሃለነ እግዚኦ።',
        a: 'ቅዱስ እግዚአብሔር፣ ቅዱስ ኃያል፣ ቅዱስ ሕያው የማይሞት፤ በዮርዳኖስ የተጠመቀ፤ በቅዱስ መስቀል ላይ የተሰቀለ፤ አቤቱ ይቅር በለን።',
        e: 'Holy God, Holy Mighty, Holy Living, Immortal, who was baptized in Jordan and crucified on the tree of the cross, have mercy upon us, Lord.' },
      { r: H,
        g: 'ቅዱስ እግዚአብሔር ቅዱስ ኃያል ቅዱስ ሕያው ዘኢይመውት ዘተንሥአ እሙታን አመ ሣልስት ዕለት፤ ዐርገ በስብሐት ውስተ ሰማያት ወነበረ በየማነ አቡሁ፤ ዳግመ ይመጽእ በስብሐት ይኮንን ሕያዋነ ወሙታነ፤ ተሣሃለነ እግዚኦ።',
        a: 'ቅዱስ እግዚአብሔር፣ ቅዱስ ኃያል፣ ቅዱስ ሕያው የማይሞት፤ በሦስተኛው ቀን ከሙታን ተለይቶ የተነሣ፤ በምስጋና ወደ ሰማይ ወጣ፤ በአባቱም ቀኝ ተቀመጠ፤ ዳግመኛም በክብር ይመጣል፤ በሕያዋንና በሙታን ይፈርድ ዘንድ፤ አቤቱ ይቅር በለን።',
        e: 'Holy God, Holy Mighty, Holy Living Immortal, who did rise from the dead on the third day, ascend into heaven in glory, sit at the right hand of the Father and again will come in glory to judge the quick and the dead, have mercy upon us, Lord.' },
      { r: H,
        g: 'ስብሐት ለአብ፤ ስብሐት ለወልድ፤ ስብሐት ለመንፈስ ቅዱስ ይእዜኒ ወዘልፈኒ ወለዓለመ ዓለም አሜን ወአሜን ለይኩን ለይኩን።',
        a: 'ለአብ ምስጋና ይሁን፤ ለወልድም ምስጋና ይሁን፤ ለመንፈስ ቅዱስ ምስጋና ይሁን፤ ዛሬም ዘወትርም ለዘላለሙ አሜን፤ አሜን፤ ይሁን ይሁን።',
        e: 'Glory be to the Father, glory be to the Son, glory be to the Holy Spirit, both now and ever and world without end. Amen and Amen, so be it, so be it.' },
      { r: H, g: 'ቅዱስ ሥሉስ እግዚአብሔር ሕያው ተሣሃለነ።',
        a: 'ልዩ ሦስት ሕያው እግዚአብሔር ሆይ ይቅር በለን።',
        e: 'O Holy Trinity, living God have mercy upon us.' }
    ]
  },

  /* ============ 15 ============ */
  {
    id: 's15',
    title: 'ንሰብሖ ለአምላክነ',
    core: true,
    lines: [
      { r: K, g: 'ጸጋ ዘእግዚአብሔር የሀሉ ምስሌክሙ።',
        a: 'የእግዚአብሔር ጸጋ ከእናንተ ጋራ ይሁን።',
        e: 'The grace of God be with you.' },
      { r: H, g: 'ምስለ መንፈስከ።', a: 'ከመንፈስህ ጋራ።', e: 'And with your spirit.' },
      { r: K, g: 'ንሰብሖ ለአምላክነ።', a: 'ፈጣሪያችንን እናመስግን።', e: 'Let us glorify our God.' },
      { r: H, g: 'ርቱዕ ይደሉ።', a: 'እውነት ነው፤ ይገባል።', e: 'It is right, it is just.' },
      { r: K, g: 'አጽንዑ ሕሊና ልብክሙ።', a: 'የልባችሁን አሳብ አጽኑ።', e: 'Strengthen the thought of your heart.' },
      { r: H,
        g: 'ብነ ኀበ እግዚአብሔር። አቡነ ዘበሰማያት፤ አቡነ ዘበሰማያት፤ አቡነ ዘበሰማያት፤ ኢታብአነ እግዚኦ ውስተ መንሱት።',
        a: 'ከእግዚአብሔር ዘንድ አለን። አባታችን ሆይ፤ አባታችን ሆይ፤ አባታችን ሆይ፤ አቤቱ ወደ ፈተና አታግባን።',
        e: 'We lift them unto the Lord our God. Our Father who are in heaven (thrice), lead us not into temptation.' },
      { r: N, a: '— ጧት —', e: 'in the morning' },
      { r: H, g: 'ኪያከ ንሴብሕ እግዚኦ። ኪያከ ንዌድስ እግዚኦ።',
        a: 'አቤቱ አንተን እናመሰግንሃለን። አቤቱ አንተን እናወድስሃለን።',
        e: 'O Lord, we thank You. O Lord, we praise You.' },
      { r: N, a: '— ከሰዓት በኋላ —', e: 'in the afternoon' },
      { r: H, g: 'ንሴብሐከ እግዚኦ። ንዌድሰከ እግዚኦ።',
        a: 'አቤቱ እናመሰግንሃለን። አቤቱ እናወድስሃለን።',
        e: 'O Lord, we thank You. O Lord, we praise You.' }
    ]
  },

  /* ============ 16 ============ */
  {
    id: 's16',
    title: 'አቡነ ዘበሰማያት',
    core: true,
    lines: [
      { r: H,
        g: 'አቡነ ዘበሰማያት ይትቀደስ ስምከ። ትምጻእ መንግሥትከ። ወይኩን ፈቃድከ። በከመ በሰማይ፤ ከማሁ በምድር።',
        a: 'አባታችን ሆይ በሰማያት የምትኖር፤ ስምህ ይቀደስ፤ መንግሥትህ ትምጣ። ፈቃድህ በሰማይ እንደሆነች እንዲሁም በምድር ትሁን።',
        e: 'Our Father who are in heaven, hallowed be Your name, Your kingdom come, Your will be done on earth as it is in heaven;' },
      { r: H,
        g: 'ሲሳየነ ዘለለ ዕለትነ ሀበነ ዮም። ኅድግ ለነ አበሳነ ወጌጋየነ፤ ከመ ንሕነኒ ንኅድግ ለዘአበሰ ለነ።',
        a: 'የዕለት እንጀራችንን ስጠን ዛሬ። በደላችንን ይቅር በለን፤ እኛም የበደሉንን ይቅር እንደምንል።',
        e: 'give us this day our daily bread, and forgive us our trespasses as we forgive them that trespass against us,' },
      { r: H,
        g: 'ኢታብአነ እግዚኦ ውስተ መንሱት፤ አላ አድኅነነ። ወባልሐነ እምኵሉ እኩይ። እስመ ዚአከ ይእቲ መንግሥት ኃይል ወስብሐት ለዓለመ ዓለም አሜን።',
        a: 'አቤቱ ወደ ፈተና አታግባን፤ ከክፉ ሁሉ አድነን እንጂ። መንግሥት ያንተ ናትና ኃይል ክብር ምስጋናም ለዘላለሙ አሜን።',
        e: 'and lead us not into temptation but deliver us and rescue us from all evil; for Yours is the kingdom, the power and the glory for ever and ever. Amen.' },
      { r: H,
        g: 'በሰላመ ቅዱስ ገብርኤል መልአክ ኦ እግዝእትየ ማርያም ሰላም ለኪ። ድንግል በሕሊናኪ፣ ኦ ድንግል በሥጋኪ። እመ እግዚአብሔር ጸባዖት ሰላም ለኪ።',
        a: 'እመቤታችን ቅድስት ድንግል ማርያም ሆይ በመልአኩ በቅዱስ ገብርኤል ሰላምታ ሰላም እንልሻለን። በኃሳብሽ ድንግል ነሽ። በሥጋሽም ድንግል ነሽ። የአሸናፊ የእግዚአብሔር እናቱ ሆይ ሰላምታ ለአንቺ ይገባሻል።',
        e: 'Our Lady, Virgin St. Mary! In St. Gabriel\'s greeting, peace be unto you. You are Virgin in thought and Virgin in body, O mother of the almighty God! Peace be unto you.' },
      { r: H,
        g: 'ቡርክት አንቲ እምአንስት ወቡሩክ ፍሬ ከርስኪ። ተፈሥሒ ፍሥሕት ኦ ምልዕተ ጸጋ እግዚአብሔር ምስሌኪ። ሰአሊ ወጸልዪ በእንቲአነ ምሕረት ኀበ ፍቁር ወልድኪ ኢየሱስ ክርስቶስ ከመ ይሥረይ ለነ ኃጣውኢነ አሜን።',
        a: 'ከሴቶች ሁሉ ተለይተሽ አንቺ የተባረክሽ ነሽ። የማኅፀንሽም ፍሬ የተባረከ ነው። ጸጋን የተመላሽ ሆይ ደስ ይበለሽ፤ ልዑል እግዚአብሔር ከአንቺ ጋር ነውና። ከተወደደው ልጅሽ ከጌታችን ከመድኃኒታችን ከኢየሱስ ክርስቶስ ዘንድ ይቅርታንና ምሕረትን ለምኚልን፤ ኃጢአታችንንም ያስተሠርይልን ዘንድ አሜን።',
        e: 'Blessed are You amongst women and blessed is the fruit of Your womb. Hail Mary, full of Grace, the Lord is with You. Beseech and pray for us for mercy to Your beloved Son our Lord Jesus Christ that He may forgive us our sins. Amen.' },
      { r: H,
        g: 'ኦ ሥሉስ ቅዱስ መሐረነ። ኦ ሥሉስ ቅዱስ መሐከነ። ኦ ሥሉስ ቅዱስ ተሣሀለነ።',
        a: 'ልዩ ሦስት ሆይ ማረን። ልዩ ሦስት ሆይ ራራልን። ልዩ ሦስት ሆይ ይቅር በለን።',
        e: 'O Holy Trinity, pity us. O Holy Trinity, spare us. O Holy Trinity, have mercy upon us.' }
    ]
  },

  /* ============ 17 ============ */
  {
    id: 's17',
    title: 'ወንጌል',
    lines: [
      { r: D,
        g: 'ሃሌ ሉያ ቁሙ ወአጽምዑ ወንጌለ ቅዱሰ ዜናሁ ለእግዚእነ ወመድኃኒነ ኢየሱስ ክርስቶስ።',
        a: 'ሃሌ ሉያ! ጌታችንና መድኃኒታችን የኢየሱስ ክርስቶስ የተናገረውን ቅዱስ ወንጌል ቆማችሁ አድምጡ።',
        e: 'Halleluiah, stand up and hear the Holy Gospel, the message of our Lord and Savior Jesus Christ.' },
      { r: K, g: 'እግዚአብሔር ምስለ ኵልክሙ።',
        a: 'እግዚአብሔር ከሁላችሁ ጋራ ይሁን።',
        e: 'The Lord be with you all.' },
      { r: H, g: 'ምስለ መንፈስከ።', a: 'ከመንፈስህ ጋራ።', e: 'And with your spirit.' },
      { r: K,
        g: 'ወንጌል ቅዱስ፤ ዘዜነወ ማቴዎስ / ማርቆስ / ሉቃስ (ዘሰበከ ዮሐንስ) ቃለ ወልደ እግዚአብሔር።',
        a: '(ማቴዎስ / ማርቆስ / ሉቃስ) የተናገረው (ዮሐንስ የሰበከው) የእግዚአብሔር ልጅ ቃል የሚሆን ቅዱስ ወንጌል ይህ ነው።',
        e: 'The Holy gospel which Matthew / Mark / Luke have proclaimed (John preached), the Word of the Son of God.' },
      { r: H, g: 'ስብሐት ለከ ክርስቶስ እግዚእየ ወአምላኪየ ኵሎ ጊዜ።',
        a: 'ጌታዬና አምላኬ ክርስቶስ ሆይ ሁልጊዜ ለአንተ ምስጋና ይገባል።',
        e: 'Glory be to You, Christ my Lord and my God, at all times.' },
      { r: D, g: 'ጸልዩ በእንተ ወንጌል ቅዱስ።',
        a: 'ክቡር ስለሚሆን ስለ ወንጌል ጸልዩ።',
        e: 'Pray for the Holy Gospel.' },
      { r: H, g: 'ይረስየነ ድልዋነ ለሰሚዐ ወንጌል ቅዱስ።',
        a: 'ቅዱስ ወንጌልን ለመስማት የበቃን ያድርገን።',
        e: 'May He make us meet to hear the Holy Gospel.' },
      { r: H,
        g: 'በወንጌል መራህከነ፤ ወበነቢያት ናዘዝከነ፤ ዘለሊከ አቅረብከነ ስብሐት ለከ።',
        a: 'በወንጌል መራኸን፤ በነቢያትም አጸናኸን፤ ለአቀረብኸን ክብር ምስጋና ይገባል።',
        e: 'You have guided us with the Gospel, comforted us with the prophets, and drawn us nigh unto You. Glory be to You.' },
      { r: D, g: 'ፃኡ ንኡሰ ክርስቲያን።',
        a: 'የክርስቲያን ታናሾች የሆናችሁ ውጡ።',
        e: 'Go out, you catechumens.' }
    ]
  },

  /* ============ 18 ============ */
  {
    id: 's18',
    title: 'ጸሎተ ሃይማኖት',
    note: 'ዲያቆኑ ካወጀ በኋላ ሕዝቡ በአንድነት ይላል።',
    lines: [
      { r: D, g: 'ንበል ኵልነ በጥበበ እግዚአብሔር ጸሎተ ሃይማኖት።',
        a: 'በእግዚአብሔር ጥበብ ሁነን ሁላችን የሃይማኖት ጸሎት እንበል።',
        e: 'Let us all say, in the wisdom of God, the prayer of faith.' },
      { r: H,
        g: 'ነአምን በአሐዱ አምላክ ገባሬ ኵሉ ፍጥረት አብ ለእግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ እስመ አልቦ ውስተ ህላዌሁ አመክንዮ።',
        a: 'የጌታችንና የአምላካችን የመድኃኒታችን የኢየሱስ ክርስቶስ አባት በሚሆን ፍጥረቱን ሁሉ በፈጠረ በአንድ አምላክ እናምናለን፤ በባሕርዩ ምክንያት የለበትምና።',
        e: 'We believe in one God, maker of all creation, Father of our Lord and our God and our Saviour Jesus Christ, because His nature is unsearchable.' },
      { r: H,
        g: 'አሐዱ እግዚአብሔር አብ ለእግዚእነ ወመድኃኒነ ኢየሱስ ክርስቶስ ዘተወልደ እምቅድመ ይትፈጠር ዓለም ወልድ ዋሕድ ዘዕሩይ ምስሌሁ ገባሬ ኵሉ ሠራዊት ወሢመታት ወሥልጣናት፤',
        a: 'የጌታችንና የመድኃኒታችን የኢየሱስ ክርስቶስ አባት እግዚአብሔር አንድ ነው። ዓለም ሳይፈጠር የተወለደ፣ ከርሱ ጋራ የተካከለ የሚሆን አንድ ልጅ፣ ሠራዊትና ሢመታትን ሥልጣናትንም ሁሉ የፈጠረ፤',
        e: 'One God, Father of our Lord and our Saviour Jesus Christ, who was begotten before the creation of the world, the only-begotten Son, coequal with Him, creator of all the hosts, the principalities and the dominions:' },
      { r: H,
        g: 'ዘሠምረ ይኩን ሰብአ በደኃሪ መዋዕል ወነሥአ ሥጋ እምእግዚእትነ ማርያም ቅድስት ድንግል ዘእንበለ ዘርዐ ብእሲ። ወተሐፅነ ከመ ሰብእ ዘእንበለ ኃጢአት ወአበሳ ወአልቦ ጕሕሉት ውስተ አፉሁ፤',
        a: 'በኋለኛው ዘመን ሰው ይሆን ዘንድ የወደደ፣ ያለ ዘርዐ ብእሲ ቅድስት ከምትሆን ከእመቤታችን ከድንግል ማርያም ሥጋን ነሣ። ያለ ኃጢአትና ያለ በደል እንደ ሰው አደገ፤ በአንደበቱም ሐሰት የለበትም።',
        e: 'Who in the last days was pleased to become man, and took flesh from our Lady Mary, the Holy Virgin, without the seed of man, and grew like men yet without sin or evil; neither was guile found in His mouth,' },
      { r: H,
        g: 'ወእምዝ ሐመ ወሞተ በሥጋ ወተንሥአ እሙታን በሣልስት ዕለት ወዐርገ ሰማያተ ኀበ አብ ዘፈነዎ። ወነበረ በየማነ ኃይል ወፈነወ ለነ ጰራቅሊጦስሃ መንፈሰ ቅዱስ ዘወፅአ እምአብ ወአድኀነ ኵሎ ዓለመ።',
        a: 'ከዚህ በኋላ በሥጋ ታመመ፣ ሞተም፤ በሦስተኛውም ቀን ከሙታን ተለይቶ ተነሣ፤ ወደ ላከውም ወደ አብ ወደ ሰማይ ዐረገ። ኃይል ባለውም ቀኝ ተቀመጠ፤ ከአብ የሠረፀ ጰራቅሊጦስ መንፈስ ቅዱስን ሰደደልን፤ ዓለሙንም ሁሉ አዳነ።',
        e: 'Then He suffered, died in the flesh, rose from the dead on the third day, ascended unto heaven to the Father who sent Him, sat down at the right hand of Power, sent to us the paraclete, the Holy Spirit, who proceeds from the Father, and saved all the world.' },
      { r: H,
        g: 'ወካዕበ ነአምን ትንሣኤ ሙታን ጻድቃን ወኃጥአን ወዕለተ ኵነኔ አመ ይትፈደይ ኵሉ በከመ ምግባሩ።',
        a: 'ዳግመኛም የሞቱ የጻድቃንና የኃጥአን ትንሣኤ እንዳለ እናምናለን። ሁሉ እንደ ሥራው ፍዳውን የሚቀበልበት የፍርድ ቀን እንዳለ እናምናለን።',
        e: 'We also believe in the resurrection of the dead, the righteous and sinners; and in the day of judgment, when every one will be recompensed according to his deeds.' }
    ]
  },

  /* ============ 19 ============ */
  {
    id: 's19',
    title: 'ዘኮነ ንጹሐ ይንሣእ — ማስጠንቀቂያ',
    lines: [
      { r: K,
        g: 'ዘኮነ ንጹሐ ይንሣእ እምቍርባን፤ ወዘኢኮነ ንጹሐ ኢይንሣእ ከመ ኢየዐይ በእሳተ መለኮት ዘተደለወ ለሰይጣን ወለመላእክቲሁ።',
        a: 'ንጹሕ የሆነ ከቍርባኑ ይቀበል፤ ንጹሕ ያልሆነ ግን አይቀበል፤ ለሰይጣንና ለመላክተኞቹ በተዘጋጀ በመለኮት እሳት እንዳይቃጠል።',
        e: 'He that is pure let him receive of the oblation and he that is not pure let him not receive it, that he may not be consumed by the fire of the godhead which is prepared for the devil and his angels.' },
      { r: K,
        g: 'ዘቦ ቂም ውስተ ልቡ ወዘቦ ውስቴቱ ሕሊና ነኪር ወዝሙት ኢይቅረብ። በከመ አንጻሕኩ እደውየ እምርስሐት አፋአዊ ከማሁ ንጹሕ አነ እምደመ ኵልክሙ።',
        a: 'በልቡናው ቂምን የያዘ፤ ልዩ አሳብና ዝሙትም ያለበት ቢኖር አይቅረብ። እጄን ከአፍአዊ እድፍ ንጹሕ እንዳደረግሁ እንደዚሁም ከሁላችሁ ደም ንጹሕ ነኝ።',
        e: 'Whosoever has revenge in his heart and whoever has in him strange thoughts and fornication let him not draw near. As I have cleansed my hands from outward pollution, so also I am pure from the blood of you all.' }
    ]
  },

  /* ============ 20 ============ */
  {
    id: 's20',
    title: 'ጸሎተ አምኃ ዘባስልዮስ — ሰላምታ',
    lines: [
      { r: K,
        g: 'እግዚአብሔር ዐቢይ ዘለዓለም ዘለሐኮ ለሰብእ እንበለ ሙስና። ሞተ ዘቦአ ቀዳሚ በቅንዓተ ሰይጣን አብጠልከ በምጽአቱ ለሕያው ወልድከ እግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ።',
        a: 'ለዘላለሙ ገናና የምትሆን እግዚአብሔር ሆይ፣ ያለጥፋት ሰውን የፈጠርኸው፤ አስቀድሞ በሰይጣን ቅንዓት የገባውን ሞት ሕያው በሚሆን ልጅህ በጌታችንና በአምላካችን በመድኃኒታችን በኢየሱስ ክርስቶስ መምጣት አጠፋህ።',
        e: 'God, great eternal, Who did form man uncorrupt, You did abolish death that came first through the envy of Satan, by the advent of Your living Son our Lord, and our God, and Saviour Jesus Christ.' },
      { r: H,
        g: 'ስብሐት ለእግዚአብሔር በሰማያት፤ ወሰላም በምድር ሥምረቱ ለሰብእ።',
        a: 'በሰማይ ለእግዚአብሔር ምስጋና ይገባል። በምድርም ሰላም፤ የሰው ፈቃድ።',
        e: 'Glory to God in heaven and on earth peace, His goodwill toward men.' },
      { r: D,
        g: 'ጸልዩ በእንተ ሰላም ፍጽምት ወፍቅር ተአምኁ በበይናቲክሙ በአምኃ ቅድሳት።',
        a: 'ፍጽምት ስለምትሆን ሰላምና ፍቅር ጸልዩ። እርስ በእርሳችሁ በተለየች ሰላምታ እጅ ተነሣሡ።',
        e: 'Pray for the perfect peace and love. Salute one another with a Holy salutation.' },
      { r: H,
        g: 'ክርስቶስ አምላክነ ረስየነ ድልዋነ ከመ ንትአማኅ በበይናቲነ በአምኃ ቅድሳት።',
        a: 'አምላካችን ክርስቶስ ሆይ እርስ በርሳችን በተለየች ሰላምታ እጅ እንነሣሣ ዘንድ የበቃን አድርገን።',
        e: 'Christ our God, make us meet to salute one another with a Holy salutation.' }
    ]
  },

  /* ============ 21 ============ */
  {
    id: 's21',
    title: 'አኰቴተ ቍርባን ዘሐዋርያት — መክፈቻ',
    core: true,
    note: 'ፍሬ ቅዳሴው (Anaphora) የሚጀመርበት።',
    lines: [
      { r: K,
        g: 'አኮቴተ ቊርባን ዘአበዊነ ሐዋርያት በረከተ ጸሎቶሙ የሃሉ ምስለ ርዕሰ ሊቃነ ጳጳሳቲነ ……… ወምስለ ሊቀ ጳጳስነ ……… ወምስለ ኵልነ ሕዝበ ክርስቲያን ወይዕቀባ ለሀገሪትነ ኢትዮጵያ ለዓለመ ዓለም አሜን።',
        a: 'የአባቶቻችን ሐዋርያት የቁርባን ምስጋና፤ የጸሎታቸው በረከት በጳጳሳቱ አለቃ ……ና በጳጳሳችን ……… በሁላችንም ላይ ይደር፤ አገራችንን ኢትዮጵያን ይጠብቃት ለዘላለሙ አሜን።',
        e: 'The Anaphora of our fathers the Apostles; may their prayer and blessing be with our Patriarch… and our Bishop… and may He watch over Ethiopia, world without end. Amen.' },
      { r: K, g: 'እግዚአብሔር ምስለ ኵልክሙ።',
        a: 'እግዚአብሔር ከሁላችሁም ጋር ይሁን።',
        e: 'The Lord be with you all.' },
      { r: H, g: 'ምስለ መንፈስከ።', a: 'ከመንፈስህ ጋራ።', e: 'And with your spirit.' },
      { r: K, g: 'አእኵትዎ ለአምላክነ።', a: 'አምላካችንን አመስግኑት።', e: 'Give ye thanks unto our God.' },
      { r: H, g: 'ርቱዕ ይደሉ።', a: 'እውነት ነው፤ ይገባዋል።', e: 'It is right, it is just.' },
      { r: K, g: 'አልዕሉ አልባቢክሙ።', a: 'ልቡናችሁ ሰማያዊ ነገርን ያስብ።', e: 'Lift up your hearts.' },
      { r: H, g: 'ብነ ኀበ እግዚአብሔር አምላክነ።',
        a: 'በአምላካችን በእግዚአብሔር ዘንድ አለን።',
        e: 'We have lifted them up unto the Lord our God.' },
      { r: K,
        g: 'ነአኵተከ እግዚኦ በፍቁር ወልድከ እግዚእነ ኢየሱስ ዘበደኃሪ መዋዕል ፈኖከ ለነ ወልድከ መድኀነ ወመቤዝወ መልአከ ምክርከ ዝ ቃል እንተ እምኔከ ውእቱ ወቦቱ ኵሎ ገበርከ በፈቃድከ።',
        a: 'አቤቱ በተወደደ ልጅህ በጌታችን በኢየሱስ ክርስቶስ እናመሰግንሃለን፤ በኋለኛውም ዘመን የምክርህን አበጋዝ፣ መድኃኒትና ቤዛ የሚሆን ልጅህን የሰደድህልን፤ ይህ ቃል ካንተ የተገኘ ነው። በእርሱም ሁሉን በፈቃድህ አደረግህ።',
        e: 'We give You thanks, O Lord, in Your beloved son our Lord Jesus, whom in the last days You did send unto us, Your Son the Savior and Redeemer, the messenger of Your counsel; this Word is He who is from You, and through whom You did make all things by Your will.' }
    ]
  },

  /* ============ 22 ============ */
  {
    id: 's22',
    title: 'ሥሉስ ቅዱስ ባርክ',
    lines: [
      { r: K,
        g: 'ኦ ሥሉስ ቅዱስ አብ ወወልድ ወመንፈስ ቅዱስ ባርክ ዲበ ሕዝብከ ፍቁራን ክርስቶሳውያን በበረከተ ሰማያውያን ወምድራውያን ወፈኑ ላዕሌነ ጸጋ መንፈስ ቅዱስ።',
        a: 'ልዩ ሦስት የምትሆን አብ ወልድ መንፈስ ቅዱስ ሆይ! የሚፋቀሩ የክርስቶስ ወገኖች የሚሆኑ ሕዝብህን በሰማያውያንና በምድራዊያን በረከት ባርክ፤ በእኛ ላይም የመንፈስ ቅዱስን ጸጋ ላክ።',
        e: 'O Holy Trinity, Father and Son and Holy Spirit, bless Your people, Christians beloved, with blessings heavenly and earthly and send upon us the grace of the Holy Spirit.' },
      { r: K,
        g: 'ወረሲ ኀዋኅወ ቤተ ክርስቲያንከ ቅድስት ርኅዋተ ለነ በምሕረት ወአሚን ወፈጽም ለነ አሚነ ሥላሴከ ቅድስት እስከ ደኃሪት እስትንፋስ።',
        a: 'የቅድስት ቤተ ክርስቲያንህም ደጆች በምሕረትና በሃይማኖት እንዲከፈቱ አድርግልን፤ እስከ መጨረሻዪቱ ሕቅታም ድረስ ልዩ ሦስትነትህን ማመንን ፈጽምልን።',
        e: 'And make the doors of Your Holy Church open unto us in mercy and in faith; and perfect unto us the faith of Your Holy Trinity unto our latest breath.' },
      { r: D,
        g: 'መሐሮሙ እግዚኦ ወተሣሃሎሙ ለሊቃነ ጳጳሳት፤ ጳጳሳት ኤጲስ ቆጶሳት ቀሳውስት ወዲያቆናት ወኵሎሙ ሕዝበ ክርስቲያን።',
        a: 'አቤቱ የጳጳሳት አለቆችን፣ ጳጳሳቱንና ኤጲስ ቆጶሳቱን፣ ቀሳውስቱንና ዲያቆናቱን፣ የክርስቲያን ወገኖችን ሁሉ ማራቸው፤ ይቅርም በላቸው።',
        e: 'Lord pity and have mercy upon the patriarchs, archbishops, bishops, priests, deacons and all the Christian people.' },
      { r: K, g: 'ኦ እግዚኦ አድኅን ሕዝበከ፤ ወባርክ ርስተከ። ረዓዮሙ ወአልዕሎሙ እስከ ለዓለም።',
        a: 'አቤቱ ሕዝብህን አድን፤ ርስትህንም ባርክ። ጠብቃቸው፤ እስከ ዘላለምም ከፍ ከፍ አድርጋቸው።',
        e: 'O Lord, save Your people and bless Your inheritance; feed them and lift them up for ever.' }
    ]
  },

  /* ============ 23 ============ */
  {
    id: 's23',
    title: 'ቅዱስ ቅዱስ ቅዱስ (ሰርአፍ)',
    core: true,
    lines: [
      { r: D, g: 'እለ ትነብሩ ተንሥኡ።', a: 'የተቀመጣችሁ ተነሡ።', e: 'You that are sitting, stand up.' },
      { r: K,
        g: 'ለከ ለዘይቀውም ቅድሜከ አእላፈ አእላፋት ወትእልፊተ አእላፋት ቅዱሳን መላእክት ወሊቃነ መላእክት ወክቡራን እንስሳከ እለ ስድስቱ ክነፊሆሙ።',
        a: 'አእላፈ አእላፋትና ትእልፊተ አእላፋት የሚሆኑ ቅዱሳን መላእክት፣ የመላእክት አለቆች፣ ክንፎቻቸው ስድስት የሚሆኑ ክቡራን አርባዕቱ እንስሳትም ከፊትህ ለሚቆሙልህ ለአንተ።',
        e: 'There stand before You thousand thousands and ten thousand times ten thousand holy angels and archangels and Your honorable beasts, each with six wings.' },
      { r: D, g: 'ውስተ ጽባሕ ነጽሩ።', a: 'ወደ ምሥራቅ ተመልከቱ።', e: 'Look towards the east.' },
      { r: K,
        g: 'በክልኤ ክነፊሆሙ ይከድኑ ገጾሙ፤ ወበክልኤ ክነፊሆሙ ይከድኑ እግሮሙ፤ ወበክልኤ ክነፊሆሙ ይሠሩ እምጽንፍ ወእስከ አጽናፈ ዓለም።',
        a: 'በሁለት ክንፋቸው ፊታቸውን ይሸፍናሉ። በሁለት ክንፋቸው እግራቸውን ይሸፍናሉ። በሁለት ክንፋቸው ከዳርቻ እስከ ዓለም ዳርቻ ይወጣሉ።',
        e: 'With two of their wings they cover their face, with two of their wings they cover their feet, and with two of their wings they fly from end to the end of the world.' },
      { r: D, g: 'ንነጽር።', a: 'እናስተውል።', e: 'Let us give heed.' },
      { r: D, g: 'አውሥኡ።', a: 'ተሰጥኦውን መልሱ።', e: 'Answer you.' },
      { r: H,
        g: 'ቅዱስ ቅዱስ ቅዱስ እግዚአብሔር ጸባዖት ፍጹም ምሉዕ ሰማያተ ወምድረ ቅድሳተ ስብሐቲከ።',
        a: 'ቅዱስ ቅዱስ ቅዱስ ፍጹም አሸናፊ እግዚአብሔር፤ የጌትነትህ ምስጋና በሰማይና በምድር የመላ ነው።',
        e: 'Holy Holy Holy, perfect Lord of hosts, heaven and earth are full of the holiness of Your Glory.' },
      { r: K,
        g: 'አማን መልዐ ሰማያተ ወምድረ ቅድሳተ ስብሐቲከ በእግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ፤ ቅዱስ ወልድከ መጽአ ወእምድንግል ተወልደ ከመ ፈቃደከ ይፈጽም ወሕዝበ ለከ ይግበር።',
        a: 'የጌትነትህን ምስጋና በጌታችን በአምላካችንና በመድኃኒታችን በኢየሱስ ክርስቶስ በእውነት በሰማይና በምድር መላ፤ ቅዱስ ልጅህ መጣ፤ ከድንግልም ተወለደ፤ ፈቃድህን ይፈጽም ዘንድ፤ ሕዝቡንም ላንተ ያደርግ ዘንድ።',
        e: 'Truly heaven and earth are full of the holiness of Your glory through our Lord and our God and our Savior Jesus Christ Your Holy Son. He came and was born of a virgin that He might fulfill Your will and make a people for You.' },
      { r: H,
        g: 'ተዘከረነ እግዚኦ በውስተ መንግሥትከ። ተዘከረነ እግዚኦ ኦ ሊቅነ በውስተ መንግሥትከ። ተዘከረነ እግዚኦ በውስተ መንግሥትከ። በከመ ተዘከርኮ ለፈያታዊ ዘየማን እንዘ ሀሎከ ዲበ ዕፀ መስቀል ቅዱስ።',
        a: 'አቤቱ በመንግሥትህ አስበን። ሊቅ ሆይ አቤቱ በመንግሥትህ አስበን። አቤቱ በመንግሥትህ አስበን። ቅዱስ በሚሆን በዕፀ መስቀል ላይ ሳለህ ፈያታዊ ዘየማንን እንዳሰብከው።',
        e: 'Remember us, Lord, in Your kingdom; remember us, Lord, Master, in Your kingdom; remember us, Lord, in Your kingdom, as You did remember the thief on the right hand when You were on the tree of the Holy Cross.' }
    ]
  },

  /* ============ 24 ============ */
  {
    id: 's24',
    title: 'ቃለ ተቀድሶ — በይእቲ ሌሊት',
    core: true,
    note: 'የጌታችን የመጨረሻው እራት ቃል። ሕዝቡ "አሜን አሜን አሜን…" ብሎ ይመልሳል።',
    lines: [
      { r: K,
        g: 'ሰፍሐ እደዊሁ ለሕማም ከመ ሕሙማነ ያድኅን እለ ተወከሉ በላዕሌሁ፤ ዘተውህበ በፈቃዱ ለሕማም ከመ ሞተ ይሥዓር ወማእሠረ ሰይጣን ይብትክ ወይኪድ ሲኦለ ቅዱሳነ ይምራሕ ሥርዓተ ይትክል ወትንሣኤሁ ያዑቅ።',
        a: 'በርሱ ያመኑ ሕሙማንን ታሞ ያድን ዘንድ እጆቹን ለሕማም ዘረጋ። ሞትን ይሽር ዘንድ፣ የሰይጣንን ማሠሪያ ይቈርጥ ዘንድ፣ ሲኦልንም ይረግጥ ዘንድ፣ ቅዱሳንን ይመራ ዘንድ፣ ሥርዓትን ይሠራ ዘንድ፣ ትንሣኤውን ይገልጽ ዘንድ ለሕማም ተሠጠ።',
        e: 'He stretched out his hands in the passion, suffering to save the sufferers that trust in Him; who was delivered to the passion that He might destroy death, break the bonds of Satan, tread down hell, lead forth the saints, establish a covenant and make known His resurrection.' },
      { r: D, g: 'አንሥኡ እደዊክሙ ቀሳውስት።',
        a: 'ቀሳውስት እጆቻችሁን አንሡ።',
        e: 'Priests, raise up your hands.' },
      { r: K,
        g: 'በይእቲ ሌሊት እንተ ባቲ አመ ያገብዕዎ ነሥአ ኅብስተ በእደዊሁ ቅዱሳት ወብፁዓት እለ እንበለ ነውር።',
        a: 'እርሱን በያዙባት በዚያች ሌሊት ነውር በሌለባቸው ንዑዳት፣ ክቡራት፣ ብፁዓትም በሆኑ እጆቹ ኅብስቱን አንሥቶ ያዘ።',
        e: 'In the same night in which they betrayed Him He took bread in His Holy, blessed and spotless hands;' },
      { r: H, g: 'ነአምን ከመ ዝንቱ ውእቱ በአማን ነአምን።',
        a: 'ይህ እንደ ሆነ በእውነት እናምናለን።',
        e: 'We believe that this is He, truly we believe.' },
      { r: K, g: 'አንቃዕደወ ሰማየ ኀቤከ ኀበ አቡሁ አእኰተ ባረከ ወፈተተ።',
        a: 'ወደ አንተ ወደ አባቱ ወደ ሰማይ ቀና ብሎ አመሰገነ፣ ባረከ፣ ቈረሰ።',
        e: 'He looked up to heaven toward You, His Father; gave thanks, blessed and broke.' },
      { r: K,
        g: 'ወወሀቦሙ ለእሊአሁ አርዳኢሁ ወይቤሎሙ ንሥኡ ብልዑ ዝ ኅብስት ሥጋየ ውእቱ ለዘበእንቲአክሙ ይትፌተት ለኅድገተ ኃጢአት።',
        a: 'ለወገኖቹ ለደቀ መዛሙርቱ ሰጣቸው። "ንሡ! ብሉ! ይህ ኅብስት ለኃጢአት ማስተሥረያ ሊሆን ስለ እናንተ የሚፈተት ሥጋዬ ነው" አላቸው።',
        e: 'And He gave to His disciples and said unto them: "Take, eat, this bread is My body which will be broken on behalf of you for the remission of sin."' },
      { r: H,
        g: 'አሜን አሜን አሜን ነአምን ወንትአመን፤ ንሴብሐከ ኦ እግዚእነ ወአምላክነ። ከመ ዝንቱ ውእቱ በአማን ነአምን።',
        a: 'አሜን አሜን አሜን እናምናለን፤ እንታመናለን። ጌታችንና አምላካችን ሆይ እናመሰግንሃለን፤ ይህ እርሱ እንደሆነ በእውነት እናምናለን።',
        e: 'Amen Amen Amen: We believe and confess, we glorify You O our Lord and our God; that this is He we truly believe.' },
      { r: K,
        g: 'ወከማሁ ጽዋዐኒ አእኵቶ ባሪኮ ወቀዲሶ ወመጠዎሙ ለእሊአሁ አርዳኢሁ ወይቤሎሙ ንሥኡ ስትዩ ዝ ጽዋዕ ደምየ ውእቱ ለዘበእንቲአክሙ ይትከዐው ለሥርየተ ኃጢአት።',
        a: 'እንዲሁም ጽዋውን አመስግኖ፣ ባርኮ፣ አክብሮ ለወገኖቹ ለደቀ መዛሙርት ሰጣቸው። "ንሡ! ጠጡ! ይህ ጽዋ ለብዙ ሰዎች ቤዛ ሊሆን ስለ እናንተ የሚፈስ ደሜ ነው" አላቸው።',
        e: 'And likewise also the cup: giving thanks, blessing it, and hallowing it, He gave it to His disciples, and said unto them, "Take, drink; this cup is My blood which will be shed on behalf of you as a propitiation for many."' },
      { r: H,
        g: 'አሜን አሜን አሜን ነአምን ወንትአመን ንሴብሐከ ኦ እግዚእነ ወአምላክነ። ከመ ዝንቱ ውእቱ በአማን ነአምን።',
        a: 'አሜን አሜን አሜን እናምናለን፤ እንታመናለን። ጌታችንና አምላካችን ሆይ እናመሰግንሃለን፤ ይህ እርሱ እንደሆነ በእውነት እናምናለን።',
        e: 'Amen Amen Amen: We believe and confess, we glorify You, O our Lord and our God; that this is He we truly believe.' },
      { r: K, g: 'ወሶበ ትገብርዎ ለዝንቱ ተዝካረ ዚአየ ግበሩ።',
        a: '"ይህንን በምታደርጉበት ጊዜ የኔን መታሰቢያ አድርጉ።"',
        e: '"And as often as you do this, do it in remembrance of Me."' },
      { r: H,
        g: 'ንዜኑ ሞተከ እግዚኦ ወትንሣኤከ ቅድስተ። ነአምን ዕርገተከ ወዳግመ ምጽአተከ። ንሴብሐከ ወንትአምነከ። ንስእለከ ወናስተበቍአከ ኦ እግዚእነ ወአምላክነ።',
        a: 'አቤቱ ሞትህንና ቅድስት ትንሣኤህን እንናገራለን። ዕርገትህን፣ ዳግመኛም መምጣትህን እናምናለን። እናመሰግንሃለን፤ እናምንሃለንም። ጌታችንና አምላካችን ሆይ እንለምንሃለን፤ እንማልድሃለንም።',
        e: 'We proclaim Your death, Lord, and Your holy resurrection; we believe in Your ascension and Your second advent. We glorify You, and confess You, we offer our prayer unto You and supplicate You, O our Lord and our God.' }
    ]
  },

  /* ============ 25 ============ */
  {
    id: 's25',
    title: 'ኤጲቅሌሲስ — ፈኑ መንፈሰ ቅዱሰ',
    core: true,
    note: 'መንፈስ ቅዱስ እንዲወርድ የሚለመንበት ዋና ክፍል።',
    lines: [
      { r: K,
        g: 'ይእዜኒ እግዚኦ ንዜከር ሞተከ ወትንሣኤከ ንትአመነከ ወናቄርብ ለከ ዘንተ ኅብስተ ወዘንተ ጽዋዐ እንዘ ነአኵተከ ወቦቱ ረሰይከ ለነ ለተድላ ንቁም ቅድሜከ ወለከ ንትከሀን።',
        a: 'አሁንም አቤቱ ሞትህንና ትንሣኤህን እናስባለን፤ እናምንሃለን፤ እያመሰገንን ይህን ኅብስት ይህንም ጽዋ እናቀርብልሃለን። በፊትህ እንቆም ዘንድ አንተንም እናገለግል ዘንድ በርሱ ተድላን አደረግህልን።',
        e: 'Now, Lord, we remember Your death and Your resurrection. We confess You and we offer unto You this bread and this cup, giving thanks unto You; and thereby You have made us worthy of the joy of standing before You and ministering to You.' },
      { r: K,
        g: 'ንስእለከ እግዚኦ ወናስተበቊዐከ ከመ ትፈኑ ቅዱሰ መንፈሰ ወኃይለ ዲበ ዝንቱ ኅብስት ወላዕለ ዝንቱ ጽዋዕ ይረስዮ ሥጋሁ ወደሞ ለእግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ ለዓለመ ዓለም።',
        a: 'አቤቱ እንለምንሃለን፤ እንማልድሃለንም። በዚህ ኅብስት ላይ፣ በዚህም ጽዋ ላይ ቅዱስ መንፈስን ኃይልንም ታሳድር ዘንድ፤ የጌታችንና የአምላካችን የመድኃኒታችን የኢየሱስ ክርስቶስ ሥጋና ደም ያደርገው ዘንድ ለዘለዓለሙ።',
        e: 'We pray You and beseech You, Lord, that You would send the Holy Spirit and power upon this bread and upon this cup. May He make them the body and blood of our Lord and our God and our Savior Jesus Christ, world without end.' },
      { r: H,
        g: 'አሜን እግዚኦ መሐረነ፤ እግዚኦ መሐከነ፤ እግዚኦ ተሣሃለነ።',
        a: 'አሜን። አቤቱ ማረን፤ አቤቱ ራራልን፤ አቤቱ ይቅር በለን።',
        e: 'Amen; Lord have pity upon us, Lord spare us, Lord have mercy upon us.' },
      { r: D,
        g: 'በኵሉ ልብ ናስተብቊዖ ለእግዚአብሔር አምላክነ ኅብረተ መንፈስ ቅዱስ ሠናየ ከመ ይጸግወነ።',
        a: 'ያማረ የመንፈስ ቅዱስን አንድነት ይሰጠን ዘንድ በፍጹም ልብ አምላካችንን እግዚአብሔርን እንማልደው።',
        e: 'With all the heart let us beseech the Lord our God that He grant unto us good communion of the Holy Spirit.' },
      { r: H,
        g: 'በከመ ሀሎ ህልወ ወይሄሉ ለትውልደ ትውልድ ለዓለመ ዓለም።',
        a: 'በፊት እንደነበረ ለዘለዓለሙ ለልጅ ልጁ ይኖራል።',
        e: 'As it was, is and shall be unto generations of generations, world without end.' },
      { r: H,
        g: 'ሀበነ ንኅበር በዘዚአከ መንፈስ ቅዱስ፤ ወፈውሰነ በዝንቱ ጵርስፎራ፤ ከመ ብከ ንሕየው ዘለኵሉ ዓለም፤ ወለዓለመ ዓለም።',
        a: 'የአንተ በሚሆን በመንፈስ ቅዱስ አንድ እንሆን ዘንድ፤ በዚሁም በሥጋው በደሙ አድነን። ለዓለሙ ሁሉ በምትሆን በአንተ ለዘለዓለሙ ሕያው እንሆን ዘንድ።',
        e: 'Grant us to be united through Your Holy Spirit, and heal us by this oblation that we may live in You for ever.' },
      { r: H,
        g: 'ቡሩክ ስሙ ለእግዚአብሔር። ወቡሩክ ዘይመጽእ በስመ እግዚአብሔር። ወይትባረክ ስመ ስብሐቲሁ፤ ለይኩን፤ ለይኩን፤ ቡሩከ ለይኩን። ፈኑ ጸጋ መንፈስ ቅዱስ ላዕሌነ።',
        a: 'የእግዚአብሔር ስሙ ምስጉን ነው። በእግዚአብሔር ስም የሚመጣውም ምስጉን ነው፤ የጌትነቱም ስም ይመስገን፤ ይሁን ይሁን የተመሰገነ ይሁን። የመንፈስ ቅዱስ ጸጋን ላክልን።',
        e: 'Blessed be the name of the Lord, and blessed be He that cometh in the name of the Lord, and let the name of His Glory be blessed. So be it, so be it, so be it blessed. Send the grace of the Holy Spirit upon us.' }
    ]
  },

  /* ============ 26 ============ */
  {
    id: 's26',
    title: 'ጸሎተ ፈትቶ',
    lines: [
      { r: K,
        g: 'እግዚአብሔር ገባሬ ኵሉ ወጣኔ ኵሉ ወፈጻሜ ኵሉ አኃዜ ኵሉ ወጸባጤ ኵሉ ዘሎቱ ይሰግዱ መላእክት ወሊቃነ መላእክት መናብርት ወሥልጣናት አጋዕዝት ወኃይላት ፀሐይ ወወርኅ።',
        a: 'ሁሉን የፈጠረ፣ ሁሉን የጀመረ፣ ሁሉን የጨበጠ እግዚአብሔር፤ መላእክትና የመላእክት አለቆች፣ መናብርትና ሥልጣናት፣ አጋዕዝትና ኃይላት፣ ፀሐይና ጨረቃ የሚሰግዱለት።',
        e: 'God, maker of all, the Beginner of all, the Completer of all, the Almighty, the Holder of all, You are He whom angels, archangels, thrones, authorities, lords, powers, the sun, the moon worship.' },
      { r: D, g: 'ጸልዩ።', a: 'ጸልዩ።', e: 'You pray.' },
      { r: H,
        g: 'አቡነ ዘበሰማያት ይትቀደስ ስምከ ትምጻእ መንግሥትከ ወይኩን ፈቃደከ በከመ በሰማይ ከማሁ በምድር ሲሳየነ ዘለለዕለትነ ሀበነ ዮም ኅድግ ለነ አበሳነ ወጌጋየነ ከመ ንሕነኒ ንኅድግ ለዘአበሰ ለነ ኢታብአነ እግዚኦ ውስተ መንሱት አላ አድኅነነ ወባልሐነ እምኵሉ እኩይ እስመ ዚአከ ይእቲ መንግሥት ኃይል ወስብሐት ለዓለመ ዓለም።',
        a: 'አባታችን ሆይ በሰማይ የምትኖር፣ ስምህ ይቀደስ፣ መንግሥትህ ትምጣ፣ ፈቃድህ በሰማይ እንደሆነች እንዲሁም በምድር ትሁን። የዕለት እንጀራችንን ስጠን ዛሬ። በደላችንንም ይቅር በለን፣ እኛ የበደሉንን ይቅር እንደምንል። አቤቱ ወደ ፈተናም አታግባን፣ ከክፉ አድነን እንጂ። መንግሥት ያንተ ናትና ኃይልም ምስጋናም ለዘላለሙ።',
        e: 'Our Father who are in heaven, hallowed be Your name, Your kingdom come, Your will be done on earth as it is in heaven; give us this day our daily bread, and forgive us our trespasses as we forgive them that trespass against us, and lead us not into temptation but deliver us from all evil: for Yours is the kingdom, the power and the glory forever and ever.' },
      { r: H,
        g: 'በከመ ምሕረትከ አምላክነ ወአኮ በከመ አበሳነ። (፫ ጊዜ)',
        a: 'አምላካችን ሆይ እንደ ቸርነትህ ነው እንጂ እንደ በደላችን አይሁን። (፫ ጊዜ)',
        e: 'According to Your mercy, our God, and not according to our sins. (three times)' },
      { r: H,
        g: 'ሠራዊተ መላእክቲሁ ለመድኃኔ ዓለም ዬ ዬ ዬ ይቀውሙ ቅድሜሁ ለመድኃኔ ዓለም። ወይኬልልዎ ለመድኃኔ ዓለም ዬ ዬ ዬ ሥጋሁ ወደሙ ለመድኃኔ ዓለም።',
        a: 'የመድኃኔ ዓለም አገልጋዮች የሚሆኑ የመላእክት ሠራዊት፣ ወዮ ወዮ ወዮ፣ በመድኃኔ ዓለም ፊት ይቆማሉ። መድኃኔ ዓለምን ያመሰግኑታል፣ ወዮ ወዮ ወዮ፣ የመድኃኔ ዓለም ሥጋውና ደሙ።',
        e: 'The hosts of the angels of the Savior of the world, yé yé yé, stand before the Savior of the world and encircle the Savior of the world, even the body and blood of the Savior of the world.' },
      { r: ND, g: 'አርኅዉ ኆኃተ መኳንንት።', a: 'መኳንንት ደጆችን ክፈቱ።', e: 'Open the gates, princes.' },
      { r: D, g: 'እለ ትቀውሙ አትሕቱ ርእሰክሙ።',
        a: 'የቆማችሁ ሰዎች ራሳችሁን ዝቅ ዝቅ አድርጉ።',
        e: 'You who are standing, bow your heads.' }
    ]
  },

  /* ============ 27 ============ */
  {
    id: 's27',
    title: 'ጸሎተ ንስሓ',
    lines: [
      { r: K,
        g: 'እግዚእ እግዚኦ እግዚአብሔር አብ አኃዜ ኵሉ ዓለም አንተ ውእቱ ዘትፌውስ ቊስለ ነፍስነ ወሥጋነ ወመንፈስነ።',
        a: 'አቤቱ ዓለሙን ሁሉ የያዝህ ጌታችን እግዚአብሔር አብ! የነፍሳችንንና የሥጋችንን የደመ ነፍሳችንንም ቊስል የምታድን አንተ ነህ።',
        e: 'O Lord God, the Father almighty, it is You that heal the wounds of our soul and our body and our spirit.' },
      { r: K,
        g: 'ዘይቤሎ ለአቡነ ጴጥሮስ አንተ ኰኵሕ ወዲበ ዛቲ ኰኵሕ አሐንጻ ለቤተ ክርስቲያንየ ቅድስት ወኢክልዋ አናቅጸ ሲኦል አማስኖታ ወአንቀልቅሎታ።',
        a: 'ለአባታችን ለጴጥሮስ እንዲህ ብሎ የተናገረውን፦ "አንተ አለት መሠረት ነህ፤ በዚችም አለት መሠረት ላይ ክብርት ቤተ ክርስቲያኔን እሠራታለሁ፤ የሲኦልም ደጆች ሊያጠፏትና ሊያነዋውጧት አይችሉም።"',
        e: 'That which He said to our father Peter, "You are a rock and on this rock I will build My Holy Church and the gates of hell shall not prevail against it."' },
      { r: K,
        g: 'ኦ መሐሪ ወመስተሣህል ወመፍቀሬ ሰብእ እግዚአብሔር አምላክነ ዘታአትት ኃጢአተ ዓለም ተወከፍ ንስሓሆሙ ለአግብርቲከ ወለአእማቲከ ወአሥርቅ ላዕሌሆሙ ብርሃነ ሕይወት ዘለዓለም ወሥረይ ሎሙ እግዚኦ ኵሎ ኃጢአቶሙ።',
        a: 'መሐሪ፣ ይቅር ባይ፣ ሰውንም የምትወድ አምላካችን እግዚአብሔር ሆይ! የዓለሙን ኃጢአት የምታስወግድ፤ የወንዶቹንና የሴቶቹን ባሮችህን ንስሓቸውን ተቀበል፤ የዘላለም ደኅንነት የሚሆን ብርሃንንም ግለጽላቸው፤ አቤቱ ኃጢአታቸውንም ሁሉ ይቅር በላቸው።',
        e: 'O pitiful, merciful and lover of man, Lord our God, that take away the sin of the world, accept the penitence of Your servants and Your handmaids, and shine upon them with the light of everlasting life, and forgive them, Lord, all their sins.' }
    ]
  },

  /* ============ 28 — ⭐ ============ */
  {
    id: 's28',
    title: '⭐ ቅድሳት ለቅዱሳን',
    star: true,
    core: true,
    note: 'ወደ ቁርባን ከመቅረብ በፊት። ሕዝቡ እንደገና "አሐዱ አብ ቅዱስ" ይላል።',
    lines: [
      { r: D, g: 'ነጽር።', a: 'አስተውል።', e: 'Give heed.' },
      { r: K, g: 'ቅድሳት ለቅዱሳን።', a: 'ቅድሳት ለቅዱሳን።', e: 'Holy things for the Holy.' },
      { r: H,
        g: 'አሐዱ አብ ቅዱስ።\nአሐዱ ወልድ ቅዱስ።\nአሐዱ ውእቱ መንፈስ ቅዱስ።',
        a: 'አንዱ ቅዱስ አብ ነው።\nአንዱ ቅዱስ ወልድ ነው።\nአንዱ ቅዱስ መንፈስ ቅዱስ ነው።',
        e: 'One is the Holy Father,\none is the Holy Son,\none is the Holy Spirit.' },
      { r: K, g: 'እግዚአብሔር ምስለ ኵልክሙ።', a: 'እግዚአብሔር ከሁላችሁ ጋር ይሁን።', e: 'The Lord be with you all.' },
      { r: H, g: 'ምስለ መንፈስከ።', a: 'ከመንፈስህ ጋራ።', e: 'And with your spirit.' },
      { r: N, a: '— ካህኑን በመከተል ደግመን እንበል —', e: 'Repeat after the priest' },
      { r: H, g: 'እግዚኦ መሐረነ ክርስቶስ።', a: 'አቤቱ ክርስቶስ ማረን።', e: 'Lord have compassion upon us, O Christ!' },
      { r: D, g: 'እለ ውስተ ንስሓ ሀለውክሙ አትሕቱ ርእሰክሙ።',
        a: 'በንስሓ ውስጥ ያላችሁ ራሳችሁን ዝቅ ዝቅ አድርጉ።',
        e: 'You that are penitent, bow your heads.' }
    ]
  },

  /* ============ 29 ============ */
  {
    id: 's29',
    title: 'ሥጋ ቅዱስ ወደም ክቡር',
    core: true,
    lines: [
      { r: K,
        g: 'ሥጋ ቅዱስ ዘበአማን ዝውእቱ ዘእግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ ዘይትወሀብ ለሕይወት ወለመድኃኒት ወለሥርየተ ኃጢአት ለእለ ይነሥኡ እምኔሁ በአሚን።',
        a: 'በእውነት ክቡር የሚሆን የጌታችንና የአምላካችን የመድኃኒታችን የኢየሱስ ክርስቶስ ሥጋ ይህ ነው። አምነው ከእርሱ ለሚቀበሉ ሕይወትና መድኃኒት፣ የኃጢአት ማስተሥረያም ሊሆን የሚሰጥ።',
        e: 'This is the true Holy body of our Lord, God, and Saviour Jesus Christ, that is given for life, salvation, remission of sin unto them that receive of it in faith.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },
      { r: K,
        g: 'ደም ክቡር ዘበአማን ዝ ውእቱ ዘእግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ ዘይትወሀብ ለሕይወት ወለመድኃኒት ወለሥርየተ ኃጢአት ለእለ ይትሜጠው እምኔሁ በአሚን።',
        a: 'በእውነት አምነው ከእርሱ ለሚቀበሉ ሕይወትና መድኃኒት፣ የኃጢአት ማስተሥረያም ሊሆን የሚሰጥ የጌታችንና የአምላካችን የመድኃኒታችን የኢየሱስ ክርስቶስ ክቡር ደም ይህ ነው።',
        e: 'This is the true precious blood of our Lord, God, and Saviour Jesus Christ, which is given for life, salvation, and remission of sins unto those who drink of it in faith.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },
      { r: K, g: 'እስመ ዝንቱ ውእቱ ሥጋሁ ወደሙ ለአማኑኤል አምላክነ ዘበአማን።',
        a: 'በእውነት የአምላካችን የአማኑኤል ሥጋውና ደሙ ይህ ነው።',
        e: 'For this is the body and blood of Emmanuel our very God.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },
      { r: K,
        g: 'አአምን አአምን አአምን ወእትአመን እስከ ደኃሪት እስትንፋስ ከመ ዝንቱ ውእቱ ሥጋሁ ወደሙ ለእግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ ዘነሥአ እምእግዝእትነ ኵልነ ቅድስት ድንግል በክልኤ ማርያም።',
        a: 'አምናለሁ አምናለሁ አምናለሁ፤ እስከ መጨረሻይቱም እስትንፋስ እታመናለሁ፤ በሁለት ወገን ድንግል ከምትሆን ከሁላችን እመቤት ከቅድስት ድንግል ማርያም የነሣው የጌታችንና የአምላካችን የመድኃኒታችንም የኢየሱስ ክርስቶስ ሥጋውና ደሙ ይህ እንደሆነ።',
        e: 'I believe, I believe, I believe and I confess, unto my last breath, that this is the body and blood of our Lord, God, and Saviour Jesus Christ, which He took from the Lady of us all, the Holy Mary of twofold virginity.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },
      { r: K,
        g: 'አአምን አአምን አአምን ወእትአመን ከመ ኢፈልጠ መለኮቱ እምትስብእቱ ኢአሐተ ሰዓተ ወኢከመ ቅጽበት ዓይን።',
        a: 'አምናለሁ አምናለሁ አምናለሁ፤ መለኮቱ ከሰውነቱ አንዲት ሰዓት እንኳን፣ እንደ ዓይን ቅጽበት እንኳ እንዳልተለየም እታመናለሁ።',
        e: 'I believe, I believe, I believe and I confess that His godhead was not separated from His manhood, not for an hour nor for the twinkling of an eye.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' }
    ]
  },

  /* ============ 30 ============ */
  {
    id: 's30',
    title: 'ጸሎት ዘቅድመ ቁርባን',
    note: 'ቁርባን ከመቀበል በፊት ቆራቢዎች ሁሉ የሚሉት።',
    lines: [
      { r: H,
        g: 'ኦ እግዚእየ ኢየሱስ ክርስቶስ አኮ ዘይደልወኒ ትባእ ታሕተ ጠፈረ ቤትየ ርኵስት እስመ አነ አስተቈጣዕኩከ፤',
        a: 'አቤቱ ጌታዬ ኢየሱስ ክርስቶስ ሆይ፣ ርኵስት ከሆነች ከቤቴ ጠፈር በታች ትገባ ዘንድ የሚገባኝ አይደለም፤ እኔ አሳዝኜሃለሁና፤',
        e: 'O my Lord Jesus Christ, I am not worthy for You to come under the roof of my polluted house, for I have provoked You to wrath.' },
      { r: H,
        g: 'ወባሕቱ በእንተ ተኬንዎትከ ወበእንተ ትስብእትከ በእንተ መድኃኒትየ ወበእንተ መስቀልከ ክቡር ወበእንተ ሞትከ ማሕየዊት ወበእንተ ትንሣኤከ በሣልስት ዕለት እስእለከ ወአስተበቍዐከ ኦ እግዚእየ ከመ ታንጽሐኒ እምኵሉ አበሳ ወመርገም።',
        a: 'ነገር ግን ስለ መፍጠርህና እኔን ለማዳን ሰው ስለ መሆንህ፣ ስለ ክቡር መስቀልህም፣ ማሕየዊት ስለምትሆን ስለ ሞትህ፣ በሦስተኛው ቀን ስለ መነሣትህም፣ ጌታዬ ሆይ ከበደልና ከመርገም ሁሉ ታነጻኝ ዘንድ እለምንሃለሁ፤ እማልድሃለሁም።',
        e: 'But for the sake of Your contrivance and Your incarnation for my salvation, for the sake of Your precious cross and Your life-giving death, for the sake of Your resurrection on the third day, I pray You and beseech You, O my Lord, that You would purge me from all guilt and curse.' },
      { r: H,
        g: 'ወሶበ እትሜጠዎ ለምሥጢረ ቅድሳቲከ ኢይኩነኒ ለቅሥት ወኢለኵነኔ፣ አላ መሐረኒ ወተሣሃለኒ፣ ወሀበኒ ቦቱ ሥርየተ ኃጢአትየ ወሕይወተ ነፍስየ።',
        a: 'የቅድስናህንም ምሥጢር በተቀበልሁት ጊዜ ለወቀሳ ለመፈራረጃ አይሁንብኝ፤ ማረኝ ይቅርም በለኝ እንጂ፤ በርሱ የኃጢአቴን ሥርየት የነፍሴንም ሕይወት ስጠኝ።',
        e: 'When I receive Your Holy mystery let it not be unto me for judgment nor for condemnation, but have compassion upon me and have mercy upon me; and through it grant me remission of my sin and life for my soul.' }
    ]
  },

  /* ============ 31 ============ */
  {
    id: 's31',
    title: 'እግዚኦ መሐረነ ክርስቶስ',
    core: true,
    lines: [
      { r: K, g: 'እግዚኦ መሐረነ ክርስቶስ። (፫ ጊዜ)',
        a: 'አቤቱ ክርስቶስ ሆይ ማረን። (፫ ጊዜ)',
        e: 'Lord have compassion upon us, O Christ! (3 times)' },
      { r: H, g: 'በእንተ ማርያም መሐረነ ክርስቶስ። (፫ ጊዜ)',
        a: 'ክርስቶስ ሆይ ስለ ማርያም ብለህ ማረን። (፫ ጊዜ)',
        e: 'For the sake of Mary, have compassion upon us, O Christ! (3 times)' },
      { r: H, g: 'ሰአሊ ለነ ማርያም ወልድኪ ሣህሎ ይክፍለነ።',
        a: 'ማርያም ሆይ! ይቅርታውን ያደርግልን ዘንድ የልጅሽን ምሕረት ለምኝልን።',
        e: 'O Mary, pray for our mercy, so that He may forgive us.' },
      { r: H,
        g: 'እግዚኦ ሰላመከ ሀባ ለሀገር ወጽድቀከኒ ለቤተ ክርስቲያን። አግርር ፀራ ታሕተ እገሪሃ፤ ዕቀብ ሕዝባ ወሃይማኖታ ለሀገሪትነ ኢትዮጵያ።',
        a: 'አቤቱ ጌታ ሆይ ሰላምህን ለሀገር፤ እውነትህንም ለቤተ ክርስቲያን ስጥ። ለሀገራችን ኢትዮጵያ ጠላቶቿን በእግሮቿ ሥር ጣልላት፤ ሕዝቧንና ሃይማኖቷን ጠብቅላት።',
        e: 'O Lord! Grant Your peace to the country and Your truth to the church. For our country Ethiopia, O Lord, bring her enemies under her feet and protect her people and religion.' },
      { r: D,
        g: 'ነአኵቶ ለእግዚአብሔር ቅድሳቶ ነሢአነ ከመ ለሕይወተ ነፍስ ይኩነነ ፈውሰ።',
        a: 'ለነፍሳችን አነዋወር መድኃኒት ይሆነን ዘንድ ሥጋውንና ደሙን ተቀበልን፤ እግዚአብሔርን እናመሰግነዋለን።',
        e: 'We thank God for that we have partaken of His Holy things.' },
      { r: K,
        g: 'አሌዕለከ ንጉሥየ ወአምላኪየ ወእባርክ ለስምከ ቅዱስ ለዓለም ወለዓለመ ዓለም።',
        a: 'ንጉሤና ፈጣሪዬ ሆይ ከፍ ከፍ አደርግሃለሁ። ቅዱስ ስምህንም ለዘለዓለም አመሰግናለሁ።',
        e: 'I will extol You, my King and my God, and I will bless Your Holy name for ever and ever.' },
      { r: H, g: 'አቡነ ዘበሰማያት ኢታብአነ እግዚኦ ውስተ መንሱት።',
        a: 'በሰማይ ያለህ አባታችን ሆይ አቤቱ ወደ ፈተና አታግባን።',
        e: 'Our Father who are in heaven, lead us not, Lord, into temptation.' },
      { r: D, g: 'ተመጦነ እምሥጋሁ ቅዱስ ወእምደሙ ክቡር ለክርስቶስ።',
        a: 'ከክርስቶስ ከቅዱስ ሥጋውና ከክቡር ደሙ ተቀበልን።',
        e: 'We have received of the Holy Body and the precious Blood of Christ.' }
    ]
  },

  /* ============ 32 ============ */
  {
    id: 's32',
    title: 'ቡራኬ ወስንብት',
    core: true,
    lines: [
      { r: H,
        g: 'ኦ ንጉሠ ሰላም ሰላማዊ ኢየሱስ ክርስቶስ ሰላመከ ሀበነ ወአጽንዕ ለነ ሰላመከ ወሥረይ ለነ ኃጣውኢነ ወረስየነ ድልዋነ ከመ ንሑር ወንባእ ውስተ አብያቲነ በሰላም።',
        a: 'የፍቅር ባለቤት የሰላም ንጉሥ ሰላማዊ ኢየሱስ ክርስቶስ ሆይ! ሰላምህን ስጠን፤ ሰላምህን አጽናልን፤ ኃጢአታችንንም ይቅር በለን፤ በሰላም ወደ ቤታችን ሄደን እንገባ ዘንድ የበቃን አድርገን።',
        e: 'O peaceful King of peace, Jesus Christ, grant us Your peace and confirm unto us Your peace, and forgive us our sins, and make us worthy to go out and enter into our homes in peace.' },
      { r: D,
        g: 'አድንኑ አርእስቲክሙ ቅድመ እግዚአብሔር አምላክነ በእደ ገብሩ ካህን ከመ ይባርክክሙ።',
        a: 'አገልጋይ በሚሆን በካህኑ እጅ ይባርካችሁ ዘንድ፤ በአምላካችን በእግዚአብሔር ፊት ራሳችሁን ዝቅ ዝቅ አድርጉ።',
        e: 'Bow your heads in front of the Lord our God, that He may bless you at the hand of His servant the priest.' },
      { r: H, g: 'አሜን። እግዚአብሔር ይባርከነ ወይሣለሃነ።',
        a: 'አሜን። እግዚአብሔር ይባርከን፤ ይቅርም ይበለን።',
        e: 'Amen. May God bless us and forgive us.' },
      { r: K,
        g: 'ኦ እግዚኦ አድኅን ሕዝበከ ወባርክ ርስተከ ረዓዮሙ ወአልዕሎሙ እስከ ለዓለም። ወዕቀባ ለቤተ ክርስቲያንከ ቅድስት እንተ አጥረይካ ወቤዘውካ በደሙ ክቡር ለዋሕድ ወልድከ።',
        a: 'አቤቱ ሕዝብህን አድን፤ ርስትህንም ባርክ። እስከ ዘላለሙ ጠብቃቸው፤ ከፍ ከፍም አድርጋቸው። በአንድ ልጅህ በክቡር ደሙ የዋጀሃት፣ ቤዛም የሆንኻት ቅድስት ቤተ ክርስቲያንህንም ጠብቃት።',
        e: 'O Lord, save Your people and bless Your inheritance. Feed them, lift them up for ever, and keep Your church which You did purchase and ransom with the precious blood of Your only-begotten Son.' },
      { r: K, g: 'እግዚአብሔር የሀሉ ምስለ ኵልክሙ።',
        a: 'እግዚአብሔር ከሁላችሁ ጋር ይሁን።',
        e: 'The Lord be with you all.' },
      { r: H, g: 'ምስለ መንፈስከ።', a: 'ከመንፈስህ ጋራ።', e: 'And with your spirit.' },
      { r: H,
        g: 'አሜን። እግዚአብሔር ይባርከነ ለአግብርቲሁ በሰላም ሥርየተ ይኩነነ። ዘተመጦነ ሥጋከ ወደመከ አብሐነ በመንፈስ ንኪድ ኵሉ ኃይሎ ለጸላዒ።',
        a: 'አሜን። እግዚአብሔር እኛን አገልጋዮቹን በሰላም ይባርክ፤ የተቀበልነው ሥጋህና ደምህ ለሥርየት ይሁነን፤ የጠላትን ኃይል ሁሉ በመንፈስ እንረግጥ ዘንድ አሰልጥነን።',
        e: 'Amen. May God bless us, His servants, in peace. Remission be unto us who have received Your body and Your blood. Enable us by the Spirit to tread upon all the power of the enemy.' },
      { r: H,
        g: 'ጸጋ ነሣእነ ወሕይወተ ረከብነ በኃይለ መስቀሉ ለኢየሱስ ክርስቶስ፤ ኪያከ እግዚኦ ነአኵት ነሢአነ ጸጋ ዘመንፈስ ቅዱስ።',
        a: 'ጸጋን ተቀበልን፤ ደኅንነትንም በኢየሱስ ክርስቶስ በመስቀሉ ኃይል አገኘን። አቤቱ ከመንፈስ ቅዱስ የተገኘ ጸጋን ተቀበልን፤ አንተን እናመሰግንሃለን።',
        e: 'We have received grace and we have found life by the power of the cross of Jesus Christ. Unto You, Lord, do we give thanks, for that we have received grace from the Holy Spirit.' },
      { r: D, g: 'እትዉ በሰላም።', a: 'በሰላም ግቡ።', e: 'Go in peace.' },
      { r: H, g: 'አሜን።', a: 'አሜን።', e: 'Amen.' },
      { r: H, g: 'ስብሐት ለአብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ። አሜን።',
        a: 'ምሥጋና ለአብ ለወልድ ለመንፈስ ቅዱስ ለአንድ አምላክ። አሜን።',
        e: 'Glory to the Father, to the Son, and to the Holy Spirit, One God. Amen.' }
    ]
  },

  /* ============ 33 ============ */
  {
    id: 's33',
    title: 'መዝሙረ ቁርባን — ኑ እንቅረብ',
    note: 'በአማርኛ የሚዘመር የቁርባን መዝሙር።',
    lines: [
      { r: H, a: 'ኑ እንቅረብ መከራ ሳይመጣ፤\nሥጋውን እንብላ ሥጋውን እንብላ ደሙንም እንጠጣ።' },
      { r: H, a: 'የቀራንዮ በግ የአምላክ ሥጋው፤\nተሰውቶልናል እንመገበው።' },
      { r: H, a: 'እድፉን ኃጢያታችን በንስሐ አጥበን፤\nእንቀበል አምነን በልጅነታችን።' },
      { r: H, a: 'መቅረብ ወደ ጌታ በእውነት የሚገባው፤\nበስተእርጅና አይደለም በወጣትነት ነው።' },
      { r: H, a: 'ጨረቃና ፀሐይ ደም የለበሱለት፤\nከዋክብት ከሰማይ የተነጠፉለት፤\nይኸው ተፈተተ እሳተ መለኮት።' },
      { r: H, a: 'ቅድስት እናታችን ቤተ ክርስቲያን፤\nትጋብዘናለች ሥጋና ደሙን።' },
      { r: H, a: 'የአማኑኤል ሥጋ ይኸው ተዘጋጀ፤\nከግብዣው ተጠራን አዋጁ ታወጀ።' },
      { r: H, a: 'ይህ ቁርባን ክቡር ነው ፍጹም ሰማያዊ፤\nእንዳይመስለን ተራ አይደለም ምድራዊ።' },
      { r: H, a: 'ዋ! ምን አፍ ነው የሚቀበለው፤\nዋ! ምን ጥርስ ነው የሚያላምጠው፤\nዋ! ምን ሆድ ነው የሚሸከመው፤\nነበልባል ያለበት የሚያቃጥል ነው።' },
      { r: H, a: 'አምላካችን ሆይ አንተ ይቅር ባይ፤\nእንደ ቸርነትህ በደልን አትይ።' },
      { r: H, a: 'አሜን አሜን ብለን ተቀብለናል፤\nበድፍረትም ሳይሆን በፍርሃት ቀርበናል።' },
      { r: H, a: 'ሱራፌል ኪሩቤል ጸዎርተ መንበር፤\nሊይዙት ያልቻሉት ፈርተውት በክብር።' },
      { r: H, a: 'እኛ ተመገብነው አገኘን ድኅነት፤\nበነፍስ በሥጋችን ሆነልን ሕይወት።' }
    ]
  }

  ]
};

/* ---- ጠቃሚ ተሰጥኦዎች (ፈጣን ልምምድ) ---- */
const QUICK_PAIRS = [
  { c: 'አሐዱ አብ ቅዱስ። አሐዱ ወልድ ቅዱስ። አሐዱ ውእቱ መንፈስ ቅዱስ።',
    r: 'በአማን አብ ቅዱስ። በአማን ወልድ ቅዱስ። በአማን ውእቱ መንፈስ ቅዱስ።', who: 'ካህን → ሕዝብ' },
  { c: 'ተንሥኡ ለጸሎት።', r: 'እግዚኦ ተሣሃለነ።', who: 'ዲያቆን → ሕዝብ' },
  { c: 'ሰላም ለኵልክሙ።', r: 'ምስለ መንፈስከ።', who: 'ካህን → ሕዝብ' },
  { c: 'እግዚአብሔር ምስለ ኵልክሙ።', r: 'ምስለ መንፈስከ።', who: 'ካህን → ሕዝብ' },
  { c: 'ንሰብሖ ለአምላክነ።', r: 'ርቱዕ ይደሉ።', who: 'ካህን → ሕዝብ' },
  { c: 'አእኵትዎ ለአምላክነ።', r: 'ርቱዕ ይደሉ።', who: 'ካህን → ሕዝብ' },
  { c: 'አልዕሉ አልባቢክሙ።', r: 'ብነ ኀበ እግዚአብሔር አምላክነ።', who: 'ካህን → ሕዝብ' },
  { c: 'ቅድሳት ለቅዱሳን።', r: 'አሐዱ አብ ቅዱስ። አሐዱ ወልድ ቅዱስ። አሐዱ ውእቱ መንፈስ ቅዱስ።', who: 'ካህን → ሕዝብ' },
  { c: 'ሰብሕዎ ለእግዚአብሔር ኵልክሙ አሕዛብ።', r: 'ወሴብሕዎ ኵሎሙ ሕዝብ።', who: 'ካህን → ሕዝብ' },
  { c: 'እስመ ጸንዐት ምሕረቱ ላዕሌነ።', r: 'ጽድቁሰ ለእግዚአብሔር ይሄሉ ለዓለም።', who: 'ካህን → ሕዝብ' },
  { c: 'ስግዱ ለእግዚአብሔር በፍርሀት።', r: 'ቅድሜከ እግዚኦ ንሰግድ ወንሴብሐከ።', who: 'ዲያቆን → ሕዝብ' },
  { c: 'ጸልዩ በእንተ ወንጌል ቅዱስ።', r: 'ይረስየነ ድልዋነ ለሰሚዐ ወንጌል ቅዱስ።', who: 'ዲያቆን → ሕዝብ' },
  { c: 'ጸልዩ በእንተ እለ ያበውኡ መባአ።',
    r: 'ተወከፍ መባኦሙ ለአኃው ወተወከፍ መባኦን ለአኃት ለነኒ ተወከፍ መባአነ ወቍርባነነ።', who: 'ዲያቆን → ሕዝብ' },
  { c: 'ንስግድ።', r: 'ለአብ ወወልድ ወመንፈስ ቅዱስ እንዘ ሠለስቱ አሐዱ።', who: 'ካህን → ሕዝብ' },
  { c: 'ሰላም ለኪ።', r: 'ቅድስት ቤተ ክርስቲያን ማኅደረ መለኮት።', who: 'ካህን → ሕዝብ' },
  { c: 'ሰአሊ ለነ።', r: 'ድንግል ማርያም ወላዲተ አምላክ።', who: 'ካህን → ሕዝብ' },
  { c: 'አውሥኡ።',
    r: 'ቅዱስ ቅዱስ ቅዱስ እግዚአብሔር ጸባዖት ፍጹም ምሉዕ ሰማያተ ወምድረ ቅድሳተ ስብሐቲከ።', who: 'ዲያቆን → ሕዝብ' },
  { c: 'ጸልዩ በእንተ ዛቲ ቤተ ክርስቲያን ቅድስት ወማኅበርነ በውስቴታ።',
    r: 'ማኅበረነ ባርክ ዕቀብ በሰላም።', who: 'ዲያቆን → ሕዝብ' },
  { c: 'እትዉ በሰላም።', r: 'አሜን።', who: 'ዲያቆን → ሕዝብ' },
  { c: 'ንበል ኵልነ በጥበበ እግዚአብሔር ጸሎተ ሃይማኖት።',
    r: 'ነአምን በአሐዱ አምላክ ገባሬ ኵሉ ፍጥረት…', who: 'ዲያቆን → ሕዝብ' }
];
