// Minimal zero-dependency local static file server for NEON RELIC
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = 8000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.txt':  'text/plain; charset=utf-8',
  '.ico':  'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Parse URL pathname
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log('============================================================');
  console.log(' NEON RELIC Local Dev Server running at:');
  console.log(` > Laptop / Desktop:   ${url}/index.html`);
  console.log(` > Self-Tests:         ${url}/tests.html`);

  // Detect local network IP for mobile testing over Wi-Fi
  const interfaces = os.networkInterfaces();
  const lanIps = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        lanIps.push(iface.address);
      }
    }
  }
  if (lanIps.length > 0) {
    lanIps.forEach(ip => {
      console.log(` > Mobile Phone (LAN): http://${ip}:${PORT}/index.html`);
    });
  }
  console.log(' Press Ctrl+C to stop the server.');
  console.log('============================================================');

  // Automatically open default browser on Windows
  if (process.platform === 'win32') {
    exec(`start ${url}`);
  }
});
