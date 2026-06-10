import { useState, useEffect, useMemo, useCallback, useRef, Fragment } from "react"
import { LineChart, Line as RechartsLine, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  useMapContext,
} from "react-simple-maps"
import "./App.css"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Country name → lat/lng lookup
const COORDS = {
  "United States": [-95, 38], "Russia": [60, 58], "Soviet Union": [60, 58],
  "France": [2, 46], "United Kingdom": [-2, 54], "Germany": [10, 51],
  "China": [105, 35], "Israel": [35, 31], "Italy": [12, 42],
  "Spain": [-4, 40], "Netherlands": [5, 52], "Sweden": [18, 60],
  "Ukraine": [32, 49], "Turkey": [35, 39], "India": [77, 20],
  "Saudi Arabia": [45, 23], "Australia": [133, -27], "Egypt": [30, 26],
  "Pakistan": [69, 30], "Japan": [138, 36], "South Korea": [127, 37],
  "Brazil": [-55, -10], "South Africa": [25, -29], "Indonesia": [113, -5],
  "Iran": [54, 32], "Iraq": [44, 33], "Algeria": [3, 28],
  "United Arab Emirates": [54, 24], "Qatar": [51, 25], "Greece": [22, 39],
  "Poland": [20, 52], "Norway": [10, 60], "Denmark": [10, 56],
  "Finland": [26, 62], "Canada": [-96, 57], "Mexico": [-102, 23],
  "Argentina": [-65, -34], "Chile": [-71, -35], "Colombia": [-74, 4],
  "Venezuela": [-66, 8], "Peru": [-76, -10], "Nigeria": [8, 10],
  "Ethiopia": [40, 9], "Kenya": [38, -1], "Tanzania": [35, -6],
  "Morocco": [-8, 32], "Libya": [17, 27], "Sudan": [30, 15],
  "Angola": [18, -12], "Mozambique": [35, -18], "Zimbabwe": [30, -20],
  "Czechia": [15, 50], "Slovakia": [19, 48], "Hungary": [19, 47],
  "Romania": [25, 46], "Bulgaria": [25, 43], "Serbia": [21, 44],
  "Croatia": [16, 45], "Belarus": [28, 53], "Kazakhstan": [68, 48],
  "Azerbaijan": [48, 40], "Georgia": [44, 42], "Armenia": [45, 40],
  "Syria": [38, 35], "Jordan": [36, 31], "Kuwait": [48, 29],
  "Oman": [58, 22], "Bahrain": [50, 26], "Yemen": [48, 16],
  "Afghanistan": [67, 33], "Bangladesh": [90, 24], "Myanmar": [96, 17],
  "Thailand": [101, 15], "Vietnam": [108, 16], "Malaysia": [110, 3],
  "Singapore": [104, 1], "Philippines": [122, 13], "Taiwan": [121, 23],
  "New Zealand": [172, -42], "Portugal": [-8, 39], "Belgium": [4, 51],
  "Switzerland": [8, 47], "Austria": [14, 47], "Czechoslovakia": [16, 50],
  "Yugoslavia": [20, 44], "East Germany (Gdr)": [13, 52],
  "North Korea": [127, 40], "Cuba": [-80, 22],
  "Guyana": [-59, 5], "Trinidad and Tobago": [-61, 11],
  "Ecuador": [-78, -2], "Bolivia": [-65, -17], "Paraguay": [-58, -23],
  "Uruguay": [-56, -33], "Tunisia": [9, 34], "Cameroon": [12, 6],
  "Ghana": [-2, 8], "Senegal": [-14, 14], "Uganda": [32, 1],
  "Zambia": [28, -15], "Namibia": [18, -22], "Botswana": [24, -22],
  "Chad": [18, 15], "Mali": [-2, 17], "Niger": [8, 17],
  "Burkina Faso": [-2, 12], "Guinea": [-11, 11], "Ivory Coast": [-6, 7],
  "Liberia": [-9, 6], "Sierra Leone": [-12, 8], "Congo": [15, -1],
  "DR Congo": [24, -3], "Rwanda": [30, -2], "Burundi": [30, -3],
  "Somalia": [46, 6], "Eritrea": [39, 15], "Djibouti": [43, 12],
  "Mauritania": [-11, 20], "Gabon": [12, -1], "Equatorial Guinea": [10, 2],
  "Lebanon": [35, 34], "Cyprus": [33, 35], "Malta": [14, 36],
  "Iceland": [-18, 65], "Ireland": [-8, 53], "Luxembourg": [6, 50],
  "Estonia": [25, 59], "Latvia": [25, 57], "Lithuania": [24, 56],
  "Moldova": [29, 47], "Uzbekistan": [64, 41], "Turkmenistan": [59, 40],
  "Tajikistan": [71, 39], "Kyrgyzstan": [75, 41], "Mongolia": [105, 47],
  "Nepal": [84, 28], "Sri Lanka": [81, 8], "Laos": [103, 18],
  "Cambodia": [105, 13], "Brunei": [115, 4], "Papua New Guinea": [144, -6],
  "Turkiye": [35, 39], "Viet Nam": [108, 16], "Cote D'Ivoire": [-6, 7],
  "Trinidad And Tobago": [-61, 11], "Dr Congo": [24, -3],
  "Albania": [20, 41], "Antigua And Barbuda": [-61.8, 17.1], "Aruba": [-69.9, 12.5],
  "Bahamas": [-77.4, 25.0], "Barbados": [-59.5, 13.2], "Belize": [-88.5, 17.2],
  "Benin": [2.3, 9.3], "Bhutan": [90.4, 27.5], "Bosnia-Herzegovina": [17.8, 44.2],
  "Cabo Verde": [-24.0, 16.0], "Central African Republic": [20.9, 6.6],
  "Comoros": [43.3, -11.6], "Costa Rica": [-84.0, 10.0],
  "Dominican Republic": [-70.7, 19.0], "El Salvador": [-88.9, 13.8],
  "Eswatini": [31.5, -26.5], "Fiji": [178.0, -18.0], "Gambia": [-15.3, 13.4],
  "Grenada": [-61.7, 12.1], "Guatemala": [-90.2, 15.8], "Guinea-Bissau": [-15.2, 11.8],
  "Haiti": [-73.1, 19.0], "Honduras": [-87.2, 15.2], "Jamaica": [-77.3, 18.1],
  "Katanga": [26, -9], "Kosovo": [21.0, 42.6], "Lesotho": [28.2, -29.6],
  "Madagascar": [46.9, -18.8], "Malawi": [34.3, -13.3], "Maldives": [73.5, 4.2],
  "Mauritius": [57.6, -20.2], "Montenegro": [19.4, 42.8], "Nicaragua": [-85.2, 13.0],
  "North Macedonia": [21.7, 41.6], "North Yemen": [44.0, 15.0],
  "Northern Cyprus": [33.4, 35.2], "Palestine": [35.3, 31.9],
  "Panama": [-80.8, 8.4], "Saint Kitts And Nevis": [-62.8, 17.3],
  "Saint Vincent": [-61.2, 13.3], "Seychelles": [55.5, -4.6],
  "Slovenia": [15.0, 46.1], "Solomon Islands": [159.9, -9.0],
  "South Sudan": [31.3, 6.9], "South Vietnam": [107.0, 12.0],
  "South Yemen": [46.5, 14.5], "Suriname": [-56.0, 4.0],
  "Timor-Leste": [125.7, -8.9], "Togo": [0.8, 8.6], "Tonga": [-175.2, -21.2],
  "Vanuatu": [167.0, -16.0], "Western Sahara": [-13.0, 24.5],
  "Yemen Arab Republic (North Yemen)": [44.0, 15.0], "Biafra": [7, 5],
}

const HISTORICAL_COUNTRIES = new Set([
  'Soviet Union', 'Yugoslavia', 'Czechoslovakia', 'East Germany (Gdr)',
  'South Vietnam', 'South Yemen', 'North Yemen',
])

const CLUSTER_COLORS = {
  0: "#e05252",
  1: "#52a8e0",
  2: "#52c98a",
  3: "#e0a852",
  "-1": "#666"
}

// Returns a control point perpendicular to the midpoint so arcs curve off the straight line
function offsetControlPoint([x1, y1], [x2, y2], offset) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return [mx - (dy / len) * offset, my + (dx / len) * offset]
}

// Draws a curved SVG arc between two geo coords with a filled dot near the destination as an arrowhead
function DirectionalArc({ fromGeo, toGeo, stroke, strokeWidth, strokeOpacity }) {
  const { projection } = useMapContext()
  const from = projection(fromGeo)
  const to = projection(toGeo)
  if (!from || !to) return null
  const offset = 20 + strokeWidth * 4
  const [cx, cy] = offsetControlPoint(from, to, offset)
  const d = `M ${from[0]},${from[1]} Q ${cx},${cy} ${to[0]},${to[1]}`
  // point at t=0.82 on the quadratic bezier — clear of the destination node circle
  const t = 0.95
  const tx = (1-t)*(1-t)*from[0] + 2*(1-t)*t*cx + t*t*to[0]
  const ty = (1-t)*(1-t)*from[1] + 2*(1-t)*t*cy + t*t*to[1]
  return (
    <g>
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity} strokeLinecap="round" />
      <circle cx={tx} cy={ty} r={Math.max(1.2, strokeWidth * 0.7)} fill={stroke} fillOpacity={0.85} />
    </g>
  )
}

export default function App() {

  // ── State ──────────────────────────────────────────────────────────────────
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [edgesByYear, setEdgesByYear] = useState([])
  const [loading, setLoading] = useState(true)
  const [topN, setTopN] = useState(30)
  const [yearRange, setYearRange] = useState([1991, 2023])
  const [selected, setSelected] = useState(null)
  const [tradeBalance, setTradeBalance] = useState([])
  const [spikesData, setSpikesData] = useState([])
  const [hhiData, setHhiData] = useState([])
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 })
  const [selectedDecade, setSelectedDecade] = useState('all')
  const [showHistorical, setShowHistorical] = useState(false)

  // ── Animation state & refs ─────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef(null)
  const animEndRef = useRef(2023) // tracks animation position independently of state

  // ── Comparison state ───────────────────────────────────────────────────────
  const [compareCountry, setCompareCountry] = useState(null)
  const [comparePending, setComparePending] = useState(false)

  // ── Data fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch('/data/nodes.json').then(r => r.json()),
      fetch('/data/edges_collapsed.json').then(r => r.json()),
      fetch('/data/edges_by_year.json').then(r => r.json()),
      fetch('/data/hhi.json').then(r => r.json()),
      fetch('/data/trade_balance.json').then(r => r.json()),
      fetch('/data/spikes.json').then(r => r.json()),
    ]).then(([n, e, ey, hhi, tb, sp]) => {
      setNodes(n)
      setEdges(e)
      setEdgesByYear(ey)
      setHhiData(hhi)
      setTradeBalance(tb)
      setSpikesData(sp)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load data:', err)
      setLoading(false)
    })
  }, [])

  // ── Animation logic ────────────────────────────────────────────────────────
  // Clears the playback interval and marks animation as stopped
  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPlaying(false)
  }, [])

  // Advances yearRange[1] by 1 every 150ms from startEnd up to 2023
  const startAnimation = useCallback((startEnd) => {
    stopAnimation()
    animEndRef.current = startEnd
    setIsPlaying(true)
    intervalRef.current = setInterval(() => {
      if (animEndRef.current >= 2023) {
        stopAnimation()
        return
      }
      animEndRef.current += 1
      setYearRange(prev => [prev[0], animEndRef.current])
    }, 150)
  }, [stopAnimation])

  // Toggles playback; rewinds end year to start if the range is already maxed out
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stopAnimation()
    } else {
      const startEnd = yearRange[1] >= 2023 ? yearRange[0] : yearRange[1]
      if (yearRange[1] >= 2023) {
        setYearRange(prev => [prev[0], prev[0]])
      }
      startAnimation(startEnd)
    }
  }, [isPlaying, yearRange, stopAnimation, startAnimation])

  // Stops animation and resets the year range back to 1940
  const handleReset = useCallback(() => {
    stopAnimation()
    setYearRange([1940, 1940])
    animEndRef.current = 1940
  }, [stopAnimation])

  useEffect(() => () => stopAnimation(), [stopAnimation])

  // ── Comparison logic ───────────────────────────────────────────────────────
  const handleExitComparison = useCallback(() => {
    setCompareCountry(null)
    setComparePending(false)
  }, [])

  // ── Cluster color ──────────────────────────────────────────────────────────
  // Maps a node's cluster label to a hex color, using decade-specific labels when a decade is selected
  const getClusterColor = useCallback((node) => {
    const CLUSTER_COLORS_NAMED = {
      'Soviet/Eastern Bloc': '#e05252',
      'Soviet': '#e05252',
      'Soviet/Russian': '#e05252',
      'Western': '#52a8e0',
      'US-led West': '#52a8e0',
      'Anglosphere+Allies': '#52a8e0',
      'Anglosphere': '#52a8e0',
      'Anglosphere Rump': '#52a8e0',
      'Secondary Western': '#7bc8f0',
      'Chinese Non-Aligned': '#e8a838',
      'Chinese Bloc': '#e8a838',
      'Continental Europe': '#52c98a',
      'Continental EU': '#52c98a',
      'Franco-European': '#52c98a',
      'Franco-Mediterranean': '#52c98a',
      'Gulf-French': '#52c98a',
      'Independent Arms Market': '#b07fd4',
      'Non-Aligned Commercial': '#b07fd4',
      'Eurasian': '#e05252',
      'Eurasian Bloc': '#e05252',
      'Post-Soviet Surplus': '#e07852',
      'Russian Isolation': '#c43030',
      'Germanic/Nordic': '#52c98a',
      'Secondary Exporters': '#7bc8f0',
      'Neutral/Embargoed': '#888',
      'Fringe': '#888',
      'Other': '#888',
      'No Data': '#444',
    }
    if (selectedDecade === 'all') return CLUSTER_COLORS[node.cluster] ?? '#666'
    const label = node[`cluster_${selectedDecade}`] || 'No Data'
    return CLUSTER_COLORS_NAMED[label] ?? '#888'
  }, [selectedDecade])

  const handleMoveEnd = useCallback((pos) => setPosition(pos), [])

  // ── Derived data ───────────────────────────────────────────────────────────
  // Aggregates year-filtered edges into per-pair TIV totals, sorted descending
  const filteredEdges = useMemo(() => {
    const [y1, y2] = yearRange
    const yearFiltered = edgesByYear.filter(e => {
      const year = Number(e.year)
      return year >= y1 && year <= y2
    })
    const agg = {}
    yearFiltered.forEach(e => {
      const key = `${e.supplier}||${e.recipient}`
      if (!agg[key]) agg[key] = { supplier: e.supplier, recipient: e.recipient, tiv: 0 }
      agg[key].tiv += e.tiv
    })
    let result = Object.values(agg).sort((a, b) => b.tiv - a.tiv)
    if (!showHistorical) {
      result = result.filter(e => !HISTORICAL_COUNTRIES.has(e.supplier) && !HISTORICAL_COUNTRIES.has(e.recipient))
    }
    return result
  }, [edgesByYear, yearRange, showHistorical])

  // Shows only edges involving the selected/compare country, or the top-N flows globally
  const visibleEdges = useMemo(() => {
    if (selected) {
      return filteredEdges.filter(e =>
        e.supplier === selected || e.recipient === selected ||
        (compareCountry && (e.supplier === compareCountry || e.recipient === compareCountry))
      )
    }
    return filteredEdges.slice(0, topN)
  }, [filteredEdges, selected, compareCountry, topN])

  // country name → node object for O(1) lookups in the render
  const nodeMap = useMemo(() => {
    const m = {}
    nodes.forEach(n => m[n.country] = n)
    return m
  }, [nodes])

  // Set of countries that appear in at least one visible edge (used to dim inactive nodes)
  const activeCountries = useMemo(() => {
    const s = new Set()
    visibleEdges.forEach(e => { s.add(e.supplier); s.add(e.recipient) })
    return s
  }, [visibleEdges])

  if (loading) return <p style={{ padding: 20, color: "#fff" }}>Loading data...</p>

  const selectedNode = selected ? nodeMap[selected] : null
  const compareNode = compareCountry ? nodeMap[compareCountry] : null

  // ── Small formatting helpers used in comparison grid ──────────────────────
  const fmt  = v => v?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '—'
  const pct1 = v => v != null ? `${(v * 100).toFixed(1)}%` : '—'
  const pct0 = v => v != null ? `${(v * 100).toFixed(0)}%` : '—'
  const getBlocLabel = node =>
    selectedDecade === 'all'
      ? (['Russia/Soviet Sphere', 'Post-Soviet', 'Western', 'Independent'][node.cluster] ?? 'Unknown')
      : (node[`cluster_${selectedDecade}`] || 'No Data')

  return (
    <div className="app">
      <div className="topbar">
        <h1>Watch Tower</h1>
        <span>SIPRI Arms Transfers Database</span>
        <span style={{ marginLeft: "auto" }}>
          {visibleEdges.length} flows · {activeCountries.size} countries
        </span>
      </div>

      {/* ── Map ─────────────────────────────────────────────────────────────── */}
      <div className="map-area">
        <ComposableMap
          projection="geoNaturalEarth1"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            maxZoom={8}
            minZoom={0.5}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1e2530"
                    stroke="#2d3748"
                    strokeWidth={0.5}
                    style={{ outline: "none" }}
                  />
                ))
              }
            </Geographies>

            {/* Arcs */}
            {visibleEdges.map((e, i) => {
              const fromGeo = COORDS[e.supplier]
              const toGeo = COORDS[e.recipient]
              if (!fromGeo || !toGeo) return null
              const maxTiv = filteredEdges[0]?.tiv || 1
              const w = 0.3 + (e.tiv / maxTiv) * 3
              const involvesCompare = compareCountry &&
                (e.supplier === compareCountry || e.recipient === compareCountry)
              return (
                <DirectionalArc
                  key={i}
                  fromGeo={fromGeo}
                  toGeo={toGeo}
                  stroke={involvesCompare ? "#c084fc" : "#58a6ff"}
                  strokeWidth={w}
                  strokeOpacity={0.4}
                />
              )
            })}

            {/* Nodes */}
            {nodes.map(n => {
              const coords = COORDS[n.country]
              if (!coords) return null
              if (!showHistorical && HISTORICAL_COUNTRIES.has(n.country)) return null
              const isActive = !selected || activeCountries.has(n.country)
              const maxExp = 865926
              const r = 2 + (n.total_exported / maxExp) * 10
              const color = getClusterColor(n) ?? "#666"
              const isSelected = n.country === selected
              const isCompare = n.country === compareCountry
              return (
                <Marker
                  key={n.country}
                  coordinates={coords}
                  onClick={() => {
                    if (comparePending) {
                      if (n.country !== selected) setCompareCountry(n.country)
                      setComparePending(false)
                    } else {
                      if (isSelected) {
                        setSelected(null)
                        setCompareCountry(null)
                      } else {
                        setSelected(n.country)
                        setCompareCountry(null)
                      }
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    r={r}
                    fill={color}
                    fillOpacity={isActive ? 0.85 : 0.15}
                    stroke={isSelected ? "#fff" : isCompare ? "#c084fc" : color}
                    strokeWidth={(isSelected || isCompare) ? 1.5 : 0.5}
                  />
                </Marker>
              )
            })}
          </ZoomableGroup>
        </ComposableMap>
        <div className="hint">
          {comparePending
            ? "Click a country to compare"
            : "click a country to isolate · click again to reset"}
        </div>
      </div>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <div className="sidebar">

        {/* Top N */}
        <div className="filter-group">
          <div className="filter-label">
            Top N flows <span className="filter-value">{topN}</span>
          </div>
          <input type="range" min={5} max={100} value={topN}
            onChange={e => setTopN(+e.target.value)} />
        </div>

        {/* Year range */}
        <div className="filter-group">
          <div className="filter-label">
            Year from <span className="filter-value">{yearRange[0]}</span>
          </div>
          <input type="range" min={1940} max={2023} value={yearRange[0]}
            onChange={e => {
              if (isPlaying) stopAnimation()
              setYearRange([Math.min(+e.target.value, yearRange[1]), yearRange[1]])
            }} />
          <div className="filter-label">
            Year to <span className="filter-value">{yearRange[1]}</span>
          </div>
          <input type="range" min={1940} max={2023} value={yearRange[1]}
            onChange={e => {
              const newEnd = +e.target.value
              if (isPlaying) animEndRef.current = newEnd
              setYearRange([yearRange[0], newEnd])
            }} />
        </div>

        {/* Animation controls */}
        <div className="filter-group">
          <div className="filter-label">Timeline animation</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="anim-btn" onClick={handlePlayPause}>
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button className="anim-btn anim-btn--secondary" onClick={handleReset}>
              ↺ Reset
            </button>
          </div>
          {isPlaying && (
            <div style={{ fontSize: 11, color: "#58a6ff" }}>
              Animating… {yearRange[0]} → {yearRange[1]}
            </div>
          )}
        </div>

        {/* Cluster view */}
        <div className="filter-group">
          <div className="filter-label">Cluster view</div>
          <select
            value={selectedDecade}
            onChange={e => setSelectedDecade(e.target.value)}
            style={{
              width: '100%', fontSize: 12, padding: '6px 8px',
              background: '#0f1117', color: '#e0e0e0',
              border: '1px solid #30363d', borderRadius: 6, cursor: 'pointer'
            }}
          >
            <option value="all">All time</option>
            <option value="1940s">1940s</option>
            <option value="1950s">1950s</option>
            <option value="1960s">1960s</option>
            <option value="1970s">1970s</option>
            <option value="1980s">1980s</option>
            <option value="1990s">1990s</option>
            <option value="2000s">2000s</option>
            <option value="2010s">2010s</option>
            <option value="2020s">2020s</option>
          </select>
          {selectedDecade !== 'all' && (
            <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>
              Showing geopolitical blocs for {selectedDecade}
            </div>
          )}
        </div>

        {/* Historical states toggle */}
        <div className="filter-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#e0e0e0' }}>
            <input
              type="checkbox"
              checked={showHistorical}
              onChange={e => setShowHistorical(e.target.checked)}
              style={{ accentColor: '#58a6ff', cursor: 'pointer' }}
            />
            Show historical states
          </label>
          {showHistorical && (
            <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>
              Soviet Union, Yugoslavia, Czechoslovakia, East Germany, South/North Yemen, South Vietnam
            </div>
          )}
        </div>

        {/* Network stats */}
        <div className="filter-group">
          <div className="filter-label">Network stats</div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-num">{activeCountries.size}</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{visibleEdges.length}</div>
              <div className="stat-label">Flows</div>
            </div>
          </div>
        </div>

        {/* ── Country detail panel ────────────────────────────────────────────── */}
        {selectedNode && (
          <div className="filter-group">

            {/* Header row with Compare / Exit button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="filter-label" style={{ color: '#58a6ff', textTransform: 'none', fontSize: 13, fontWeight: 600 }}>
                {selected}
              </div>
              {!comparePending && !compareCountry && (
                <button className="compare-btn" onClick={() => setComparePending(true)}>
                  Compare
                </button>
              )}
              {comparePending && (
                <span style={{ fontSize: 11, color: '#c084fc', fontStyle: 'italic' }}>
                  Click a country…
                </span>
              )}
              {compareCountry && (
                <button className="compare-btn compare-btn--exit" onClick={handleExitComparison}>
                  ✕ Exit
                </button>
              )}
            </div>

            {/* Stats — single view or comparison grid */}
            {compareNode ? (
              <div className="comparison-grid">
                <div className="cmp-label" />
                <div className="cmp-header cmp-header--blue">{selected}</div>
                <div className="cmp-header cmp-header--purple">{compareCountry}</div>
                {[
                  ['Exported',    fmt(selectedNode.total_exported),              fmt(compareNode.total_exported)],
                  ['Imported',    fmt(selectedNode.total_imported),              fmt(compareNode.total_imported)],
                  ['Betweenness', pct1(selectedNode.betweenness),               pct1(compareNode.betweenness)],
                  ['Dependency',  pct0(selectedNode.dependency_index),          pct0(compareNode.dependency_index)],
                  ['Top Supplier',selectedNode.top_supplier,                    compareNode.top_supplier],
                  ['Bloc',        getBlocLabel(selectedNode),                   getBlocLabel(compareNode)],
                ].map(([label, valA, valB]) => (
                  <Fragment key={label}>
                    <div className="cmp-label">{label}</div>
                    <div className="cmp-val cmp-val--blue">{valA}</div>
                    <div className="cmp-val cmp-val--purple">{valB}</div>
                  </Fragment>
                ))}
              </div>
            ) : (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-num">{selectedNode.total_exported.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="stat-label">TIV exported</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-num">{selectedNode.total_imported.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="stat-label">TIV imported</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-num">{(selectedNode.betweenness * 100).toFixed(1)}%</div>
                    <div className="stat-label">Betweenness</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-num">{(selectedNode.dependency_index * 100).toFixed(0)}%</div>
                    <div className="stat-label">Dependency</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#8b949e" }}>
                  Top supplier (historically): <span style={{ color: "#e0e0e0" }}>{selectedNode.top_supplier}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8b949e' }}>
                  Bloc:{' '}
                  <span style={{ color: '#e0e0e0' }}>{getBlocLabel(selectedNode)}</span>
                </div>
              </>
            )}

            {/* ── HHI chart ─────────────────────────────────────────────────── */}
            {(() => {
              const hhiA = hhiData.filter(d => d.country === selected).sort((a, b) => a.year - b.year)
              if (hhiA.length === 0) return null

              let chartData, lines
              if (compareNode) {
                const hhiB = hhiData.filter(d => d.country === compareCountry).sort((a, b) => a.year - b.year)
                const mapA = Object.fromEntries(hhiA.map(d => [d.year, d.hhi]))
                const mapB = Object.fromEntries(hhiB.map(d => [d.year, d.hhi]))
                const years = [...new Set([...hhiA.map(d => d.year), ...hhiB.map(d => d.year)])].sort((a, b) => a - b)
                chartData = years.map(y => ({ year: y, hhiA: mapA[y] ?? null, hhiB: mapB[y] ?? null }))
                lines = (
                  <>
                    <RechartsLine type="monotone" dataKey="hhiA" stroke="#58a6ff" strokeWidth={1.5} dot={false} connectNulls activeDot={{ r: 3 }} />
                    <RechartsLine type="monotone" dataKey="hhiB" stroke="#c084fc" strokeWidth={1.5} dot={false} connectNulls activeDot={{ r: 3 }} />
                  </>
                )
              } else {
                chartData = hhiA
                lines = <RechartsLine type="monotone" dataKey="hhi" stroke="#58a6ff" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
              }

              return (
                <div className="filter-group">
                  <div className="filter-label">Supplier diversification (HHI)</div>
                  <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 4 }}>
                    1.0 = total dependence · 0.0 = fully diversified
                  </div>
                  {compareNode && (
                    <div className="chart-legend">
                      <span><span className="chart-legend-dot" style={{ background: '#58a6ff' }} />{selected}</span>
                      <span><span className="chart-legend-dot" style={{ background: '#c084fc' }} />{compareCountry}</span>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <XAxis dataKey="year" tick={{ fontSize: 9, fill: "#8b949e" }} tickLine={false} interval={9} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: "#8b949e" }} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, fontSize: 11 }}
                        formatter={(val, name) => [
                          val?.toFixed(3) ?? '—',
                          name === 'hhiA' ? selected : name === 'hhiB' ? compareCountry : 'HHI'
                        ]}
                        labelFormatter={l => `Year: ${l}`}
                      />
                      {lines}
                    </LineChart>
                  </ResponsiveContainer>
                  {!compareNode && (
                    <div style={{ fontSize: 11, color: "#8b949e" }}>
                      Current top supplier:{" "}
                      <span style={{ color: "#e0e0e0" }}>{hhiA[hhiA.length - 1]?.top_supplier}</span>
                      {" · "}
                      <span style={{ color: "#e0e0e0" }}>
                        {(hhiA[hhiA.length - 1]?.top_share * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ── Trade balance chart ────────────────────────────────────────── */}
            {(() => {
              const balA = tradeBalance.filter(d => d.country === selected).sort((a, b) => a.year - b.year)
              if (balA.length === 0) return null

              let chartData, lines
              if (compareNode) {
                const balB = tradeBalance.filter(d => d.country === compareCountry).sort((a, b) => a.year - b.year)
                const mapA = Object.fromEntries(balA.map(d => [d.year, d.balance]))
                const mapB = Object.fromEntries(balB.map(d => [d.year, d.balance]))
                const years = [...new Set([...balA.map(d => d.year), ...balB.map(d => d.year)])].sort((a, b) => a - b)
                chartData = years.map(y => ({ year: y, balA: mapA[y] ?? null, balB: mapB[y] ?? null }))
                lines = (
                  <>
                    <RechartsLine type="monotone" dataKey="balA" stroke="#52c98a" strokeWidth={1.5} dot={false} connectNulls activeDot={{ r: 3 }} />
                    <RechartsLine type="monotone" dataKey="balB" stroke="#c084fc" strokeWidth={1.5} dot={false} connectNulls activeDot={{ r: 3 }} />
                  </>
                )
              } else {
                chartData = balA
                lines = <RechartsLine type="monotone" dataKey="balance" stroke="#52c98a" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
              }

              return (
                <div className="filter-group">
                  <div className="filter-label">Trade balance over time</div>
                  <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 4 }}>
                    positive = net exporter · negative = net importer
                  </div>
                  {compareNode && (
                    <div className="chart-legend">
                      <span><span className="chart-legend-dot" style={{ background: '#52c98a' }} />{selected}</span>
                      <span><span className="chart-legend-dot" style={{ background: '#c084fc' }} />{compareCountry}</span>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <XAxis dataKey="year" tick={{ fontSize: 9, fill: "#8b949e" }} tickLine={false} interval={9} />
                      <YAxis tick={{ fontSize: 9, fill: "#8b949e" }} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, fontSize: 11 }}
                        formatter={(val, name) => [
                          val?.toFixed(0) ?? '—',
                          name === 'balA' ? selected : name === 'balB' ? compareCountry : 'TIV balance'
                        ]}
                        labelFormatter={l => `Year: ${l}`}
                      />
                      {lines}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )
            })()}

            {/* ── Import volume + spikes (single country only) ───────────────── */}
            {(() => {
              const countryBalance = tradeBalance.filter(d => d.country === selected).sort((a, b) => a.year - b.year)
              if (countryBalance.length === 0) return null

              const countrySpikes = spikesData.filter(d => d.country === selected).sort((a, b) => a.year - b.year)

              let chartData, lines
              if (compareNode) {
                const balB = tradeBalance.filter(d => d.country === compareCountry).sort((a, b) => a.year - b.year)
                const mapA = Object.fromEntries(countryBalance.map(d => [d.year, d.total_imported]))
                const mapB = Object.fromEntries(balB.map(d => [d.year, d.total_imported]))
                const years = [...new Set([...countryBalance.map(d => d.year), ...balB.map(d => d.year)])].sort((a, b) => a - b)
                chartData = years.map(y => ({ year: y, impA: mapA[y] ?? null, impB: mapB[y] ?? null }))
                lines = (
                  <>
                    <RechartsLine type="monotone" dataKey="impA" stroke="#e0a852" strokeWidth={1.5} dot={false} connectNulls activeDot={{ r: 3 }} />
                    <RechartsLine type="monotone" dataKey="impB" stroke="#c084fc" strokeWidth={1.5} dot={false} connectNulls activeDot={{ r: 3 }} />
                  </>
                )
              } else {
                chartData = countryBalance
                lines = <RechartsLine type="monotone" dataKey="total_imported" stroke="#e0a852" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
              }

              return (
                <div className="filter-group">
                  <div className="filter-label">Import volume over time</div>
                  {compareNode && (
                    <div className="chart-legend">
                      <span><span className="chart-legend-dot" style={{ background: '#e0a852' }} />{selected}</span>
                      <span><span className="chart-legend-dot" style={{ background: '#c084fc' }} />{compareCountry}</span>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <XAxis dataKey="year" tick={{ fontSize: 9, fill: "#8b949e" }} tickLine={false} interval={9} />
                      <YAxis tick={{ fontSize: 9, fill: "#8b949e" }} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, fontSize: 11 }}
                        formatter={(val, name) => [
                          val?.toFixed(0) ?? '—',
                          name === 'impA' ? selected : name === 'impB' ? compareCountry : 'TIV imported'
                        ]}
                        labelFormatter={l => `Year: ${l}`}
                      />
                      {lines}
                    </LineChart>
                  </ResponsiveContainer>

                  {!compareNode && countrySpikes.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "#e0e0e0", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Historical Context
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {countrySpikes.map(spike => (
                          <div key={spike.year} style={{ background: "#1c2333", border: "1px solid #30363d", borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#e0a852", marginBottom: 4 }}>{spike.year}</div>
                            <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.6 }}>{spike.explanation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

          </div>
        )}
      </div>
    </div>
  )
}
