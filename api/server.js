import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleStoreRoute } from './store.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, '..');
const distDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT || 3001);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

function addJsonHelpers(res) {
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };

  res.json = (payload) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(payload));
  };
}

async function readRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

function readQuery(url) {
  return Object.fromEntries(url.searchParams.entries());
}

async function handleApi(req, res, url) {
  addJsonHelpers(res);
  req.query = readQuery(url);
  req.body = await readRequestBody(req);

  const routeName = url.pathname.replace(/^\/api\/?/, '');

  if (!routeName) {
    res.json({
      routes: [
        '/api/summary',
        '/api/auth',
        '/api/signup',
        '/api/products',
        '/api/categories',
        '/api/customers',
        '/api/cart',
        '/api/orders',
        '/api/reviews',
      ],
    });
    return;
  }

  if (routeName === 'store') {
    await handleStoreRoute(req, res, req.query.route || 'summary');
    return;
  }

  if (
    [
      'summary',
      'auth',
      'signup',
      'products',
      'categories',
      'customers',
      'cart',
      'orders',
      'reviews',
    ].includes(routeName)
  ) {
    await handleStoreRoute(req, res, routeName);
    return;
  }

  res.status(404).json({ error: 'API route was not found.' });
}

async function sendFile(res, filePath) {
  const extension = path.extname(filePath);
  const contentType = contentTypes.get(extension) || 'application/octet-stream';
  const file = await fs.readFile(filePath);

  res.writeHead(200, { 'Content-Type': contentType });
  res.end(file);
}

async function handleStatic(req, res, url) {
  const requestedPath =
    url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const resolvedPath = path.resolve(distDir, requestedPath);

  if (!resolvedPath.startsWith(distDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    await sendFile(res, resolvedPath);
  } catch {
    try {
      await sendFile(res, path.join(distDir, 'index.html'));
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Build the frontend first with pnpm build.');
    }
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  try {
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }

    await handleStatic(req, res, url);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? 'Server request failed.' : error.message;

    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify({ error: message }));
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
