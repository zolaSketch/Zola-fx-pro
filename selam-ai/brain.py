"""ሰላም — የአማርኛ ቀጠሮ አእምሮ። ኤክስተርናል API አያስፈልግም።"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timedelta
from typing import Any


WEEKDAYS = {
    0: "ሰኞ",
    1: "ማክሰኞ",
    2: "ረቡዕ",
    3: "ሐሙስ",
    4: "አርብ",
    5: "ቅዳሜ",
    6: "እሑድ",
}

DAY_WORDS = {
    "ዛሬ": 0,
    "ነገ": 1,
    "ከነገ ወዲያ": 2,
    "ከነገው ወዲያ": 2,
    "ሰኞ": "dow:0",
    "ማክሰኞ": "dow:1",
    "ማክሰኞን": "dow:1",
    "ረቡዕ": "dow:2",
    "ረቡን": "dow:2",
    "ሐሙስ": "dow:3",
    "ሀሙስ": "dow:3",
    "አርብ": "dow:4",
    "ቅዳሜ": "dow:5",
    "እሑድ": "dow:6",
    "እሁድ": "dow:6",
}

SERVICE_WORDS = [
    ("pain", ["ህመም", "ሕመም", "እየመታ", "መታኝ", "አመመኝ", "ድንገተኛ", "አስቸኳይ"]),
    ("clean", ["ጽዳት", "ማጽዳት", "ክሊኒንግ", "ስኬሊንግ", "ድንጋይ"]),
    ("white", ["ነጣት", "ማንጣት", "ብሊች", "ነጭ"]),
    ("fill", ["መሙላት", "ፊሊንግ", "ቆርቆሮ", "ቀዳዳ", "ካሪስ"]),
    ("pull", ["ማውጣት", "መንቀል", "አውጣ", "ብልህ"]),
    ("checkup", ["ምርመራ", "ምክክር", "ቼክ", "ማየት", "መመልከት", "ቀጠሮ"]),
]


def normalize(text: str) -> str:
    t = (text or "").strip()
    t = t.replace("ሀ", "ሐ")  # light unify
    return t


def has_any(text: str, words: list[str]) -> bool:
    return any(w in text for w in words)


class SelamBrain:
    def __init__(self, clinic: dict, store: Any):
        self.clinic = clinic
        self.store = store

    def new_session(self) -> dict:
        return {
            "id": str(uuid.uuid4())[:8],
            "step": "idle",
            "service": None,
            "date": None,
            "time": None,
            "name": None,
            "phone": None,
            "turns": 0,
        }

    def reply(self, session: dict, user_text: str) -> dict:
        text = normalize(user_text)
        session["turns"] = session.get("turns", 0) + 1
        clinic = self.clinic

        if not text:
            return self._say(session, "አልሰማሁም። እባክዎ እንደገና ይንገሩኝ።")

        if has_any(text, ["ደም", "አደጋ", "መተንፈስ", "በጣም እየመታ", "መዋሸት", "ድንገተኛ ክፉ"]):
            return self._say(
                session,
                "ይህ ድንገተኛ ሊሆን ይችላል። እባክዎ ወደ ቅርብ የመጀመሪያ እርዳታ ይሂዱ "
                f"ወይም የክሊኒኩን ስልክ ይደውሉ፦ {clinic['phone']}። ቀጠሮ ከፈለጉ ግን እዚህ ልይዝልዎት እችላለሁ።",
                escalate=True,
            )

        if has_any(text, ["ሰው", "ሴክሬተር", "ሐኪም ያነጋግሩ", "ሰው ያነጋግሩ", "ወደ ሰው"]):
            return self._say(
                session,
                f"እሺ። ስልክዎን ቢተዉልኝ ሴክሬተሩ ይደውልልዎታል። "
                f"አሁንም መደወል ከፈለጉ {clinic['phone']} ነው። ስልክዎ ስንት ነው?",
            )

        if has_any(text, ["ቁም", "ተወው", "አመሰግናለሁ በቃ", "ዛሬ በቃ", "ሰላም ሂጃለሁ"]):
            session["step"] = "idle"
            return self._say(session, "እሺ። ሌላ ስትፈልጉ ደውሉ። ደህና ሁኑ።", end=True)

        if has_any(text, ["አድራሻ", "የት ነው", "የት አለ", "መጣራት", "ሎኬሽን", "location"]):
            return self._say(session, f"አድራሻችን፦ {clinic['address']}። ስልክ {clinic['phone']}። ቀጠሮ ልይዝልዎት?")

        if has_any(text, ["ሰዓት ስንት", "መክፈቻ", "መዝጊያ", "ስንት ትከፍታላችሁ", "የስራ ሰዓት"]):
            return self._say(session, f"{clinic['hours']}። {clinic['closed']}። ቀጠሮ ልይዝልዎት?")

        if has_any(text, ["ዋጋ", "ስንት ብር", "ክፍያ", "ውድ ነው", "price"]):
            lines = "፣ ".join(f"{s['name']} ከ{s['price']} ብር" for s in clinic["services"][:4])
            return self._say(
                session,
                f"ዋጋ ከአገልግሎት ይለያል። ለምሳሌ {lines}። ትክክለኛው ከምርመራ በኋላ ይወሰናል። የትኛውን ልይዝ?",
            )

        if has_any(text, ["ሰርዝ", "ሰርዞ", "አልመጣም", "መሰረዝ", "ካንሰል"]):
            session["step"] = "cancel"
            return self._say(session, "ቀጠሮ ለመሰረዝ በስልክ የተመዘገቡበትን ቁጥር ይንገሩኝ።")

        if session.get("step") == "cancel":
            phone = self._extract_phone(text)
            if phone:
                removed = self.store.cancel_by_phone(phone)
                session["step"] = "idle"
                if removed:
                    return self._say(session, f"ቀጠሮው ተሰርዟል። ሌላ ልርዳዎት?")
                return self._say(session, "በዚህ ስልክ የተያዘ ቀጠሮ አላገኘሁም። ስልኩን እንደገና ይንገሩኝ ወይም ሌላ ልርዳዎት?")
            return self._say(session, "ስልክ ቁጥር በ09 ወይም 07 የሚጀምር 10 አሃዝ ይንገሩኝ።")

        # booking flow
        if session.get("step") in {"ask_service", "ask_day", "ask_time", "ask_name", "ask_phone", "confirm"}:
            return self._continue_booking(session, text)

        if self._wants_booking(text) or session.get("step") == "idle" and self._extract_service(text):
            return self._start_booking(session, text)

        if has_any(text, ["ሰላም", "ሃሎ", "ሀሎ", "hello", "hi", "ኧረ", "እሺ ሰላም"]):
            return self._greet(session)

        if session.get("step") == "idle":
            # treat as possible booking intent in natural speech
            if has_any(text, ["እፈልጋለሁ", "መምጣት", "ማየት", "ልምጣ", "ይቻላል", "ባዶ"]):
                return self._start_booking(session, text)
            return self._greet(session)

        return self._say(session, "አልገባኝም። ቀጠሮ፣ አድራሻ፣ ዋጋ ወይም የስራ ሰዓት መጠየቅ ይችላሉ።")

    def _greet(self, session: dict) -> dict:
        session["step"] = "idle"
        c = self.clinic
        return self._say(
            session,
            f"ሰላም፣ {c['name']} ተቀባይ ነኝ። ስሜ {c['agent_name']} ነው። "
            "ቀጠሮ ልይዝልዎት፣ አድራሻ ወይም ዋጋ ልንገርዎት?",
        )

    def _wants_booking(self, text: str) -> bool:
        return has_any(
            text,
            ["ቀጠሮ", "ማስያዝ", "ላስያዝ", "መያዝ", "እፈልጋለሁ", "ልምጣ", "መምጣት እችላለሁ", "ባዶ ሰዓት"],
        )

    def _start_booking(self, session: dict, text: str) -> dict:
        session["step"] = "ask_service"
        session["service"] = self._extract_service(text)
        session["date"] = self._extract_date(text)
        session["time"] = self._extract_time(text)
        session["name"] = self._extract_name(text)
        session["phone"] = self._extract_phone(text)
        return self._advance(session)

    def _continue_booking(self, session: dict, text: str) -> dict:
        step = session["step"]
        if step == "ask_service":
            session["service"] = self._extract_service(text) or session.get("service")
            if not session["service"]:
                if text.isdigit() and 1 <= int(text) <= len(self.clinic["services"]):
                    session["service"] = self.clinic["services"][int(text) - 1]["id"]
            if not session["service"]:
                return self._ask_service(session)
        elif step == "ask_day":
            d = self._extract_date(text)
            if not d:
                return self._say(session, "የትኛው ቀን ነው? ለምሳሌ ነገ፣ ማክሰኞ፣ ወይም አርብ ይበሉ።")
            session["date"] = d
        elif step == "ask_time":
            t = self._extract_time(text)
            if not t:
                free = self._free_slots(session["date"])
                shown = "፣ ".join(free[:6]) if free else "ዛሬ ባዶ የለም"
                return self._say(session, f"ሰዓቱን በግልጽ ይንገሩኝ። ባዶ ሰዓቶች፦ {shown}።")
            if t not in self._free_slots(session["date"]):
                free = self._free_slots(session["date"])
                if not free:
                    session["date"] = None
                    session["step"] = "ask_day"
                    return self._say(session, "ያ ቀን ሙሉ ነው። ሌላ ቀን ይምረጡ።")
                return self._say(session, f"{t} ተይዟል። ባዶ፦ {'፣ '.join(free[:6])}። የትኛው?")
            session["time"] = t
        elif step == "ask_name":
            name = self._extract_name(text) or (text.strip() if len(text.strip()) >= 3 else None)
            if not name:
                return self._say(session, "ስምዎን ብቻ ይንገሩኝ። ለምሳሌ አበበ ከበደ።")
            session["name"] = name
        elif step == "ask_phone":
            phone = self._extract_phone(text)
            if not phone:
                return self._say(session, "ስልክ ቁጥር በ09 ወይም 07 የሚጀምር 10 አሃዝ ይንገሩኝ።")
            session["phone"] = phone
        elif step == "confirm":
            if has_any(text, ["አዎ", "እሺ", "ተስማማሁ", "ይሁን", "እውነት", "አዎን", "ok", "yes"]):
                appt = self.store.add(session, self.clinic)
                session["step"] = "idle"
                svc = self._service(session["service"])
                when = self._pretty_when(session["date"], session["time"])
                msg = (
                    f"ተይዟል። {session['name']}፣ {when}፣ {svc['name']}። "
                    f"አድራሻ፦ {self.clinic['address']}። "
                    f"ቅድሚያ {self.clinic['deposit']} ብር በመድረስ ይከፍላሉ። "
                    "ከመምጣት አንድ ሰዓት ቢያንሱ ይደውሉ። ሌላ ልርዳዎት?"
                )
                return self._say(session, msg, booked=appt)
            if has_any(text, ["አይ", "የለም", "ቀይር", "ስህተት"]):
                session["step"] = "ask_day"
                session["date"] = None
                session["time"] = None
                return self._say(session, "እሺ፣ እንደገና እንያዝ። የትኛው ቀን ነው?")
            return self._say(session, "ለማረጋገጥ «አዎ» ወይም ለመቀየር «አይ» ይበሉ።")

        return self._advance(session)

    def _advance(self, session: dict) -> dict:
        if not session.get("service"):
            session["step"] = "ask_service"
            return self._ask_service(session)
        if not session.get("date"):
            session["step"] = "ask_day"
            svc = self._service(session["service"])
            return self._say(session, f"{svc['name']} እንይዛለን። የትኛው ቀን ነው? ነገ፣ ማክሰኞ፣ ወይም ሌላ ቀን ይበሉ።")
        if not session.get("time"):
            session["step"] = "ask_time"
            free = self._free_slots(session["date"])
            day = self._pretty_date(session["date"])
            if not free:
                session["date"] = None
                session["step"] = "ask_day"
                return self._say(session, f"{day} ሙሉ ነው። ሌላ ቀን ይምረጡ።")
            return self._say(session, f"{day} ባዶ ሰዓቶች፦ {'፣ '.join(free[:7])}። የትኛው ይመቾታል?")
        if not session.get("name"):
            session["step"] = "ask_name"
            return self._say(session, "በማን ስም ቀጠሮው ይያዝ? ሙሉ ስም ይንገሩኝ።")
        if not session.get("phone"):
            session["step"] = "ask_phone"
            return self._say(session, "ስልክ ቁጥርዎን ይንገሩኝ።")
        session["step"] = "confirm"
        svc = self._service(session["service"])
        when = self._pretty_when(session["date"], session["time"])
        return self._say(
            session,
            f"ላረጋግጥ፦ {session['name']}፣ {when}፣ {svc['name']}፣ ስልክ {session['phone']}። "
            f"ከ{svc['price']} ብር ይጀምራል። ትክክል ነው? አዎ ወይም አይ ይበሉ።",
        )

    def _ask_service(self, session: dict) -> dict:
        items = [f"{i+1}) {s['name']}" for i, s in enumerate(self.clinic["services"])]
        return self._say(session, "ምን አይነት አገልግሎት ነው? " + "። ".join(items) + "። ቁጥር ወይም ስም ይበሉ።")

    def _extract_service(self, text: str) -> str | None:
        for sid, words in SERVICE_WORDS:
            if has_any(text, words):
                return sid
        return None

    def _extract_date(self, text: str) -> str | None:
        today = datetime.now().date()
        for word, val in DAY_WORDS.items():
            if word in text:
                if isinstance(val, int):
                    return (today + timedelta(days=val)).isoformat()
                if isinstance(val, str) and val.startswith("dow:"):
                    target = int(val.split(":")[1])
                    delta = (target - today.weekday()) % 7
                    if delta == 0 and word not in ("ዛሬ",):
                        delta = 7
                    return (today + timedelta(days=delta)).isoformat()
        m = re.search(r"(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?", text)
        if m:
            d, mo = int(m.group(1)), int(m.group(2))
            y = int(m.group(3)) if m.group(3) else today.year
            if y < 100:
                y += 2000
            try:
                return datetime(y, mo, d).date().isoformat()
            except ValueError:
                try:
                    return datetime(y, d, mo).date().isoformat()
                except ValueError:
                    return None
        return None

    def _extract_time(self, text: str) -> str | None:
        # Ethiopian informal: 3 ሰዓት ከሰዓት ≈ 15:00, 10 ጠዋት ≈ 10:00
        afternoon = has_any(text, ["ከሰዓት", "ምሽት", "ማታ", "ከሰዓት በኋላ"])
        morning = has_any(text, ["ጠዋት", "ጥዋት", "ሌሊት አልፎ"])

        m = re.search(r"(\d{1,2})\s*[:፡.]\s*(\d{2})", text)
        if m:
            h, mi = int(m.group(1)), int(m.group(2))
            if afternoon and h <= 6:
                h += 12
            return f"{h:02d}:{mi:02d}"

        m = re.search(r"(\d{1,2})\s*(ሰዓት|ሰዓቱ|ሠዓት)?", text)
        if m and ( "ሰዓት" in text or "ሠዓት" in text or afternoon or morning):
            h = int(m.group(1))
            if afternoon and h < 12:
                h += 12
            if h == 12 and morning:
                h = 12
            # map to nearest slot
            cand = f"{h:02d}:00"
            slots = self.clinic["slots"]
            if cand in slots:
                return cand
            # 3:00 -> 15:00 if clinic afternoon slots exist
            if h <= 7:
                alt = f"{h+12:02d}:00"
                if alt in slots:
                    return alt
            # nearest
            minutes = h * 60
            best = min(slots, key=lambda s: abs(int(s[:2]) * 60 + int(s[3:]) - minutes))
            return best
        return None

    def _extract_phone(self, text: str) -> str | None:
        digits = re.sub(r"\D", "", text)
        if digits.startswith("251") and len(digits) >= 12:
            digits = "0" + digits[3:]
        if len(digits) == 10 and digits.startswith(("09", "07")):
            return digits
        if len(digits) == 9 and digits.startswith(("9", "7")):
            return "0" + digits
        return None

    def _extract_name(self, text: str) -> str | None:
        t = text.strip()
        # skip if looks like a command
        if has_any(t, ["ቀጠሮ", "ሰዓት", "ነገ", "ዛሬ", "ስልክ", "አዎ", "አይ"]):
            # try "ስሜ አበበ ከበደ"
            m = re.search(r"ስሜ\s+(.+)$", t)
            if m:
                return m.group(1).strip()
            m = re.search(r"ስም(?:ዎ|ዬ)?\s+(.+)$", t)
            if m:
                return m.group(1).strip()
            return None
        if re.search(r"\d", t):
            return None
        parts = t.split()
        if 2 <= len(parts) <= 4 and all(len(p) >= 2 for p in parts):
            return t
        return None

    def _service(self, sid: str) -> dict:
        for s in self.clinic["services"]:
            if s["id"] == sid:
                return s
        return self.clinic["services"][0]

    def _free_slots(self, iso_date: str) -> list[str]:
        taken = self.store.taken_slots(iso_date)
        d = datetime.fromisoformat(iso_date).date()
        if d.weekday() not in self.clinic["work_days"]:
            return []
        if d < datetime.now().date():
            return []
        slots = [s for s in self.clinic["slots"] if s not in taken]
        if d == datetime.now().date():
            now = datetime.now().strftime("%H:%M")
            slots = [s for s in slots if s > now]
        return slots

    def _pretty_date(self, iso_date: str) -> str:
        d = datetime.fromisoformat(iso_date).date()
        today = datetime.now().date()
        if d == today:
            label = "ዛሬ"
        elif d == today + timedelta(days=1):
            label = "ነገ"
        else:
            label = WEEKDAYS[d.weekday()]
        return f"{label} {d.day}/{d.month}"

    def _pretty_when(self, iso_date: str, time: str) -> str:
        return f"{self._pretty_date(iso_date)} {time}"

    def _say(self, session: dict, text: str, **extra) -> dict:
        out = {"text": text, "session": session}
        out.update(extra)
        return out
