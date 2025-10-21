# sinya2026-dashboard (v1.1)

This release standardizes **English column names** and recomputes derived metrics for easier reuse across dashboards.

## Data (`data/summary.csv`)
- `YearBase_2025` — Baseline for 2025 (prefers "2025年度預估", fallback "2025年度目標設定").
- `YearTarget_2026` — 2026 target (maps from "2026年度目標設定").
- `YearStretch_2026` — 2026 stretch target (maps from "2026年度激勵目標").
- `Growth_2026_vs_2025_pct` — `(YearTarget_2026 / YearBase_2025 - 1) * 100`.
- `Stretch_Uplift_vs_2026Target_pct` — `(YearStretch_2026 / YearTarget_2026 - 1) * 100`.

Optional, if source columns exist:
- `YearGP_2025`, `YearGP_2026`, `GPMargin_2026_pct`, `GPGrowth_2026_vs_2025_pct`.

Common dimension columns (kept when present):
- `Brand`, `Category`, `Owner`, `Unit`, `Dept`, `Name`, `Item`.

## Frontend (`docs/`)
- `index.html` + `app.js` (Chart.js) will read the English columns by default, but still works if Chinese columns remain in the CSV.

## GitHub Pages
- Same as v1.0: set Pages to serve from `/docs` and it will render the dashboard.

**Version:** v1.1
