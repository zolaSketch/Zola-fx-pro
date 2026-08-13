"""Deterministic synthetic market generator.

Generates OHLCV candles from a Markov regime-switching random walk so the
whole product works offline and the demo always has realistic, clearly
labelled data. Every call with the same (symbol, interval, bars, seed)
produces identical candles.
"""
import hashlib
import math
import random
import time

# Symbol profile: base price, pip/unit scale, display name.
SYMBOLS = {
    "BTCUSD":  (63000.0, "Bitcoin (ሲምዩሌሽን)"),
    "ETHUSD":  (3300.0,  "Ethereum (ሲምዩሌሽን)"),
    "SOLUSD":  (148.0,   "Solana (ሲምዩሌሽን)"),
    "EURUSD":  (1.0850,  "Euro / Dollar (ሲምዩሌሽን)"),
    "GBPUSD":  (1.2700,  "Pound / Dollar (ሲምዩሌሽን)"),
    "USDJPY":  (156.0,   "Dollar / Yen (ሲምዩሌሽን)"),
    "GOLD":    (2400.0,  "Gold (ሲምዩሌሽን)"),
    "SP500":   (5200.0,  "S&P 500 (ሲምዩሌሽን)"),
}

INTERVALS = {"1h": 3600, "4h": 14400, "1d": 86400}

# Regime states: (drift per bar, volatility per bar)
REGIMES = [
    ("calm", 0.0001, 0.0035),
    ("up", 0.0014, 0.0075),
    ("down", -0.0014, 0.0075),
    ("storm", 0.0002, 0.0260),
]


def _seed_for(symbol, interval, bars, seed):
    if seed is None:
        key = "%s|%s|%d" % (symbol, interval, bars)
        seed = int(hashlib.sha256(key.encode()).hexdigest()[:8], 16)
    return seed


def synth_candles(symbol="EURUSD", interval="1h", bars=800, seed=None):
    """Return a list of OHLCV dicts (chronological order)."""
    if symbol not in SYMBOLS:
        symbol = "EURUSD"
    base_price = SYMBOLS[symbol][0]
    step = INTERVALS.get(interval, 3600)
    rng = random.Random(_seed_for(symbol, interval, bars, seed))

    # Markov regime chain with strong persistence.
    state = rng.randrange(4)
    states = []
    for _ in range(bars):
        if rng.random() > 0.975:
            state = rng.randrange(4)
        states.append(state)

    candles = []
    price = base_price * (0.9 + rng.random() * 0.2)
    now = int(time.time()) - bars * step
    for i in range(bars):
        _, drift, vol = REGIMES[states[i]]
        o = price
        # Intrabar path (4 steps) so OHLC looks organic.
        path = [o]
        for _ in range(4):
            r = drift + rng.gauss(0.0, vol)
            path.append(path[-1] * math.exp(r))
        c = path[-1]
        h = max(path)
        l = min(path)
        v = rng.uniform(0.7, 1.4) * (1.0 + 2.0 * vol) * base_price
        candles.append({
            "t": (now + i * step) * 1000,
            "o": round(o, 6),
            "h": round(h, 6),
            "l": round(l, 6),
            "c": round(c, 6),
            "v": round(v, 2),
        })
        price = c
    return candles
