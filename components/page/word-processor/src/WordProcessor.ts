// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * WordProcessor -- Full-screen layout resembling a word processor application.
 *
 * Features a menu bar with working dropdowns, formatting toolbar with toggle
 * states that apply formatting via execCommand, ruler bar, centered
 * contentEditable document page on a gray background with drop shadow, and a
 * status bar with live word count and zoom display. Supports dark mode
 * via CSS variables and provides hover/transition polish on interactive
 * elements.
 */

import { createElement } from 'specifyjs';
import { useMemo, useState, useCallback, useRef } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WordProcessorProps {
  /** Document content rendered in the page area */
  content?: string;
  /** Extra class name */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MENUS = ['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Help'];

const MENU_ITEMS: Record<string, Array<{ label: string; action: string }>> = {
  File: [
    { label: 'New', action: 'new' },
    { label: 'Open', action: 'open' },
    { label: 'Save', action: 'save' },
    { label: 'Print', action: 'print' },
  ],
  Edit: [
    { label: 'Undo', action: 'undo' },
    { label: 'Redo', action: 'redo' },
    { label: 'Cut', action: 'cut' },
    { label: 'Copy', action: 'copy' },
    { label: 'Paste', action: 'paste' },
  ],
  View: [
    { label: 'Zoom In', action: 'zoomIn' },
    { label: 'Zoom Out', action: 'zoomOut' },
    { label: 'Full Screen', action: 'fullScreen' },
  ],
  Insert: [
    { label: 'Image', action: 'insertImage' },
    { label: 'Table', action: 'insertTable' },
    { label: 'Link', action: 'insertLink' },
  ],
  Format: [
    { label: 'Bold', action: 'bold' },
    { label: 'Italic', action: 'italic' },
    { label: 'Underline', action: 'underline' },
  ],
  Tools: [
    { label: 'Word Count', action: 'wordCount' },
    { label: 'Spell Check', action: 'spellCheck' },
  ],
  Help: [
    { label: 'About', action: 'about' },
    { label: 'Keyboard Shortcuts', action: 'shortcuts' },
  ],
};

const FORMAT_BUTTONS: Array<{ id: string; label: string; text: string; shortcut?: string; style?: Record<string, string> }> = [
  { id: 'bold', label: 'Bold', text: 'B', shortcut: 'Ctrl+B', style: { fontWeight: '700' } },
  { id: 'italic', label: 'Italic', text: 'I', shortcut: 'Ctrl+I', style: { fontStyle: 'italic' } },
  { id: 'underline', label: 'Underline', text: 'U', shortcut: 'Ctrl+U', style: { textDecoration: 'underline' } },
];

const ALIGN_BUTTONS: Array<{ label: string; text: string; command: string }> = [
  { label: 'Align left', text: '\u2261', command: 'justifyLeft' },
  { label: 'Align center', text: '\u2263', command: 'justifyCenter' },
  { label: 'Align right', text: '\u2262', command: 'justifyRight' },
];

const FONT_SIZES = ['1', '2', '3', '4', '5', '6', '7'];
const FONT_SIZE_LABELS: Record<string, string> = {
  '1': '8', '2': '10', '3': '12', '4': '14', '5': '18', '6': '24', '7': '36',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRulerTicks(): Array<unknown> {
  const ticks: Array<unknown> = [];
  for (let i = 0; i <= 20; i++) {
    const isMajor = i % 2 === 0;
    ticks.push(
      createElement('div', {
        key: String(i),
        style: {
          position: 'absolute',
          left: `${(i / 20) * 100}%`,
          bottom: '0',
          width: '1px',
          height: isMajor ? '10px' : '5px',
          backgroundColor: '#999',
        },
      }),
    );
    if (isMajor) {
      ticks.push(
        createElement('span', {
          key: `l${i}`,
          style: {
            position: 'absolute',
            left: `${(i / 20) * 100}%`,
            top: '1px',
            fontSize: '8px',
            color: '#666',
            transform: 'translateX(-50%)',
          },
        }, String(i / 2)),
      );
    }
  }
  return ticks;
}

function computeWordCount(text: string): number {
  return text.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WordProcessor(props: WordProcessorProps) {
  const [boldActive, setBoldActive] = useState<boolean>(false);
  const [italicActive, setItalicActive] = useState<boolean>(false);
  const [underlineActive, setUnderlineActive] = useState<boolean>(false);
  const [hoveredMenuIndex, setHoveredMenuIndex] = useState<number>(-1);
  const [hoveredToolBtn, setHoveredToolBtn] = useState<string>('');
  const [activeMenu, setActiveMenu] = useState<number>(-1);
  const [wordCount, setWordCount] = useState<number>(0);
  const [fontSize, setFontSize] = useState<string>('3');

  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleBoldClick = useCallback(() => {
    document.execCommand('bold', false);
    setBoldActive((prev: boolean) => !prev);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const handleItalicClick = useCallback(() => {
    document.execCommand('italic', false);
    setItalicActive((prev: boolean) => !prev);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const handleUnderlineClick = useCallback(() => {
    document.execCommand('underline', false);
    setUnderlineActive((prev: boolean) => !prev);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const togglers: Record<string, () => void> = {
    bold: handleBoldClick,
    italic: handleItalicClick,
    underline: handleUnderlineClick,
  };

  const activeStates: Record<string, boolean> = {
    bold: boldActive,
    italic: italicActive,
    underline: underlineActive,
  };

  const handleAlignClick = useCallback((command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const handleFontSizeChange = useCallback((size: string) => {
    document.execCommand('fontSize', false, size);
    setFontSize(size);
    if (editorRef.current) {
      editorRef.current.focus();
    }
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
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'print':
        if (typeof window !== 'undefined' && window.print) {
          window.print();
        }
        break;
      case 'new':
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
          setWordCount(0);
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

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.textContent ?? '';
      setWordCount(computeWordCount(text));
    }
  }, []);

  const handleDocumentAreaClick = useCallback(() => {
    // Close menu when clicking the document area
    setActiveMenu(-1);
  }, []);

  const containerStyle = useMemo<Record<string, string>>(() => ({
    width: '100%',
    height: '100%',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
    fontSize: '13px',
    color: 'var(--color-text, #333)',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  }), []);

  const menuBarStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    height: '30px',
    backgroundColor: 'var(--color-bg-subtle, #ffffff)',
    borderBottom: '1px solid var(--color-border, #d0d0d0)',
    padding: '0 8px',
    gap: '2px',
    flexShrink: '0',
    position: 'relative',
  };

  const toolbarStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    height: '36px',
    backgroundColor: 'var(--color-bg-subtle, #f8f9fa)',
    borderBottom: '1px solid var(--color-border, #d0d0d0)',
    padding: '0 12px',
    gap: '12px',
    flexShrink: '0',
  };

  const rulerStyle: Record<string, string> = {
    height: '20px',
    backgroundColor: '#e8e8e8',
    borderBottom: '1px solid #ccc',
    position: 'relative',
    flexShrink: '0',
    margin: '0 60px',
  };

  const documentAreaStyle: Record<string, string> = {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '30px 40px',
    overflow: 'auto',
    backgroundColor: '#e0e0e0',
    cursor: 'text',
  };

  const pageStyle: Record<string, string> = {
    width: '680px',
    minHeight: '880px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.18), 0 0 1px rgba(0,0,0,0.1)',
    padding: '72px 72px 96px 72px',
    boxSizing: 'border-box',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#222',
    fontFamily: '"Times New Roman", Georgia, serif',
    cursor: 'text',
    outline: 'none',
  };

  const statusBarStyle: Record<string, string> = {
    height: '24px',
    backgroundColor: 'var(--color-bg-subtle, #f0f0f0)',
    borderTop: '1px solid var(--color-border, #ccc)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    fontSize: '11px',
    color: '#666',
    flexShrink: '0',
  };

  const rulerTicks = useMemo(() => buildRulerTicks(), []);

  const displayContent = props.content ?? 'Start typing...';

  // Compute initial word count from content prop
  const initialWordCount = computeWordCount(displayContent);
  const displayWordCount = wordCount > 0 ? wordCount : initialWordCount;

  function makeMenuItemStyle(index: number): Record<string, string> {
    const isHovered = hoveredMenuIndex === index;
    const isActive = activeMenu === index;
    return {
      padding: '4px 10px',
      cursor: 'pointer',
      borderRadius: '3px',
      fontSize: '13px',
      color: 'var(--color-text, #333)',
      backgroundColor: isActive ? 'rgba(0,0,0,0.12)' : (isHovered ? 'rgba(0,0,0,0.08)' : 'transparent'),
      border: 'none',
      lineHeight: '1',
      transition: 'background 0.15s',
      position: 'relative',
    };
  }

  const dropdownStyle: Record<string, string> = {
    position: 'absolute',
    top: '100%',
    left: '0',
    minWidth: '160px',
    backgroundColor: '#ffffff',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '4px 0',
    zIndex: '1000',
  };

  const dropdownItemStyle: Record<string, string> = {
    display: 'block',
    width: '100%',
    padding: '6px 16px',
    fontSize: '13px',
    color: '#333',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.1s',
  };

  function makeToolBtnStyle(id: string, extraStyle?: Record<string, string>): Record<string, string> {
    const isActive = activeStates[id] ?? false;
    const isHovered = hoveredToolBtn === id;
    return {
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid transparent',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '13px',
      backgroundColor: isActive ? 'rgba(0,0,0,0.12)' : (isHovered ? 'rgba(0,0,0,0.06)' : 'transparent'),
      color: 'var(--color-text, #444)',
      transition: 'background 0.15s',
      ...(extraStyle ?? {}),
    };
  }

  const fontDropdownStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 8px',
    border: '1px solid var(--color-border, #ccc)',
    borderRadius: '3px',
    fontSize: '12px',
    color: 'var(--color-text, #444)',
    backgroundColor: 'transparent',
    cursor: 'default',
    height: '24px',
    gap: '4px',
  };

  const fontSizeSelectStyle: Record<string, string> = {
    padding: '2px 4px',
    border: '1px solid var(--color-border, #ccc)',
    borderRadius: '3px',
    fontSize: '12px',
    color: 'var(--color-text, #444)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    height: '24px',
    outline: 'none',
  };

  // Build menu items with dropdowns
  const menuElements = MENUS.map((menu, i) => {
    const children: Array<unknown> = [menu];

    if (activeMenu === i && MENU_ITEMS[menu]) {
      children.push(
        createElement(
          'div',
          {
            key: 'dropdown',
            style: dropdownStyle,
            className: 'word-processor__menu-dropdown',
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
        style: makeMenuItemStyle(i),
        role: 'menuitem',
        'aria-label': menu,
        onClick: () => handleMenuClick(i),
        onMouseEnter: () => {
          setHoveredMenuIndex(i);
          // If a menu is already open, switch to this one on hover
        },
        onMouseLeave: () => setHoveredMenuIndex(-1),
      },
      ...children,
    );
  });

  return createElement(
    'div',
    {
      className: `word-processor ${props.className ?? ''}`.trim(),
      style: containerStyle,
    },
    // Menu Bar
    createElement(
      'div',
      { className: 'word-processor__menu-bar', style: menuBarStyle, role: 'menubar' },
      ...menuElements,
    ),
    // Toolbar
    createElement(
      'div',
      { className: 'word-processor__toolbar', style: toolbarStyle, role: 'toolbar', 'aria-label': 'Formatting toolbar' },
      // Font family mock dropdown
      createElement(
        'div',
        {
          style: fontDropdownStyle,
          'aria-label': 'Font family',
        },
        createElement('span', null, 'Arial'),
        createElement('span', { style: { fontSize: '10px', color: '#999' } }, '\u25BC'),
      ),
      // Format buttons group (Bold, Italic, Underline)
      createElement(
        'div',
        {
          key: '0',
          style: {
            display: 'flex',
            gap: '2px',
            borderLeft: '1px solid var(--color-border, #ccc)',
            paddingLeft: '10px',
          },
        },
        ...FORMAT_BUTTONS.map((btn) =>
          createElement(
            'button',
            {
              key: btn.id,
              style: makeToolBtnStyle(btn.id, btn.style),
              title: btn.shortcut ? `${btn.label} (${btn.shortcut})` : btn.label,
              'aria-label': btn.label,
              'aria-pressed': String(activeStates[btn.id] ?? false),
              onClick: togglers[btn.id],
              onMouseEnter: () => setHoveredToolBtn(btn.id),
              onMouseLeave: () => setHoveredToolBtn(''),
            },
            btn.text,
          ),
        ),
      ),
      // Font size selector
      createElement(
        'div',
        {
          key: '1',
          style: {
            display: 'flex',
            gap: '2px',
            borderLeft: '1px solid var(--color-border, #ccc)',
            paddingLeft: '10px',
            alignItems: 'center',
          },
        },
        createElement(
          'select',
          {
            style: fontSizeSelectStyle,
            'aria-label': 'Font size',
            value: fontSize,
            onChange: (e: Event) => {
              const target = e.target as HTMLSelectElement;
              handleFontSizeChange(target.value);
            },
          },
          ...FONT_SIZES.map((size) =>
            createElement(
              'option',
              { key: size, value: size },
              FONT_SIZE_LABELS[size],
            ),
          ),
        ),
      ),
      // Align buttons
      createElement(
        'div',
        {
          key: '2',
          style: {
            display: 'flex',
            gap: '2px',
            borderLeft: '1px solid var(--color-border, #ccc)',
            paddingLeft: '10px',
          },
        },
        ...ALIGN_BUTTONS.map((btn, bi) =>
          createElement(
            'button',
            {
              key: String(bi),
              style: makeToolBtnStyle(`align-${bi}`),
              title: btn.label,
              'aria-label': btn.label,
              onClick: () => handleAlignClick(btn.command),
              onMouseEnter: () => setHoveredToolBtn(`align-${bi}`),
              onMouseLeave: () => setHoveredToolBtn(''),
            },
            btn.text,
          ),
        ),
      ),
    ),
    // Ruler
    createElement(
      'div',
      { className: 'word-processor__ruler', style: rulerStyle, 'aria-hidden': 'true' },
      ...rulerTicks,
    ),
    // Document Area
    createElement(
      'main',
      {
        className: 'word-processor__document-area',
        style: documentAreaStyle,
        onClick: handleDocumentAreaClick,
      },
      createElement(
        'div',
        {
          className: 'word-processor__page',
          style: pageStyle,
          contentEditable: 'true',
          ref: editorRef,
          onInput: handleInput,
          suppressContentEditableWarning: true,
        },
        displayContent,
      ),
    ),
    // Status Bar
    createElement(
      'div',
      { className: 'word-processor__status-bar', style: statusBarStyle },
      createElement('span', null, 'Page 1 of 1'),
      createElement('span', null, `${displayWordCount} words`),
      createElement('span', null, '100%'),
    ),
  );
}
