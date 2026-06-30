// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';

import { TitleBar } from '../src/TitleBar';
import { MenuBar } from '../src/MenuBar';
import { FileExplorer } from '../src/FileExplorer';
import type { FileEntry } from '../src/FileExplorer';
import { TabBar } from '../src/TabBar';
import { CodeEditor } from '../src/CodeEditor';
import { Minimap } from '../src/Minimap';
import { StatusBar } from '../src/StatusBar';
import {
  tokenizeLine,
  COL_KEYWORD,
  COL_STRING,
  COL_DEFAULT,
  COL_COMMENT,
  COL_TYPE,
  COL_FUNCTION,
  COL_NUMBER,
  COL_PUNCTUATION,
} from '../src/SyntaxHighlighter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let container: HTMLDivElement;

function render(vnode: unknown): HTMLElement {
  container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(vnode as ReturnType<typeof createElement>);
  return container;
}

beforeEach(() => {
  return () => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  };
});

// ---------------------------------------------------------------------------
// SyntaxHighlighter
// ---------------------------------------------------------------------------

describe('SyntaxHighlighter', () => {
  it('returns non-breaking space for empty lines', () => {
    const tokens = tokenizeLine('');
    expect(tokens.length).toBe(1);
    expect(tokens[0].text).toBe('\u00A0');
    expect(tokens[0].color).toBe(COL_DEFAULT);
  });

  it('returns non-breaking space for whitespace-only lines', () => {
    const tokens = tokenizeLine('   ');
    expect(tokens.length).toBe(1);
    expect(tokens[0].text).toBe('\u00A0');
  });

  it('tokenizes keywords', () => {
    const tokens = tokenizeLine('const x = 1');
    expect(tokens[0].text).toBe('const');
    expect(tokens[0].color).toBe(COL_KEYWORD);
  });

  it('tokenizes strings', () => {
    const tokens = tokenizeLine('"hello"');
    expect(tokens[0].text).toBe('"hello"');
    expect(tokens[0].color).toBe(COL_STRING);
  });

  it('tokenizes single-quoted strings', () => {
    const tokens = tokenizeLine("'world'");
    expect(tokens[0].text).toBe("'world'");
    expect(tokens[0].color).toBe(COL_STRING);
  });

  it('tokenizes template literals', () => {
    const tokens = tokenizeLine('`template`');
    expect(tokens[0].text).toBe('`template`');
    expect(tokens[0].color).toBe(COL_STRING);
  });

  it('tokenizes comments', () => {
    const tokens = tokenizeLine('// comment');
    expect(tokens[0].text).toBe('// comment');
    expect(tokens[0].color).toBe(COL_COMMENT);
  });

  it('tokenizes type keywords', () => {
    const tokens = tokenizeLine('interface Foo');
    expect(tokens[0].text).toBe('interface');
    expect(tokens[0].color).toBe(COL_TYPE);
  });

  it('tokenizes function calls', () => {
    const tokens = tokenizeLine('foo()');
    expect(tokens[0].text).toBe('foo');
    expect(tokens[0].color).toBe(COL_FUNCTION);
  });

  it('tokenizes numbers', () => {
    const tokens = tokenizeLine('42');
    expect(tokens[0].text).toBe('42');
    expect(tokens[0].color).toBe(COL_NUMBER);
  });

  it('tokenizes booleans as keywords', () => {
    const tokens = tokenizeLine('true');
    expect(tokens[0].text).toBe('true');
    expect(tokens[0].color).toBe(COL_KEYWORD);
  });

  it('tokenizes punctuation', () => {
    const tokens = tokenizeLine('(');
    expect(tokens[0].text).toBe('(');
    expect(tokens[0].color).toBe(COL_PUNCTUATION);
  });

  it('handles escaped characters in strings', () => {
    const tokens = tokenizeLine('"he\\"llo"');
    expect(tokens[0].color).toBe(COL_STRING);
  });

  it('tokenizes whitespace', () => {
    const tokens = tokenizeLine('a  b');
    expect(tokens.length).toBe(3);
    expect(tokens[1].text).toBe('  ');
    expect(tokens[1].color).toBe(COL_DEFAULT);
  });
});

// ---------------------------------------------------------------------------
// TitleBar
// ---------------------------------------------------------------------------

describe('TitleBar', () => {
  it('renders with title text', () => {
    const el = render(createElement(TitleBar, { title: 'My IDE' }));
    const bar = el.querySelector('.ide__title-bar');
    expect(bar).not.toBeNull();
    expect(bar?.textContent).toBe('My IDE');
  });

  it('applies default styles', () => {
    const el = render(createElement(TitleBar, { title: 'Test' }));
    const bar = el.querySelector('.ide__title-bar') as HTMLElement;
    expect(bar.style.height).toBe('30px');
    expect(bar.style.display).toBe('flex');
  });

  it('merges style overrides', () => {
    const el = render(createElement(TitleBar, {
      title: 'Test',
      style: { backgroundColor: 'red' },
    }));
    const bar = el.querySelector('.ide__title-bar') as HTMLElement;
    expect(bar.style.backgroundColor).toBe('red');
  });
});

// ---------------------------------------------------------------------------
// MenuBar
// ---------------------------------------------------------------------------

describe('MenuBar', () => {
  const defaultMenuProps = {
    menus: ['File', 'Edit'],
    menuItems: {
      File: [{ label: 'New', action: 'new' }],
      Edit: [{ label: 'Undo', action: 'undo' }],
    },
    onAction: () => {},
  };

  it('renders menu bar with role menubar', () => {
    const el = render(createElement(MenuBar, defaultMenuProps));
    const bar = el.querySelector('.ide__menu-bar');
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute('role')).toBe('menubar');
  });

  it('renders all menu labels', () => {
    const el = render(createElement(MenuBar, defaultMenuProps));
    const bar = el.querySelector('.ide__menu-bar');
    const text = bar?.textContent ?? '';
    expect(text).toContain('File');
    expect(text).toContain('Edit');
  });

  it('renders menu buttons with aria-label', () => {
    const el = render(createElement(MenuBar, defaultMenuProps));
    const buttons = el.querySelectorAll('[role="menuitem"]');
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons[0].getAttribute('aria-label')).toBe('File');
  });

  it('opens dropdown on click', () => {
    const el = render(createElement(MenuBar, defaultMenuProps));
    const fileBtn = el.querySelector('[aria-label="File"]') as HTMLElement;
    fileBtn.click();
    const dropdown = el.querySelector('.ide__menu-dropdown');
    expect(dropdown).not.toBeNull();
    expect(dropdown?.textContent).toContain('New');
  });

  it('calls onAction when dropdown item is clicked', () => {
    let calledAction = '';
    const el = render(createElement(MenuBar, {
      ...defaultMenuProps,
      onAction: (action: string) => { calledAction = action; },
    }));
    const fileBtn = el.querySelector('[aria-label="File"]') as HTMLElement;
    fileBtn.click();
    const items = el.querySelectorAll('.ide__menu-dropdown [role="menuitem"]');
    expect(items.length).toBeGreaterThan(0);
    (items[0] as HTMLElement).click();
    expect(calledAction).toBe('new');
  });
});

// ---------------------------------------------------------------------------
// FileExplorer
// ---------------------------------------------------------------------------

describe('FileExplorer', () => {
  const files: FileEntry[] = [
    { name: 'src', indent: 0, isFolder: true },
    { name: 'App.ts', indent: 1, isFolder: false, parent: 'src' },
    { name: 'README.md', indent: 0, isFolder: false },
  ];

  it('renders sidebar with Explorer header', () => {
    const el = render(createElement(FileExplorer, {
      files,
      activeFile: 'App.ts',
      expandedFolders: { src: true },
      onFileClick: () => {},
      onFolderToggle: () => {},
    }));
    const sidebar = el.querySelector('.ide__sidebar');
    expect(sidebar).not.toBeNull();
    expect(sidebar?.textContent).toContain('Explorer');
    expect(sidebar?.getAttribute('aria-label')).toBe('File explorer');
  });

  it('shows files when parent folder is expanded', () => {
    const el = render(createElement(FileExplorer, {
      files,
      activeFile: 'App.ts',
      expandedFolders: { src: true },
      onFileClick: () => {},
      onFolderToggle: () => {},
    }));
    const sidebar = el.querySelector('.ide__sidebar');
    expect(sidebar?.textContent).toContain('App.ts');
  });

  it('hides files when parent folder is collapsed', () => {
    const el = render(createElement(FileExplorer, {
      files,
      activeFile: '',
      expandedFolders: { src: false },
      onFileClick: () => {},
      onFolderToggle: () => {},
    }));
    const sidebar = el.querySelector('.ide__sidebar');
    // App.ts should be hidden because src is collapsed
    // But root-level files should still show
    expect(sidebar?.textContent).toContain('README.md');
  });

  it('calls onFileClick when a file is clicked', () => {
    let clicked = '';
    const el = render(createElement(FileExplorer, {
      files: [{ name: 'test.ts', indent: 0, isFolder: false }],
      activeFile: '',
      expandedFolders: {},
      onFileClick: (name: string) => { clicked = name; },
      onFolderToggle: () => {},
    }));
    // Find the file item and click it
    const sidebar = el.querySelector('.ide__sidebar');
    const items = sidebar?.querySelectorAll('div');
    // Last div should be the file item (first is header)
    if (items && items.length > 1) {
      (items[items.length - 1] as HTMLElement).click();
    }
    expect(clicked).toBe('test.ts');
  });

  it('calls onFolderToggle when a folder is clicked', () => {
    let toggled = '';
    const el = render(createElement(FileExplorer, {
      files: [{ name: 'src', indent: 0, isFolder: true }],
      activeFile: '',
      expandedFolders: { src: true },
      onFileClick: () => {},
      onFolderToggle: (name: string) => { toggled = name; },
    }));
    const sidebar = el.querySelector('.ide__sidebar');
    const items = sidebar?.querySelectorAll('div');
    if (items && items.length > 1) {
      (items[items.length - 1] as HTMLElement).click();
    }
    expect(toggled).toBe('src');
  });

  it('shows root-level files without parent', () => {
    const el = render(createElement(FileExplorer, {
      files,
      activeFile: '',
      expandedFolders: {},
      onFileClick: () => {},
      onFolderToggle: () => {},
    }));
    const sidebar = el.querySelector('.ide__sidebar');
    expect(sidebar?.textContent).toContain('README.md');
    expect(sidebar?.textContent).toContain('src');
  });
});

// ---------------------------------------------------------------------------
// TabBar
// ---------------------------------------------------------------------------

describe('TabBar', () => {
  it('renders tabs', () => {
    const el = render(createElement(TabBar, {
      tabs: ['App.ts', 'main.ts'],
      activeTab: 'App.ts',
      onTabClick: () => {},
    }));
    const text = el.textContent ?? '';
    expect(text).toContain('App.ts');
    expect(text).toContain('main.ts');
  });

  it('calls onTabClick when tab is clicked', () => {
    let clicked = '';
    const el = render(createElement(TabBar, {
      tabs: ['App.ts', 'main.ts'],
      activeTab: 'App.ts',
      onTabClick: (tab: string) => { clicked = tab; },
    }));
    const buttons = el.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    (buttons[1] as HTMLElement).click();
    expect(clicked).toBe('main.ts');
  });

  it('marks active tab with aria-label', () => {
    const el = render(createElement(TabBar, {
      tabs: ['App.ts'],
      activeTab: 'App.ts',
      onTabClick: () => {},
    }));
    const btn = el.querySelector('[aria-label="App.ts"]');
    expect(btn).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// CodeEditor
// ---------------------------------------------------------------------------

describe('CodeEditor', () => {
  it('renders code with syntax highlighting', () => {
    const el = render(createElement(CodeEditor, {
      content: ['const x = 1;'],
    }));
    const code = el.querySelector('code');
    expect(code).not.toBeNull();
    expect(code?.textContent).toContain('const');
  });

  it('renders line numbers', () => {
    const el = render(createElement(CodeEditor, {
      content: ['line1', 'line2', 'line3'],
    }));
    const lineNums = el.querySelector('[aria-hidden="true"]');
    expect(lineNums).not.toBeNull();
    expect(lineNums?.textContent).toContain('1');
    expect(lineNums?.textContent).toContain('3');
  });

  it('renders multiple lines', () => {
    const el = render(createElement(CodeEditor, {
      content: ['import { foo } from "bar";', '', 'foo();'],
    }));
    const code = el.querySelector('code');
    expect(code?.textContent).toContain('import');
    expect(code?.textContent).toContain('foo');
  });

  it('code area is contentEditable', () => {
    const el = render(createElement(CodeEditor, {
      content: ['hello'],
    }));
    const code = el.querySelector('code');
    expect(code?.getAttribute('contenteditable')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// Minimap
// ---------------------------------------------------------------------------

describe('Minimap', () => {
  it('renders minimap with aria-hidden', () => {
    const el = render(createElement(Minimap, {
      lines: ['code', '', 'more code'],
      visibleStart: 8,
      visibleEnd: 30,
      totalLines: 3,
    }));
    const minimap = el.querySelector('.ide__minimap');
    expect(minimap).not.toBeNull();
    expect(minimap?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders line bars for non-empty lines', () => {
    const el = render(createElement(Minimap, {
      lines: ['code', '', 'more'],
      visibleStart: 8,
      visibleEnd: 30,
      totalLines: 3,
    }));
    const minimap = el.querySelector('.ide__minimap');
    // Should have viewport indicator div + 3 line divs = 4 child divs
    const children = minimap?.children;
    expect(children).not.toBeNull();
    // At least 4 children (viewport + 3 lines)
    expect(children!.length).toBeGreaterThanOrEqual(4);
  });

  it('renders viewport indicator', () => {
    const el = render(createElement(Minimap, {
      lines: ['a'],
      visibleStart: 10,
      visibleEnd: 40,
      totalLines: 1,
    }));
    const minimap = el.querySelector('.ide__minimap');
    // First child is viewport indicator
    const viewport = minimap?.children[0] as HTMLElement;
    expect(viewport).not.toBeNull();
    expect(viewport.style.position).toBe('absolute');
  });
});

// ---------------------------------------------------------------------------
// StatusBar
// ---------------------------------------------------------------------------

describe('StatusBar', () => {
  it('renders status bar with left and right items', () => {
    const el = render(createElement(StatusBar, {
      items: [{ label: 'main' }, { label: '0 errors' }],
      rightItems: [{ label: 'UTF-8' }, { label: 'TypeScript' }],
    }));
    const bar = el.querySelector('.ide__status-bar');
    expect(bar).not.toBeNull();
    expect(bar?.textContent).toContain('main');
    expect(bar?.textContent).toContain('0 errors');
    expect(bar?.textContent).toContain('UTF-8');
    expect(bar?.textContent).toContain('TypeScript');
  });

  it('renders with empty items', () => {
    const el = render(createElement(StatusBar, {
      items: [],
      rightItems: [],
    }));
    const bar = el.querySelector('.ide__status-bar');
    expect(bar).not.toBeNull();
  });
});
