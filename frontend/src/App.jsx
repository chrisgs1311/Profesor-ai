import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "";

const fmtUsd = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  if (n >= 1) return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${Number(n).toPrecision(4)}`;
};

const fmtPct = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const v = Number(n).toFixed(2);
  return `${v > 0 ? "+" : ""}${v}%`;
};

const fmtBig = (n) => {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
};

const pctColor = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "#888";
  return n >= 0 ? "#16c784" : "#ea3943";
};

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0b0f1a 0%,#0a0a14 100%)",
    color: "#e8eaf0",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
  },
  container: { maxWidth: 1200, margin: "0 auto", padding: "24px 20px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title: { fontSize: 28, fontWeight: 800, letterSpacing: -0.5 },
  badge: { fontSize: 11, padding: "4px 8px", borderRadius: 999, background: "#16c784", color: "#001b0e", fontWeight: 700 },
  tabs: { display: "flex", gap: 8, marginBottom: 16 },
  tab: (active) => ({
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #1f2436",
    background: active ? "#1b2236" : "#0f1322",
    color: active ? "#fff" : "#a6acbd",
    cursor: "pointer",
    fontWeight: 600,
  }),
  toolbar: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  input: {
    flex: 1,
    minWidth: 240,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #1f2436",
    background: "#0f1322",
    color: "#fff",
    outline: "none",
  },
  button: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #2b3454",
    background: "#1b2542",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  card: {
    background: "#0f1322",
    border: "1px solid #1f2436",
    borderRadius: 14,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 12,
    color: "#8b93a8",
    borderBottom: "1px solid #1f2436",
    background: "#0c1020",
    cursor: "pointer",
    userSelect: "none",
  },
  td: { padding: "12px 14px", borderBottom: "1px solid #161b2c", fontSize: 14 },
  row: { cursor: "pointer" },
  rowHover: { background: "#11172a" },
  meta: { fontSize: 12, color: "#8b93a8" },
  drawer: {
    position: "fixed", top: 0, right: 0, bottom: 0, width: "min(520px, 100%)",
    background: "#0c1020", borderLeft: "1px solid #1f2436",
    transform: "translateX(0)", transition: "transform .25s ease",
    overflowY: "auto", zIndex: 50, padding: 20,
  },
  drawerBackdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 40,
  },
  pre: { whiteSpace: "pre-wrap", lineHeight: 1.5, fontSize: 14 },
  small: { fontSize: 12, color: "#8b93a8" },
};

function useFetchJson(path, deps = []) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setErr(null);
    fetch(`${API_BASE}${path}`)
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setData(j); })
      .catch((e) => { if (!cancelled) setErr(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [path, tick, ...deps]);

  return { data, err, loading, reload };
}

function KnownTable({ rows, onPick }) {
  const [sortKey, setSortKey] = useState("market_cap");
  const [sortDir, setSortDir] = useState("desc");

  const sorted = useMemo(() => {
    if (!rows) return [];
    const r = [...rows];
    r.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return r;
  }, [rows, sortKey, sortDir]);

  const sortBy = (k) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };

  return (
    <div style={styles.card}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Coin</th>
            <th style={styles.th} onClick={() => sortBy("current_price")}>Precio</th>
            <th style={styles.th} onClick={() => sortBy("price_change_percentage_1h_in_currency")}>1h</th>
            <th style={styles.th} onClick={() => sortBy("price_change_percentage_24h_in_currency")}>24h</th>
            <th style={styles.th} onClick={() => sortBy("price_change_percentage_7d_in_currency")}>7d</th>
            <th style={styles.th} onClick={() => sortBy("market_cap")}>Market Cap</th>
            <th style={styles.th} onClick={() => sortBy("total_volume")}>Volumen 24h</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => (
            <tr key={c.id} style={styles.row} onClick={() => onPick(c)}>
              <td style={styles.td}>{i + 1}</td>
              <td style={styles.td}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {c.image && <img src={c.image} width={22} height={22} alt="" />}
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <div style={styles.meta}>{(c.symbol || "").toUpperCase()}</div>
                  </div>
                </div>
              </td>
              <td style={styles.td}>{fmtUsd(c.current_price)}</td>
              <td style={{ ...styles.td, color: pctColor(c.price_change_percentage_1h_in_currency) }}>
                {fmtPct(c.price_change_percentage_1h_in_currency)}
              </td>
              <td style={{ ...styles.td, color: pctColor(c.price_change_percentage_24h_in_currency) }}>
                {fmtPct(c.price_change_percentage_24h_in_currency)}
              </td>
              <td style={{ ...styles.td, color: pctColor(c.price_change_percentage_7d_in_currency) }}>
                {fmtPct(c.price_change_percentage_7d_in_currency)}
              </td>
              <td style={styles.td}>{fmtBig(c.market_cap)}</td>
              <td style={styles.td}>{fmtBig(c.total_volume)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DexTable({ rows, onPick }) {
  return (
    <div style={styles.card}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Par</th>
            <th style={styles.th}>Cadena / DEX</th>
            <th style={styles.th}>Precio</th>
            <th style={styles.th}>5m</th>
            <th style={styles.th}>1h</th>
            <th style={styles.th}>24h</th>
            <th style={styles.th}>Liquidez</th>
            <th style={styles.th}>Volumen 24h</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const c5 = p.priceChange?.m5;
            const c1 = p.priceChange?.h1;
            const c24 = p.priceChange?.h24;
            return (
              <tr key={p.pairAddress + (p.chainId || "")} style={styles.row} onClick={() => onPick(p)}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 700 }}>
                    {p.baseToken?.symbol}/{p.quoteToken?.symbol}
                  </div>
                  <div style={styles.meta}>{p.baseToken?.name}</div>
                </td>
                <td style={styles.td}>
                  <div>{p.chainId}</div>
                  <div style={styles.meta}>{p.dexId}</div>
                </td>
                <td style={styles.td}>{fmtUsd(parseFloat(p.priceUsd))}</td>
                <td style={{ ...styles.td, color: pctColor(c5) }}>{fmtPct(c5)}</td>
                <td style={{ ...styles.td, color: pctColor(c1) }}>{fmtPct(c1)}</td>
                <td style={{ ...styles.td, color: pctColor(c24) }}>{fmtPct(c24)}</td>
                <td style={styles.td}>{fmtBig(p.liquidity?.usd)}</td>
                <td style={styles.td}>{fmtBig(p.volume?.h24)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AnalysisDrawer({ asset, onClose }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!asset) return;
    setAnalysis(""); setError(null); setLoading(true);

    const isCoin = !!asset.id && !!asset.symbol && !asset.baseToken;
    const summary = isCoin
      ? `Coin: ${asset.name} (${asset.symbol?.toUpperCase()})
Precio: ${fmtUsd(asset.current_price)}
Cambio 1h: ${fmtPct(asset.price_change_percentage_1h_in_currency)}
Cambio 24h: ${fmtPct(asset.price_change_percentage_24h_in_currency)}
Cambio 7d: ${fmtPct(asset.price_change_percentage_7d_in_currency)}
Market cap: ${fmtBig(asset.market_cap)}
Volumen 24h: ${fmtBig(asset.total_volume)}
ATH: ${fmtUsd(asset.ath)}  ATL: ${fmtUsd(asset.atl)}`
      : `Par: ${asset.baseToken?.symbol}/${asset.quoteToken?.symbol} en ${asset.dexId} (${asset.chainId})
Token: ${asset.baseToken?.name} (${asset.baseToken?.symbol})
Precio USD: ${fmtUsd(parseFloat(asset.priceUsd))}
Cambio 5m/1h/24h: ${fmtPct(asset.priceChange?.m5)} / ${fmtPct(asset.priceChange?.h1)} / ${fmtPct(asset.priceChange?.h24)}
Liquidez: ${fmtBig(asset.liquidity?.usd)}
Volumen 24h: ${fmtBig(asset.volume?.h24)}
FDV: ${fmtBig(asset.fdv)}`;

    const prompt = `Eres un analista cripto experimentado. Analiza brevemente este activo en español, en máximo 5 viñetas:
1) tesis rápida, 2) señales positivas, 3) riesgos clave, 4) niveles a vigilar, 5) verdict (acumular / esperar / evitar).
No inventes datos. Sé directo y conciso.

DATOS:
${summary}`;

    (async () => {
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 800,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`AI ${r.status}: ${t.slice(0, 200)}`);
        }
        const j = await r.json();
        const text = (j.content || []).map((c) => c.text || "").join("\n").trim();
        setAnalysis(text || "(sin respuesta)");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [asset]);

  if (!asset) return null;
  const isCoin = !!asset.id && !asset.baseToken;
  const title = isCoin
    ? `${asset.name} (${asset.symbol?.toUpperCase()})`
    : `${asset.baseToken?.symbol}/${asset.quoteToken?.symbol}`;

  return (
    <>
      <div style={styles.drawerBackdrop} onClick={onClose} />
      <div style={styles.drawer}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{title}</div>
          <button style={styles.button} onClick={onClose}>Cerrar</button>
        </div>
        <div style={styles.small}>Análisis generado por IA. No es asesoría financiera.</div>
        <hr style={{ borderColor: "#1f2436", margin: "14px 0" }} />
        {loading && <div>Analizando…</div>}
        {error && <div style={{ color: "#ea3943" }}>Error: {error}</div>}
        {analysis && <div style={styles.pre}>{analysis}</div>}
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("known");
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [picked, setPicked] = useState(null);

  const known = useFetchJson("/api/known");
  const dex = useFetchJson("/api/dex");
  const dexSearch = useFetchJson(
    searchTerm ? `/api/dex/search?q=${encodeURIComponent(searchTerm)}` : null,
    [searchTerm]
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (tab === "known") known.reload();
      else if (tab === "dex") dex.reload();
    }, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [tab]);

  const filteredKnown = useMemo(() => {
    if (!known.data) return [];
    if (!query) return known.data;
    const q = query.toLowerCase();
    return known.data.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.symbol || "").toLowerCase().includes(q)
    );
  }, [known.data, query]);

  const dexRows = useMemo(() => {
    const list = searchTerm ? dexSearch.data : dex.data;
    if (!list) return [];
    return [...list].sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
  }, [dex.data, dexSearch.data, searchTerm]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(query.trim());
    if (query.trim()) setTab("dex");
  };

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>🎯 Crypto Hunter</div>
            <div style={styles.small}>Screener de inversiones cripto · CoinGecko · DexScreener</div>
          </div>
          <div style={styles.badge}>LIVE</div>
        </div>

        <div style={styles.tabs}>
          <button style={styles.tab(tab === "known")} onClick={() => setTab("known")}>Top Coins</button>
          <button style={styles.tab(tab === "dex")} onClick={() => setTab("dex")}>DEX Pairs</button>
        </div>

        <form style={styles.toolbar} onSubmit={onSearchSubmit}>
          <input
            style={styles.input}
            placeholder={tab === "known" ? "Filtrar coins…" : "Buscar token o par en DEX…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {tab === "dex" && (
            <>
              <button type="submit" style={styles.button}>Buscar</button>
              {searchTerm && (
                <button type="button" style={styles.button} onClick={() => { setSearchTerm(""); setQuery(""); }}>
                  Limpiar
                </button>
              )}
            </>
          )}
          <button
            type="button"
            style={styles.button}
            onClick={() => (tab === "known" ? known.reload() : dex.reload())}
          >
            Refrescar
          </button>
        </form>

        {tab === "known" && (
          <>
            {known.loading && !known.data && <div>Cargando precios…</div>}
            {known.err && <div style={{ color: "#ea3943" }}>Error: {known.err}</div>}
            {known.data && <KnownTable rows={filteredKnown} onPick={setPicked} />}
          </>
        )}

        {tab === "dex" && (
          <>
            {(dex.loading || dexSearch.loading) && !dexRows.length && <div>Cargando pares…</div>}
            {(dex.err || dexSearch.err) && (
              <div style={{ color: "#ea3943" }}>Error: {dex.err || dexSearch.err}</div>
            )}
            <DexTable rows={dexRows} onPick={setPicked} />
          </>
        )}

        <div style={{ ...styles.small, marginTop: 16 }}>
          Auto-refresh cada 60s. Click en una fila para análisis con IA.
        </div>
      </div>

      <AnalysisDrawer asset={picked} onClose={() => setPicked(null)} />
    </div>
  );
}
