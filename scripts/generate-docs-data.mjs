// Generate docs-data.ts from docs/ directory
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, basename } from 'path';

const DOCS_DIR = join(new URL(".", import.meta.url).pathname.replace(/\/$/,""), '..', 'docs');
const OUTPUT = join(new URL(".", import.meta.url).pathname.replace(/\/$/,""), '..', 'site', 'src', 'docs-data.ts');

function readMarkdownFiles(dir, prefix = '') {
  const entries = [];
  const items = readdirSync(dir).sort();
  for (const item of items) {
    const full = join(dir, item);
    const stat = statSync(full);
    if (stat.isFile() && item.endsWith('.md')) {
      const name = item.replace(/\.md$/, '');
      const path = prefix ? `${prefix}/${name}` : name;
      const content = readFileSync(full, 'utf-8');
      // Extract title from first H1
      const titleMatch = content.match(/^#\s+(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : name;
      entries.push({ title, path, content });
    }
  }
  return entries;
}

function readSection(dir, sectionName) {
  const sectionDir = join(DOCS_DIR, dir);
  try {
    const entries = readMarkdownFiles(sectionDir, dir);
    return { title: sectionName, entries };
  } catch {
    return { title: sectionName, entries: [] };
  }
}

function readComponentSection(subdir, sectionTitle) {
  const dir = join(DOCS_DIR, 'components', subdir);
  try {
    const entries = readMarkdownFiles(dir, `components/${subdir}`);
    return { title: sectionTitle, entries };
  } catch {
    return { title: sectionTitle, entries: [] };
  }
}

// Build the tree
const overview = readMarkdownFiles(DOCS_DIR);
const guides = readMarkdownFiles(join(DOCS_DIR, 'guides'), 'guides');
const api = readMarkdownFiles(join(DOCS_DIR, 'api'), 'api');
const architecture = readMarkdownFiles(join(DOCS_DIR, 'architecture'), 'architecture');
const contributing = readMarkdownFiles(join(DOCS_DIR, 'contributing'), 'contributing');

// Component subcategories
const componentSubs = [
  ['form', 'Form Components'],
  ['data', 'Data Display'],
  ['feedback', 'Feedback'],
  ['nav', 'Navigation'],
  ['layout', 'Layout'],
  ['overlay', 'Overlay'],
  ['media', 'Media'],
  ['viz', 'Visualization'],
  ['page', 'Page Layouts'],
  ['errors', 'Error Pages'],
  ['ad', 'Advertising'],
  ['analytics', 'Analytics'],
  ['math', 'Math'],
];

let componentEntries = [];
// Add components README if exists
try {
  const readme = readFileSync(join(DOCS_DIR, 'components', 'README.md'), 'utf-8');
  const titleMatch = readme.match(/^#\s+(.+)/m);
  componentEntries.push({ title: titleMatch ? titleMatch[1].trim() : 'Components', path: 'components/README', content: readme });
} catch {}

for (const [sub, label] of componentSubs) {
  const dir = join(DOCS_DIR, 'components', sub);
  try {
    const entries = readMarkdownFiles(dir, `components/${sub}`);
    componentEntries = componentEntries.concat(entries);
  } catch {}
}

// Escape content for TypeScript string
function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function entryToTS(e) {
  return `    { title: ${JSON.stringify(e.title)}, path: ${JSON.stringify(e.path)}, content: ${JSON.stringify(e.content)} }`;
}

const sections = [
  { title: 'Overview', entries: overview },
  { title: 'Guides', entries: guides },
  { title: 'API Reference', entries: api },
  { title: 'Architecture', entries: architecture },
  { title: 'Components', entries: componentEntries },
  { title: 'Contributing', entries: contributing },
];

let out = `// Auto-generated from docs/ — do not edit manually
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

export interface DocEntry { title: string; path: string; content: string; }
export interface DocSection { title: string; children: DocEntry[]; }
export type DocTreeNode = DocSection;

export const docsTree: DocSection[] = [
`;

for (const section of sections) {
  out += `  { title: ${JSON.stringify(section.title)}, children: [\n`;
  for (const entry of section.entries) {
    out += entryToTS(entry) + ',\n';
  }
  out += `  ] },\n`;
}

out += `];

export const docsContent: Record<string, DocEntry> = {};
for (const section of docsTree) { for (const entry of section.children) { docsContent[entry.path] = entry; } }
`;

writeFileSync(OUTPUT, out, 'utf-8');
const totalEntries = sections.reduce((sum, s) => sum + s.entries.length, 0);
console.log(`Generated docs-data.ts: ${totalEntries} entries across ${sections.length} sections`);
