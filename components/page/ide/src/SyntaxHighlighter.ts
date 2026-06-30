// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * SyntaxHighlighter -- Tokenizer and color constants for syntax highlighting.
 *
 * Provides `tokenizeLine` which splits a line of TypeScript/JavaScript code
 * into colored tokens for rendering in the IDE editor and minimap.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single colored token produced by the tokenizer. */
export interface Token {
  text: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Color Constants
// ---------------------------------------------------------------------------

export const COL_KEYWORD = '#569cd6';
export const COL_STRING = '#ce9178';
export const COL_TYPE = '#4ec9b0';
export const COL_COMMENT = '#6a9955';
export const COL_FUNCTION = '#dcdcaa';
export const COL_DEFAULT = '#d4d4d4';
export const COL_PUNCTUATION = '#d4d4d4';
export const COL_NUMBER = '#b5cea8';

// ---------------------------------------------------------------------------
// Keyword/Type Sets
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

/**
 * Tokenize a single line of code into an array of colored tokens.
 *
 * Recognizes comments, strings, numbers, keywords, type names, function calls,
 * and punctuation. Returns a non-breaking space token for blank lines.
 */
export function tokenizeLine(line: string): Array<Token> {
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
