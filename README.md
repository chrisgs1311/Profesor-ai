# 🎯 Crypto Hunter

Screener full-stack de inversiones cripto con datos en vivo de **CoinGecko** y **DexScreener**, y análisis con IA usando la **Anthropic API**.

## Estructura

```
.
├── backend/         # Express proxy (CoinGecko, DexScreener, Anthropic)
├── frontend/        # Vite + React UI
└── render.yaml      # Blueprint de deploy en Render
```

## Correr en local

```bash
# Terminal 1 — backend
cd backend
npm install
ANTHROPIC_API_KEY=sk-ant-xxx npm run dev   # http://localhost:3001

# Terminal 2 — frontend
cd frontend
npm install
npm run dev                                 # http://localhost:5173
```

Verifica que `http://localhost:3001/api/known` devuelva precios reales antes de seguir.

## Endpoints del backend

| Método | Ruta                  | Descripción                                  |
|--------|-----------------------|----------------------------------------------|
| GET    | `/`                   | Health check                                 |
| GET    | `/api/known`          | Top coins (CoinGecko)                        |
| GET    | `/api/dex`            | Pares nuevos en DEX (5 cadenas, deduplicado) |
| GET    | `/api/dex/search?q=`  | Búsqueda en DexScreener                      |
| POST   | `/api/analyze`        | Análisis con IA (Claude). Body: `{ prompt }` |

## Deploy en Render (con `render.yaml`)

1. Sube este repo a GitHub.
2. En Render → **New** → **Blueprint** → conecta el repo. Render detecta `render.yaml` y crea **dos** servicios:
   - `crypto-hunter-api` (Web Service, Node)
   - `crypto-hunter-frontend` (Static Site)
3. En el dashboard del servicio `crypto-hunter-api`, configura la env var:
   - `ANTHROPIC_API_KEY` = tu key de Anthropic
4. En el dashboard del servicio `crypto-hunter-frontend`, configura:
   - `VITE_API_BASE` = la URL pública del backend (ej. `https://crypto-hunter-api.onrender.com`)
5. Deploy. Listo.

> El plan free de Render duerme el backend tras 15 min sin tráfico; el primer request tras dormir tarda ~30 s.

## Notas

- **CoinGecko free tier**: ~30 req/min. El auto-refresh del frontend está en 60 s.
- **DexScreener**: sin API key.
- **Anthropic**: la key vive sólo en el backend; el frontend nunca la ve.
