// 最小静态服务器，用于预览 spike 和最终页面（ESM import 需要 http 协议）
// Windows 兼容：用 path.resolve 做路径解析与越界检查。
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const ROOT = resolve(process.argv[2] || '.');
const PORT = parseInt(process.argv[3] || '8765', 10);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

function safeJoin(root, urlPath) {
  // 去掉 query，解码，去掉开头的 /
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  // 防止绝对路径与盘符注入
  rel = rel.replace(/^[/\\]+/, '');
  const filePath = resolve(root, rel);
  // 越界检查：必须仍在 root 之下（含 root 自身）
  const rootWithSep = root.endsWith(sep) ? root : root + sep;
  if (filePath !== root && !filePath.startsWith(rootWithSep)) {
    return null;
  }
  return filePath;
}

const server = http.createServer(async (req, res) => {
  try {
    const filePath = safeJoin(ROOT, req.url || '/');
    if (!filePath) {
      res.writeHead(403); res.end('forbidden'); return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(404); res.end('not found: ' + req.url);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`serving ${ROOT} at http://127.0.0.1:${PORT}`);
});
