import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// In-memory cache for Google Sheet CSV to reduce latency and respect rate limits
let cachedCSV: string | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds

const SPREADSHEET_ID = '1Pdhc1lFf6QQHWieC--IpvtkyP87lke5-EyrBmUH8pOk';
const SHEET_GID = '1021449465';
const EXPORT_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

// API Proxy to bypass browser CORS for Google Sheets CSV export
app.get('/api/sheet-data', async (req, res) => {
  try {
    const now = Date.now();
    // Return cached CSV if still fresh and force refresh not requested
    if (cachedCSV && now - lastCacheTime < CACHE_TTL_MS && !req.query.force) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('X-Cache', 'HIT');
      return res.send(cachedCSV);
    }

    // Fetch from Google Docs server-to-server (no CORS restrictions)
    const response = await fetch(`${EXPORT_CSV_URL}&_t=${now}`);
    if (!response.ok) {
      if (cachedCSV) {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('X-Cache', 'STALE');
        return res.send(cachedCSV);
      }
      return res.status(response.status).json({ error: `Google Sheets HTTP ${response.status}` });
    }

    const text = await response.text();
    cachedCSV = text;
    lastCacheTime = now;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('X-Cache', 'MISS');
    res.send(text);
  } catch (error: any) {
    console.error('Error fetching sheet CSV in server proxy:', error);
    if (cachedCSV) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('X-Cache', 'STALE_FALLBACK');
      return res.send(cachedCSV);
    }
    res.status(500).json({ error: error?.message || 'Failed to fetch sheet CSV' });
  }
});

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (production: ${isProduction})`);
  });
}

startServer();
