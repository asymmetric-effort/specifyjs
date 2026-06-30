// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * CodeEditor -- Code editing area with line numbers and syntax highlighting.
 *
 * Renders a contentEditable code block with line numbers on the left.
 * Uses `tokenizeLine` from SyntaxHighlighter for syntax coloring.
 */

import { createElement } from 'specifyjs';
import { tokenizeLine } from './SyntaxHighlighter';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props for the CodeEditor component. */
export interface CodeEditorProps {
  /** Lines of code to display with syntax highlighting. */
  content: string[];
  /** Callback fired when the editor content changes. */
  onInput?: () => void;
  /** Ref object to attach to the contentEditable element. */
  editorRef?: { current: HTMLElement | null };
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A code editing area with line numbers and syntax-highlighted content.
 * The code block is contentEditable, allowing live editing.
 */
export function CodeEditor(props: CodeEditorProps) {
  const codeLines = props.content.map((line, i) => {
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
        style: { minHeight: '20px' },
      },
      ...spans,
    );
  });

  const lineNumbers: Array<unknown> = [];
  for (let i = 0; i < props.content.length; i++) {
    lineNumbers.push(createElement('div', {
      key: String(i),
    }, String(i + 1)));
  }

  return createElement(
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
        ref: props.editorRef,
        onInput: props.onInput,
        suppressContentEditableWarning: true,
      },
      ...codeLines,
    ),
  );
}
