"""Indicator suite — pure Python, precomputed once per dataset.

Every function returns a list the same length as the input; leading values
that cannot be computed yet are ``None``.
"""
import math


def sma(vals, n):
    out = [None] * len(vals)
    if len(vals) < n:
        return out
    s = 0.0
    for i, v in enumerate(vals):
        s += v
        if i >= n:
            s -= vals[i - n]
        if i >= n - 1:
            out[i] = s / n
    return out


def ema(vals, n):
    out = [None] * len(vals)
    if len(vals) < n:
        return out
    k = 2.0 / (n + 1.0)
    prev = sum(vals[:n]) / n
    out[n - 1] = prev
    for i in range(n, len(vals)):
        prev = vals[i] * k + prev * (1.0 - k)
        out[i] = prev
    return out


def rsi(closes, n=14):
    out = [None] * len(closes)
    if len(closes) <= n:
        return out
    avg_g = avg_l = 0.0
    for i in range(1, n + 1):
        d = closes[i] - closes[i - 1]
        if d >= 0:
            avg_g += d
        else:
            avg_l -= d
    avg_g /= n
    avg_l /= n
    out[n] = _rsi_from(avg_g, avg_l)
    for i in range(n + 1, len(closes)):
        d = closes[i] - closes[i - 1]
        g = d if d > 0 else 0.0
        l = -d if d < 0 else 0.0
        avg_g = (avg_g * (n - 1) + g) / n
        avg_l = (avg_l * (n - 1) + l) / n
        out[i] = _rsi_from(avg_g, avg_l)
    return out


def _rsi_from(avg_g, avg_l):
    if avg_l == 0.0:
        return 100.0
    rs = avg_g / avg_l
    return 100.0 - 100.0 / (1.0 + rs)


def atr(highs, lows, closes, n=14):
    out = [None] * len(closes)
    if len(closes) <= n:
        return out
    prev_c = closes[0]
    trs = []
    for i in range(1, len(closes)):
        h, l, c = highs[i], lows[i], closes[i]
        tr = max(h - l, abs(h - prev_c), abs(l - prev_c))
        trs.append(tr)
        prev_c = c
    avg = sum(trs[:n]) / n
    out[n] = avg
    for i in range(n, len(trs)):
        avg = (avg * (n - 1) + trs[i]) / n
        out[i + 1] = avg
    return out


def roc(vals, n):
    out = [None] * len(vals)
    for i in range(n, len(vals)):
        out[i] = vals[i] / vals[i - n] - 1.0
    return out


def stdev(vals, n):
    """Rolling population standard deviation."""
    out = [None] * len(vals)
    if len(vals) < n:
        return out
    s = 0.0
    s2 = 0.0
    for i, v in enumerate(vals):
        s += v
        s2 += v * v
        if i >= n:
            s -= vals[i - n]
            s2 -= vals[i - n] * vals[i - n]
        if i >= n - 1:
            mean = s / n
            var = max(0.0, s2 / n - mean * mean)
            out[i] = math.sqrt(var)
    return out


def log_returns(closes):
    out = [None] * len(closes)
    for i in range(1, len(closes)):
        out[i] = math.log(closes[i] / closes[i - 1])
    return out


def build_suite(candles):
    """Precompute every indicator series the engine may need.

    Returns a dict of lists aligned with ``candles``.
    """
    closes = [c["c"] for c in candles]
    highs = [c["h"] for c in candles]
    lows = [c["l"] for c in candles]
    suite = {"close": closes}
    for n in sorted(set(list(FAST_SMA_LENGTHS) + list(SLOW_SMA_LENGTHS) + [50])):
        suite["sma%d" % n] = sma(closes, n)
    for n in (12, 26, 50):
        suite["ema%d" % n] = ema(closes, n)
    for n in (7, 14, 21):
        suite["rsi%d" % n] = rsi(closes, n)
    suite["atr14"] = atr(highs, lows, closes, 14)
    suite["roc10"] = roc(closes, 10)
    suite["roc20"] = roc(closes, 20)
    suite["std20"] = stdev(closes, 20)
    suite["std50"] = stdev(closes, 50)
    return suite


# Fast/slow SMA candidates the genome may pick from.
FAST_SMA_LENGTHS = (5, 8, 13, 21, 34)
SLOW_SMA_LENGTHS = (40, 60, 80, 100, 150, 200)


def pick_sma(suite, gene_fast, gene_slow):
    """Map two float genes in [0,1] to (fast_series, slow_series)."""
    fi = int(gene_fast * (len(FAST_SMA_LENGTHS) - 1) + 0.5)
    fast_n = FAST_SMA_LENGTHS[max(0, min(fi, len(FAST_SMA_LENGTHS) - 1))]
    si = int(gene_slow * (len(SLOW_SMA_LENGTHS) - 1) + 0.5)
    slow_n = SLOW_SMA_LENGTHS[max(0, min(si, len(SLOW_SMA_LENGTHS) - 1))]
    if slow_n <= fast_n:
        slow_n = min(200, fast_n * 6)
    return suite["sma%d" % fast_n], suite["sma%d" % slow_n], fast_n, slow_n
