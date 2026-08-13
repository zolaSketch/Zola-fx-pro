"""Strategy simulator — pure Python.

A strategy genome is decoded into a rule set and simulated bar-by-bar with
fees, slippage, ATR stop/take-profit brackets and a regime gate. Metrics are
designed to be honest: Sharpe, max drawdown, win rate, profit factor and
trade count are all reported, never cherry-picked.
"""
import math

from . import indicators

FEE = 0.0010      # per side
SLIPPAGE = 0.0005  # per side


def decode_genome(g):
    """Map 8 float genes in [0,1] to readable parameters."""
    fast_n = indicators.FAST_SMA_LENGTHS[
        int(g[0] * (len(indicators.FAST_SMA_LENGTHS) - 1) + 0.5)]
    slow_n = indicators.SLOW_SMA_LENGTHS[
        int(g[1] * (len(indicators.SLOW_SMA_LENGTHS) - 1) + 0.5)]
    if slow_n <= fast_n:
        slow_n = min(200, fast_n * 6)
    rsi_buy = round(35.0 + g[2] * 25.0, 1)
    rsi_sell = round(60.0 + g[3] * 25.0, 1)
    if rsi_sell < rsi_buy + 10:
        rsi_sell = round(rsi_buy + 10.0, 1)
    atr_stop = round(1.2 + g[4] * 3.8, 2)
    atr_tp = round(2.0 + g[5] * 6.0, 2)
    if atr_tp < atr_stop * 1.3:
        atr_tp = round(atr_stop * 1.3, 2)
    risk_pct = round(0.5 + g[6] * 3.5, 1)
    mask = 1 + int(g[7] * 14.999)
    return {
        "fast": fast_n, "slow": slow_n, "rsi_buy": rsi_buy,
        "rsi_sell": rsi_sell, "atr_stop": atr_stop, "atr_tp": atr_tp,
        "risk_pct": risk_pct, "mask": mask,
    }


def dna_code(params):
    return ("Z1|f%d-%d|r%.0f-%.0f|a%.1f-%.1f|k%.1f|m%d" % (
        params["fast"], params["slow"], params["rsi_buy"], params["rsi_sell"],
        params["atr_stop"], params["atr_tp"], params["risk_pct"],
        params["mask"]))


def regime_allows(mask, label):
    return (mask >> label) & 1 == 1


def backtest(candles, suite, labels, genome, interval_sec=3600,
             start=0, end=None, min_trades=0):
    """Simulate one genome over bars [start, end).

    Returns a metrics dict including an (optionally downsampled) equity curve.
    """
    if end is None:
        end = len(candles)
    p = decode_genome(genome)
    sma_fast = suite["sma%d" % p["fast"]]
    sma_slow = suite["sma%d" % p["slow"]]
    rsi = suite["rsi14"]
    atr = suite["atr14"]
    closes = suite["close"]
    highs = [c["h"] for c in candles]
    lows = [c["l"] for c in candles]

    equity = 10000.0
    cash = 10000.0
    qty = 0.0
    pos = 0            # 1 long, -1 short, 0 flat
    entry_px = 0.0
    stop = 0.0
    tp = 0.0
    curve = []
    trades = []
    bars_in_pos = 0
    last_exit = -10    # bar index of the last exit (cooldown)

    cost = FEE + SLIPPAGE
    last = start
    for i in range(start, end):
        f = sma_fast[i]
        s = sma_slow[i]
        r = rsi[i]
        a = atr[i]
        c = closes[i]
        h = highs[i]
        l = lows[i]
        ok = None not in (f, s, r, a)

        if pos != 0 and i > last + 1:
            # intrabar stop / take-profit
            if pos == 1:
                if l <= stop:
                    exit_px = stop * (1.0 - SLIPPAGE)
                    pnl = qty * (exit_px - entry_px) - cost * qty * (entry_px + exit_px)
                    cash += qty * exit_px - qty * exit_px * (FEE + SLIPPAGE)
                    qty = 0.0
                    trades.append({
                        "side": "long", "entry": round(entry_px, 6),
                        "exit": round(exit_px, 6), "pnl": round(pnl, 2),
                        "bars": i - last, "i_entry": last - start, "i_exit": i - start})
                    pos = 0
                    last_exit = i
                elif h >= tp:
                    exit_px = tp * (1.0 + SLIPPAGE)
                    pnl = qty * (exit_px - entry_px) - cost * qty * (entry_px + exit_px)
                    cash += qty * exit_px - qty * exit_px * (FEE + SLIPPAGE)
                    qty = 0.0
                    trades.append({
                        "side": "long", "entry": round(entry_px, 6),
                        "exit": round(exit_px, 6), "pnl": round(pnl, 2),
                        "bars": i - last, "i_entry": last - start, "i_exit": i - start})
                    pos = 0
                    last_exit = i
            elif pos == -1:
                if h >= stop:
                    exit_px = stop * (1.0 + SLIPPAGE)
                    pnl = qty * (entry_px - exit_px) - cost * qty * (entry_px + exit_px)
                    cash += qty * exit_px - qty * exit_px * (FEE + SLIPPAGE)
                    qty = 0.0
                    trades.append({
                        "side": "short", "entry": round(entry_px, 6),
                        "exit": round(exit_px, 6), "pnl": round(pnl, 2),
                        "bars": i - last, "i_entry": last - start, "i_exit": i - start})
                    pos = 0
                    last_exit = i
                elif l <= tp:
                    exit_px = tp * (1.0 - SLIPPAGE)
                    pnl = qty * (entry_px - exit_px) - cost * qty * (entry_px + exit_px)
                    cash += qty * exit_px - qty * exit_px * (FEE + SLIPPAGE)
                    qty = 0.0
                    trades.append({
                        "side": "short", "entry": round(entry_px, 6),
                        "exit": round(exit_px, 6), "pnl": round(pnl, 2),
                        "bars": i - last, "i_entry": last - start, "i_exit": i - start})
                    pos = 0
                    last_exit = i

        if pos == 1 and ok:
            if f < s or r > p["rsi_sell"]:
                exit_px = c * (1.0 - SLIPPAGE)
                pnl = qty * (exit_px - entry_px) - cost * qty * (entry_px + exit_px)
                cash += qty * exit_px - qty * exit_px * (FEE + SLIPPAGE)
                qty = 0.0
                trades.append({
                    "side": "long", "entry": round(entry_px, 6),
                    "exit": round(exit_px, 6), "pnl": round(pnl, 2),
                    "bars": i - last, "i_entry": last - start, "i_exit": i - start})
                pos = 0
                last_exit = i
        elif pos == -1 and ok:
            if f > s or r < 100.0 - p["rsi_sell"]:
                exit_px = c * (1.0 + SLIPPAGE)
                pnl = qty * (entry_px - exit_px) - cost * qty * (entry_px + exit_px)
                cash += qty * exit_px - qty * exit_px * (FEE + SLIPPAGE)
                qty = 0.0
                trades.append({
                    "side": "short", "entry": round(entry_px, 6),
                    "exit": round(exit_px, 6), "pnl": round(pnl, 2),
                    "bars": i - last, "i_entry": last - start, "i_exit": i - start})
                pos = 0
                last_exit = i

        if pos == 0 and ok and i > start and i > last_exit + 2:
            cross_up = f > s and sma_fast[i - 1] is not None and \
                sma_slow[i - 1] is not None and sma_fast[i - 1] <= sma_slow[i - 1]
            cross_dn = f < s and sma_fast[i - 1] is not None and \
                sma_slow[i - 1] is not None and sma_fast[i - 1] >= sma_slow[i - 1]
            pr = rsi[i - 1]
            # trend-following re-entry on RSI pullback within an established trend
            pullback_up = pr is not None and f > s and pr <= p["rsi_buy"] < r
            pullback_dn = pr is not None and f < s and pr >= 100.0 - p["rsi_buy"] > r
            allowed = regime_allows(p["mask"], labels[i])
            if allowed and p["rsi_buy"] <= r < p["rsi_sell"] and (cross_up or pullback_up):
                entry_px = c * (1.0 + SLIPPAGE)
                stop = entry_px - p["atr_stop"] * a
                tp = entry_px + p["atr_tp"] * a
                qty = equity * (p["risk_pct"] / 100.0) / max(a * p["atr_stop"], 1e-12)
                qty = min(qty, equity * 5.0 / entry_px)  # leverage cap
                cash -= qty * entry_px + qty * entry_px * (FEE + SLIPPAGE)
                pos = 1
                last = i
            elif allowed and 100.0 - p["rsi_sell"] < r <= 100.0 - p["rsi_buy"] and (cross_dn or pullback_dn):
                entry_px = c * (1.0 - SLIPPAGE)
                stop = entry_px + p["atr_stop"] * a
                tp = entry_px - p["atr_tp"] * a
                qty = equity * (p["risk_pct"] / 100.0) / max(a * p["atr_stop"], 1e-12)
                qty = min(qty, equity * 5.0 / entry_px)  # leverage cap
                cash -= qty * entry_px + qty * entry_px * (FEE + SLIPPAGE)
                pos = -1
                last = i

        if pos != 0:
            bars_in_pos += 1
        equity = cash + qty * c
        curve.append(equity)

    # Close any open position at the final bar (still flat in PnL terms).
    metrics = summarize(curve, closes[start:end], trades, bars_in_pos,
                        len(curve), interval_sec)
    metrics["params"] = p
    metrics["dna"] = dna_code(p)
    return metrics


def summarize(curve, closes, trades, bars_in_pos, n_bars, interval_sec):
    start_eq = curve[0] if curve else 10000.0
    final_eq = curve[-1] if curve else start_eq
    total_ret = (final_eq / start_eq - 1.0) * 100.0

    rets = []
    for i in range(1, len(curve)):
        if curve[i - 1] > 0:
            rets.append(curve[i] / curve[i - 1] - 1.0)
    ppy = (365.0 * 86400.0) / max(interval_sec, 60)
    ann_sharpe = 0.0
    if len(rets) > 5:
        mean = sum(rets) / len(rets)
        var = sum((r - mean) ** 2 for r in rets) / len(rets)
        if var > 1e-18:
            ann_sharpe = (mean / math.sqrt(var)) * math.sqrt(ppy)

    peak = -1e18
    max_dd = 0.0
    for e in curve:
        peak = max(peak, e)
        if peak > 0:
            max_dd = max(max_dd, (peak - e) / peak * 100.0)

    wins = [t for t in trades if t["pnl"] > 0]
    losses = [t for t in trades if t["pnl"] <= 0]
    gross_w = sum(t["pnl"] for t in wins)
    gross_l = abs(sum(t["pnl"] for t in losses))
    profit_factor = (gross_w / gross_l) if gross_l > 0 else (
        99.0 if gross_w > 0 else 0.0)

    # Buy & hold on the same window, normalized to the strategy start equity.
    bh = []
    if closes:
        base = closes[0] or 1.0
        bh = [round(start_eq * c / base, 2) for c in closes]

    step = max(1, len(curve) // 300)
    eq_down = [round(curve[i], 2) for i in range(0, len(curve), step)]
    if len(curve) > 1 and (len(curve) - 1) % step:
        eq_down.append(round(curve[-1], 2))
    bh_down = [round(bh[i], 2) for i in range(0, len(bh), step)] if bh else []

    return {
        "total_ret": round(total_ret, 2),
        "ann_sharpe": round(ann_sharpe, 2),
        "max_dd": round(max_dd, 2),
        "trades": len(trades),
        "win_rate": round(100.0 * len(wins) / len(trades), 1) if trades else 0.0,
        "profit_factor": round(profit_factor, 2),
        "exposure": round(100.0 * bars_in_pos / max(1, n_bars), 1),
        "equity": eq_down,
        "buyhold": bh_down,
        "trades_list": trades[:200],
    }
