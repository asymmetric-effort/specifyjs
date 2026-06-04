// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from 'specifyjs';
import { useState, useEffect, useMemo, useCallback, useHead } from 'specifyjs/hooks';
import { useRouter } from 'specifyjs';
import { docsTree, docsContent } from '../docs-data';

// ─── Search Index ───────────────────────────────────────────────────────────

interface SearchResult {
  path: string;
  title: string;
  snippet: string;
  score: number;
}

function buildSearchIndex(): { path: string; title: string; words: string[]; content: string }[] {
  const index: { path: string; title: string; words: string[]; content: string }[] = [];
  for (const [path, entry] of Object.entries(docsContent)) {
    const text = entry.content
      .replace(/```[\s\S]*?```/g, '') // strip code blocks
      .replace(/[#*`\[\]()|\-_>]/g, ' ')
      .toLowerCase();
    const words = text.split(/\s+/).filter((w) => w.length > 2);
    index.push({ path, title: entry.title, words, content: text });
  }
  return index;
}

function searchDocs(query: string, index: ReturnType<typeof buildSearchIndex>): SearchResult[] {
  if (!query || query.length < 2) return [];
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];
  for (const entry of index) {
    let score = 0;
    const titleLower = entry.title.toLowerCase();
    for (const term of terms) {
      if (titleLower.includes(term)) score += 10;
      const wordMatches = entry.words.filter((w) => w.includes(term)).length;
      score += Math.min(wordMatches, 20);
    }
    if (score > 0) {
      // Extract snippet around first match
      let snippet = '';
      const firstTerm = terms[0];
      const idx = entry.content.indexOf(firstTerm);
      if (idx >= 0) {
        const start = Math.max(0, idx - 60);
        const end = Math.min(entry.content.length, idx + 120);
        snippet = (start > 0 ? '...' : '') + entry.content.slice(start, end).trim() + (end < entry.content.length ? '...' : '');
      }
      results.push({ path: entry.path, title: entry.title, snippet, score });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 15);
}

function SearchBar(props: { onSelect: (path: string) => void }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const index = useMemo(() => buildSearchIndex(), []);
  const results = useMemo(() => searchDocs(query, index), [query, index]);
  const showResults = focused && results.length > 0;

  return createElement(
    'div',
    { style: { position: 'relative' } },
    createElement('input', {
      type: 'text',
      value: query,
      placeholder: 'Search docs...',
      'aria-label': 'Search documentation',
      onInput: (e: Event) => setQuery((e.target as HTMLInputElement).value),
      onFocus: () => setFocused(true),
      onBlur: () => setTimeout(() => setFocused(false), 200),
      style: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '6px',
        fontSize: '13px',
        background: 'var(--color-bg, #fff)',
        color: 'var(--color-text, #0f172a)',
        outline: 'none',
        fontFamily: 'inherit',
      },
    }),
    showResults
      ? createElement(
          'div',
          {
            style: {
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: 'var(--color-bg, #fff)',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: '200',
              maxHeight: '400px',
              overflowY: 'auto',
              marginTop: '4px',
            },
          },
          ...results.map((r, i) =>
            createElement(
              'button',
              {
                key: `sr-${i}`,
                onClick: () => {
                  props.onSelect(r.path);
                  setQuery('');
                },
                style: {
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: i < results.length - 1 ? '1px solid var(--color-border, #f1f5f9)' : 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                },
              },
              createElement(
                'div',
                { style: { fontWeight: '600', color: 'var(--color-text, #1e293b)', marginBottom: '2px' } },
                r.title,
              ),
              createElement(
                'div',
                { style: { fontSize: '12px', color: 'var(--color-text-muted, #94a3b8)', lineHeight: '1.4' } },
                r.snippet,
              ),
            ),
          ),
        )
      : null,
  );
}

// ─── Markdown Renderer ───────────────────────────────────────────────────────

function renderMarkdown(md: string): ReturnType<typeof createElement>[] {
  const lines = md.split('\n');
  const elements: ReturnType<typeof createElement>[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        createElement('pre', {
          key: `pre-${elements.length}`,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            padding: '16px',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '13px',
            lineHeight: '1.6',
            margin: '16px 0',
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          },
        },
          createElement('code', {
            className: lang ? `language-${lang}` : undefined,
          }, codeLines.join('\n')),
        ),
      );
      continue;
    }

    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        const cells = lines[i].split('|').slice(1, -1).map(c => c.trim());
        // Skip separator rows (----)
        if (!cells.every(c => /^[-:]+$/.test(c))) {
          tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        const headerCells = tableRows[0];
        const bodyRows = tableRows.slice(1);
        elements.push(
          createElement('div', {
            key: `table-${elements.length}`,
            style: { overflowX: 'auto', margin: '16px 0' },
          },
            createElement('table', {
              style: {
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              },
            },
              createElement('thead', null,
                createElement('tr', null,
                  ...headerCells.map((cell, ci) =>
                    createElement('th', {
                      key: `th-${ci}`,
                      style: {
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderBottom: '2px solid #e2e8f0',
                        fontWeight: '600',
                        color: '#334155',
                        backgroundColor: '#f8fafc',
                        whiteSpace: 'nowrap',
                      },
                    }, renderInline(cell)),
                  ),
                ),
              ),
              createElement('tbody', null,
                ...bodyRows.map((row, ri) =>
                  createElement('tr', {
                    key: `tr-${ri}`,
                    style: {
                      backgroundColor: ri % 2 === 0 ? '#ffffff' : '#f8fafc',
                    },
                  },
                    ...row.map((cell, ci) =>
                      createElement('td', {
                        key: `td-${ci}`,
                        style: {
                          padding: '8px 12px',
                          borderBottom: '1px solid #e2e8f0',
                          color: '#475569',
                        },
                      }, renderInline(cell)),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const tag = `h${Math.min(level, 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const styles: Record<string, Record<string, string>> = {
        h1: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '32px 0 16px', paddingBottom: '8px', borderBottom: '2px solid #e2e8f0' },
        h2: { fontSize: '22px', fontWeight: '600', color: '#1e293b', margin: '28px 0 12px', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0' },
        h3: { fontSize: '18px', fontWeight: '600', color: '#334155', margin: '24px 0 8px' },
        h4: { fontSize: '16px', fontWeight: '600', color: '#475569', margin: '20px 0 8px' },
        h5: { fontSize: '14px', fontWeight: '600', color: '#475569', margin: '16px 0 4px' },
        h6: { fontSize: '13px', fontWeight: '600', color: '#64748b', margin: '12px 0 4px' },
      };
      elements.push(
        createElement(tag, {
          key: `h-${elements.length}`,
          style: styles[tag] || styles.h6,
        }, renderInline(text)),
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        bqLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        createElement('blockquote', {
          key: `bq-${elements.length}`,
          style: {
            borderLeft: '4px solid #6366f1',
            padding: '12px 16px',
            margin: '16px 0',
            backgroundColor: '#f0f0ff',
            borderRadius: '0 6px 6px 0',
            color: '#475569',
            fontSize: '14px',
            lineHeight: '1.6',
          },
        }, ...renderMarkdown(bqLines.join('\n'))),
      );
      continue;
    }

    // Unordered list
    if (/^(\s*)[-*]\s/.test(line)) {
      const listItems: { text: string; indent: number }[] = [];
      while (i < lines.length && /^(\s*)[-*]\s/.test(lines[i])) {
        const m = lines[i].match(/^(\s*)[-*]\s(.+)/);
        if (m) {
          listItems.push({ text: m[2], indent: m[1].length });
        }
        i++;
      }
      elements.push(
        createElement('ul', {
          key: `ul-${elements.length}`,
          style: {
            paddingLeft: '24px',
            margin: '12px 0',
            listStyleType: 'disc',
            lineHeight: '1.7',
            color: '#475569',
          },
        },
          ...listItems.map((item, li) =>
            createElement('li', {
              key: `li-${li}`,
              style: {
                padding: '2px 0',
                marginLeft: item.indent > 0 ? `${item.indent * 8}px` : '0',
              },
            }, renderInline(item.text)),
          ),
        ),
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const m = lines[i].match(/^\d+\.\s(.+)/);
        if (m) listItems.push(m[1]);
        i++;
      }
      elements.push(
        createElement('ol', {
          key: `ol-${elements.length}`,
          style: {
            paddingLeft: '24px',
            margin: '12px 0',
            lineHeight: '1.7',
            color: '#475569',
          },
        },
          ...listItems.map((item, li) =>
            createElement('li', {
              key: `li-${li}`,
              style: { padding: '2px 0' },
            }, renderInline(item)),
          ),
        ),
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(
        createElement('hr', {
          key: `hr-${elements.length}`,
          style: {
            border: 'none',
            borderTop: '1px solid #e2e8f0',
            margin: '24px 0',
          },
        }),
      );
      i++;
      continue;
    }

    // Paragraph - collect consecutive non-special lines
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !lines[i].startsWith('```') && !lines[i].startsWith('>') && !/^[-*]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i]) && !(lines[i].includes('|') && lines[i].trim().startsWith('|')) && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(
        createElement('p', {
          key: `p-${elements.length}`,
          style: {
            margin: '12px 0',
            lineHeight: '1.7',
            color: '#475569',
            fontSize: '15px',
          },
        }, renderInline(paraLines.join(' '))),
      );
    }
  }

  return elements;
}

// ─── Inline Markdown ─────────────────────────────────────────────────────────

function renderInline(text: string): ReturnType<typeof createElement> {
  // Process inline markdown: bold, italic, code, links
  const parts: (string | ReturnType<typeof createElement>)[] = [];
  let remaining = text;
  let keyCounter = 0;

  while (remaining.length > 0) {
    // Inline code
    let match = remaining.match(/^(.*?)`([^`]+)`/);
    if (match) {
      if (match[1]) parts.push(match[1]);
      parts.push(
        createElement('code', {
          key: `ic-${keyCounter++}`,
          style: {
            background: '#f1f5f9',
            color: '#e11d48',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.9em',
            fontFamily: "'Fira Code', Consolas, monospace",
          },
        }, match[2]),
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Bold
    match = remaining.match(/^(.*?)\*\*(.+?)\*\*/);
    if (match) {
      if (match[1]) parts.push(match[1]);
      parts.push(
        createElement('strong', { key: `b-${keyCounter++}` }, match[2]),
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Italic
    match = remaining.match(/^(.*?)\*(.+?)\*/);
    if (match) {
      if (match[1]) parts.push(match[1]);
      parts.push(
        createElement('em', { key: `i-${keyCounter++}` }, match[2]),
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Link [text](url)
    match = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      if (match[1]) parts.push(match[1]);
      const linkUrl = match[3];
      const isExternal = linkUrl.startsWith('http') || linkUrl.startsWith('//');
      // Convert relative doc links to hash routes:
      // "../guides/getting-started.md" → "#/docs/guides/getting-started"
      // "guides/getting-started.md" → "#/docs/guides/getting-started"
      // "hooks.md" → "#/docs/api/hooks" (resolved relative to current context)
      let resolvedHref = linkUrl;
      if (!isExternal && !linkUrl.startsWith('#')) {
        // Strip .md extension and normalize relative paths
        let cleanPath = linkUrl.replace(/\.md$/, '');
        // Remove leading ../ segments (docs links are relative within docs/)
        cleanPath = cleanPath.replace(/^(\.\.\/)+/, '');
        // Remove leading ./ segments
        cleanPath = cleanPath.replace(/^\.\//, '');
        resolvedHref = `#/docs/${cleanPath}`;
      }
      parts.push(
        createElement('a', {
          key: `a-${keyCounter++}`,
          href: resolvedHref,
          style: {
            color: '#3b82f6',
            textDecoration: 'none',
            borderBottom: '1px solid transparent',
          },
          target: isExternal ? '_blank' : undefined,
          rel: isExternal ? 'noopener noreferrer' : undefined,
        }, match[2]),
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // No more matches, push the rest
    parts.push(remaining);
    break;
  }

  if (parts.length === 1 && typeof parts[0] === 'string') {
    return createElement('span', null, parts[0]);
  }
  return createElement('span', null, ...parts);
}

// ─── Sidebar Tree ────────────────────────────────────────────────────────────

function SidebarSection(props: {
  section: { title: string; children: { title: string; path: string }[] };
  activePath: string;
  onSelect: (path: string) => void;
}) {
  const { section, activePath, onSelect } = props;
  const hasActiveChild = section.children.some((c) => c.path === activePath);
  const [expanded, setExpanded] = useState(hasActiveChild);

  return createElement(
    'div',
    { style: { margin: '4px 0' } },
    createElement(
      'button',
      {
        onClick: () => setExpanded(!expanded),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
          textAlign: 'left',
          padding: '8px 12px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          color: hasActiveChild ? 'var(--color-text, #1e293b)' : 'var(--color-text-muted, #64748b)',
          backgroundColor: 'transparent',
          fontFamily: 'inherit',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
      createElement(
        'span',
        {
          style: {
            display: 'inline-block',
            fontSize: '10px',
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          },
        },
        '\u25B6',
      ),
      section.title,
    ),
    expanded
      ? createElement(
          'div',
          null,
          ...section.children.map((entry, ci) => {
            const isActive = activePath === entry.path;
            return createElement('button', {
              key: `${entry.path}-${ci}`,
              onClick: () => onSelect(entry.path),
              style: {
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '6px 12px 6px 28px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#3b82f6' : 'var(--color-text-muted, #475569)',
                backgroundColor: isActive ? 'var(--color-bg-muted, #eff6ff)' : 'transparent',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }, entry.title);
          }),
        )
      : null,
  );
}

// ─── Docs Viewer Component ───────────────────────────────────────────────────

export function DocsViewer() {
  const { pathname, navigate } = useRouter();

  // Extract the doc path from the route, e.g., /docs/api/hooks -> api/hooks
  const docPath = pathname.replace(/^\/docs\/?/, '') || 'README';

  const [activePath, setActivePath] = useState(docPath);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync activePath with URL
  useEffect(() => {
    setActivePath(docPath);
  }, [docPath]);

  const activeDoc = docsContent[activePath];

  useHead({
    title: activeDoc ? `${activeDoc.title} -- SpecifyJS Docs` : 'Documentation -- SpecifyJS',
    description: 'SpecifyJS documentation: guides, API reference, architecture, and component library.',
    keywords: 'specifyjs, documentation, api, guides, components',
    author: 'Asymmetric Effort, LLC',
  });

  const handleSelect = (path: string) => {
    navigate(`/docs/${path}`);
    setSidebarOpen(false);
  };

  return createElement('div', {
    style: {
      display: 'flex',
      height: '100%',
      minHeight: '70vh',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
  },
    // Mobile sidebar toggle
    createElement('button', {
      onClick: () => setSidebarOpen(!sidebarOpen),
      style: {
        display: 'none',
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: '100',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
      },
      className: 'docs-sidebar-toggle',
    }, sidebarOpen ? '\u2715' : '\u2630'),

    // Sidebar
    createElement('nav', {
      style: {
        width: '280px',
        minWidth: '280px',
        borderRight: '1px solid #e2e8f0',
        backgroundColor: '#fafbfc',
        overflowY: 'auto',
        padding: '16px 8px',
        maxHeight: '75vh',
      },
      className: `docs-sidebar${sidebarOpen ? ' docs-sidebar--open' : ''}`,
    },
      createElement('div', {
        style: {
          padding: '4px 12px 16px',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          marginBottom: '8px',
        },
      },
        createElement('div', {
          style: {
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--color-text, #0f172a)',
            marginBottom: '8px',
          },
        }, 'Documentation'),
        createElement(SearchBar, { onSelect: handleSelect }),
        createElement('div', {
          style: {
            fontSize: '12px',
            color: 'var(--color-text-muted, #94a3b8)',
            marginTop: '6px',
          },
        }, `${Object.keys(docsContent).length} documents`),
      ),

      // Tree
      ...docsTree.map((section, i) =>
        createElement(SidebarSection, {
          key: `section-${i}`,
          section,
          activePath,
          onSelect: handleSelect,
        }),
      ),
    ),

    // Main content
    createElement('main', {
      style: {
        flex: '1',
        overflowY: 'auto',
        padding: '24px 40px',
        maxWidth: '960px',
        maxHeight: '75vh',
      },
    },
      activeDoc
        ? createElement('article', {
            style: {
              maxWidth: '780px',
            },
          },
            // Breadcrumb
            createElement('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#94a3b8',
                marginBottom: '16px',
              },
            },
              createElement('button', {
                onClick: () => handleSelect('README'),
                style: {
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#3b82f6',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  padding: '0',
                },
              }, 'Docs'),
              ...activePath.split('/').map((segment, si, arr) => {
                const isLast = si === arr.length - 1;
                return createElement('span', { key: `bc-${si}` },
                  createElement('span', { style: { margin: '0 4px' } }, '/'),
                  isLast
                    ? createElement('span', { style: { color: '#475569' } }, segment)
                    : createElement('span', { style: { color: '#94a3b8' } }, segment),
                );
              }),
            ),
            // Rendered content
            ...renderMarkdown(activeDoc.content),
          )
        : createElement('div', {
            style: {
              textAlign: 'center',
              padding: '48px',
              color: '#94a3b8',
            },
          },
            createElement('h2', { style: { color: '#64748b', marginBottom: '12px' } }, 'Document Not Found'),
            createElement('p', null, `No document found at path: ${activePath}`),
            createElement('button', {
              onClick: () => handleSelect('README'),
              style: {
                marginTop: '16px',
                padding: '8px 20px',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
              },
            }, 'Go to Documentation Home'),
          ),
    ),
  );
}
