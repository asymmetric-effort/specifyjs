// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * REST API Demo Server — Bookmarks CRUD
 * Zero dependencies, uses Node.js built-in https module with self-signed certs.
 */

import { createServer } from 'node:https';
import { IncomingMessage, ServerResponse } from 'node:http';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ── Self-signed certificate generation ───────────────────────────────

const certDir = join(import.meta.dirname ?? '.', '.certs');
const keyPath = join(certDir, 'key.pem');
const certPath = join(certDir, 'cert.pem');

if (!existsSync(keyPath) || !existsSync(certPath)) {
  if (!existsSync(certDir)) mkdirSync(certDir, { recursive: true });
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`,
    { stdio: 'pipe' },
  );
}

// ── Types ─────────────────────────────────────────────────────────────

interface Bookmark {
  id: number;
  title: string;
  url: string;
  tags: string[];
}

// ── In-memory store ───────────────────────────────────────────────────

let nextId = 4;
const bookmarks: Map<number, Bookmark> = new Map([
  [1, { id: 1, title: 'SpecifyJS Docs', url: 'https://specifyjs.asymmetric-effort.com', tags: ['docs', 'framework'] }],
  [2, { id: 2, title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', tags: ['typescript', 'docs'] }],
  [3, { id: 3, title: 'MDN Web Docs', url: 'https://developer.mozilla.org', tags: ['reference', 'web'] }],
]);

// ── Helpers ───────────────────────────────────────────────────────────

const MAX_BODY = 1024 * 1024; // 1MB

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) { req.destroy(); reject(new Error('Body too large')); return; }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

function cors(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function extractId(url: string): number | null {
  const match = url.match(/^\/api\/bookmarks\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// ── Request handler ───────────────────────────────────────────────────

async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  cors(res);
  const method = req.method ?? 'GET';
  const url = req.url ?? '/';

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (url === '/api/health') {
    json(res, 200, { status: 'ok' });
    return;
  }

  // GET /api/bookmarks
  if (url === '/api/bookmarks' && method === 'GET') {
    json(res, 200, Array.from(bookmarks.values()));
    return;
  }

  // POST /api/bookmarks
  if (url === '/api/bookmarks' && method === 'POST') {
    const body = await readBody(req);
    let data: Partial<Bookmark>;
    try { data = JSON.parse(body) as Partial<Bookmark>; } catch { json(res, 400, { error: 'Invalid JSON' }); return; }
    if (typeof data.title !== 'string' || typeof data.url !== 'string' || !data.title || !data.url) {
      json(res, 400, { error: 'title (string) and url (string) are required' });
      return;
    }
    if (data.title.length > 500 || data.url.length > 2000) {
      json(res, 400, { error: 'title or url exceeds max length' });
      return;
    }
    const bookmark: Bookmark = {
      id: nextId++,
      title: data.title,
      url: data.url,
      tags: data.tags ?? [],
    };
    bookmarks.set(bookmark.id, bookmark);
    json(res, 201, bookmark);
    return;
  }

  // Single bookmark operations
  const id = extractId(url);
  if (id !== null) {
    const bookmark = bookmarks.get(id);

    if (method === 'GET') {
      if (!bookmark) { json(res, 404, { error: 'not found' }); return; }
      json(res, 200, bookmark);
      return;
    }

    if (method === 'PUT') {
      if (!bookmark) { json(res, 404, { error: 'not found' }); return; }
      const body = await readBody(req);
      let data: Partial<Bookmark>;
      try { data = JSON.parse(body) as Partial<Bookmark>; } catch { json(res, 400, { error: 'Invalid JSON' }); return; }
      const updated: Bookmark = {
        ...bookmark,
        title: data.title ?? bookmark.title,
        url: data.url ?? bookmark.url,
        tags: data.tags ?? bookmark.tags,
      };
      bookmarks.set(id, updated);
      json(res, 200, updated);
      return;
    }

    if (method === 'DELETE') {
      if (!bookmarks.delete(id)) { json(res, 404, { error: 'not found' }); return; }
      json(res, 200, { deleted: true });
      return;
    }
  }

  json(res, 404, { error: 'not found' });
}

// ── Start server ──────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '4001', 10);
const server = createServer(
  { key: readFileSync(keyPath), cert: readFileSync(certPath) },
  (req, res) => {
    handler(req, res).catch(() => {
      json(res, 500, { error: 'Internal server error' });
    });
  },
);

server.listen(PORT, () => {
  console.log(`REST API server listening on https://localhost:${PORT}`);
});
