// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * CardEditor.ts -- Inline edit overlay for card title and description.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useEffect, useRef } from 'specifyjs/hooks';
import type { ProjectCard } from './types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CardEditorProps {
  card: ProjectCard;
  onSave: (cardId: string, updates: { title: string; description: string }) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CardEditor(props: CardEditorProps) {
  const { card, onSave, onClose } = props;
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const overlayRef = useRef<HTMLElement | null>(null);

  // Focus title on mount
  useEffect(() => {
    if (titleRef.current) {
      (titleRef.current as HTMLInputElement).focus();
      (titleRef.current as HTMLInputElement).select();
    }
  }, []);

  const save = useCallback(() => {
    onSave(card.id, { title, description });
    onClose();
  }, [card.id, title, description, onSave, onClose]);

  const handleKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Escape') {
      save();
    }
  }, [save]);

  const handleOverlayClick = useCallback((e: Event) => {
    const me = e as MouseEvent;
    if (me.target === overlayRef.current) {
      save();
    }
  }, [save]);

  const handleTitleChange = useCallback((e: Event) => {
    setTitle((e.target as HTMLInputElement).value);
  }, []);

  const handleDescChange = useCallback((e: Event) => {
    setDescription((e.target as HTMLTextAreaElement).value);
  }, []);

  const handleTitleKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Tab') {
      ke.preventDefault();
      // Focus description textarea
      const textarea = (ke.target as HTMLElement).parentElement?.querySelector('textarea');
      if (textarea) (textarea as HTMLTextAreaElement).focus();
    }
    if (ke.key === 'Escape') {
      save();
    }
  }, [save]);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const overlayStyle: Record<string, string> = {
    position: 'absolute',
    inset: '0',
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '100',
  };

  const editorStyle: Record<string, string> = {
    backgroundColor: card.color || '#fef9c3',
    borderRadius: '8px',
    padding: '16px',
    width: `${Math.max(card.size.width, 200)}px`,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const inputStyle: Record<string, string> = {
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '4px',
    padding: '6px 8px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.7)',
    color: '#1a1a1a',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const textareaStyle: Record<string, string> = {
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '4px',
    padding: '6px 8px',
    fontSize: '12px',
    backgroundColor: 'rgba(255,255,255,0.7)',
    color: '#333',
    outline: 'none',
    resize: 'vertical',
    minHeight: '60px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const btnStyle: Record<string, string> = {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    alignSelf: 'flex-end',
  };

  return createElement('div', {
    ref: overlayRef,
    className: 'card-editor-overlay',
    style: overlayStyle,
    onClick: handleOverlayClick,
    onKeyDown: handleKeyDown,
    'data-testid': 'card-editor-overlay',
  },
    createElement('div', {
      style: editorStyle,
      'data-testid': 'card-editor',
      role: 'dialog',
      'aria-label': `Edit card: ${card.title}`,
    },
      createElement('input', {
        ref: titleRef,
        type: 'text',
        value: title,
        onInput: handleTitleChange,
        onKeyDown: handleTitleKeyDown,
        style: inputStyle,
        placeholder: 'Card title',
        'data-testid': 'card-editor-title',
        'aria-label': 'Card title',
      }),
      createElement('textarea', {
        value: description,
        onInput: handleDescChange,
        onKeyDown: handleKeyDown,
        style: textareaStyle,
        placeholder: 'Description...',
        'data-testid': 'card-editor-description',
        'aria-label': 'Card description',
      }),
      createElement('button', {
        style: btnStyle,
        onClick: save,
        'data-testid': 'card-editor-save',
      }, 'Done'),
    ),
  );
}
