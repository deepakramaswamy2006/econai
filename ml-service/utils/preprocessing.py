"""
preprocessing.py
================
Input preprocessing for the EconAI ML API.

New dataset features
--------------------
  Inflation            – CPI-based inflation rate (%)
  GDP_Growth           – Real GDP growth rate (%)
  Industrial_Production – Industrial production growth (%)
  Job_Market           – Employment / labour market index (0-90)
  Recession_Indicator  – Binary: 1 = recession quarter, 0 = normal
  Quarter              – 1–4

The models were trained with lag / rolling features using historical rows.
For real-time single-row prediction we approximate lag/rolling values
with the current input values (best-effort for an API endpoint).
"""


# ── feature lists (must match training order exactly) ──────────────────────────

INFLATION_FEATURES = [
    "GDP_Growth",
    "Industrial_Production",
    "Job_Market",
    "Recession_Indicator",
    "Quarter",
    # lag 1
    "GDP_Growth_lag1",
    "Inflation_lag1",
    "Industrial_Production_lag1",
    "Job_Market_lag1",
    # rolling 4
    "GDP_Growth_roll4",
    "Inflation_roll4",
    "Industrial_Production_roll4",
    # interactions
    "gdp_x_ip",
    "infl_x_job",
    "ip_positive",
    "high_gdp",
]

GDP_FEATURES = [
    "Inflation",
    "Industrial_Production",
    "Job_Market",
    "Recession_Indicator",
    "Quarter",
    # lag 1
    "Inflation_lag1",
    "GDP_Growth_lag1",
    "Industrial_Production_lag1",
    "Job_Market_lag1",
    # rolling 4
    "GDP_Growth_roll4",
    "Inflation_roll4",
    "Industrial_Production_roll4",
    # interactions
    "infl_x_ip",
    "gdp_x_job",
    "high_infl",
    "neg_ip",
]

CRISIS_FEATURES = [
    "GDP_Growth",
    "Inflation",
    "Industrial_Production",
    "Job_Market",
    "Quarter",
    # lag 1 & 2
    "GDP_Growth_lag1", "GDP_Growth_lag2",
    "Inflation_lag1",  "Inflation_lag2",
    "Industrial_Production_lag1", "Industrial_Production_lag2",
    "Job_Market_lag1", "Job_Market_lag2",
    # rolling 4
    "GDP_Growth_roll4",
    "Inflation_roll4",
    "Industrial_Production_roll4",
    # composite stress score
    "stress_score",
    # domain signals
    "gdp_decline",
    "ip_decline",
    "gdp_and_ip_neg",
    "high_inflation",
    "job_market_weak",
    "dual_stress",
]


def _base_values(data: dict) -> dict:
    """Extract and normalise the raw input values from an API payload."""
    gdp  = float(data.get("gdp_growth",            data.get("GDP_Growth",            4.5)))
    infl = float(data.get("inflation",              data.get("Inflation",             5.0)))
    ip   = float(data.get("industrial_production",  data.get("Industrial_Production", 1.0)))
    jm   = float(data.get("job_market",             data.get("Job_Market",           55.0)))
    rec  = float(data.get("recession_indicator",    data.get("Recession_Indicator",   0)))
    q    = float(data.get("quarter",                data.get("Quarter",               2)))
    return dict(gdp=gdp, infl=infl, ip=ip, jm=jm, rec=rec, q=q)


def preprocess_inflation_input(data: dict) -> list:
    """Return feature vector for the Inflation model (16 features)."""
    v = _base_values(data)
    gdp, infl, ip, jm, rec, q = v["gdp"], v["infl"], v["ip"], v["jm"], v["rec"], v["q"]
    return [
        gdp,               # GDP_Growth
        ip,                # Industrial_Production
        jm,                # Job_Market
        rec,               # Recession_Indicator
        q,                 # Quarter
        gdp,               # GDP_Growth_lag1  (approximated)
        infl,              # Inflation_lag1   (approximated)
        ip,                # Industrial_Production_lag1
        jm,                # Job_Market_lag1
        gdp,               # GDP_Growth_roll4
        infl,              # Inflation_roll4
        ip,                # Industrial_Production_roll4
        gdp * ip,          # gdp_x_ip
        infl * jm,         # infl_x_job
        int(ip > 0),       # ip_positive
        int(gdp > 7),      # high_gdp
    ]


def preprocess_gdp_input(data: dict) -> list:
    """Return feature vector for the GDP model (16 features)."""
    v = _base_values(data)
    gdp, infl, ip, jm, rec, q = v["gdp"], v["infl"], v["ip"], v["jm"], v["rec"], v["q"]
    return [
        infl,              # Inflation
        ip,                # Industrial_Production
        jm,                # Job_Market
        rec,               # Recession_Indicator
        q,                 # Quarter
        infl,              # Inflation_lag1
        gdp,               # GDP_Growth_lag1
        ip,                # Industrial_Production_lag1
        jm,                # Job_Market_lag1
        gdp,               # GDP_Growth_roll4
        infl,              # Inflation_roll4
        ip,                # Industrial_Production_roll4
        infl * ip,         # infl_x_ip
        gdp * jm,          # gdp_x_job
        int(infl > 10),    # high_infl
        int(ip < 0),       # neg_ip
    ]


def preprocess_crisis_input(data: dict) -> list:
    """Return feature vector for the Crisis / Recession model (24 features)."""
    v = _base_values(data)
    gdp, infl, ip, jm, rec, q = v["gdp"], v["infl"], v["ip"], v["jm"], v["rec"], v["q"]

    gdp_decline     = int(gdp < 0)
    ip_decline      = int(ip  < 0)
    gdp_and_ip_neg  = int(gdp < 0 and ip < 0)
    high_inflation  = int(infl > 10)
    job_market_weak = int(jm < 30)
    dual_stress     = int(gdp < 0 or jm < 30)

    # Composite stress score (matches training formula)
    stress_score = (
        max(0, -gdp)              # negative GDP adds stress
        + max(0, infl) * 0.5     # high inflation
        + max(0, -ip) * 0.5      # negative industrial production
        + (100 - max(0, min(jm, 100))) * 0.1   # weak job market
    )

    return [
        gdp,            # GDP_Growth
        infl,           # Inflation
        ip,             # Industrial_Production
        jm,             # Job_Market
        q,              # Quarter
        gdp, gdp,       # GDP_Growth_lag1, _lag2
        infl, infl,     # Inflation_lag1, _lag2
        ip, ip,         # Industrial_Production_lag1, _lag2
        jm, jm,         # Job_Market_lag1, _lag2
        gdp,            # GDP_Growth_roll4
        infl,           # Inflation_roll4
        ip,             # Industrial_Production_roll4
        stress_score,   # stress_score
        gdp_decline,
        ip_decline,
        gdp_and_ip_neg,
        high_inflation,
        job_market_weak,
        dual_stress,
    ]


# ── backward-compatible alias ─────────────────────────────────────────────────

def preprocess_input(data: dict) -> list:
    """Alias → GDP feature vector (used by historical_data view)."""
    return preprocess_gdp_input(data)