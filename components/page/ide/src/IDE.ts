// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * IDE -- Full-screen layout resembling a programmer's IDE (VS Code style).
 *
 * Features a title bar, menu bar with working dropdowns, left sidebar file
 * explorer with expandable/collapsible folders, main editor area with
 * contentEditable editing, dynamic line numbers, a right minimap strip,
 * and a status bar.
 */

import { createElement } from 'specifyjs';
import { useState, useMemo, useCallback, useRef } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IDEProps {
  /** Extra class name */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MENUS = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'];

const MENU_ITEMS: Record<string, Array<{ label: string; action: string }>> = {
  File: [
    { label: 'New File', action: 'newFile' },
    { label: 'Open', action: 'open' },
    { label: 'Save', action: 'save' },
    { label: 'Save As', action: 'saveAs' },
  ],
  Edit: [
    { label: 'Undo', action: 'undo' },
    { label: 'Redo', action: 'redo' },
    { label: 'Cut', action: 'cut' },
    { label: 'Copy', action: 'copy' },
    { label: 'Paste', action: 'paste' },
  ],
  View: [
    { label: 'Command Palette', action: 'commandPalette' },
    { label: 'Explorer', action: 'explorer' },
    { label: 'Search', action: 'search' },
  ],
};

interface FileEntry {
  name: string;
  indent: number;
  isFolder: boolean;
  parent?: string;
}

const FILE_TREE: Array<FileEntry> = [
  { name: 'src', indent: 0, isFolder: true },
  { name: 'components', indent: 1, isFolder: true, parent: 'src' },
  { name: 'App.ts', indent: 2, isFolder: false, parent: 'components' },
  { name: 'Header.ts', indent: 2, isFolder: false, parent: 'components' },
  { name: 'hooks', indent: 1, isFolder: true, parent: 'src' },
  { name: 'useAuth.ts', indent: 2, isFolder: false, parent: 'hooks' },
  { name: 'index.ts', indent: 1, isFolder: false, parent: 'src' },
  { name: 'main.ts', indent: 1, isFolder: false, parent: 'src' },
  { name: 'types.ts', indent: 1, isFolder: false, parent: 'src' },
  { name: 'package.json', indent: 0, isFolder: false },
  { name: 'tsconfig.json', indent: 0, isFolder: false },
];

const FILE_CONTENTS: Record<string, Array<string>> = {
  'App.ts': [
    'import { createElement, useState } from "specifyjs";',
    '',
    'interface AppProps {',
    '  title: string;',
    '  version?: number;',
    '}',
    '',
    'export function App(props: AppProps) {',
    '  const [count, setCount] = useState(0);',
    '',
    '  const increment = () => {',
    '    setCount((prev: number) => prev + 1);',
    '  };',
    '',
    '  return createElement(',
    '    "div",',
    '    { className: "app" },',
    '    createElement("h1", null, props.title),',
    '    createElement("p", null, `Count: ${count}`),',
    '    createElement(',
    '      "button",',
    '      { onClick: increment },',
    '      "Increment",',
    '    ),',
    '  );',
    '}',
  ],
  'Header.ts': [
    'import { createElement } from "specifyjs";',
    '',
    'interface HeaderProps {',
    '  title: string;',
    '  subtitle?: string;',
    '}',
    '',
    'export function Header(props: HeaderProps) {',
    '  return createElement(',
    '    "header",',
    '    { className: "header" },',
    '    createElement("h1", null, props.title),',
    '    props.subtitle',
    '      ? createElement("p", null, props.subtitle)',
    '      : null,',
    '  );',
    '}',
  ],
  'useAuth.ts': [
    'import { useState, useCallback } from "specifyjs";',
    '',
    'interface AuthState {',
    '  user: string | null;',
    '  isLoggedIn: boolean;',
    '}',
    '',
    'export function useAuth() {',
    '  const [auth, setAuth] = useState<AuthState>({',
    '    user: null,',
    '    isLoggedIn: false,',
    '  });',
    '',
    '  const login = useCallback((username: string) => {',
    '    setAuth({ user: username, isLoggedIn: true });',
    '  }, []);',
    '',
    '  const logout = useCallback(() => {',
    '    setAuth({ user: null, isLoggedIn: false });',
    '  }, []);',
    '',
    '  return { ...auth, login, logout };',
    '}',
  ],
  'index.ts': [
    'export { App } from "./components/App";',
    'export { Header } from "./components/Header";',
    'export { useAuth } from "./hooks/useAuth";',
  ],
  'main.ts': [
    'import { createElement, createRoot } from "specifyjs";',
    'import { App } from "./components/App";',
    '',
    'const root = createRoot(',
    '  document.getElementById("root")!',
    ');',
    '',
    'root.render(',
    '  createElement(App, {',
    '    title: "My SpecifyJS App",',
    '    version: 1,',
    '  }),',
    ');',
  ],
  'types.ts': [
    'export interface User {',
    '  id: string;',
    '  name: string;',
    '  email: string;',
    '  role: "admin" | "user" | "guest";',
    '}',
    '',
    'export interface Config {',
    '  apiUrl: string;',
    '  debug: boolean;',
    '  maxRetries: number;',
    '}',
    '',
    'export type EventHandler<T = void> = (event: T) => void;',
  ],
  'package.json': [
    '{',
    '  "name": "specifyjs-app",',
    '  "version": "1.0.0",',
    '  "scripts": {',
    '    "dev": "vite",',
    '    "build": "tsc && vite build",',
    '    "preview": "vite preview"',
    '  }',
    '}',
  ],
  'tsconfig.json': [
    '{',
    '  "compilerOptions": {',
    '    "target": "ES2020",',
    '    "module": "ESNext",',
    '    "strict": true,',
    '    "jsx": "preserve"',
    '  },',
    '  "include": ["src"]',
    '}',
  ],
};

// Use App.ts as the default sample code (same as original SAMPLE_CODE)
const SAMPLE_CODE = FILE_CONTENTS['App.ts'];

// ---------------------------------------------------------------------------
// Syntax Highlighting
// ---------------------------------------------------------------------------

interface Token {
  text: string;
  color: string;
}

const KEYWORDS = new Set([
  'import', 'export', 'from', 'const', 'let', 'var', 'function', 'return',
  'if', 'else', 'for', 'while', 'class', 'new', 'throw', 'try', 'catch',
  'finally', 'typeof', 'instanceof', 'in', 'of', 'default', 'switch', 'case',
  'break', 'continue', 'do', 'void', 'delete', 'yield', 'async', 'await',
]);

const TYPES = new Set([
  'string', 'number', 'boolean', 'void', 'null', 'undefined', 'any', 'never',
  'unknown', 'object', 'interface', 'type', 'enum',
]);

const COL_KEYWORD = '#569cd6';
const COL_STRING = '#ce9178';
const COL_TYPE = '#4ec9b0';
const COL_COMMENT = '#6a9955';
const COL_FUNCTION = '#dcdcaa';
const COL_DEFAULT = '#d4d4d4';
const COL_PUNCTUATION = '#d4d4d4';
const COL_NUMBER = '#b5cea8';

function tokenizeLine(line: string): Array<Token> {
  if (!line.trim()) return [{ text: '\u00A0', color: COL_DEFAULT }];

  const tokens: Array<Token> = [];
  let i = 0;

  while (i < line.length) {
    // Comments
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), color: COL_COMMENT });
      break;
    }

    // Strings (double or single quoted)
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++; // skip escaped
        j++;
      }
      j = Math.min(j + 1, line.length);
      tokens.push({ text: line.slice(i, j), color: COL_STRING });
      i = j;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(line[i]) && (i === 0 || /[\s(,=:[\]{}+\-*/]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: COL_NUMBER });
      i = j;
      continue;
    }

    // Identifiers / keywords
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);

      // Check if followed by '(' to detect function calls
      let nextNonSpace = j;
      while (nextNonSpace < line.length && line[nextNonSpace] === ' ') nextNonSpace++;
      const isCall = nextNonSpace < line.length && line[nextNonSpace] === '(';

      let color = COL_DEFAULT;
      if (KEYWORDS.has(word)) {
        color = COL_KEYWORD;
      } else if (TYPES.has(word)) {
        color = COL_TYPE;
      } else if (isCall) {
        color = COL_FUNCTION;
      } else if (word === 'true' || word === 'false') {
        color = COL_KEYWORD;
      }
      tokens.push({ text: word, color });
      i = j;
      continue;
    }

    // Whitespace
    if (line[i] === ' ' || line[i] === '\t') {
      let j = i;
      while (j < line.length && (line[j] === ' ' || line[j] === '\t')) j++;
      tokens.push({ text: line.slice(i, j), color: COL_DEFAULT });
      i = j;
      continue;
    }

    // Punctuation / operators
    tokens.push({ text: line[i], color: COL_PUNCTUATION });
    i++;
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IDE(props: IDEProps) {
  const [activeFile, setActiveFile] = useState<string>('App.ts');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    components: true,
    hooks: true,
  });
  const [activeMenu, setActiveMenu] = useState<number>(-1);
  const [lineCount, setLineCount] = useState<number>(SAMPLE_CODE.length);

  const editorRef = useRef<HTMLElement | null>(null);

  const handleFileClick = useCallback((fileName: string) => {
    setActiveFile(fileName);
    const content = FILE_CONTENTS[fileName];
    if (content) {
      setLineCount(content.length);
    }
  }, []);

  const handleFolderToggle = useCallback((folderName: string) => {
    setExpandedFolders((prev: Record<string, boolean>) => {
      const next: Record<string, boolean> = {};
      const keys = Object.keys(prev);
      for (let i = 0; i < keys.length; i++) {
        next[keys[i]] = prev[keys[i]];
      }
      next[folderName] = !prev[folderName];
      return next;
    });
  }, []);

  const handleMenuClick = useCallback((index: number) => {
    setActiveMenu((prev: number) => prev === index ? -1 : index);
  }, []);

  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'undo':
        document.execCommand('undo', false);
        break;
      case 'redo':
        document.execCommand('redo', false);
        break;
      case 'cut':
        document.execCommand('cut', false);
        break;
      case 'copy':
        document.execCommand('copy', false);
        break;
      case 'paste':
        document.execCommand('paste', false);
        break;
      case 'newFile':
        // Clear editor
        if (editorRef.current) {
          editorRef.current.textContent = '';
          setLineCount(1);
        }
        break;
      default:
        break;
    }
    setActiveMenu(-1);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.textContent ?? '';
      const lines = text.split('\n');
      setLineCount(Math.max(lines.length, 1));
    }
  }, []);

  const containerStyle = useMemo<Record<string, string>>(() => ({
    width: '100%',
    height: '100%',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
    fontSize: '13px',
    color: '#cccccc',
    backgroundColor: '#1e1e1e',
    overflow: 'hidden',
  }), []);

  const titleBarStyle: Record<string, string> = {
    height: '30px',
    backgroundColor: '#323233',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#999',
    flexShrink: '0',
    borderBottom: '1px solid var(--color-border, #252526)',
  };

  const menuBarStyle: Record<string, string> = {
    height: '28px',
    backgroundColor: '#3c3c3c',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    gap: '2px',
    flexShrink: '0',
    position: 'relative',
  };

  const menuItemStyleBase: Record<string, string> = {
    padding: '3px 8px',
    fontSize: '12px',
    color: '#cccccc',
    cursor: 'pointer',
    borderRadius: '3px',
    backgroundColor: 'transparent',
    border: 'none',
    position: 'relative',
  };

  const menuItemStyleActive: Record<string, string> = {
    ...menuItemStyleBase,
    backgroundColor: 'rgba(255,255,255,0.1)',
  };

  const dropdownStyle: Record<string, string> = {
    position: 'absolute',
    top: '100%',
    left: '0',
    minWidth: '180px',
    backgroundColor: '#2d2d2d',
    border: '1px solid #454545',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    padding: '4px 0',
    zIndex: '1000',
  };

  const dropdownItemStyle: Record<string, string> = {
    display: 'block',
    width: '100%',
    padding: '6px 16px',
    fontSize: '12px',
    color: '#cccccc',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.1s',
  };

  const mainAreaStyle: Record<string, string> = {
    flex: '1',
    display: 'flex',
    overflow: 'hidden',
  };

  const sidebarStyle: Record<string, string> = {
    width: '220px',
    backgroundColor: '#252526',
    borderRight: 'none',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: '0',
    overflowY: 'auto',
  };

  const sidebarResizeHandleStyle: Record<string, string> = {
    width: '1px',
    backgroundColor: '#007acc',
    cursor: 'col-resize',
    flexShrink: '0',
    opacity: '0.4',
    transition: 'opacity 0.2s',
  };

  const sidebarHeaderStyle: Record<string, string> = {
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#bbbbbb',
  };

  const fileItemStyle = (indent: number, isFolder: boolean, isActive: boolean): Record<string, string> => ({
    padding: '3px 8px',
    paddingLeft: `${12 + indent * 16}px`,
    fontSize: '13px',
    cursor: 'pointer',
    color: isFolder ? '#cccccc' : '#d4d4d4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderRadius: '3px',
    margin: '0 4px',
    transition: 'background-color 0.1s',
    backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
  });

  const editorAreaStyle: Record<string, string> = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const editorTabBarStyle: Record<string, string> = {
    height: '35px',
    backgroundColor: '#252526',
    display: 'flex',
    alignItems: 'center',
    flexShrink: '0',
  };

  const activeTabStyle: Record<string, string> = {
    padding: '0 16px',
    height: '35px',
    lineHeight: '35px',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    fontSize: '13px',
    cursor: 'pointer',
    border: 'none',
    borderBottom: '2px solid #007acc',
    boxSizing: 'border-box',
  };

  const editorContentStyle: Record<string, string> = {
    flex: '1',
    display: 'flex',
    overflow: 'auto',
    backgroundColor: '#1e1e1e',
    fontFamily: '"Cascadia Code", "Fira Code", "Consolas", monospace',
    fontSize: '13px',
    lineHeight: '20px',
  };

  const lineNumbersStyle: Record<string, string> = {
    padding: '8px 0',
    textAlign: 'right',
    color: '#858585',
    userSelect: 'none',
    minWidth: '48px',
    paddingRight: '12px',
    paddingLeft: '12px',
    flexShrink: '0',
  };

  const codeAreaStyle: Record<string, string> = {
    padding: '8px 0',
    flex: '1',
    whiteSpace: 'pre',
    overflowX: 'auto',
    outline: 'none',
    color: '#d4d4d4',
  };

  const minimapStyle: Record<string, string> = {
    width: '60px',
    backgroundColor: '#1e1e1e',
    borderLeft: '1px solid var(--color-border, #252526)',
    flexShrink: '0',
    padding: '8px 4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    position: 'relative',
  };

  const statusBarStyle: Record<string, string> = {
    height: '22px',
    backgroundColor: '#007acc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    fontSize: '12px',
    color: '#ffffff',
    flexShrink: '0',
  };

  const statusItemStyle: Record<string, string> = {
    cursor: 'pointer',
    padding: '0 6px',
    borderRadius: '3px',
    transition: 'background-color 0.15s',
  };

  // Minimap viewport indicator position
  const viewportTop = 8;
  const viewportHeight = 30;

  // Get current file content
  const currentCode = FILE_CONTENTS[activeFile] ?? SAMPLE_CODE;

  // Build code lines with syntax highlighting
  const codeLines = currentCode.map((line, i) => {
    const tokens = tokenizeLine(line);
    const spans: Array<unknown> = [];
    let spanIdx = 0;
    for (const token of tokens) {
      spans.push(
        createElement('span', {
          key: String(spanIdx++),
          style: { color: token.color },
        }, token.text),
      );
    }

    return createElement(
      'div',
      {
        key: String(i),
        style: {
          minHeight: '20px',
        },
      },
      ...spans,
    );
  });

  // Build line number elements -- reflect actual content lines
  const actualLineCount = Math.max(lineCount, currentCode.length);
  const lineNumbers: Array<unknown> = [];
  for (let i = 0; i < actualLineCount; i++) {
    lineNumbers.push(createElement('div', {
      key: String(i),
    }, String(i + 1)));
  }

  // Determine which file tree items are visible based on expanded folders
  const isItemVisible = (item: FileEntry): boolean => {
    if (!item.parent) return true;
    // Check if parent folder is expanded
    if (!expandedFolders[item.parent]) return false;
    // Check the parent's parent recursively via the tree
    const parentEntry = FILE_TREE.find((e) => e.name === item.parent && e.isFolder);
    if (parentEntry) return isItemVisible(parentEntry);
    return true;
  };

  // Build menu elements with dropdowns
  const menuElements = MENUS.map((menu, i) => {
    const children: Array<unknown> = [menu];
    const isActive = activeMenu === i;

    if (isActive && MENU_ITEMS[menu]) {
      children.push(
        createElement(
          'div',
          {
            key: 'dropdown',
            style: dropdownStyle,
            className: 'ide__menu-dropdown',
          },
          ...MENU_ITEMS[menu].map((item, j) =>
            createElement(
              'button',
              {
                key: String(j),
                style: dropdownItemStyle,
                onClick: (e: Event) => {
                  e.stopPropagation();
                  handleMenuAction(item.action);
                },
                role: 'menuitem',
              },
              item.label,
            ),
          ),
        ),
      );
    }

    return createElement(
      'button',
      {
        key: String(i),
        style: isActive ? menuItemStyleActive : menuItemStyleBase,
        role: 'menuitem',
        'aria-label': menu,
        onClick: () => handleMenuClick(i),
      },
      ...children,
    );
  });

  // Build file tree elements with visibility
  const fileTreeElements = FILE_TREE.map((item, i) => {
    if (!isItemVisible(item)) return null;

    const isActiveFile = !item.isFolder && item.name === activeFile;
    const folderIcon = item.isFolder
      ? (expandedFolders[item.name] ? '\u{1F4C2} ' : '\u{1F4C1} ')
      : '\u{1F4C4} ';

    return createElement(
      'div',
      {
        key: String(i),
        style: fileItemStyle(item.indent, item.isFolder, isActiveFile),
        onClick: item.isFolder
          ? () => handleFolderToggle(item.name)
          : () => handleFileClick(item.name),
      },
      folderIcon,
      item.name,
    );
  });

  // Filter out nulls
  const visibleFileTreeElements = fileTreeElements.filter((el) => el !== null);

  return createElement(
    'div',
    {
      className: `ide ${props.className ?? ''}`.trim(),
      style: containerStyle,
    },
    // Title Bar
    createElement(
      'div',
      { className: 'ide__title-bar', style: titleBarStyle },
      'SpecifyJS IDE',
    ),
    // Menu Bar
    createElement(
      'div',
      { className: 'ide__menu-bar', style: menuBarStyle, role: 'menubar' },
      ...menuElements,
    ),
    // Main Area
    createElement(
      'div',
      { style: mainAreaStyle },
      // Sidebar
      createElement(
        'nav',
        { className: 'ide__sidebar', style: sidebarStyle, 'aria-label': 'File explorer' },
        createElement('div', { style: sidebarHeaderStyle }, 'Explorer'),
        ...visibleFileTreeElements,
      ),
      // Resize handle between sidebar and editor
      createElement('div', { style: sidebarResizeHandleStyle }),
      // Editor Area
      createElement(
        'div',
        { style: editorAreaStyle },
        // Tab Bar -- shows active file name
        createElement(
          'div',
          { style: editorTabBarStyle },
          createElement('button', { style: activeTabStyle, 'aria-label': activeFile }, activeFile),
        ),
        // Editor Content
        createElement(
          'div',
          { style: editorContentStyle },
          // Line Numbers
          createElement(
            'div',
            { style: lineNumbersStyle, 'aria-hidden': 'true' },
            ...lineNumbers,
          ),
          // Code - contentEditable
          createElement(
            'code',
            {
              style: codeAreaStyle,
              contentEditable: 'true',
              ref: editorRef,
              onInput: handleEditorInput,
              suppressContentEditableWarning: true,
            },
            ...codeLines,
          ),
        ),
      ),
      // Minimap
      createElement(
        'div',
        { className: 'ide__minimap', style: minimapStyle, 'aria-hidden': 'true' },
        // Viewport indicator
        createElement('div', {
          style: {
            position: 'absolute',
            top: `${viewportTop}px`,
            left: '0',
            right: '0',
            height: `${viewportHeight}px`,
            backgroundColor: 'rgba(100, 100, 200, 0.15)',
            border: '1px solid rgba(100, 100, 200, 0.3)',
            borderRadius: '2px',
            pointerEvents: 'none',
          },
        }),
        ...currentCode.map((line, i) =>
          createElement('div', {
            key: String(i),
            style: {
              height: '2px',
              backgroundColor: line.trim() ? '#555555' : 'transparent',
              borderRadius: '1px',
              width: `${Math.min(100, line.length * 2)}%`,
            },
          }),
        ),
      ),
    ),
    // Status Bar
    createElement(
      'div',
      { className: 'ide__status-bar', style: statusBarStyle },
      createElement(
        'div',
        { style: { display: 'flex', gap: '16px' } },
        createElement('span', { style: statusItemStyle }, '\u{2387} main'),
        createElement('span', { style: statusItemStyle }, '0 errors'),
        createElement('span', { style: statusItemStyle }, '0 warnings'),
      ),
      createElement(
        'div',
        { style: { display: 'flex', gap: '16px' } },
        createElement('span', { style: statusItemStyle }, 'Ln 1, Col 1'),
        createElement('span', { style: statusItemStyle }, 'UTF-8'),
        createElement('span', { style: statusItemStyle }, 'TypeScript'),
      ),
    ),
  );
}
