"""ZOLA MarketDNA engine — pure Python, zero dependencies.

Submodules
----------
indicators : technical indicator suite (precomputed, O(n) access)
synth      : deterministic regime-switching synthetic market generator
regimes    : unsupervised market-regime fingerprinting (k-means)
backtest   : strategy simulator with fees, ATR stops and honesty metrics
evolve     : genetic strategy evolution with walk-forward validation
"""

__version__ = "1.0.0"
