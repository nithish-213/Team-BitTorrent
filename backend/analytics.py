"""Deterministic analytics. Numbers come from here (pandas), never from the LLM."""
import pandas as pd
from pathlib import Path

DATA = Path(__file__).parent / "data"
_CSV_FRAMES = {f.stem: pd.read_csv(f) for f in DATA.glob("*.csv")}
FILTER_COLS = {"region": "region", "customer_tier": "tier", "date_range": "period",
               "deal_status": "deal_status", "delay_severity": "delay_severity", "risk_level": "risk_level"}
MEAN_HINTS = ("pct", "score", "margin", "delay", "avg")

def get_dataframe(page_id: str) -> pd.DataFrame:
    """Retrieves dataset for a page from MongoDB Atlas collection, falling back to local CSV."""
    import db
    database = db.get_db()
    if database is not None:
        try:
            # Query the dedicated collection for this page_id
            docs = list(database[page_id].find({}, {"_id": 0, "_imported_at": 0}))
            if docs:
                return pd.DataFrame(docs)
        except Exception:
            pass
    return _CSV_FRAMES.get(page_id)

def describe(page_id):
    df = get_dataframe(page_id)
    if df is None:
        return None
    return {"metrics": [c for c in df.select_dtypes("number").columns],
            "dimensions": [c for c in df.columns if df[c].dtype == object and c != "id"]}

def _agg(col):
    return "mean" if any(h in col for h in MEAN_HINTS) else "sum"

def _filter(df, filters, skip=()):
    for k, v in (filters or {}).items():
        col = FILTER_COLS.get(k)
        if k in skip or not col or col not in df.columns or str(v).lower().startswith("all"):
            continue
        df = df[df[col] == v]
    return df

def _prep(page_id, metric):
    df = get_dataframe(page_id)
    if df is None:
        return None, {"error": f"No dataset is attached to page '{page_id}'. You can only navigate/filter it."}
    if metric not in df.columns or df[metric].dtype == object:
        return None, {"error": f"Invalid metric '{metric}'. Valid metrics: {describe(page_id)['metrics']}"}
    return df, None

def query_data(page_id, metric, group_by=None, filters=None, top_n=10):
    df, err = _prep(page_id, metric)
    if err: return err
    if group_by and group_by not in df.columns:
        return {"error": f"Invalid group_by '{group_by}'. Valid: {describe(page_id)['dimensions']}"}
    df = _filter(df, filters)
    if df.empty:
        return {"error": "No rows match those filters."}
    agg = _agg(metric)
    if group_by:
        g = df.groupby(group_by)[metric].agg(agg).sort_values(ascending=False).head(top_n)
        rows = [{group_by: k, metric: round(float(v), 2)} for k, v in g.items()]
    else:
        rows = [{metric: round(float(df[metric].agg(agg)), 2)}]
    return {"metric": metric, "aggregation": agg, "row_count": int(len(df)), "rows": rows}

def compare_periods(page_id, metric, period_a, period_b, group_by=None, filters=None):
    """period_a = earlier/baseline, period_b = later. Returns delta and which groups drove it."""
    df, err = _prep(page_id, metric)
    if err: return err
    if "period" not in df.columns:
        return {"error": "This dataset has no period column; cannot compare periods."}
    valid = sorted(str(p) for p in df["period"].dropna().unique() if p is not None and str(p) != "nan")
    for p in (period_a, period_b):
        if str(p) not in valid:
            return {"error": f"Unknown period '{p}'. Valid periods: {valid}"}
    df = _filter(df, filters, skip=("date_range",))
    if df.empty:
        return {"error": "No rows match those filters."}
    agg = _agg(metric)
    a = float(df[df.period == period_a][metric].agg(agg)); b = float(df[df.period == period_b][metric].agg(agg))
    out = {"metric": metric, "aggregation": agg, "period_a": period_a, "period_b": period_b,
           "value_a": round(a, 2), "value_b": round(b, 2), "delta": round(b - a, 2),
           "pct_change": round((b - a) / a * 100, 1) if a else None}
    if group_by:
        if group_by not in df.columns:
            return {"error": f"Invalid group_by '{group_by}'. Valid: {describe(page_id)['dimensions']}"}
        pv = df.pivot_table(index=group_by, columns="period", values=metric, aggfunc=agg).fillna(0)
        pv["delta"] = pv[period_b] - pv[period_a]
        pv = pv.sort_values("delta", ascending=(out["delta"] < 0))
        out["drivers"] = [{group_by: k, "value_a": round(float(r[period_a]), 2), "value_b": round(float(r[period_b]), 2),
                           "delta": round(float(r["delta"]), 2)} for k, r in pv.head(5).iterrows()]
    # supporting signal: any delay-style columns, for explaining "why"
    for c in df.columns:
        if "delay" in c and c != metric and df[c].dtype != object:
            out.setdefault("supporting_signals", {})[f"avg_{c}"] = {period_a: round(float(df[df.period == period_a][c].mean()), 1),
                                                                    period_b: round(float(df[df.period == period_b][c].mean()), 1)}
    return out
