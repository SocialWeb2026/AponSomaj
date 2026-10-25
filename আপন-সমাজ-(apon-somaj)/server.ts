import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run's Nginx frontend listens on 8080 and proxies traffic to 3000.
// The Node app must strictly listen on port 3000 to prevent EADDRINUSE collisions.
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// Health check endpoints for Cloud Run container probes
app.get(['/api/health', '/healthz', '/ping', '/_health'], (_req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'Apon Somaj (আপন সমাজ)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Serve production static assets from dist folder
if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      maxAge: '1h',
      etag: true,
    })
  );
}

// Client-side SPA routing fallback
app.get('*', (_req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>আপন সমাজ | Apon Somaj</title>
  </head>
  <body>
    <div id="root">
      <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
        <h2>আপন সমাজ (Apon Somaj)</h2>
        <p>অ্যাপ্লিকেশন প্রস্তুত হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
      </div>
    </div>
  </body>
</html>`);
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[Apon Somaj] Production server successfully running on http://${HOST}:${PORT}`);
});

// Graceful container shutdown handlers for Cloud Run
const handleShutdown = (signal: string) => {
  console.log(`[Apon Somaj] ${signal} received: closing HTTP server`);
  server.close(() => {
    console.log('[Apon Somaj] HTTP server closed cleanly');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
