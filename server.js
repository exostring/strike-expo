import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
const uploadsDir = path.join(dataDir, 'uploads');
const contentPath = path.join(dataDir, 'content.json');
const seedPath = path.join(root, 'content.seed.json');
const adminPath = normalizeAdminPath(process.env.ADMIN_PATH || '/control-7f3a-strike');
const adminPassword = process.env.ADMIN_PASSWORD || '';
const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
const isProduction = process.env.NODE_ENV === 'production';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

await ensureData();

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === '/api/content' && req.method === 'GET') {
      return json(res, await readContent());
    }

    if (pathname.startsWith('/uploads/')) {
      return sendFile(res, path.join(uploadsDir, pathname.slice('/uploads/'.length)), uploadsDir);
    }

    if (pathname === adminPath && req.method === 'GET') {
      return sendFile(res, path.join(root, 'admin.html'), root);
    }

    if (pathname === `${adminPath}/api/login` && req.method === 'POST') {
      return handleLogin(req, res);
    }

    if (pathname === `${adminPath}/api/content`) {
      if (!isAuthed(req)) return unauthorized(res);
      if (req.method === 'GET') return json(res, await readContent());
      if (req.method === 'PUT') return saveContent(req, res);
    }

    if (pathname === `${adminPath}/api/upload` && req.method === 'POST') {
      if (!isAuthed(req)) return unauthorized(res);
      return saveUpload(req, res);
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return notFound(res);
    }

    return sendPublic(req, res, pathname);
  } catch (error) {
    console.error(error);
    text(res, 500, 'Server error');
  }
}).listen(port, () => {
  console.log(`Strike Expo listening on ${port}`);
  console.log(`Admin path: ${adminPath}`);
});

function normalizeAdminPath(value) {
  const clean = String(value || '').trim();
  if (!clean || clean === '/') return '/control-7f3a-strike';
  return clean.startsWith('/') ? clean.replace(/\/+$/, '') : `/${clean.replace(/\/+$/, '')}`;
}

async function ensureData() {
  await mkdir(dataDir, { recursive: true });
  await mkdir(uploadsDir, { recursive: true });
  try {
    await stat(contentPath);
  } catch {
    await writeFile(contentPath, await readFile(seedPath, 'utf8'), 'utf8');
  }
}

async function readContent() {
  return JSON.parse(await readFile(contentPath, 'utf8'));
}

async function writeContent(data) {
  const tmp = `${contentPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await rename(tmp, contentPath);
}

async function saveContent(req, res) {
  const data = await readJson(req, 1024 * 1024);
  if (!data || !Array.isArray(data.participants) || !data.texts) {
    return text(res, 400, 'Bad content');
  }
  data.updatedAt = new Date().toISOString();
  await writeContent(data);
  json(res, { ok: true, content: data });
}

async function saveUpload(req, res) {
  const { filename, dataUrl } = await readJson(req, 12 * 1024 * 1024);
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl || '');
  if (!match) return text(res, 400, 'Only png, jpg and webp images are allowed');

  const ext = match[1] === 'image/png' ? '.png' : match[1] === 'image/webp' ? '.webp' : '.jpg';
  const base = path.basename(String(filename || 'logo')).replace(/\.[^.]+$/, '');
  const safe = base.toLowerCase().replace(/[^a-z0-9а-яё_-]+/giu, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'logo';
  const name = `${Date.now()}-${safe}${ext}`;
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 8 * 1024 * 1024) return text(res, 413, 'Image is too large');

  await writeFile(path.join(uploadsDir, name), buffer);
  json(res, { ok: true, path: `/uploads/${name}` });
}

async function handleLogin(req, res) {
  if (isProduction && !adminPassword) return text(res, 503, 'ADMIN_PASSWORD is required');
  const { password } = await readJson(req, 32 * 1024);
  if (!safeEqual(password || '', adminPassword || 'change-me')) return unauthorized(res);

  const issued = String(Date.now());
  const sig = sign(issued);
  res.writeHead(200, {
    'content-type': 'application/json; charset=utf-8',
    'set-cookie': `strike_session=${issued}.${sig}; HttpOnly; SameSite=Lax; Path=${adminPath}; Max-Age=604800`
  });
  res.end(JSON.stringify({ ok: true }));
}

function isAuthed(req) {
  const cookie = req.headers.cookie || '';
  const value = cookie.split(';').map(x => x.trim()).find(x => x.startsWith('strike_session='))?.split('=')[1];
  if (!value) return false;
  const [issued, sig] = value.split('.');
  if (!issued || !sig || sign(issued) !== sig) return false;
  return Date.now() - Number(issued) < 7 * 24 * 60 * 60 * 1000;
}

function sign(value) {
  return createHmac('sha256', sessionSecret).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

async function readJson(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('Request too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function sendPublic(req, res, pathname) {
  const clean = pathname === '/' ? '/index.html' : pathname;
  return sendFile(res, path.join(root, clean.replace(/^\/+/, '')), root);
}

async function sendFile(res, file, base) {
  const resolved = path.resolve(file);
  if (!resolved.startsWith(path.resolve(base))) return notFound(res);
  try {
    const info = await stat(resolved);
    if (!info.isFile()) return notFound(res);
    res.writeHead(200, { 'content-type': mime[path.extname(resolved).toLowerCase()] || 'application/octet-stream' });
    createReadStream(resolved).pipe(res);
  } catch {
    notFound(res);
  }
}

function json(res, data) {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}

function text(res, status, message) {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(message);
}

function unauthorized(res) {
  text(res, 401, 'Unauthorized');
}

function notFound(res) {
  text(res, 404, 'Not found');
}
