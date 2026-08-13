"""Genetic strategy evolution with walk-forward validation — pure Python.

Pipeline (the "honesty engine"):

1. The dataset is split into train/test windows that march forward in time.
2. In each fold, a small genetic algorithm breeds a champion ON THE TRAIN
   WINDOW ONLY. The champion is then frozen and scored on the following
   OUT-OF-SAMPLE test window it has never seen.
3. The final champion is the fold champion with the best out-of-sample
   score — not the best in-sample one.
4. A separate "naive" run optimises on the full dataset, so the UI can show
   the overfitting gap (naive vs walk-forward) transparently.

Genome: 8 float genes in [0,1] -> (SMA fast, SMA slow, RSI buy, RSI sell,
ATR stop, ATR target, risk %, regime mask). Selection: elitism + tournament,
uniform crossover, gaussian mutation.
"""
import math
import random

from . import backtest

WARMUP_BT = 120  # indicator warm-up bars for every backtest window

DEFAULTS = {"population": 16, "generations": 14, "folds": 3}


# ---------------------------------------------------------------- GA core

def random_genome(rng):
    return [rng.random() for _ in range(8)]


def crossover(a, b, rng):
    return [x if rng.random() < 0.5 else y for x, y in zip(a, b)]


def mutate(g, rng, rate=0.30, sigma=0.14):
    out = list(g)
    for i in range(len(out)):
        if rng.random() < rate:
            out[i] += rng.gauss(0.0, sigma)
            if rng.random() < 0.07:
                out[i] = rng.random()
            out[i] = max(0.0, min(1.0, out[i]))
    return out


def _score(m, min_trades):
    if m["trades"] < min_trades:
        return -10.0 + m["trades"]
    return m["ann_sharpe"] - 0.35 * (m["max_dd"] / 100.0)


def _evaluate(genome, candles, suite, labels, interval_sec, start, end,
              min_trades):
    m = backtest.backtest(candles, suite, labels, genome, interval_sec,
                          start=start, end=end)
    return _score(m, min_trades), m


def ga(candles, suite, labels, interval_sec, start, end, population,
       generations, seed, min_trades=2, tick=None):
    """Evolve a champion genome on bars [start, end). Returns
    (best_genome, best_score, fitness_history)."""
    rng = random.Random(seed)
    pop = [random_genome(rng) for _ in range(population)]
    history = []
    best_g = None
    best_s = -1e18

    def evaluate(g):
        return _evaluate(g, candles, suite, labels, interval_sec,
                         start, end, min_trades)[0]

    elite_n = max(1, population // 4)
    for gen in range(generations):
        scored = [(evaluate(g), g) for g in pop]
        scored.sort(key=lambda x: -x[0])
        if scored[0][0] > best_s:
            best_s, best_g = scored[0][0], list(scored[0][1])
        history.append(round(best_s, 3))
        if tick:
            tick(gen + 1, generations, best_s)

        elites = [list(g) for _, g in scored[:elite_n]]
        new_pop = [mutate(g, rng) for g in elites]
        while len(new_pop) < population:
            # tournament selection
            t1 = scored[rng.randrange(max(1, population // 2))][1]
            t2 = scored[rng.randrange(max(1, population // 2))][1]
            child = crossover(t1, t2, rng)
            new_pop.append(mutate(child, rng))
        pop = new_pop

    return best_g, best_s, history


# ------------------------------------------------------ walk-forward driver

def evolve(candles, interval_sec=3600, population=None, generations=None,
           folds=None, seed=42, progress=None):
    """Full walk-forward evolution. ``progress`` is an optional callback
    receiving (fraction, stage_label)."""
    population = population or DEFAULTS["population"]
    generations = generations or DEFAULTS["generations"]
    folds = folds or DEFAULTS["folds"]
    population = max(4, min(40, int(population)))
    generations = max(3, min(40, int(generations)))
    folds = max(2, min(6, int(folds)))

    n = len(candles)
    usable = max(100, n - WARMUP_BT)
    tsz = usable // (folds + 1)
    if tsz < 60:
        folds = max(2, usable // 120)
        tsz = usable // (folds + 1)

    from . import indicators as ind
    from . import regimes as reg

    def report(frac, stage):
        if progress:
            progress(frac, stage)

    suite = ind.build_suite(candles)
    labels, _ = reg.detect_regimes(candles)

    fold_results = []
    for f in range(folds):
        train_end = WARMUP_BT + (f + 1) * tsz
        test_end = min(n, WARMUP_BT + (f + 2) * tsz)
        if test_end <= train_end:
            break
        base = (f / (folds + 1)) * 0.75
        stage = "fold %d/%d" % (f + 1, folds)

        def tick(gen, gens, best, _f=base):
            report(_f + 0.02 * (gen / gens), "በደረጃ %s — ዝግመተ ለውጥ %d/%d" % (stage, gen, gens))

        best_g, best_s, hist = ga(candles, suite, labels, interval_sec,
                                  WARMUP_BT, train_end, population,
                                  generations, seed + f * 101, tick=tick)
        train_m = backtest.backtest(candles, suite, labels, best_g,
                                    interval_sec, start=WARMUP_BT,
                                    end=train_end)
        test_m = backtest.backtest(candles, suite, labels, best_g,
                                   interval_sec, start=train_end, end=test_end)
        fold_results.append({
            "fold": f + 1,
            "genome": best_g,
            "train": train_m,
            "test": test_m,
            "train_bars": train_end - WARMUP_BT,
            "test_bars": test_end - train_end,
            "history": hist,
            "score": _score(test_m, 2),
        })
        report((f + 1) / (folds + 1) * 0.75,
               "እጥፋት %d/%d ተጠናቀቀ — OOS Sharpe %.2f" %
               (f + 1, folds, test_m["ann_sharpe"]))

    # Champion = best OUT-OF-SAMPLE fold, not best in-sample.
    viable = [r for r in fold_results if r["test"]["trades"] >= 2]
    if not viable:
        viable = fold_results
    viable.sort(key=lambda r: -(r["test"]["ann_sharpe"] - 0.35 * (r["test"]["max_dd"] / 100.0)))
    champ = viable[0]
    report(0.78, "የንፅፅር ሙሉ-ዳታ ኢቮሉሽን (naive)…")

    def tick2(gen, gens, best):
        report(0.78 + 0.2 * (gen / gens),
               "naive ዝግመተ ለውጥ %d/%d" % (gen, gens))

    naive_g, _, naive_hist = ga(candles, suite, labels, interval_sec,
                                WARMUP_BT, n, population, generations,
                                seed + 777, tick=tick2)
    naive_m = backtest.backtest(candles, suite, labels, naive_g,
                                interval_sec, start=WARMUP_BT, end=n)

    oos_sharpes = [r["test"]["ann_sharpe"] for r in fold_results]
    consistency = 0.0
    if len(oos_sharpes) > 1:
        mean = sum(oos_sharpes) / len(oos_sharpes)
        consistency = math.sqrt(
            sum((x - mean) ** 2 for x in oos_sharpes) / len(oos_sharpes))

    champ["test"]["params"] = backtest.decode_genome(champ["genome"])
    champ["test"]["dna"] = backtest.dna_code(champ["test"]["params"])
    naive_m["params"] = backtest.decode_genome(naive_g)
    naive_m["dna"] = backtest.dna_code(naive_m["params"])

    report(1.0, "ተጠናቀቀ ✓")

    return {
        "champion": champ,
        "naive": naive_m,
        "naive_history": naive_hist,
        "folds": [{
            "fold": r["fold"],
            "train": {k: r["train"][k] for k in
                      ("total_ret", "ann_sharpe", "max_dd", "trades",
                       "win_rate", "profit_factor", "params", "dna")},
            "test": {k: r["test"][k] for k in
                     ("total_ret", "ann_sharpe", "max_dd", "trades",
                      "win_rate", "profit_factor")},
        } for r in fold_results],
        "oos_consistency": round(consistency, 2),
        "population": population,
        "generations": generations,
        "fold_count": len(fold_results),
    }
