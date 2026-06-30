// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * FileExplorer -- Tree view sidebar with folders and files.
 *
 * Renders a vertical list of file and folder entries with expand/collapse
 * support for folders. Highlights the currently active file.
 */

import { createElement } from 'specifyjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single entry in the file tree. */
export interface FileEntry {
  /** Display name of the file or folder. */
  name: string;
  /** Indentation level (0 = root). */
  indent: number;
  /** Whether this entry is a folder (true) or a file (false). */
  isFolder: boolean;
  /** Name of the parent folder, if any. */
  parent?: string;
}

/** Props for the FileExplorer component. */
export interface FileExplorerProps {
  /** Flat list of file/folder entries to display. */
  files: FileEntry[];
  /** Name of the currently active (selected) file. */
  activeFile: string;
  /** Map of folder name to whether it is expanded. */
  expandedFolders: Record<string, boolean>;
  /** Callback when a file is clicked. */
  onFileClick: (fileName: string) => void;
  /** Callback when a folder is toggled. */
  onFolderToggle: (folderName: string) => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const sidebarStyle: Record<string, string> = {
  width: '220px',
  backgroundColor: '#252526',
  borderRight: 'none',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: '0',
  overflowY: 'auto',
};

const sidebarHeaderStyle: Record<string, string> = {
  padding: '8px 12px',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#bbbbbb',
};

function fileItemStyle(indent: number, isFolder: boolean, isActive: boolean): Record<string, string> {
  return {
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
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A file-tree sidebar that displays folders and files with expand/collapse.
 * Visibility of nested items is determined by `expandedFolders`.
 */
export function FileExplorer(props: FileExplorerProps) {
  const isItemVisible = (item: FileEntry): boolean => {
    if (!item.parent) return true;
    if (!props.expandedFolders[item.parent]) return false;
    const parentEntry = props.files.find((e) => e.name === item.parent && e.isFolder);
    if (parentEntry) return isItemVisible(parentEntry);
    return true;
  };

  const elements = props.files.map((item, i) => {
    if (!isItemVisible(item)) return null;

    const isActiveFile = !item.isFolder && item.name === props.activeFile;
    const folderIcon = item.isFolder
      ? (props.expandedFolders[item.name] ? '\u{1F4C2} ' : '\u{1F4C1} ')
      : '\u{1F4C4} ';

    return createElement(
      'div',
      {
        key: String(i),
        style: fileItemStyle(item.indent, item.isFolder, isActiveFile),
        onClick: item.isFolder
          ? () => props.onFolderToggle(item.name)
          : () => props.onFileClick(item.name),
      },
      folderIcon,
      item.name,
    );
  });

  const visibleElements = elements.filter((el) => el !== null);

  return createElement(
    'nav',
    { className: 'ide__sidebar', style: sidebarStyle, 'aria-label': 'File explorer' },
    createElement('div', { style: sidebarHeaderStyle }, 'Explorer'),
    ...visibleElements,
  );
}
