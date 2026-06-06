# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Global arms trade network visualization — a full-stack project analyzing SIPRI arms transfer data (1940–2025). A Python/Jupyter notebook processes raw CSV data into JSON, which a React + D3 frontend consumes for interactive geopolitical visualization.

## Commands

### Frontend (`arms-trade-viz/`)
```bash
npm run dev       # Dev server with HMR at http://localhost:5173
npm run build     # Production bundle → dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint
```

### Data Pipeline
Run `explore.ipynb` sequentially in Jupyter. Outputs land in `arms-trade-viz/public/data/`.

Requires Python packages: `pandas`, `networkx`, `community` (python-louvain), `google-genai`

The Gemini AI context generation step needs a Google Gemini API key in `.env`.

## Architecture

### Data flow
```
trade-register.csv + UCDP.csv
        ↓ explore.ipynb (Python)
arms-trade-viz/public/data/*.json
        ↓ fetch() on load
App.jsx (single React component + D3 + react-simple-maps)
```

### Key data files (all in `public/data/`)
| File | Records | Contents |
|------|---------|----------|
| `nodes.json` | 258 | Countries with centrality metrics and per-decade cluster assignments |
| `edges_collapsed.json` | 3,150 | All-time supplier→recipient TIV flows |
| `edges_by_year.json` | 16,104 | Year-granular flows (for year-range filtering) |
| `hhi.json` | 10,020 | Herfindahl Index (supplier diversification) per country-year |
| `trade_balance.json` | 8,061 | Exports/imports/balance per country-year with anomaly flags |
| `spikes.json` | 497 | Import anomalies with Z-scores and AI-generated geopolitical context |

### Frontend (`App.jsx`)
Single 600-line component. State is managed with `useState` — no external state library. Key pieces:
- **Map**: `react-simple-maps` with `d3-zoom`. Only 65 countries have hardcoded coordinates (the `COORDS` object); others appear as edge endpoints only.
- **Clusters**: Louvain community detection assigns countries to 4 geopolitical blocs (US-led, Soviet/Russian, European, Chinese/Non-aligned) — both all-time and per-decade (stored as `cluster_1940s` … `cluster_2020s` fields on nodes).
- **Charts**: Recharts renders HHI and trade balance timelines in the country detail sidebar.
- **Filtering**: Year range + top-N flows sliders drive re-renders against pre-loaded JSON data (no server calls after initial load).

### Notebook pipeline stages (`explore.ipynb`)
1. Load & clean SIPRI CSV → aggregate by supplier/recipient/year
2. Build directed graph → Louvain clustering → centrality metrics → `nodes.json`, `edges_*.json`
3. Per-decade Louvain runs (manual cluster labeling required)
4. Rolling HHI calculation → `hhi.json`
5. Trade balance + Z-score anomaly detection → `trade_balance.json`
6. Async Gemini API calls for spike context → `spikes.json`
