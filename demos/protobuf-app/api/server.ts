// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Protobuf-like Binary Protocol API Demo Server — Task Tracker
 * Zero dependencies, uses Node.js built-in https module with self-signed certs.
 * Custom binary wire format using DataView (big-endian).
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

const StatusPending = 0;
const StatusInProgress = 1;
const StatusDone = 2;

interface Task {
  id: number;
  title: string;
  description: string;
  status: number;
  priority: number;
}

// ── In-memory store ───────────────────────────────────────────────────

let nextId = 4;
const tasks: Map<number, Task> = new Map([
  [1, { id: 1, title: 'Set up project', description: 'Initialize the SpecifyJS project repository', status: StatusDone, priority: 1 }],
  [2, { id: 2, title: 'Build components', description: 'Implement core UI components', status: StatusInProgress, priority: 2 }],
  [3, { id: 3, title: 'Write tests', description: 'Add comprehensive test coverage', status: StatusPending, priority: 3 }],
]);

// ── Binary encoding/decoding ──────────────────────────────────────────
// Wire format per task:
//   [4 bytes: ID][1 byte: Status][1 byte: Priority]
//   [2 bytes: TitleLen][Title bytes][2 bytes: DescLen][Desc bytes]
// Task list: [4 bytes: Count][repeated Task]

function encodeTask(task: Task): Buffer {
  const titleBuf = Buffer.from(task.title, 'utf8');
  const descBuf = Buffer.from(task.description, 'utf8');
  const buf = Buffer.alloc(4 + 1 + 1 + 2 + titleBuf.length + 2 + descBuf.length);
  let offset = 0;
  buf.writeUInt32BE(task.id, offset); offset += 4;
  buf.writeUInt8(task.status, offset); offset += 1;
  buf.writeUInt8(task.priority, offset); offset += 1;
  buf.writeUInt16BE(titleBuf.length, offset); offset += 2;
  titleBuf.copy(buf, offset); offset += titleBuf.length;
  buf.writeUInt16BE(descBuf.length, offset); offset += 2;
  descBuf.copy(buf, offset);
  return buf;
}

function encodeTaskList(taskList: Task[]): Buffer {
  const encoded = taskList.map(encodeTask);
  const totalLen = 4 + encoded.reduce((sum, b) => sum + b.length, 0);
  const buf = Buffer.alloc(totalLen);
  buf.writeUInt32BE(taskList.length, 0);
  let offset = 4;
  for (const e of encoded) {
    e.copy(buf, offset);
    offset += e.length;
  }
  return buf;
}

function decodeTask(buf: Buffer, startOffset: number): { task: Partial<Task>; bytesRead: number } {
  let offset = startOffset;
  const need = (n: number, field: string) => {
    if (offset + n > buf.length) throw new Error(`Buffer too short for ${field}`);
  };
  need(4, 'id');
  const id = buf.readUInt32BE(offset); offset += 4;
  need(1, 'status');
  const status = buf.readUInt8(offset); offset += 1;
  need(1, 'priority');
  const priority = buf.readUInt8(offset); offset += 1;
  need(2, 'titleLen');
  const titleLen = buf.readUInt16BE(offset); offset += 2;
  need(titleLen, 'title');
  const title = buf.subarray(offset, offset + titleLen).toString('utf8'); offset += titleLen;
  need(2, 'descLen');
  const descLen = buf.readUInt16BE(offset); offset += 2;
  need(descLen, 'description');
  const description = buf.subarray(offset, offset + descLen).toString('utf8'); offset += descLen;
  return { task: { id, title, description, status, priority }, bytesRead: offset - startOffset };
}

// ── Helpers ───────────────────────────────────────────────────────────

const MAX_BODY = 1024 * 1024;

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) { req.destroy(); reject(new Error('Body too large')); return; }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

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

function binary(res: ServerResponse, status: number, data: Buffer): void {
  res.writeHead(status, { 'Content-Type': 'application/octet-stream', 'Content-Length': data.length });
  res.end(data);
}

function cors(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function extractId(url: string, prefix: string): number | null {
  const match = url.match(new RegExp(`^${prefix}/(\\d+)`));
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

  if (url === '/api/health') {
    json(res, 200, { status: 'ok' });
    return;
  }

  // ── Binary protocol endpoints ──────────────────────────────────────

  if (url === '/proto/tasks' && method === 'GET') {
    binary(res, 200, encodeTaskList(Array.from(tasks.values())));
    return;
  }

  if (url === '/proto/tasks' && method === 'POST') {
    const raw = await readRawBody(req);
    const { task: data } = decodeTask(raw, 0);
    const task: Task = {
      id: nextId++,
      title: data.title ?? '',
      description: data.description ?? '',
      status: data.status ?? StatusPending,
      priority: data.priority ?? 0,
    };
    tasks.set(task.id, task);
    binary(res, 201, encodeTask(task));
    return;
  }

  const protoId = extractId(url, '/proto/tasks');
  if (protoId !== null) {
    const task = tasks.get(protoId);
    if (method === 'PUT') {
      if (!task) { json(res, 404, { error: 'not found' }); return; }
      const raw = await readRawBody(req);
      const { task: data } = decodeTask(raw, 0);
      const updated: Task = { ...task, ...data, id: protoId };
      tasks.set(protoId, updated);
      binary(res, 200, encodeTask(updated));
      return;
    }
    if (method === 'DELETE') {
      if (!tasks.delete(protoId)) { json(res, 404, { error: 'not found' }); return; }
      res.writeHead(204);
      res.end();
      return;
    }
  }

  // ── JSON fallback endpoints ────────────────────────────────────────

  if (url === '/api/tasks' && method === 'GET') {
    json(res, 200, Array.from(tasks.values()));
    return;
  }

  if (url === '/api/tasks' && method === 'POST') {
    const body = await readBody(req);
    let data: Partial<Task>;
    try { data = JSON.parse(body) as Partial<Task>; } catch { json(res, 400, { error: 'Invalid JSON' }); return; }
    const task: Task = {
      id: nextId++,
      title: data.title ?? '',
      description: data.description ?? '',
      status: data.status ?? StatusPending,
      priority: data.priority ?? 0,
    };
    tasks.set(task.id, task);
    json(res, 201, task);
    return;
  }

  const jsonId = extractId(url, '/api/tasks');
  if (jsonId !== null) {
    const task = tasks.get(jsonId);
    if (method === 'PUT') {
      if (!task) { json(res, 404, { error: 'not found' }); return; }
      const body = await readBody(req);
      let data: Partial<Task>;
      try { data = JSON.parse(body) as Partial<Task>; } catch { json(res, 400, { error: 'Invalid JSON' }); return; }
      const updated: Task = { ...task, ...data, id: jsonId };
      tasks.set(jsonId, updated);
      json(res, 200, updated);
      return;
    }
    if (method === 'DELETE') {
      if (!tasks.delete(jsonId)) { json(res, 404, { error: 'not found' }); return; }
      json(res, 200, { deleted: true });
      return;
    }
  }

  json(res, 404, { error: 'not found' });
}

// ── Start server ──────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '4003', 10);
const server = createServer(
  { key: readFileSync(keyPath), cert: readFileSync(certPath) },
  (req, res) => {
    handler(req, res).catch(() => {
      json(res, 500, { error: 'Internal server error' });
    });
  },
);

server.listen(PORT, () => {
  console.log(`Protobuf API server listening on https://localhost:${PORT}`);
});
