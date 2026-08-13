"""Regime DNA — unsupervised market-state fingerprinting.

Four features per bar (volatility, trend slope, momentum, mean-distance)
are z-scored and clustered with k-means (k=4, multiple restarts). Clusters
are deterministically named by their centroid character:

    calm (ረጋ ያለ)   — low volatility, flat trend
    up   (ጭማሪ)      — positive trend, moderate volatility
    down (ቅናሽ)      — negative trend, moderate volatility
    storm (ማዕበል)   — highest volatility, erratic

Pure Python — no numpy, no dependencies.
"""
import math
import random

from . import indicators

WARMUP = 60  # bars skipped while feature windows fill

REGIME_META = {
    0: {"id": "calm",  "en": "Calm",      "am": "ረጋ ያለ", "color": "#2dd4bf"},
    1: {"id": "up",    "en": "Uptrend",   "am": "ጭማሪ",   "color": "#4ade80"},
    2: {"id": "down",  "en": "Downtrend", "am": "ቅናሽ",   "color": "#f87171"},
    3: {"id": "storm", "en": "Storm",     "am": "ማዕበል", "color": "#c084fc"},
}


def _zscore(col):
    vals = [v for v in col if v is not None]
    if not vals:
        return [None] * len(col)
    n = len(vals)
    mean = sum(vals) / n
    var = sum((v - mean) ** 2 for v in vals) / n
    sd = math.sqrt(var) if var > 1e-18 else 1e-9
    return [None if v is None else (v - mean) / sd for v in col]


def _kmeans(rows, k, iters=40, restarts=8, seed=7):
    rng = random.Random(seed)
    best = None
    dim = len(rows[0])
    for _ in range(restarts):
        centers = [list(rows[rng.randrange(len(rows))]) for _ in range(k)]
        labels = [0] * len(rows)
        for _ in range(iters):
            changed = False
            for i, x in enumerate(rows):
                best_c = 0
                best_d = 1e308
                for ci, c in enumerate(centers):
                    d = 0.0
                    for a, b in zip(x, c):
                        d += (a - b) * (a - b)
                    if d < best_d:
                        best_d = d
                        best_c = ci
                if labels[i] != best_c:
                    labels[i] = best_c
                    changed = True
            acc = [[0.0] * dim for _ in range(k)]
            cnt = [0] * k
            for x, lb in zip(rows, labels):
                cnt[lb] += 1
                for j, v in enumerate(x):
                    acc[lb][j] += v
            for ci in range(k):
                if cnt[ci]:
                    centers[ci] = [v / cnt[ci] for v in acc[ci]]
            if not changed:
                break
        inertia = 0.0
        for x, lb in zip(rows, labels):
            d = 0.0
            for a, b in zip(x, centers[lb]):
                d += (a - b) * (a - b)
            inertia += d
        if best is None or inertia < best[0]:
            best = (inertia, centers, list(labels))
    return best[1], best[2]


def detect_regimes(candles):
    """Cluster bars into regimes.

    Returns (labels, meta) where labels[i] is a regime id (0..3) and meta
    carries per-cluster statistics plus the full legend.
    """
    n = len(candles)
    suite = indicators.build_suite(candles)
    closes = suite["close"]
    ema50 = suite["ema50"]
    sma50 = suite["sma50"]
    std50 = suite["std50"]
    lrets = indicators.log_returns(closes)
    std20 = suite["std20"]

    feat_vol = [None] * n
    feat_trend = [None] * n
    feat_mom = [None] * n
    feat_dist = [None] * n
    for i in range(n):
        if i < WARMUP:
            continue
        feat_vol[i] = std20[i] / closes[i] if std20[i] and closes[i] else 0.0
        base = ema50[i - 40] if ema50[i - 40] else 1e-9
        feat_trend[i] = (ema50[i] - base) / base
        feat_mom[i] = closes[i] / closes[i - 10] - 1.0
        if std50[i] and std50[i] > 0:
            feat_dist[i] = (closes[i] - sma50[i]) / std50[i]
        else:
            feat_dist[i] = 0.0

    zv = _zscore(feat_vol)
    zt = _zscore(feat_trend)
    zm = _zscore(feat_mom)
    zd = _zscore(feat_dist)

    rows = []
    idx = []
    for i in range(n):
        if None in (zv[i], zt[i], zm[i], zd[i]):
            continue
        rows.append([zv[i], zt[i], zm[i], zd[i]])
        idx.append(i)

    if len(rows) < 20:
        labels = [0] * n
        meta = _summarize([], labels, n, closes)
        return labels, meta

    centers, cluster_ids = _kmeans(rows, k=4)
    # Centroid character on ORIGINAL features.
    feat_sum = [[0.0, 0.0, 0.0, 0.0] for _ in range(4)]
    cnt = [0] * 4
    for r, cid in zip(rows, cluster_ids):
        cnt[cid] += 1
        for j in range(4):
            feat_sum[cid][j] += r[j]
    char = []
    for cid in range(4):
        char.append([feat_sum[cid][j] / max(1, cnt[cid]) for j in range(4)])
    # vol rank: 0 = calmest, 3 = stormiest
    vol_order = sorted(range(4), key=lambda c: char[c][0])
    # trend sign
    name = [None] * 4
    name[vol_order[0]] = "calm"
    name[vol_order[3]] = "storm"
    rest = [vol_order[1], vol_order[2]]
    rest.sort(key=lambda c: -char[c][1])  # most positive trend first
    name[rest[0]] = "up"
    name[rest[1]] = "down"
    name_to_id = {"calm": 0, "up": 1, "down": 2, "storm": 3}

    labels = [0] * n
    for i, cid in zip(idx, cluster_ids):
        labels[i] = name_to_id[name[cid]]
    meta = _summarize(char, labels, n, closes)
    meta["k"] = 4
    meta["cluster_char"] = char
    return labels, meta


def _summarize(char, labels, n, closes):
    dist = [0, 0, 0, 0]
    for lb in labels:
        dist[lb] += 1
    total = max(1, sum(dist))
    current = labels[-1] if labels else 0
    vol = 0.0
    if n > 30:
        r = [math.log(closes[i] / closes[i - 1]) for i in range(n - 30, n)]
        mean = sum(r) / len(r)
        vol = math.sqrt(sum((x - mean) ** 2 for x in r) / len(r))
    trend = 0.0
    if n > 60 and closes[-1] and closes[-60]:
        trend = closes[-1] / closes[-60] - 1.0
    return {
        "current": current,
        "distribution": [round(100.0 * d / total, 1) for d in dist],
        "volatility": round(vol, 5),
        "trend_60": round(trend, 4),
        "legend": [
            {"id": m["id"], "en": m["en"], "am": m["am"], "color": m["color"]}
            for m in REGIME_META.values()
        ],
    }
