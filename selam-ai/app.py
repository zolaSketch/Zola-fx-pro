#!/usr/bin/env python3
"""ሰላም AI ተቀባይ — በአካባቢ የሚሮጥ ሙሉ ሥርዓት።"""

from __future__ import annotations

import json
from pathlib import Path

from flask import Flask, jsonify, render_template, request

from brain import SelamBrain
from store import Store

ROOT = Path(__file__).parent
DATA = ROOT / "data"

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False

clinic = json.loads((DATA / "clinic.json").read_text(encoding="utf-8"))
store = Store(DATA / "appointments.json")
brain = SelamBrain(clinic, store)
SESSIONS: dict[str, dict] = {}


@app.get("/")
def home():
    return render_template("index.html", clinic=clinic)


@app.get("/call")
def call():
    return render_template("call.html", clinic=clinic)


@app.get("/desk")
def desk():
    return render_template("desk.html", clinic=clinic, appointments=store.upcoming())


@app.get("/api/clinic")
def api_clinic():
    return jsonify(clinic)


@app.get("/api/appointments")
def api_appointments():
    return jsonify(store.all())


@app.post("/api/appointments/<appt_id>/status")
def api_status(appt_id: str):
    body = request.get_json(force=True, silent=True) or {}
    ok = store.set_status(appt_id, body.get("status", "booked"))
    return jsonify({"ok": ok})


@app.post("/api/chat")
def api_chat():
    body = request.get_json(force=True, silent=True) or {}
    sid = (body.get("session_id") or "web").strip()
    text = (body.get("text") or "").strip()
    reset = bool(body.get("reset"))
    if reset or sid not in SESSIONS:
        SESSIONS[sid] = brain.new_session()
        SESSIONS[sid]["id"] = sid
        if reset and not text:
            result = brain.reply(SESSIONS[sid], "ሰላም")
            return jsonify(result)
    result = brain.reply(SESSIONS[sid], text)
    SESSIONS[sid] = result["session"]
    return jsonify(result)


@app.post("/api/clinic")
def api_clinic_update():
    global clinic, brain
    body = request.get_json(force=True, silent=True) or {}
    for key in ("name", "phone", "address", "hours", "agent_name"):
        if key in body and str(body[key]).strip():
            clinic[key] = str(body[key]).strip()
    (DATA / "clinic.json").write_text(json.dumps(clinic, ensure_ascii=False, indent=2), encoding="utf-8")
    brain = SelamBrain(clinic, store)
    return jsonify(clinic)


if __name__ == "__main__":
    print("\n  ሰላም AI ተቀባይ ተከፍቷል")
    print("  http://0.0.0.0:5050\n")
    app.run(host="0.0.0.0", port=8080, debug=False)
