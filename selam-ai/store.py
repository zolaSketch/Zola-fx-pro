from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from threading import Lock


class Store:
    def __init__(self, path: Path):
        self.path = path
        self.lock = Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self._write({"appointments": []})

    def _read(self) -> dict:
        return json.loads(self.path.read_text(encoding="utf-8"))

    def _write(self, data: dict) -> None:
        self.path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    def all(self) -> list[dict]:
        with self.lock:
            items = self._read()["appointments"]
        items.sort(key=lambda a: (a.get("date", ""), a.get("time", "")), reverse=True)
        return items

    def upcoming(self) -> list[dict]:
        today = datetime.now().date().isoformat()
        return [a for a in self.all() if a.get("status") == "booked" and a.get("date", "") >= today]

    def taken_slots(self, iso_date: str) -> set[str]:
        with self.lock:
            items = self._read()["appointments"]
        return {a["time"] for a in items if a.get("date") == iso_date and a.get("status") == "booked"}

    def add(self, session: dict, clinic: dict) -> dict:
        appt = {
            "id": str(uuid.uuid4())[:8].upper(),
            "name": session["name"],
            "phone": session["phone"],
            "service_id": session["service"],
            "service": next(s["name"] for s in clinic["services"] if s["id"] == session["service"]),
            "date": session["date"],
            "time": session["time"],
            "status": "booked",
            "created": datetime.now().isoformat(timespec="seconds"),
            "source": "selam",
        }
        with self.lock:
            data = self._read()
            data["appointments"].append(appt)
            self._write(data)
        return appt

    def cancel_by_phone(self, phone: str) -> bool:
        with self.lock:
            data = self._read()
            changed = False
            for a in data["appointments"]:
                if a.get("phone") == phone and a.get("status") == "booked":
                    a["status"] = "cancelled"
                    changed = True
            if changed:
                self._write(data)
            return changed

    def set_status(self, appt_id: str, status: str) -> bool:
        with self.lock:
            data = self._read()
            for a in data["appointments"]:
                if a["id"] == appt_id:
                    a["status"] = status
                    self._write(data)
                    return True
        return False
