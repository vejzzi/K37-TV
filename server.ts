import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.DEFAULT_APP_PORT || process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Interni zaštićeni token TV signala (nikada se ne šalje u frontend kod)
const SECURE_CHANNEL_TOKEN = '78a047b7a861b70334e7635552f7113524fc8876fabf2d8df2bddc4c0e9252a9';

// 1. CORS i bezbednosna zaglavlja za TV signal:
app.use(['/api/v1/streams', '/api/v1/live'], (_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// 2. Zaštićena maskirana ruta za Live Master Playlist (/api/v1/live/k37.m3u8):
// Klijent vidi samo čistu putanju bez internog tokena ili ID-ja platforme
app.get('/api/v1/live/k37.m3u8', async (_req, res) => {
  try {
    const upstreamUrl = `https://playout.vidiyo.com/api/v1/streams/${SECURE_CHANNEL_TOKEN}/master.m3u8`;
    const response = await fetch(upstreamUrl, {
      headers: {
        Origin: 'https://vidiyo.com',
        Referer: 'https://vidiyo.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('Live signal privremeno nedostupan');
    }

    const playlistText = await response.text();

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(playlistText);
  } catch (err) {
    console.error('Greška pri učitavanju maskirane playliste:', err);
    res.status(502).send('Signal gateway error');
  }
});

// 3. Proxy za sve TS video segmente i pod-playliste
app.use(
  '/api/v1/streams',
  createProxyMiddleware({
    target: 'https://playout.vidiyo.com/api/v1/streams',
    changeOrigin: true,
    secure: false,
    headers: {
      Origin: 'https://vidiyo.com',
      Referer: 'https://vidiyo.com/',
    },
    on: {
      proxyRes: (proxyRes) => {
        proxyRes.headers['access-control-allow-origin'] = '*';
        proxyRes.headers['access-control-allow-methods'] = 'GET, HEAD, OPTIONS';
        proxyRes.headers['access-control-allow-headers'] = '*';
        proxyRes.headers['x-content-type-options'] = 'nosniff';
      },
    },
  })
);

// 4. CMS Persistent Storage Endpoints
const DATA_FILE = path.resolve(__dirname, 'data', 'tvDataStore.json');

// Automatski kreiraj folder ako ne postoji
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Učitavanje baze za CMS
app.get('/api/v1/content/db', (_req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return res.json(JSON.parse(raw));
    }
    return res.json({ schedule: null, news: null, ticker: null });
  } catch (err) {
    return res.status(500).json({ error: 'Greška pri čitanju CMS baze' });
  }
});

// Snimanje izmena iz Administratorske Zone
app.post('/api/v1/admin/save', express.json({ limit: '15mb' }), (req, res) => {
  try {
    const { schedule, news, ticker } = req.body;
    const payload = {
      schedule: schedule || null,
      news: news || null,
      ticker: ticker || null,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Podaci uspešno ažurirani u TV bazi' });
  } catch (err) {
    console.error('Greška pri snimanju CMS podataka:', err);
    return res.status(500).json({ error: 'Greška pri snimanju CMS podataka' });
  }
});

// 5. Health check
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// 5. Mount Vite u development modu ili serviranje statičkog dist foldera u produkciji
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TV K37 Secure Server running on port ${PORT} [mode: ${isProduction ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
