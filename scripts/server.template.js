// Zero-dependency verification server for cloned sites.
// site-clone copies this into the clone output, replaces {{PORT}},
// and starts it for console-error validation.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = {{PORT}};
const BASE_DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.vtt': 'text/vtt; charset=utf-8',
};

function resolveSafe(requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0].split('#')[0]);
  const resolved = path.join(BASE_DIR, decoded);
  if (!resolved.startsWith(BASE_DIR)) return null;
  return resolved;
}

http.createServer((req, res) => {
  const filePath = resolveSafe(req.url === '/' ? '/index.html' : req.url);

  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
}).listen(PORT, () => {
  process.stdout.write(`http://localhost:${PORT}/`);
});
