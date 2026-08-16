/* =========================================================================
   የቅዳሴ መልመጃ አፕ — የቅዳሴ ጸሎት ውሂብ (Liturgical Data)
   ኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን
   -------------------------------------------------------------------------
   ማሳሰቢያ፦ ይህ ጸሎት ለመማርና ለመልመጃ የተዘጋጀ ነው። ለትክክለኛው
   የቅዳሴ ሥርዓት በቤተ ክርስቲያን የጸደቀውን መጽሐፈ ቅዳሴ ይመልከቱ።
   ========================================================================= */

// ── የሥርዓተ ቅዳሴ ዘማ (ዜማ) ዓይነቶች
const ZEMA = {
  GEEZ:   { id: 'geez',   am: 'ግዕዝ',   en: 'Ge\'ez',     desc: 'የዘወትር በዓላት ሰላማዊና ግርማ ሞገስ ያለው ዜማ' },
  EZEL:   { id: 'ezel',   am: 'ዕዝል',   en: 'Ezel',       desc: 'የጾም ወቅት ንስሐ የሚገባ የሐዘን ዜማ' },
  ARARAY: { id: 'araray', am: 'አራራይ', en: 'Araray',     desc: 'የደስታ በዓላት (ትንሣኤ፣ ገና...) ደስተኛ ዜማ' },
};

// ── ተናጋሪ / አገልጋይ
const SPEAKER = {
  PRIEST:  { id: 'priest',  am: 'ካህን',  en: 'Priest' },
  DEACON:  { id: 'deacon',  am: 'ዲያቆን', en: 'Deacon' },
  PEOPLE:  { id: 'people',  am: 'ሕዝብ',  en: 'People' },
  ALL:     { id: 'all',     am: 'ሁሉም',  en: 'All' },
};

/* --------------------------------------------------------------------------
   የተጋሩ ጸሎቶች (ለሁለቱም የእሁድና የጾም ቅዳሴ የሚሠሩ)
   እያንዳንዱ መስመር: { ge: ግዕዝ, am: አማርኛ, tr: ትራንስሊትሬሽን, en: እንግሊዝኛ }
-------------------------------------------------------------------------- */

const PRAYER = {
  // ── መክፈቻ / Opening
  opening: [
    { ge: 'በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ።',
      am: 'በአብ በወልድ በመንፈስ ቅዱስ ስም አንድ አምላክ።',
      tr: 'Be-sma Ab wawald wamenfas Qiddus ahadu Amlak.',
      en: 'In the Name of the Father, and the Son, and the Holy Spirit, One God.' },
    { ge: 'አሜን።',
      am: 'አሜን።',
      tr: 'Amen.',
      en: 'Amen.' },
  ],

  // ── የሰዓታት/የመልመጃ መክፈቻ ጸሎት
  lordBeWithYou: [
    { ge: 'እግዚአብሔር ምስለ ኵልክሙ።',
      am: 'እግዚአብሔር ከሁላችሁ ጋር ይሁን።',
      tr: 'Egziabher mesle kulkemu.',
      en: 'The Lord be with you all.' },
    { ge: 'ወምስለ መንፈስከ።',
      am: 'ከመንፈስህም ጋር።',
      tr: 'Wemesle menfeske.',
      en: 'And with your spirit.' },
  ],

  // ── ጸሎተ ሃይማኖት / የሃይማኖት ጸሎት (The Creed)
  creed: [
    { ge: 'ነአምን በአሐዱ አምላክ እግዚአብሔር አብ አኃዜ ኵሉ ገባሬ ሰማያት ወምድር ዘያስተርኢ ወዘኢያስተርኢ።',
      am: 'እናምናለን በአንድ አምላክ በእግዚአብሔር አብ ሁሉን በያዘ፣ ሰማይንና ምድርን፣ የሚታይን የማይታይን የፈጠረ።',
      tr: 'Naamen be-ahadu Amlak Egziabher Ab ahaaze kulu gabare samayat wamedr ze-yastareye waze-yastareye.',
      en: 'We believe in one God, the Father Almighty, maker of heaven and earth, of all things visible and invisible.' },
    { ge: 'ወነአምን በአሐዱ እግዚእ ኢየሱስ ክርስቶስ ወልደ አብ ዋሕድ ዘህልው ምስሌሁ እምቅድመ ይትፈጠር ዓለም።',
      am: 'እናምናለን በአንድ ጌታ በኢየሱስ ክርስቶስ የአብ ብቸኛ ልጅ፣ ዓለም ሳይፈጠር ከእርሱ ጋር የነበረ።',
      tr: 'Wenaamen be-ahadu Egzie Iyesus Kristos welde Ab wahid ze-halwu meslehu em-qidme yetfater alem.',
      en: 'And in one Lord Jesus Christ, the only-begotten Son of the Father, who was with Him before the creation of the world.' },
    { ge: 'ብርሃን ዘእምብርሃን አምላክ ዘእምአምላክ ወልድ ለአብ በሥጋ የተወለደ እምቅድመ ኵሉ ዘመን።',
      am: 'ብርሃን ከብርሃን፣ አምላክ ከአምላክ፣ ከሁሉ ዘመን በፊት በሥጋ የተወለደ የአብ ልጅ።',
      tr: 'Berhan ze-em-berhan, Amlak ze-em-Amlak, welde Ab besega yetwalade em-qidme kulu zeman.',
      en: 'Light of Light, God of God, the Son of the Father, born in the flesh before all time.' },
    { ge: 'ወተዋሕዶ ምስሌነ ወእስክንብር በሥጋ እምቅድስት ድንግል ማርያም።',
      am: 'ከእኛ ጋር ተዋሕዷል፤ ከቅድስት ድንግል ማርያም በሥጋ ተወልዷል።',
      tr: 'Watawahdo meslene wa-eskembr besega em-qiddist Dingel Maryam.',
      en: 'And He took our nature, and was incarnate of the Holy Virgin Mary.' },
    { ge: 'ሰቀልዎ ወመስለካም፤ ቀበርዎ ወተንሥአ በእምነት ዘፍጹም።',
      am: 'ሰቅለውታል፣ መቀበሪያውም ተቀብሮአል፣ በፍጹም እምነት ተነሥቷል።',
      tr: 'Sekelu wo wameslekam; qaberwo watensa-e ba-emnet ze-fesum.',
      en: 'They crucified Him, and He was buried; He rose again in perfect faith.' },
    { ge: 'ወነአምን በመንፈስ ቅዱስ ገዛኤ ኵሉ ሕያው መስሐለ እምአብ ወእምወልድ።',
      am: 'እናምናለን በመንፈስ ቅዱስ፣ የሁሉ ገዢ፣ ሕያው አድራጊ፣ ከአብና ከወልድ የሚወጣ።',
      tr: 'Wenaamen be-Menfes Qiddus gazae kulu hayaw meshalhu em-Ab wa-em-Wald.',
      en: 'And we believe in the Holy Spirit, the Lord and giver of life, who proceeds from the Father and the Son.' },
    { ge: 'ወአንቀጽተ ውስተ ባሕረ ዓመፅ ወሐተት ለነ አብን ወወልድን ወመንፈስ ቅዱስን። አሜን።',
      am: 'በዓመፅ ባሕር ውስጥ ጠመቅን፤ አብን ወልድን መንፈስ ቅዱስን ማግኘታችን ነው። አሜን።',
      tr: 'Wa-anqetat westa bahare amez wahatat lenen Abn wawaldn wamenfas Qiddusn. Amen.',
      en: 'We are baptized into the sea of iniquity; we have received the Father, the Son, and the Holy Spirit. Amen.' },
  ],

  // ── ነአኲቶ ለገባሬ ሠናያት (የቅዱስ ባስልዮስ ምስጋና)
  neakut: [
    { ge: 'ነአኲቶ ለገባሬ ሠናያት ላዕሌነ እግዚአብሔር መሐሪ አብ ለእግዚእነ ወአምላክነ ወመድኃኒነ ኢየሱስ ክርስቶስ።',
      am: 'ለእኛ በጎ ነገርን ለሠራ፣ ምሕረተኛ ለሆነው እግዚአብሔር፣ ለጌታችንና ለአምላካችን ለመድኃኒታችን ለኢየሱስ ክርስቶስ አባት እናመሰግናለን።',
      tr: 'Na-akuto le-gabare sanayat la-alena Egziabher mehari Ab le-egzi-ena wa-amlakena wa-madhanina Iyesus Kristos.',
      en: 'We give thanks unto the doer of good things unto us, the merciful God, the Father of our Lord and our God and our Saviour Jesus Christ.' },
    { ge: 'እስመ ከሠተ ላዕሌነ ምሕረቶ ወአኅደቀ ለነ ኪዳነ ዘልፈ።',
      am: 'ምሕረቱን በእኛ ላይ ሸፍኖአል፤ ለዘላለም ኪዳንም አድርጎልናል።',
      tr: 'Esma kasaete la-alena mehretu wa-ahdeke lena kidane zalfe.',
      en: 'For He hath covered us with His mercy, and made an everlasting covenant with us.' },
    { ge: 'ወነዓውቅ በሥጋ ውእቱ ወበራህም እምነገሥት ወካህናት።',
      am: 'በሥጋ እርሱን እናውቃለን፤ ከነገሥታትና ከካህናት የበለጠም እናከብረዋለን።',
      tr: 'Wanayuq besega wu-etu wabarahm em-negusat wakahinat.',
      en: 'And we know Him in the flesh, and honor Him above kings and priests.' },
  ],

  // ── ቅዱስ ቅዱስ ቅዱስ (Sanctus)
  sanctus: [
    { ge: 'ቅዱስ ቅዱስ ቅዱስ እግዚአብሔር ጸባኦት፤ ምልእት ሰማያት ወምድር ስብሐተ ግርማከ።',
      am: 'ቅዱስ ቅዱስ ቅዱስ የሠራዊት እግዚአብሔር፤ ሰማያትና ምድር በክብርህ ተሞልተዋል።',
      tr: 'Qiddus Qiddus Qiddus Egziabher Sabbaot; mel-et samayat wamedr sebhat le-girmake.',
      en: 'Holy, Holy, Holy, Lord of Hosts; heaven and earth are full of the glory of Thy majesty.' },
    { ge: 'ሆሣዕና ውስተ ሰማያት፤ ሆሣዕና በአርያም፤ ቡሩክ ዘይመጽእ በስመ እግዚአብሔር፤ ሆሣዕና በአርያም።',
      am: 'ሆሣዕና በሰማያት፤ ሆሣዕና በአርያም፤ በእግዚአብሔር ስም የሚመጣ ቡሩክ ነው፤ ሆሣዕና በአርያም።',
      tr: 'Hosanna westa samayat; Hosanna ba-ar-yam; buruk ze-yematsie be-sma Egziabher; Hosanna ba-ar-yam.',
      en: 'Hosanna in the highest; Hosanna in the heights; Blessed is He who comes in the Name of the Lord; Hosanna in the heights.' },
  ],

  // ── ትእዛዝ / የቁርባን ምስጢር (Words of Institution)
  institution: [
    { ge: 'ወአእመረ ቅብአቶ ለእግዚእነ ኢየሱስ ክርስቶስ፤ በዝንቱ ሌሊት እንዘ የትሐበ ወአንበረ ቅድሜሁ እንጸሕ ወባረከ ወቀደሰ።',
      am: 'ጌታችን ኢየሱስ ክርስቶስ በተዋሕደበት በዚያች ሌሊት እንጀራን በፊቱ አኖረ፤ ባረከውም ቀደሰውም።',
      tr: 'Wa-aemara qebato la-egzie-na Iyesus Kristos; bezentu lelit enze yetehabe wa-anbara qidmehu enzesah wabareke waqaddese.',
      en: 'And our Lord Jesus Christ, in the night in which He was betrayed, took bread and set it before Him, blessed it and hallowed it.' },
    { ge: 'ወከሠተ ምስጢረ እግዚአብሔር አቡሁ ለእመ በእንጀራ ሥጋሁ ወበወይን ደሙ ተሰእለ።',
      am: 'የእግዚአብሔር አባቱን ምስጢር ገለጠ፤ በእንጀራ ሥጋውን በወይን ደሙን አቀረበ።',
      tr: 'Wakasate mistere Egziabher Abuhu la-ema ba-enzajah sigahu wabawen damu tasala.',
      en: 'He revealed the mystery of God His Father, that in bread His body and in wine His blood were given.' },
  ],

  // ── ይረስዮ መንፈስ ቅዱስ (Epiclesis / መንፈስ ቅዱስ መውረድ)
  epiclesis: [
    { ge: 'ይረስዮ መንፈስ ቅዱስ ሥጋሁ ወደሙ፤ በእንጀራ ዘውእቱ ወበወይን ዘውእቱ።',
      am: 'መንፈስ ቅዱስ ይወርድባቸውና ይህ እንጀራ ሥጋው ይህም ወይን ደሙ ይሁን።',
      tr: 'Yeresyo Menfes Qiddus sigahu wadamu; ba-enzajah ze-wu-etu wabawen ze-wu-etu.',
      en: 'May the Holy Spirit come down and make them, this bread and this wine, His Body and His Blood.' },
    { ge: 'በመንፈስ ቅዱስ እግዚአብሔር ተፈጥረዋል ወተመስለዋል።',
      am: 'በመንፈስ ቅዱስ የእግዚአብሔር ሥጋና ደም ይሆናሉ።',
      tr: 'Ba-Menfes Qiddus Egziabher tefetrewal wo-temeselwal.',
      en: 'By the Holy Spirit they become and are made the Body and Blood of God.' },
  ],

  // ── አቡነ ዘበሰማያት (የጌታ ጸሎት)
  abun: [
    { ge: 'አቡነ ዘበሰማያት ይትቀደስ ስምከ። ትምጻእ መንግሥትከ። ወይኩን ፈቃድከ በከመ በሰማይ ከማሁ በምድር።',
      am: 'በሰማያት ያለህ አባታችን ሆይ ስምህ ይቀደስ። መንግሥትህ ትምጣ። ፈቃድህ በሰማይ እንደሆነች እንዲሁም በምድር ትሁን።',
      tr: 'Abun ze-besamayat yetqaddes smke. Temtsae mengestke. Waykun feqadke bakema besamay kamahu bemedr.',
      en: 'Our Father who art in heaven, hallowed be Thy Name. Thy kingdom come. Thy will be done on earth as it is in heaven.' },
    { ge: 'ሀበነ ዮም ርእየ ቀዊመ። ወሐድግ ለነ አበሳነ ከመ ንሕነኒ ንሐድግ ለእለ አበሱ ለነ።',
      am: 'የዕለት እንጀራችንን ዛሬ ስጠን። ኃጢአታችንንም ይቅር በለን፤ እኛም ያበደሉንን ይቅር እንላለን።',
      tr: 'Habena yom re-ya qaweme. Wahadeg lena abesana kama nehnene nehadeg la-ela abesu lena.',
      en: 'Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us.' },
    { ge: 'ወኢታብአነ ውስተ መንሱት፤ ወአድኅነነ እምከፉ ዓለም። አሜን።',
      am: 'ወደ ፈተናም አታግባን፤ ከክፉ ዓለም አድነን። አሜን።',
      tr: 'Wa-e-tab-ana westa mensut; wa-adhanena em-kefu alem. Amen.',
      en: 'And lead us not into temptation, but deliver us from the evil one. Amen.' },
  ],

  // ── ጸሎተ አኰቴት (የምስጋና ጸሎት)
  aqwetat: [
    { ge: 'ጸሎተ አኰቴት ዘዘፈትክዎ በልብ ፍጹም እምቅድመ ታቦተ ኪዳን።',
      am: 'ከቃል ኪዳኑ ታቦት በፊት በፍጹም ልብ የተገለጸው የምስጋና ጸሎት።',
      tr: 'Selote aqwetat ze-zeftukwo belib fesum em-qidme tabote kidan.',
      en: 'The Prayer of Thanksgiving recited with a perfect heart before the Ark of the Covenant.' },
    { ge: 'አቤቱ ገብረ ኪዳንከ ወገብረ ምሕረትከ ላዕሌነ ለተዋሕዶና ለምሥጢረ ትስብእት።',
      am: 'አቤቱ ኪዳንህን ምሕረትህን በእኛ ላይ ሠርተሃል፤ ተዋሕዶንና የሰውን ምስጢር ገልጠሃል።',
      tr: 'Abutu gabra kidanke wagabra mehretke la-alena l-tawhidona l-mestire tsibe-et.',
      en: 'O Lord, Thou hast shown Thy covenant and Thy mercy upon us, revealing the unity and the mystery of the Incarnation.' },
  ],

  // ── ጸሎተ ምሕላ (የልመና ጸሎት)
  mehla: [
    { ge: 'ጸልዩ በእንተ ሰላም፤ ስለ ሰላም ጸልዩ።',
      am: 'ስለ ሰላም ጸልዩ፤ ስለ ሰላም ጸልዩ።',
      tr: 'Selyu ba-enta selam; sela selam selyu.',
      en: 'Pray for the peace; pray for the peace.' },
    { ge: 'ስለ ሰላመ ቤተ ክርስቲያን ወስለ ሰላመ ዓለም ሁሉ ለእግዚአብሔር ንጸሊ።',
      am: 'ስለ ቤተ ክርስቲያን ሰላም እና ስለ ዓለም ሁሉ ሰላም ለእግዚአብሔር ንጸልይ።',
      tr: 'Sela selame beta Kristiyan wasela selame alem hulu le-Egziabher netseli.',
      en: 'For the peace of the Church and for the peace of the whole world, let us pray to the Lord.' },
    { ge: 'እግዚአብሔር ምሕረቶ ወበረከቶ ለአባቶሙ ለካህናት ወለዲያቆናት ይሁብ።',
      am: 'እግዚአብሔር ምሕረቱንና በረከቱን ለካህናትና ለዲያቆናት ይስጣቸው።',
      tr: 'Egziabher mehretu wabereketu la-abatomu la-kahinat wala-diyaqonat yahab.',
      en: 'May the Lord grant His mercy and blessing to the priests and the deacons.' },
  ],

  // ── ዘካልእ መልእክት (ሁለተኛ መልእክት / የሐዋርያ ንባብ)
  epistle: [
    { ge: 'ንባበ መልእክት ዘቅዱስ ጳውሎስ ለሮሜ ሰብእ።',
      am: 'የቅዱስ ጳውሎስ መልእክት ንባብ ለሮሜ ሰዎች።',
      tr: 'Nibabe mel-ekt ze-Qiddus Pawlos la-Rome sebe.',
      en: 'The reading of the Epistle of St. Paul to the Romans.' },
    { ge: 'ንጹሕ ንውኃ ውስተ ልብክሙ ወነፍስክሙ።',
      am: 'በልባችሁና በነፍሳችሁ ንጹሕ ውኃ ይኑር።',
      tr: 'Nesuh nuha westa lebkemu wanefeskemu.',
      en: 'Let pure water be in your hearts and in your souls.' },
  ],

  // ── ወንጌል (Gospel)
  gospel: [
    { ge: 'ሰላም ለክሙ ሕዝበ እግዚአብሔር፤ ወለነኒ ሰላም እምኀቤ እግዚአብሔር ይሁን።',
      am: 'ሰላም ለእናንተ የእግዚአብሔር ሕዝብ፤ ከእግዚአብሔር ዘንድ ሰላም ለእኛም ይሁን።',
      tr: 'Selam lekemu hezba Egziabher; walenani selam em-habe Egziabher yahun.',
      en: 'Peace be unto you, people of God; and peace from the Lord be also unto us.' },
    { ge: 'ወሰሚዖ ወሬዛ ዘንተ ነገረ፤ እንዘ ይሴኮዝ እስመ ቦ ብዙኀ ጥሪት።',
      am: 'ይህንን ነገር የሰሙት ብዙ ሀብት ስላላቸው እያዘኑ ሄዱ።',
      tr: 'Wasamio weriza zanta negara; enze yisekon ezma bo bezuhe terit.',
      en: 'When they heard this, they went away sorrowful, for they had great possessions.' },
  ],

  // ── ጸሎተ አንድነት (የአንድነት ጸሎት)
  anedinet: [
    { ge: 'አንድ እግዚአብሔር አንድ ሃይማኖት አንድ ጥምቀት አንድ ቤተ ክርስቲያን።',
      am: 'አንድ እግዚአብሔር፣ አንድ ሃይማኖት፣ አንድ ጥምቀት፣ አንድ ቤተ ክርስቲያን።',
      tr: 'And Egziabher, and Haymanot, and temqat, and beta Kristiyan.',
      en: 'One God, one faith, one baptism, one Church.' },
    { ge: 'አንድ ካህን ወአንድ ሊቀ ካህናት ለእግዚአብሔር ኢየሱስ ክርስቶስ።',
      am: 'ለእግዚአብሔር ለኢየሱስ ክርስቶስ አንድ ካህን አንድ ሊቀ ካህናት።',
      tr: 'And kahan wa-and liqe kahinat le-Egziabher Iyesus Kristos.',
      en: 'One priest, and one High Priest, our Lord Jesus Christ.' },
  ],

  // ── ቁርባን (Communion)
  communion: [
    { ge: 'ተሰጥዎ ተቀበሉ እግዚአብሔር የተሰጣችሁ አይሁድ ነው።',
      am: 'ተሰጣችሁ ተቀበሉ፤ ይህ የእግዚአብሔር ተስፋ ነው።',
      tr: 'Teseqyewo teqabelu Egziabher ye-tesqachu ayyu-hud new.',
      en: 'Receive and take; this is the pledge of God that is given unto you.' },
    { ge: 'እግዚአብሔር ምስለ ኵልክሙ። ወምስለ መንፈስከ።',
      am: 'እግዚአብሔር ከሁላችሁ ጋር። ከመንፈስህም ጋር።',
      tr: 'Egziabher mesle kulkemu. Wemesle menfeske.',
      en: 'The Lord be with you all. And with your spirit.' },
  ],

  // ── ምስጋና / ከቁርባን በኋላ
  thanksgiving: [
    { ge: 'እንተ ገብረከ ለነ ምስጋና ይሁነከ እግዚኦ አምላክነ።',
      am: 'ለእኛ ያደረግኸው ምስጋና ለአንተ ይሁን አቤቱ አምላካችን።',
      tr: 'Enta gabreke lenan mesgana yahuneke Egzie-o Amlakena.',
      en: 'For what Thou hast done for us, glory be to Thee, O Lord our God.' },
    { ge: 'አሜን አሜን አሜን።',
      am: 'አሜን አሜን አሜን።',
      tr: 'Amen Amen Amen.',
      en: 'Amen, Amen, Amen.' },
  ],

  // ── ፍጻሜ / መዘምር
  dismissal: [
    { ge: 'እትዉ በሰላም ወበምሕረት እምኀበ እግዚአብሔር። ሰላም ለክሙ።',
      am: 'በሰላምና በምሕረት ከእግዚአብሔር ዘንድ ሂዱ። ሰላም ለእናንተ።',
      tr: 'Etu be-selam wabamehret em-habe Egziabher. Selam lekemu.',
      en: 'Go in peace and mercy from the Lord. Peace be unto you.' },
    { ge: 'ስብሐት ለእግዚአብሔር ወለወልድ ወለመንፈስ ቅዱስ ወለአሐዱ አምላክ አሜን።',
      am: 'ክብር ለእግዚአብሔር ለወልድ ለመንፈስ ቅዱስ ለአንዱ አምላክ አሜን።',
      tr: 'Sebhat le-Egziabher walawald walemenfas Qiddus wala-ahadu Amlak Amen.',
      en: 'Glory be to God, and to the Son, and to the Holy Spirit, and to the One God. Amen.' },
  ],
};

/* --------------------------------------------------------------------------
   የመልመጃ ጥያቄዎች (Quiz) — ቁልፍ ጸሎቶችን ለማስታወስ
-------------------------------------------------------------------------- */
const QUIZ = [
  {
    q: 'የቅዳሴው መክፈቻ ምንድን ነው?',
    options: ['በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ', 'አቡነ ዘበሰማያት', 'ነአምን በአሐዱ አምላክ', 'ሆሣዕና በአርያም'],
    answer: 0,
    note: 'ቅዳሴው የሚጀመረው በሥላሴ ስም ነው።'
  },
  {
    q: '«ነአኲቶ ለገባሬ ሠናያት» ምን ማለት ነው?',
    options: ['ለበጎ አድራጊ እናመሰግናለን', 'ሰላም ለእናንተ', 'አባታችን ሆይ', 'ወደ ፈተና አታግባን'],
    answer: 0,
    note: 'ይህ የቅዱስ ባስልዮስ የምስጋና ጸሎት መክፈቻ ነው።'
  },
  {
    q: '«ቅዱስ ቅዱስ ቅዱስ» (ሳንቅቱስ) የሚጠቀሰው ማንን ነው?',
    options: ['የሠራዊት እግዚአብሔርን', 'የሰውን ኃያልነት', 'የመላዕክትን ዜማ', 'የነገሥታትን ክብር'],
    answer: 0,
    note: '«ቅዱስ ቅዱስ ቅዱስ የሠራዊት እግዚአብሔር» የሥላሴ ምስጋና ነው።'
  },
  {
    q: '«አቡነ ዘበሰማያት» በአማርኛ እንዴት ይጀመራል?',
    options: ['አባታችን ሆይ በሰማያት ያለህ', 'ሰላም ለእናንተ', 'እግዚአብሔር ከሁላችሁ ጋር', 'እናምናለን በአንድ አምላክ'],
    answer: 0,
    note: 'የጌታ ጸሎት ነው።'
  },
  {
    q: 'የሃይማኖት ጸሎት (Creed) የሚጀመረው በየትኛው ቃል ነው?',
    options: ['ነአምን በአሐዱ አምላክ', 'አቡነ ዘበሰማያት', 'ሆሣዕና በአርያም', 'እትዉ በሰላም'],
    answer: 0,
    note: '«ነአምን» ማለት «እናምናለን» ማለት ነው።'
  },
  {
    q: 'በጾም ወቅት የሚደረሰው ዜማ የትኛው ነው?',
    options: ['ዕዝል (Ezel)', 'ግዕዝ (Ge\'ez)', 'አራራይ (Araray)', 'ኳንቾ'],
    answer: 0,
    note: 'ዕዝል የጾም የሐዘንና የንስሐ ዜማ ነው።'
  },
  {
    q: '«ሆሣዕና በአርያም» የትኛው ጸሎት ክፍል ነው?',
    options: ['ቅዱስ ቅዱስ ቅዱስ', 'አቡነ ዘበሰማያት', 'ወንጌል', 'ምስጋና'],
    answer: 0,
    note: 'ሆሣዕና የሳንቅቱስ መጠናቀቂያ ነው።'
  },
  {
    q: 'የእንጀራና የወይኑ ወደ ሥጋና ወደ ደም መለወጥ የሚደረገው በማን ነው?',
    options: ['በመንፈስ ቅዱስ መውረድ', 'በካህኑ ብቻ', 'በዜማ', 'በጾም'],
    answer: 0,
    note: '«ይረስዮ መንፈስ ቅዱስ ሥጋሁ ወደሙ» ኤፒክሌሲስ ይባላል።'
  },
];

/* --------------------------------------------------------------------------
   የእሁድ ቅዳሴ — ሥርዓተ ቅዳሴ ዘዘወትር እሁድ
-------------------------------------------------------------------------- */
const LITURGY_SUNDAY = {
  id: 'sunday',
  title: 'የእሁድ ቅዳሴ',
  titleGe: 'ቅዳሴ ዘዘወትር እሁድ',
  subtitle: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን — ሥርዓተ ቅዳሴ',
  icon: '☀️',
  tone: ZEMA.GEEZ,
  intro: 'የእሁድ ቅዳሴ የትንሣኤ በዓልን ማስታወሻ የሚያደርግ፣ የሳምንቱ ማዕከል የሆነው ቅዳሴ ነው። በዚህ ቅዳሴ የትንሣኤ ደስታ የሚገለጠው በግዕዝ/አራራይ ዜማ ነው።',
  sections: [
    { id: 's1', title: 'መክፈቻ', titleGe: 'መክፈት', desc: 'ቅዳሴው የሚከፈተው በሥላሴ ስም ነው።', speaker: SPEAKER.PRIEST, lines: PRAYER.opening },
    { id: 's2', title: 'እግዚአብሔር ምስለ ኵልክሙ', titleGe: 'ጸሎተ ሰላም', desc: 'የሰላም ሰላምታ።', speaker: SPEAKER.PRIEST, lines: PRAYER.lordBeWithYou },
    { id: 's3', title: 'ጸሎተ አኰቴት', titleGe: 'ጸሎተ አኰቴት', desc: 'የምስጋና ጸሎት ከታቦተ ኪዳን በፊት።', speaker: SPEAKER.PRIEST, lines: PRAYER.aqwetat },
    { id: 's4', title: 'ጸሎተ ምሕላ', titleGe: 'ጸሎተ ምሕላ', desc: 'ለሰላምና ለቤተ ክርስቲያን የልመና ጸሎት።', speaker: SPEAKER.DEACON, lines: PRAYER.mehla },
    { id: 's5', title: 'ንባበ መልእክት', titleGe: 'መልእክት', desc: 'የቅዱስ ጳውሎስና የሐዋርያት ንባብ።', speaker: SPEAKER.DEACON, lines: PRAYER.epistle },
    { id: 's6', title: 'ወንጌል', titleGe: 'ወንጌል', desc: 'የቀኑ ወንጌል ንባብ።', speaker: SPEAKER.DEACON, lines: PRAYER.gospel },
    { id: 's7', title: 'ጸሎተ ሃይማኖት', titleGe: 'ሃይማኖት', desc: 'የአንድነት እምነት መግለጫ።', speaker: SPEAKER.PEOPLE, lines: PRAYER.creed },
    { id: 's8', title: 'ጸሎተ አንድነት', titleGe: 'ጸሎተ አንድነት', desc: 'የአንድነት ጸሎት።', speaker: SPEAKER.PRIEST, lines: PRAYER.anedinet },
    { id: 's9', title: 'ነአኲቶ ለገባሬ ሠናያት', titleGe: 'ነአኲቶ', desc: 'የቅዱስ ባስልዮስ የምስጋና ጸሎት።', speaker: SPEAKER.PRIEST, lines: PRAYER.neakut },
    { id: 's10', title: 'ቅዱስ ቅዱስ ቅዱስ', titleGe: 'ሳንቅቱስ', desc: 'የመላዕክት ዝማሬ ከሕዝቡ ጋር።', speaker: SPEAKER.PEOPLE, lines: PRAYER.sanctus },
    { id: 's11', title: 'ትእዛዘ ክርስቶስ', titleGe: 'ቃለ ምስጢር', desc: 'በዚያች ሌሊት የተዋሕደው ምስጢር።', speaker: SPEAKER.PRIEST, lines: PRAYER.institution },
    { id: 's12', title: 'ይረስዮ መንፈስ ቅዱስ', titleGe: 'ኤፒክሌሲስ', desc: 'መንፈስ ቅዱስ በኅብስቱና በወይኑ ላይ መውረድ።', speaker: SPEAKER.PRIEST, lines: PRAYER.epiclesis },
    { id: 's13', title: 'አቡነ ዘበሰማያት', titleGe: 'ጸሎተ አቡነ', desc: 'የጌታ ጸሎት።', speaker: SPEAKER.PEOPLE, lines: PRAYER.abun },
    { id: 's14', title: 'ቁርባን', titleGe: 'ሥርዓተ ቁርባን', desc: 'ሥጋና ደሙን መቀበል።', speaker: SPEAKER.PRIEST, lines: PRAYER.communion },
    { id: 's15', title: 'ምስጋና', titleGe: 'ምስጋና', desc: 'ከቁርባን በኋላ የምስጋና ጸሎት።', speaker: SPEAKER.PEOPLE, lines: PRAYER.thanksgiving },
    { id: 's16', title: 'ፍጻሜ / መዘምር', titleGe: 'መዘምር', desc: 'የቅዳሴው መደምደሚያ በረከት።', speaker: SPEAKER.PRIEST, lines: PRAYER.dismissal },
  ],
};

/* --------------------------------------------------------------------------
   የጾም ቅዳሴ — በጾም ወቅት (በተለይ ዐቢይ ጾም) ቀን የሚቀደሰው
-------------------------------------------------------------------------- */
const LITURGY_LENT = {
  id: 'lent',
  title: 'የጾም ቅዳሴ',
  titleGe: 'ቅዳሴ ዘጾም',
  subtitle: 'በጾም ወቅት ቀን የሚቀደሰው ቅዳሴ',
  icon: '✝️',
  tone: ZEMA.EZEL,
  intro: 'የጾም ቅዳሴ በዐቢይ ጾምና በሌሎች አጽዋማት ቀናት የሚቀደሰው ንስሐና ሕማማትን የሚያስታውስ ቅዳሴ ነው። በዚህ ወቅት ዜማው ዕዝል ሲሆን፣ ስግደትና ንስሐ በዋናነት ይታያል።',
  sections: [
    { id: 'l1', title: 'መክፈቻ (የጾም)', titleGe: 'መክፈት', desc: 'በሥላሴ ስም የሚከፈተው የጾም መክፈቻ።', speaker: SPEAKER.PRIEST, lines: PRAYER.opening },
    { id: 'l2', title: 'እግዚአብሔር ምስለ ኵልክሙ', titleGe: 'ጸሎተ ሰላም', desc: 'የሰላም ሰላምታ።', speaker: SPEAKER.PRIEST, lines: PRAYER.lordBeWithYou },
    { id: 'l3', title: 'ጸሎተ አኰቴት', titleGe: 'ጸሎተ አኰቴት', desc: 'የምስጋና ጸሎት።', speaker: SPEAKER.PRIEST, lines: PRAYER.aqwetat },
    { id: 'l4', title: 'ስግደትና ንስሐ', titleGe: 'ትግዕዝት', desc: 'የጾም ወቅት ልዩ የንስሐና የስግደት ጸሎት።', speaker: SPEAKER.PEOPLE, lines: [
      { ge: 'አቤቱ ኃጢአተኛ ነኝ ይቅር በለኝ በብዙ ምሕረትህ።',
        am: 'አቤቱ ኃጢአተኛ ነኝ፤ በብዙ ምሕረትህ ይቅር በለኝ።',
        tr: 'Abutu hat-e-atena negn yekir belen ba-bezu mehretke.',
        en: 'O Lord, I am a sinner; forgive me according to Thy great mercy.' },
      { ge: 'ንስሐ ገባነ እምኀበ አብ ወወልድ ወመንፈስ ቅዱስ።',
        am: 'ከአብ ከወልድ ከመንፈስ ቅዱስ ዘንድ ንስሐ ገባን።',
        tr: 'Nesa-a gabana em-habe Ab wawald wamenfas Qiddus.',
        en: 'We have repented before the Father, and the Son, and the Holy Spirit.' },
    ]},
    { id: 'l5', title: 'ጸሎተ ምሕላ (የጾም)', titleGe: 'ጸሎተ ምሕላ', desc: 'የጾም የልመና ጸሎት ለሰላም።', speaker: SPEAKER.DEACON, lines: PRAYER.mehla },
    { id: 'l6', title: 'ንባባት', titleGe: 'መልእክት ወወንጌል', desc: 'የመልእክትና የወንጌል ንባብ።', speaker: SPEAKER.DEACON, lines: [...PRAYER.epistle, ...PRAYER.gospel] },
    { id: 'l7', title: 'ጸሎተ ሃይማኖት', titleGe: 'ሃይማኖት', desc: 'የአንድነት እምነት።', speaker: SPEAKER.PEOPLE, lines: PRAYER.creed },
    { id: 'l8', title: 'ጸሎተ አንድነት', titleGe: 'ጸሎተ አንድነት', desc: 'የአንድነት ጸሎት።', speaker: SPEAKER.PRIEST, lines: PRAYER.anedinet },
    { id: 'l9', title: 'ነአኲቶ ለገባሬ ሠናያት', titleGe: 'ነአኲቶ', desc: 'የቅዱስ ባስልዮስ የምስጋና ጸሎት።', speaker: SPEAKER.PRIEST, lines: PRAYER.neakut },
    { id: 'l10', title: 'ቅዱስ ቅዱስ ቅዱስ', titleGe: 'ሳንቅቱስ', desc: 'የመላዕክት ዝማሬ።', speaker: SPEAKER.PEOPLE, lines: PRAYER.sanctus },
    { id: 'l11', title: 'ትእዛዘ ክርስቶስ', titleGe: 'ቃለ ምስጢር', desc: 'የምስጢረ ቁርባን ሥርዓት ትዕዛዝ።', speaker: SPEAKER.PRIEST, lines: PRAYER.institution },
    { id: 'l12', title: 'ይረስዮ መንፈስ ቅዱስ', titleGe: 'ኤፒክሌሲስ', desc: 'መንፈስ ቅዱስ መውረድ።', speaker: SPEAKER.PRIEST, lines: PRAYER.epiclesis },
    { id: 'l13', title: 'አቡነ ዘበሰማያት', titleGe: 'ጸሎተ አቡነ', desc: 'የጌታ ጸሎት።', speaker: SPEAKER.PEOPLE, lines: PRAYER.abun },
    { id: 'l14', title: 'ቁርባን', titleGe: 'ሥርዓተ ቁርባን', desc: 'ሥጋና ደሙን መቀበል።', speaker: SPEAKER.PRIEST, lines: PRAYER.communion },
    { id: 'l15', title: 'ምስጋና / ፍጻሜ', titleGe: 'ምስጋና ወመዘምር', desc: 'የጾም ቅዳሴ ምስጋናና መደምደሚያ።', speaker: SPEAKER.PRIEST, lines: [...PRAYER.thanksgiving, ...PRAYER.dismissal] },
  ],
};

/* --------------------------------------------------------------------------
   የአጽዋማት / የዘመናት መረጃ (for "today" detection)
-------------------------------------------------------------------------- */
const LITURGICAL_YEAR = [
  { season: 'ዘመነ ክርስቶስ (ገና)', desc: 'ገናን የሚቀድሙ 45 ቀናት ጾም' },
  { season: 'ዘመነ ጥምቀት', desc: 'የጥምቀት ጾም' },
  { season: 'ዘመነ ሕማማት (ዐቢይ ጾም)', desc: '55 ቀናት — የሕማማት ጾም' },
  { season: 'ዘመነ ትንሣኤ', desc: '50 ቀናት — ከትንሣኤ እስከ ሃምሳ' },
  { season: 'ዘመነ ሐዋርያት', desc: 'የሐዋርያት ጾም' },
  { season: 'ዘመነ ፍልሰታ', desc: 'የድንግል ማርያም ጾም' },
  { season: 'ዘመነ መስቀል', desc: 'የመስቀል በዓል ወቅት' },
];

/* --------------------------------------------------------------------------
   የቅዳሴ መጠቀሚያ ቃላት / Glossary of liturgical terms
-------------------------------------------------------------------------- */
const GLOSSARY = [
  { ge: 'ቅዳሴ', am: 'ሥርዓተ ቁርባን፤ መቀደስ፣ ማመስገን', en: 'Liturgy / to hallow' },
  { ge: 'ሥርዓተ ቅዳሴ', am: 'የቁርባን ሥርዓት የተሟላ አገልግሎት', en: 'The Divine Liturgy' },
  { ge: 'አንፆራ (አኅጉር)', am: 'የቁርባን ምስጋና ጸሎት፣ 14ቱ አንፆራዎች', en: 'Anaphora' },
  { ge: 'ሳንቅቱስ', am: '«ቅዱስ ቅዱስ ቅዱስ» የመላዕክት ዝማሬ', en: 'Sanctus' },
  { ge: 'ኤፒክሌሲስ', am: 'መንፈስ ቅዱስ በኅብስቱና በወይኑ ላይ መውረድ', en: 'Epiclesis' },
  { ge: 'ይረስዮ', am: '«ይውረድበት» — መንፈስ ቅዱስ የመውረድ ጸሎት', en: 'Yeresyo (May it descend)' },
  { ge: 'አቡነ ዘበሰማያት', am: 'የጌታ ጸሎት — «አባታችን በሰማያት»', en: 'The Lord\'s Prayer' },
  { ge: 'ነአኲቶ ለገባሬ ሠናያት', am: '«ለበጎ አድራጊ እናመሰግናለን» — የቅዱስ ባስልዮስ ምስጋና', en: 'Thanksgiving of St. Basil' },
  { ge: 'ትእዛዝ', am: 'የምስጢረ ቁርባን ሥርዓት ትዕዛዝ (የእንጀራና የወይን ቃል)', en: 'Words of Institution' },
  { ge: 'ጸሎተ ሃይማኖት', am: 'የእምነት መግለጫ (Creed)', en: 'The Creed' },
  { ge: 'ቃል ኪዳን', am: 'የምሥጢራት ሥርዓት መጽሐፍ', en: 'The Testament' },
  { ge: 'ጸባኦት', am: 'የሠራዊት (የመላዕክት ሠራዊት ጌታ)', en: 'Sabaoth (of Hosts)' },
  { ge: 'ሆሣዕና', am: '«አድን እንለምናለን» — የድል ዝማሬ', en: 'Hosanna' },
  { ge: 'መዘምር', am: 'የቅዳሴ መደምደሚያ በረከት', en: 'Dismissal' },
  { ge: 'ጸሎተ አኰቴት', am: 'የምስጋና ጸሎት', en: 'Prayer of Thanksgiving' },
  { ge: 'ጸሎተ ምሕላ', am: 'የልመና ጸሎት', en: 'Prayer of Supplication' },
  { ge: 'ጸሎተ አንድነት', am: 'የአንድነት ጸሎት', en: 'Prayer of Unity' },
  { ge: 'ቃለ ምስጢር', am: 'የቁርባን ምስጢር ቃል', en: 'Words of the Mystery' },
];

/* --------------------------------------------------------------------------
   የዕለት ንባባት / Daily Readings (ምሳሌያዊ መርሐግብር)
   A representative cycle: each entry maps an Ethiopian month range to a set
   of readings. Users follow their parish's official lectionary.
-------------------------------------------------------------------------- */
const DAILY_READINGS = [
  { months: 'ዘመነ መስቀል/ገና', gospel: 'ማቴዎስ 2:1-12 — የጥበበኞች ምጽአት', epistle: 'ሮሜ 15:8-13', psalm: 'መዝሙር 72', ot: 'ኢሳይያስ 9:1-7' },
  { months: 'ዘመነ ጥምቀት', gospel: 'ዮሐንስ 1:29-34 — የእግዚአብሔር በግ', epistle: 'ቲቶ 2:11-14', psalm: 'መዝሙር 29', ot: 'ኢሳይያስ 40:1-5' },
  { months: 'ዐቢይ ጾም', gospel: 'ማርቆስ 1:12-13 — የክርስቶስ ፈተና', epistle: '2 ቆሮንቶስ 6:1-10', psalm: 'መዝሙር 51', ot: 'ዘዳግም 8:1-10' },
  { months: 'ሕማማት', gospel: 'ማቴዎስ 26-27 — ሕማማት', epistle: 'ዕብራውያን 9:11-15', psalm: 'መዝሙር 22', ot: 'ኢሳይያስ 53:1-12' },
  { months: 'ዘመነ ትንሣኤ', gospel: 'ማቴዎስ 28:1-10 — ትንሣኤ', epistle: '1 ቆሮንቶስ 15:1-11', psalm: 'መዝሙር 118', ot: 'ዘፍጥረት 1:1-5' },
  { months: 'ዘመነ ሐዋርያት', gospel: 'ዮሐንስ 14:15-26 — መንፈስ ቅዱስ', epistle: 'ሐዋርያት 2:1-21', psalm: 'መዝሙር 104', ot: 'ኢዮቤልዩ 11:7-9' },
  { months: 'ዘመነ ፍልሰታ', gospel: 'ሉቃስ 1:46-55 — መግነጢሱ', epistle: 'ገላትያ 4:4-7', psalm: 'መዝሙር 34', ot: 'ኢሳይያስ 7:10-14' },
];

/* --------------------------------------------------------------------------
   ዐሥራ አራቱ አንፆራዎች / The 14 Anaphoras
-------------------------------------------------------------------------- */
const ANAPHORAS = [
  { name: 'ቅዳሴ ዘሐዋርያት', note: 'የሐዋርያት ቅዳሴ — የቁርባን ትዕዛዝ መሠረት' },
  { name: 'ቅዳሴ ዘአቡነ ኢየሱስ ክርስቶስ', note: 'የጌታችን ቅዳሴ' },
  { name: 'ቅዳሴ ዘእግዝእትነ ማርያም', note: 'የእመቤታችን የማርያም ቅዳሴ' },
  { name: 'ቅዳሴ ዘአትናቴዎስ', note: 'የአትናቴዎስ ቅዳሴ' },
  { name: 'ቅዳሴ ዘባስልዮስ', note: 'የባስልዮስ ቅዳሴ' },
  { name: 'ቅዳሴ ዘጎርጎርዮስ', note: 'የጎርጎርዮስ ቅዳሴ' },
  { name: 'ቅዳሴ ዘያዕቆብ', note: 'የያዕቆብ ቅዳሴ' },
  { name: 'ቅዳሴ ዘዮሐንስ ወንጌላዊ', note: 'የዮሐንስ ወንጌላዊ ቅዳሴ' },
  { name: 'ቅዳሴ ዘቄርሎስ', note: 'የቄርሎስ ቅዳሴ' },
  { name: 'ቅዳሴ ዘዮሐንስ አፈወርቅ', note: 'የዮሐንስ አፈወርቅ ቅዳሴ' },
  { name: 'ቅዳሴ ዘዲዮስቆሮስ', note: 'የዲዮስቆሮስ ቅዳሴ' },
  { name: 'ቅዳሴ ዘኤጲፋንዮስ', note: 'የኤጲፋንዮስ ቅዳሴ' },
  { name: 'ቅዳሴ ዘሠለስቱ ምዕት', note: 'የሦስት መቶ (318) ሊቃውንት ቅዳሴ' },
  { name: 'ቅዳሴ ዘኢያሬቅ', note: 'የኢያሬቅ ቅዳሴ' },
];

/* Global data object exposed to app.js */
const QIDASSE_DATA = {
  version: '2.0.0',
  zema: ZEMA,
  speaker: SPEAKER,
  quiz: QUIZ,
  liturgies: {
    sunday: LITURGY_SUNDAY,
    lent: LITURGY_LENT,
  },
  liturgicalYear: LITURGICAL_YEAR,
  glossary: GLOSSARY,
  dailyReadings: DAILY_READINGS,
  anaphoras: ANAPHORAS,
};
