// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * GraphQL API Demo Server — Contact Directory
 * Zero dependencies, uses Node.js built-in https module with self-signed certs.
 * Minimal GraphQL implementation with regex-based query parsing.
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

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
}

interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

interface GraphQLResponse {
  data?: unknown;
  errors?: { message: string }[];
}

// ── In-memory store ───────────────────────────────────────────────────

let nextId = 5;
const contacts: Map<number, Contact> = new Map([
  [1, { id: 1, name: 'Alice Chen', email: 'alice@example.com', phone: '555-0101', department: 'Engineering' }],
  [2, { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '555-0102', department: 'Design' }],
  [3, { id: 3, name: 'Carol Davis', email: 'carol@example.com', phone: '555-0103', department: 'Product' }],
  [4, { id: 4, name: 'Dan Wilson', email: 'dan@example.com', phone: '555-0104', department: 'Engineering' }],
]);

// ── Field extraction ──────────────────────────────────────────────────

function extractFields(query: string, typeName: string): string[] | null {
  // Match: typeName { field1 field2 ... } or typeName(args) { field1 field2 ... }
  const pattern = new RegExp(`${typeName}(?:\\([^)]*\\))?\\s*\\{([^}]+)\\}`);
  const match = query.match(pattern);
  if (!match) return null;
  return match[1].trim().split(/\s+/);
}

function filterFields(obj: Record<string, unknown>, fields: string[] | null): Record<string, unknown> {
  if (!fields) return obj;
  const result: Record<string, unknown> = {};
  for (const f of fields) {
    if (f in obj) result[f] = obj[f];
  }
  return result;
}

// ── Query routing ─────────────────────────────────────────────────────

function routeQuery(query: string): GraphQLResponse {
  const trimmed = query.trim();

  // mutation: addContact
  const addMatch = trimmed.match(/mutation\s*\{\s*addContact\s*\(\s*name:\s*"([^"]+)"\s*,\s*email:\s*"([^"]+)"\s*,\s*phone:\s*"([^"]+)"\s*,\s*department:\s*"([^"]+)"\s*\)/);
  if (addMatch) {
    const contact: Contact = {
      id: nextId++,
      name: addMatch[1],
      email: addMatch[2],
      phone: addMatch[3],
      department: addMatch[4],
    };
    contacts.set(contact.id, contact);
    const fields = extractFields(trimmed, 'addContact');
    return { data: { addContact: filterFields(contact as unknown as Record<string, unknown>, fields) } };
  }

  // mutation: deleteContact
  const deleteMatch = trimmed.match(/mutation\s*\{\s*deleteContact\s*\(\s*id:\s*(\d+)\s*\)/);
  if (deleteMatch) {
    const id = parseInt(deleteMatch[1], 10);
    const existed = contacts.delete(id);
    return { data: { deleteContact: existed } };
  }

  // query: contact(id: N)
  const singleMatch = trimmed.match(/contact\s*\(\s*id:\s*(\d+)\s*\)/);
  if (singleMatch) {
    const id = parseInt(singleMatch[1], 10);
    const c = contacts.get(id);
    if (!c) return { data: { contact: null } };
    const fields = extractFields(trimmed, 'contact');
    return { data: { contact: filterFields(c as unknown as Record<string, unknown>, fields) } };
  }

  // query: contacts
  if (/contacts\s*\{/.test(trimmed)) {
    const fields = extractFields(trimmed, 'contacts');
    const list = Array.from(contacts.values()).map((c) =>
      filterFields(c as unknown as Record<string, unknown>, fields),
    );
    return { data: { contacts: list } };
  }

  return { errors: [{ message: 'Unrecognized query' }] };
}

// ── Helpers ───────────────────────────────────────────────────────────

const MAX_BODY = 1024 * 1024;

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

  if (url === '/graphql' && method === 'POST') {
    const body = await readBody(req);
    let gqlReq: GraphQLRequest;
    try { gqlReq = JSON.parse(body) as GraphQLRequest; } catch { json(res, 400, { errors: [{ message: 'Invalid JSON' }] }); return; }
    const result = routeQuery(gqlReq.query);
    json(res, 200, result);
    return;
  }

  json(res, 404, { error: 'not found' });
}

// ── Start server ──────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '4002', 10);
const server = createServer(
  { key: readFileSync(keyPath), cert: readFileSync(certPath) },
  (req, res) => {
    handler(req, res).catch(() => {
      json(res, 500, { errors: [{ message: 'Internal server error' }] });
    });
  },
);

server.listen(PORT, () => {
  console.log(`GraphQL API server listening on https://localhost:${PORT}`);
});
