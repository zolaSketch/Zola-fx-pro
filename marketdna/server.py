#!/usr/bin/env python3
"""ZOLA MarketDNA — zero-dependency server (pure stdlib).

Routes
------
GET  /                    -> web app
GET  /<static file>       -> static assets
GET  /api/health          -> liveness + version
GET  /api/synth           -> deterministic synthetic OHLCV (offline demo data)
POST /api/evolve          -> start a genetic walk-forward evolution (returns job_id)
GET  /api/job?id=...      -> poll evolution progress / result
GET  /api/hof             -> hall of fame (persisted champions)
POST /api/hof/save        -> persist a champion
POST /api/hof/delete      -> remove a champion
"""
import json
import os
import sys
import threading
import time
import uuid
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DIR = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(DIR, "static")
HOF_FILE = os.path.join(DIR, "hof.json")

sys.path.insert(0, DIR)
from engine import synth, evolve  # noqa: E402
from engine import __version__  # noqa: E402

INTERVAL_SEC = {"1m": 60, "5m": 300, "15m": 900, "1h": 3600,
                "4h": 14400, "1d": 86400}

JOBS = {}
JOBS_LOCK = threading.Lock()
HOF_LOCK = threading.Lock()

MAX_BARS = 1500
MIN_BARS = 150


# ------------------------------------------------------------- hall of fame

def load_hof():
    try:
        with open(HOF_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return []


def save_hof(entries):
    with HOF_LOCK:
        try:
            with open(HOF_FILE, "w", encoding="utf-8") as f:
                json.dump(entries, f, ensure_ascii=False, indent=1)
        except OSError:
            pass


def _run_job(job_id, candles, interval_sec, population, generations, folds,
             seed):
    job = JOBS[job_id]
    t0 = time.time()
    try:

        def progress(frac, stage):
            job["progress"] = round(min(1.0, frac), 3)
            job["stage"] = stage

        result = evolve.evolve(candles, interval_sec, population, generations,
                               folds, seed, progress=progress)
        result["job_id"] = job_id
        result["elapsed"] = round(time.time() - t0, 2)
        job["status"] = "done"
        job["result"] = result
    except Exception as exc:  # pragma: no cover
        job["status"] = "error"
        job["error"] = "%s: %s" % (type(exc).__name__, exc)


def _read_json(handler, max_bytes=2_000_000):
    length = int(handler.headers.get("Content-Length") or 0)
    if length <= 0 or length > max_bytes:
        raise ValueError("bad body")
    raw = handler.rfile.read(length)
    return json.loads(raw.decode("utf-8"))


class H(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send(self, code, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if not getattr(self, "_is_head", False):
            self.wfile.write(body)

    def do_HEAD(self):
        self._is_head = True
        self.do_GET()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-Frame-Options", "ALLOWALL")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)

        if path == "/api/health":
            self._send(200, {"ok": True, "app": "ZOLA MarketDNA",
                             "version": __version__,
                             "jobs": len(JOBS), "t": int(time.time())})
            return

        if path == "/api/synth":
            bars = int(qs.get("bars", ["1000"])[0])
            bars = max(MIN_BARS, min(MAX_BARS, bars))
            symbol = qs.get("symbol", ["EURUSD"])[0].upper()
            interval = qs.get("interval", ["1h"])[0]
            seed = qs.get("seed", [None])[0]
            seed = int(seed) if seed and seed.isdigit() else None
            candles = synth.synth_candles(symbol, interval, bars, seed)
            self._send(200, {"symbol": symbol, "interval": interval,
                             "bars": len(candles), "candles": candles,
                             "source": "simulation"})
            return

        if path == "/api/job":
            job = JOBS.get(qs.get("id", [""])[0])
            if not job:
                self._send(404, {"error": "job not found"}, status=404)
                return
            self._send(200, job)
            return

        if path == "/api/hof":
            self._send(200, {"entries": load_hof()})
            return

        if path == "/":
            path = "/index.html"
        self._serve_static(path)

    def _serve_static(self, path):
        safe = os.path.normpath(path.lstrip("/"))
        if safe.startswith("..") or os.path.isabs(safe):
            self.send_error(403)
            return
        full = os.path.join(STATIC, safe)
        if not os.path.isfile(full):
            self.send_error(404)
            return
        ctype = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".png": "image/png", ".svg": "image/svg+xml",
            ".webmanifest": "application/manifest+json",
        }.get(os.path.splitext(full)[1], "application/octet-stream")
        try:
            data = open(full, "rb").read()
        except OSError:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        if safe.endswith(".html") or safe == "index.html":
            self.send_header("Cache-Control", "no-store")
        else:
            self.send_header("Cache-Control", "max-age=3600")
        self.end_headers()
        if not getattr(self, "_is_head", False):
            self.wfile.write(data)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        try:
            if path == "/api/regimes":
                body = _read_json(self)
                candles = body.get("candles") or []
                if not MIN_BARS <= len(candles) <= MAX_BARS:
                    self._send(400, {"error": "candles must be %d..%d bars"
                                     % (MIN_BARS, MAX_BARS)}, status=400)
                    return
                from engine import regimes
                labels, meta = regimes.detect_regimes(candles)
                self._send(200, {"labels": labels, "meta": meta})
                return

            if path == "/api/evolve":
                body = _read_json(self)
                candles = body.get("candles") or []
                if not MIN_BARS <= len(candles) <= MAX_BARS:
                    self._send(400, {"error": "candles must be %d..%d bars"
                                     % (MIN_BARS, MAX_BARS)}, status=400)
                    return
                interval_sec = INTERVAL_SEC.get(body.get("interval", "1h"), 3600)
                job_id = uuid.uuid4().hex[:12]
                job = {"id": job_id, "status": "running", "progress": 0.0,
                       "stage": "በመጀመር ላይ…", "created": int(time.time())}
                with JOBS_LOCK:
                    JOBS[job_id] = job
                    if len(JOBS) > 40:
                        for old in sorted(JOBS, key=lambda k: JOBS[k].get("created", 0))[:10]:
                            JOBS.pop(old, None)
                t = threading.Thread(target=_run_job, daemon=True, args=(
                    job_id, candles, interval_sec,
                    int(body.get("population", 16)),
                    int(body.get("generations", 14)),
                    int(body.get("folds", 3)),
                    int(body.get("seed", 42))))
                t.start()
                self._send(200, {"job_id": job_id})
                return

            if path == "/api/hof/save":
                entry = _read_json(self)
                entries = load_hof()
                entries.insert(0, entry)
                entries = entries[:30]
                save_hof(entries)
                self._send(200, {"ok": True, "count": len(entries)})
                return

            if path == "/api/hof/delete":
                body = _read_json(self)
                entries = [e for e in load_hof()
                           if e.get("id") != body.get("id")]
                save_hof(entries)
                self._send(200, {"ok": True, "count": len(entries)})
                return
        except (ValueError, json.JSONDecodeError, KeyError) as exc:
            self._send(400, {"error": str(exc)}, status=400)
            return
        self._send(404, {"error": "not found"}, status=404)

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)


def main():
    port = int(os.environ.get("PORT", "8000"))
    srv = ThreadingHTTPServer(("0.0.0.0", port), H)
    print("ZOLA MarketDNA v%s  ->  http://0.0.0.0:%d" % (__version__, port),
          flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
