// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

export { IDE } from './IDE';
export type { IDEProps } from './IDE';
export { TitleBar } from './TitleBar';
export type { TitleBarProps } from './TitleBar';
export { MenuBar } from './MenuBar';
export type { MenuBarProps, MenuItem } from './MenuBar';
export { FileExplorer } from './FileExplorer';
export type { FileExplorerProps, FileEntry } from './FileExplorer';
export { TabBar } from './TabBar';
export type { TabBarProps } from './TabBar';
export { CodeEditor } from './CodeEditor';
export type { CodeEditorProps } from './CodeEditor';
export { Minimap } from './Minimap';
export type { MinimapProps } from './Minimap';
export { StatusBar } from './StatusBar';
export type { StatusBarProps, StatusItem } from './StatusBar';
export { tokenizeLine } from './SyntaxHighlighter';
export type { Token } from './SyntaxHighlighter';
export {
  COL_KEYWORD,
  COL_STRING,
  COL_TYPE,
  COL_COMMENT,
  COL_FUNCTION,
  COL_DEFAULT,
  COL_PUNCTUATION,
  COL_NUMBER,
} from './SyntaxHighlighter';
