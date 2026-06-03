// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Container.ts -- Nestable container component for the Board.
 * Renders an opaque box with a name label, drag handle, resize handles,
 * and a scrollable content area for child items.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useRef } from '../../../../core/src/hooks/index';
import type { Container } from './types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ContainerComponentProps {
  container: Container;
  selected?: boolean;
  highlighted?: boolean;
  onSelect?: (containerId: string) => void;
  onMove?: (containerId: string, position: { x: number; y: number }) => void;
  onResize?: (containerId: string, size: { width: number; height: number }) => void;
  onDelete?: (containerId: string) => void;
  onDrop?: (itemId: string, containerId: string) => void;
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContainerComponent(props: ContainerComponentProps) {
  const { container, selected = false, highlighted = false, onSelect, onMove, onResize, onDelete, onDrop, children } = props;
  const [dragOver, setDragOver] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const handleDeleteClick = useCallback((e: Event) => {
    e.stopPropagation();
    if (onDelete) onDelete(container.container_id);
  }, [container.container_id, onDelete]);

  const handleMinimizeClick = useCallback((e: Event) => {
    e.stopPropagation();
    setMinimized((prev: boolean) => !prev);
  }, []);

  // -----------------------------------------------------------------------
  // Title bar drag (move container)
  // -----------------------------------------------------------------------

  const handleTitleMouseDown = useCallback((e: Event) => {
    const me = e as MouseEvent;
    me.preventDefault();
    me.stopPropagation();
    if (onSelect) onSelect(container.container_id);

    dragStartRef.current = {
      x: me.clientX,
      y: me.clientY,
      posX: container.position.x,
      posY: container.position.y,
    };

    const handleMouseMove = (ev: Event) => {
      const mev = ev as MouseEvent;
      if (!dragStartRef.current) return;
      const dx = mev.clientX - dragStartRef.current.x;
      const dy = mev.clientY - dragStartRef.current.y;
      if (onMove) {
        onMove(container.container_id, {
          x: dragStartRef.current.posX + dx,
          y: dragStartRef.current.posY + dy,
        });
      }
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [container.container_id, container.position.x, container.position.y, onSelect, onMove]);

  // -----------------------------------------------------------------------
  // Resize handle
  // -----------------------------------------------------------------------

  const handleResizeMouseDown = useCallback((e: Event) => {
    const me = e as MouseEvent;
    me.preventDefault();
    me.stopPropagation();

    resizeStartRef.current = {
      x: me.clientX,
      y: me.clientY,
      w: container.size.width,
      h: container.size.height,
    };

    const handleMouseMove = (ev: Event) => {
      const mev = ev as MouseEvent;
      if (!resizeStartRef.current) return;
      const dx = mev.clientX - resizeStartRef.current.x;
      const dy = mev.clientY - resizeStartRef.current.y;
      const newW = Math.max(160, resizeStartRef.current.w + dx);
      const newH = Math.max(120, resizeStartRef.current.h + dy);
      if (onResize) {
        onResize(container.container_id, { width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [container.container_id, container.size.width, container.size.height, onResize]);

  // -----------------------------------------------------------------------
  // Drop zone handlers
  // -----------------------------------------------------------------------

  const handleDragOver = useCallback((e: Event) => {
    const de = e as DragEvent;
    de.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: Event) => {
    const de = e as DragEvent;
    de.preventDefault();
    setDragOver(false);
    if (onDrop && de.dataTransfer) {
      const itemId = de.dataTransfer.getData('text/plain');
      if (itemId) {
        onDrop(itemId, container.container_id);
      }
    }
  }, [container.container_id, onDrop]);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const isHighlightedOrDragOver = highlighted || dragOver;

  const containerStyle: Record<string, string> = {
    position: 'absolute',
    left: `${container.position.x}px`,
    top: `${container.position.y}px`,
    width: `${container.size.width}px`,
    height: `${container.size.height}px`,
    backgroundColor: highlighted ? '#eff6ff' : '#ffffff',
    border: highlighted
      ? '2px dashed #3b82f6'
      : selected ? '2px solid #3b82f6' : '2px solid #d1d5db',
    borderRadius: '8px',
    boxShadow: isHighlightedOrDragOver
      ? '0 0 0 3px rgba(59,130,246,0.3), 0 4px 16px rgba(0,0,0,0.1)'
      : '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: '0',
    boxSizing: 'border-box',
    transition: 'border 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
  };

  const titleBarStyle: Record<string, string> = {
    padding: '6px 12px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    cursor: 'grab',
    userSelect: 'none',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '15px',
    color: '#1f2937',
    flexShrink: '0',
  };

  const contentsStyle: Record<string, string> = {
    flex: '1',
    overflow: 'auto',
    position: 'relative',
    padding: '4px',
  };

  const resizeHandleStyle: Record<string, string> = {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '14px',
    height: '14px',
    cursor: 'nwse-resize',
    opacity: '0.4',
    background: 'linear-gradient(135deg, transparent 50%, #666 50%)',
  };

  return createElement('div', {
    className: 'board-container',
    style: containerStyle,
    'data-container-id': container.container_id,
    'data-testid': `container-${container.container_id}`,
    role: 'group',
    'aria-label': `Container: ${container.name}`,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  },
    createElement('div', {
      className: 'board-container__title',
      style: { ...titleBarStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
      onMouseDown: handleTitleMouseDown,
      'data-testid': `container-title-${container.container_id}`,
    },
      createElement('span', null, container.name),
      createElement('span', { style: { display: 'flex', gap: '4px' } },
        createElement('button', {
          style: {
            border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
            color: '#94a3b8', fontSize: '12px', padding: '0 2px', lineHeight: '1',
          },
          onClick: handleMinimizeClick,
          'aria-label': minimized ? 'Expand container' : 'Minimize container',
          title: minimized ? 'Expand' : 'Minimize',
        }, minimized ? '\u25B2' : '\u2014'),
        createElement('button', {
          style: {
            border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
            color: '#94a3b8', fontSize: '14px', padding: '0 2px', lineHeight: '1',
          },
          onClick: handleDeleteClick,
          'aria-label': 'Delete container',
          title: 'Delete',
        }, '\u00D7'),
      ),
    ),
    minimized ? null : createElement('div', {
      className: 'board-container__contents',
      style: contentsStyle,
      'data-testid': `container-contents-${container.container_id}`,
    }, children),
    minimized ? null : createElement('div', {
      style: resizeHandleStyle,
      'data-role': 'resize',
      onMouseDown: handleResizeMouseDown,
      'aria-label': 'Resize container',
    }),
  );
}
