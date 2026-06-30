// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * IDE -- Full-screen layout resembling a programmer's IDE (VS Code style).
 *
 * Thin orchestrator that composes TitleBar, MenuBar, FileExplorer, TabBar,
 * CodeEditor, Minimap, and StatusBar sub-components.
 */

import { createElement } from 'specifyjs';
import { useState, useMemo, useCallback, useRef } from 'specifyjs/hooks';

import { TitleBar } from './TitleBar';
import { MenuBar } from './MenuBar';
import type { MenuItem } from './MenuBar';
import { FileExplorer } from './FileExplorer';
import type { FileEntry } from './FileExplorer';
import { TabBar } from './TabBar';
import { CodeEditor } from './CodeEditor';
import { Minimap } from './Minimap';
import { StatusBar } from './StatusBar';

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

const MENU_ITEMS: Record<string, Array<MenuItem>> = {
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

// Use App.ts as the default sample code
const SAMPLE_CODE = FILE_CONTENTS['App.ts'];

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
        if (editorRef.current) {
          editorRef.current.textContent = '';
          setLineCount(1);
        }
        break;
      default:
        break;
    }
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

  const mainAreaStyle: Record<string, string> = {
    flex: '1',
    display: 'flex',
    overflow: 'hidden',
  };

  const sidebarResizeHandleStyle: Record<string, string> = {
    width: '1px',
    backgroundColor: '#007acc',
    cursor: 'col-resize',
    flexShrink: '0',
    opacity: '0.4',
    transition: 'opacity 0.2s',
  };

  const editorAreaStyle: Record<string, string> = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  // Minimap viewport indicator position
  const viewportTop = 8;
  const viewportHeight = 30;

  // Get current file content
  const currentCode = FILE_CONTENTS[activeFile] ?? SAMPLE_CODE;

  // Suppress unused variable warning — lineCount is used to trigger re-renders
  void lineCount;

  return createElement(
    'div',
    {
      className: `ide ${props.className ?? ''}`.trim(),
      style: containerStyle,
    },
    // Title Bar
    createElement(TitleBar, { title: 'SpecifyJS IDE' }),
    // Menu Bar
    createElement(MenuBar, {
      menus: MENUS,
      menuItems: MENU_ITEMS,
      onAction: handleMenuAction,
    }),
    // Main Area
    createElement(
      'div',
      { style: mainAreaStyle },
      // Sidebar File Explorer
      createElement(FileExplorer, {
        files: FILE_TREE,
        activeFile,
        expandedFolders,
        onFileClick: handleFileClick,
        onFolderToggle: handleFolderToggle,
      }),
      // Resize handle between sidebar and editor
      createElement('div', { style: sidebarResizeHandleStyle }),
      // Editor Area
      createElement(
        'div',
        { style: editorAreaStyle },
        // Tab Bar
        createElement(TabBar, {
          tabs: [activeFile],
          activeTab: activeFile,
          onTabClick: handleFileClick,
        }),
        // Code Editor
        createElement(CodeEditor, {
          content: currentCode,
          onInput: handleEditorInput,
          editorRef,
        }),
      ),
      // Minimap
      createElement(Minimap, {
        lines: currentCode,
        visibleStart: viewportTop,
        visibleEnd: viewportHeight,
        totalLines: currentCode.length,
      }),
    ),
    // Status Bar
    createElement(StatusBar, {
      items: [
        { label: '\u{2387} main' },
        { label: '0 errors' },
        { label: '0 warnings' },
      ],
      rightItems: [
        { label: 'Ln 1, Col 1' },
        { label: 'UTF-8' },
        { label: 'TypeScript' },
      ],
    }),
  );
}
