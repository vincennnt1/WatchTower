# Global Arms Trade Network (1940–2025)

An interactive geopolitical visualization of 85 years of SIPRI arms transfer data. Explore how weapons flow between nations, how supplier-recipient blocs form and evolve across decades, and where sudden import spikes correlate with armed conflict.

## Features

- **Interactive world map** — zoom, pan, and click countries; built with D3 and react-simple-maps
- **Geopolitical bloc detection** — Louvain community detection assigns 258 countries to clusters
- **Per-decade cluster view** — toggle between 1940s–2020s to watch bloc membership shift over time
- **Year-range + top-N filtering** — sliders filter live against pre-loaded JSON with no server round-trips
- **Country detail sidebar** — HHI supplier-diversification timeline, trade balance chart, and import spike explanations
- **AI-enriched anomalies** — 497 detected import spikes annotated with Gemini-generated geopolitical context
- **Conflict correlation** — Z-score anomaly detection cross-referenced against UCDP conflict data

## Data Pipeline

All processing lives in `explore.ipynb`. Run cells sequentially; outputs land in `arms-trade-viz/public/data/`.

| Stage | What it does | Output |
|---|---|---|
| 1 | Load & clean SIPRI `trade-register.csv` → aggregate by supplier/recipient/year | — |
| 2 | Build directed graph → Louvain clustering → centrality metrics | `nodes.json`, `edges_collapsed.json`, `edges_by_year.json` |
| 3 | Per-decade Louvain runs (manual cluster labeling) | decade fields on `nodes.json` |
| 4 | Rolling Herfindahl–Hirschman Index (supplier diversification) | `hhi.json` |
| 5 | Trade balance + Z-score anomaly detection | `trade_balance.json`, `spikes.json` |
| 6 | Async Gemini API calls for spike context (~3500 s, batched) | `spikes.json` enriched |

## Architecture

```
trade-register.csv + UCDP.csv
        ↓  explore.ipynb  (Python)
arms-trade-viz/public/data/
  ├── nodes.json          258 countries  — centrality metrics, per-decade clusters
  ├── edges_collapsed.json  3,150 flows  — all-time supplier→recipient TIV
  ├── edges_by_year.json  16,104 flows   — year-granular (for range filtering)
  ├── hhi.json            10,020 records — HHI per country-year
  ├── trade_balance.json   8,061 records — exports/imports/balance + anomaly flags
  └── spikes.json            497 records — import spikes with Z-scores + AI context
        ↓  fetch() on page load
App.jsx  (React + D3 + react-simple-maps + Recharts)
```

## Tech Stack

| Layer | Tech |
|---|---|
| Data pipeline | Python, Jupyter, pandas, networkx, python-louvain |
| AI enrichment | Google Gemini API (`google-genai`) |
| Frontend | React 18, Vite, D3, react-simple-maps, Recharts |
| Source data | SIPRI Trade Register, UCDP Conflict Data Program |

## Setup

### Frontend
```bash
cd arms-trade-viz
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production bundle → dist/
```

### Data pipeline
```bash
pip install pandas networkx community google-genai
# Add GEMINI_API_KEY=<your-key> to .env at project root
# Then open and run explore.ipynb sequentially in Jupyter
```

## Next Steps

- **Richer alignment context** — trade dependency doesn't equal geopolitical alignment (India imports from China-aligned suppliers yet has active border tensions). Layering in diplomatic/alliance datasets would distinguish dependency-driven from preference-driven cluster membership.

- **Conflict prediction model** — the current Z-score → conflict correlation sits at 27.2% vs. a 27% baseline, which is statistically inconclusive. A time-lagged regression or ML classifier on import spike features could extract a more meaningful signal.

- **Expand coordinate coverage** — only 65 of 258 countries have hardcoded map coordinates. Adding the remaining ~190 would make every node renderable on the map (currently they appear only as edge endpoints).

## Live Demo

[watch-tower-7cg9zptvv-vinny-projects1.vercel.app](https://watch-tower-7cg9zptvv-vinny-projects1.vercel.app)
