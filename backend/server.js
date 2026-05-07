const express = require("express");
const cors    = require("cors");
const fetch   = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "CRYPTO HUNTER API running" }));

// CoinGecko — precios de coins conocidas
app.get("/api/known", async (req, res) => {
  try {
    const ids = [
      "bitcoin","ethereum","solana","binancecoin","ripple",
      "cardano","avalanche-2","chainlink","polkadot","uniswap","near","sui"
    ].join(",");
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&sparkline=false&price_change_percentage=1h,24h,7d`;
    const r    = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DexScreener — pares nuevos por cadena
app.get("/api/dex", async (req, res) => {
  const chains  = ["ethereum", "bsc", "solana", "base", "arbitrum"];
  const results = [];
  for (const chain of chains) {
    try {
      const url = `https://api.dexscreener.com/latest/dex/search?q=${chain}`;
      const r   = await fetch(url, { headers: { Accept: "application/json" } });
      const d   = await r.json();
      if (d.pairs) results.push(...d.pairs.slice(0, 8));
    } catch {}
  }
  const seen   = new Set();
  const unique = results.filter(p => {
    const k = p.pairAddress || p.baseToken?.address;
    if (!k || seen.has(k)) return false;
    seen.add(k); return true;
  });
  res.json(unique.slice(0, 50));
});

// DexScreener — búsqueda libre
app.get("/api/dex/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });
  try {
    const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`;
    const r   = await fetch(url);
    const d   = await r.json();
    res.json(d.pairs || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Anthropic — análisis con IA (oculta la API key del browser)
app.post("/api/analyze", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY no configurada" });

  const { prompt, model = "claude-sonnet-4-5", max_tokens = 800 } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt requerido" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(r.status).json(j);
    const text = (j.content || []).map((c) => c.text || "").join("\n").trim();
    res.json({ text, raw: j });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`🎯 Crypto Hunter API en puerto ${PORT}`));
