# J.A.R.V.I.S. — ሙሉ የአጠቃቀም መመሪያ

**ሊንክ፦** https://zolasketch.github.io/Zola-fx-pro/

---

## ክፍል 1 — መጀመሪያ

### እንደ app መጫን

| ስልክ | እርምጃ |
| --- | --- |
| **Android** | Chrome ⋮ → *Add to home screen* |
| **iPhone** | Safari ⬆️ Share → *Add to Home Screen* |

> iPhone ላይ **Safari ግድ ነው**። Chrome on iOS መጫን አይችልም።

ከጫኑ በኋላ የአርክ ሪአክተር አዶ ይፈጠራል። ሲነኩት fullscreen ይከፈታል።

### የመክፈቻ ስክሪን (Boot)
አርክ ሪአክተሩ ሲነድ ያሳያል። **ስክሪኑን ነክተው መዝለል ይችላሉ።**

---

## ክፍል 2 — አራቱ ታቦች (ከታች)

### 🗨️ TALK — ማውራት
ዋናው ገጽ። ጃርቨስን የሚያናግሩበት።

| ክፍል | ትርጉም |
| --- | --- |
| **ኦርብ** (ክብ ብርሃን) | ማይክሮፎን። ይንኩት → ማዳመጥ ይጀምራል |
| **VOICE STANDBY** | ማይኩ ጠፍቷል |
| **LISTENING** | እየሰማ ነው |
| **PROCESSING** | እያሰበ ነው |
| **SPEAKING** | እየተናገረ ነው |
| **SYS** | የሥርዓት መልእክት |
| **JVS** | የጃርቨስ መልስ |
| **YOU** | የእርስዎ ጥያቄ |

**ከታች ያሉት ቁልፎች፦**

| አዶ | ትርጉም |
| --- | --- |
| 🎤 | ማይክሮፎን ማብራት/ማጥፋት |
| 🔊 | የጃርቨስን ድምፅ ማብራት/ማጥፋት |
| ↵ | መላክ |

---

### ⚡ POWER — ኃይል

**ARC REACTOR** — የሚሽከረከር ሪአክተር። ስላይደሩን ጎትተው ኃይሉን ይቀይሩ።

**SUBSYSTEMS** — ስድስት መለኪያዎች፦

| ስም | ትርጉም |
| --- | --- |
| `ARC REACTOR` | የሪአክተሩ ውጤት |
| `REPULSOR BUS` | የእጅ መሣሪያዎች ኃይል |
| `FLIGHT THRUST` | የበረራ ግፊት |
| `ARMOR INTEGRITY` | የትጥቅ ጤንነት |
| `THERMAL LOAD` | የሙቀት መጠን (°C) |
| `SAT UPLINK` | የሳተላይት ግንኙነት |

> እነዚህ **ትወና ናቸው** (ፊልሙን ለመምሰል)።

**DEVICE** — ⚠️ **እነዚህ እውነተኛ ናቸው**፦

| ስም | ትርጉም |
| --- | --- |
| `RENDER` | ስክሪኑ በሰከንድ ስንት ጊዜ እንደሚታደስ (fps) |
| `BATTERY` | የስልክዎ እውነተኛ ባትሪ (⚡ = እየሞላ) |
| `LINK` | የኔትወርክ አይነት (4G/wifi) እና ፍጥነት |
| `LATENCY` | የኔትወርክ መዘግየት (ሚሊሰከንድ) |
| `HEAP` | ጃርቨስ የሚጠቀመው ማህደረ ትውስታ |
| `CORES` | የስልክዎ ፕሮሰሰር ኮሮች |
| `DISPLAY` | የስክሪን መጠን |
| `UPLINK` | CONNECTED / SEVERED |

---

### 🛡️ SUIT — ትጥቅ

**MARK LXXXV** — በ3D የሚሽከረከር ሆሎግራም።

`suit up` ሲሉ **ቁራጭ በቁራጭ ሲገጣጠም** ይመለከታሉ 🔥

| ሁኔታ | ትርጉም |
| --- | --- |
| `STOWED` | ተቀምጧል |
| `ASSEMBLING` | እየተገጣጠመ ነው |
| `DEPLOYED` | ተለብሷል |
| `RETRACTING` | እየተመለሰ ነው |

**MEMORY** — ታይመሮችዎ እና ማስታወሻዎችዎ።

---

### 📡 INTEL — መረጃ

**THREAT MATRIX** — ራዳር። ጨረሩ ሲዞር ኢላማዎች ይታያሉ።

| ቀለም | ደረጃ |
| --- | --- |
| 🟢 `LOW` | ዝቅተኛ አደጋ |
| 🟡 `MEDIUM` | መካከለኛ |
| 🔴 `HIGH` | ከፍተኛ |

`BRG 142°` = አቅጣጫ · `8.4km` = ርቀት

**KNOWLEDGE CORE** — 118ቱ ኤለመንቶች። ማጣሪያው ውስጥ `gold` ወይም `79` ይጻፉ።

> **118 ELEMENTS · 20 CONSTANTS · 11 BODIES · 40+ UNITS — ALL RESIDENT**
> ማለት፦ ይህ ሁሉ እውቀት **በስልክዎ ውስጥ** አለ፣ ኢንተርኔት አያስፈልገውም።

---

## ክፍል 3 — ትዕዛዞች በሙሉ

### 🧮 ሒሳብ
```
what is 15 times 24 plus 7
15% of 240
what is 2 to the power of 64
sqrt(144)
```

### 🔢 ቁጥሮች
```
is 7919 prime          →  ፕራይም መሆኑን ይፈትሻል
factors of 360         →  ምክንያቶች
gcd of 48 and 18       →  ትልቁ የጋራ አካፋይ
lcm of 4 and 6         →  ትንሹ የጋራ ብዜት
255 in hexadecimal     →  FF
45 in roman numerals   →  XLV
MCMLXXXVII in decimal  →  1987
```

### 📏 መለወጫ
```
convert 100 km to miles
5 kg to pounds
100 celsius to fahrenheit
1 gb to mb
2 hours in minutes
```

### 🔬 ሳይንስ
```
what is the speed of light
gravitational constant
tell me about the element gold
element 79
how big is jupiter
tell me about mars
what is the moon phase
```

### 🎲 ዕድል
```
roll 3d6           →  ሦስት ባለ6 ዳይስ
roll d20
flip a coin        →  ሳንቲም
random number between 1 and 100
```

### 🔐 ደህንነት
```
generate a password
sha256 of hello
base64 encode hello
```

### 📝 ጽሑፍ
```
word count of <ጽሑፍዎ>
readability of <ጽሑፍዎ>
```

### 🧠 ማህደረ ትውስታ (ቋሚ)
```
remember that I take my coffee black
remember that my door code is 4815
what do you remember about me
```
> ከቀናት በኋላም ያስታውሳል። **በስልክዎ ውስጥ ብቻ ይቀመጣል።**

### 🎛️ HUD ትዕዛዞች
```
set power to 40            →  ሪአክተሩን ይቀይራል
divert 100% to the reactor
power down                 →  ያጠፋል
set repulsors to 80
scan the perimeter         →  ራዳር ይጠርጋል
suit up                    →  ትጥቅ ይለብሳል
retract the suit           →  ያወልቃል
deploy mark VII
status report              →  ሙሉ ምርመራ
red alert                  →  አደጋ ሁኔታ
stand down                 →  ወደ መደበኛ
set a timer for 5 minutes
play some music
clear                      →  ውይይቱን ያጸዳል
what's my battery          →  እውነተኛ ባትሪ
```

### 🎖️ ፕሮቶኮሎች (ከፊልሙ)
```
lockdown protocol      →  ተቋሙን ይዘጋል
house party protocol   →  38 ትጥቆች ይነሳሉ
clean slate protocol   →  ሁሉንም ያጠፋል
summon veronica        →  Hulkbuster
sentry mode            →  የጥበቃ ሁኔታ
```

### 💬 ውይይት
```
hello jarvis
who are you
how are you
tell me a joke
thank you
help
```

### 🌐 ኢንተርኔት የሚያስፈልጋቸው
```
what is the weather in Tokyo
who is Nikola Tesla
define serendipity
capital of Japan
100 usd to eur
bitcoin price
who wrote Dune
```

---

## ክፍል 4 — ድምፅ 🎤

1. **ኦርቡን ይንኩ** → አረንጓዴ ይሆናል
2. **"Jarvis"** ብለው ይጀምሩ፦

```
"Jarvis, is seven nine one nine prime"
"Jarvis, roll three d six"
"Jarvis, suit up"
"Jarvis, what is the speed of light"
```

**"Jarvis" ብቻ** ካሉ → *"Yes, sir?"* ይላል።

> **ለምን "Jarvis" ማለት ያስፈልጋል?** ማይኩ ሁሌ ይሰማል፣ ግን ስሙ ካልተጠራ አይመልስም። ተራ ንግግርዎን አይሰማም።

⚠️ **iPhone ላይ የድምፅ ማዳመጥ አይሰራም** (Apple አልደገፈውም)። መተየብ ግን ይሰራል፣ ጃርቨስም በድምፅ ይመልስልዎታል።

---

## ክፍል 5 — በኮምፒውተር

| አቋራጭ | ተግባር |
| --- | --- |
| `/` | ወደ መጻፊያው መዝለል |
| `Ctrl + Space` | ማይክ ማብራት/ማጥፋት |
| `↑` `↓` | ያለፉ ትዕዛዞች |
| `Enter` | መላክ |

---

## ክፍል 6 — ✈️ ያለ ኢንተርኔት

**አውሮፕላን ሁነታ ላይ እንኳ ይሰራሉ፦**

✅ ሒሳብ · ኤለመንቶች · ቋሚዎች · ፕላኔቶች · መለወጫ
✅ Roman numerals · dice · passwords · hashing
✅ ማህደረ ትውስታ · ድምፅ · ሁሉም HUD ትዕዛዞች

❌ የአየር ሁኔታ · Wikipedia · ምንዛሬ · bitcoin

---

## ክፍል 7 — ችግር ሲያጋጥም

| ችግር | መፍትሔ |
| --- | --- |
| ማይኩ አይሰራም | 🎤 ይንኩ → ብራውዘሩ ፈቃድ ሲጠይቅ *Allow* |
| iPhone ላይ ማይክ የለም | Apple አልደገፈውም። ይተይቡ |
| ድምፅ አይሰማም | 🔊 ማጥፊያው ላይ ይሆናል |
| "could not reach" | ኢንተርኔት ያስፈልገዋል |
| አላወቀውም | `help` ይጻፉ |
| አዲስ ነገር አይታይም | ገጹን refresh ያድርጉ |

---

## ማጠቃለያ

| | |
| --- | --- |
| ቴስቶች | 193 |
| Tools | 20+ |
| የእውቀት ምንጮች | 20 |
| ኤለመንቶች | 118 |
| Vulnerabilities | 0 |

**ኮድ፦** https://github.com/zolaSketch/Zola-fx-pro
