// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Toolbar.ts -- Horizontal toolbar for the project board.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

export const CARD_COLORS = [
  'transparent', // no background
  '#fef9c3', // yellow
  '#fecaca', // red
  '#fed7aa', // orange
  '#bbf7d0', // green
  '#bfdbfe', // blue
  '#ddd6fe', // purple
  '#fbcfe8', // pink
  '#e5e7eb', // gray
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ToolbarProps {
  zoom: number;
  gridEnabled: boolean;
  selectedColor: string;
  colorFilter?: string | null;
  onNewCard: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onColorSelect: (color: string) => void;
  onColorFilter?: (color: string | null) => void;
  onGridToggle: () => void;
  onSearch: (query: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BoardToolbar(props: ToolbarProps) {
  const {
    zoom, gridEnabled, selectedColor, colorFilter,
    onNewCard, onZoomIn, onZoomOut, onZoomReset,
    onColorSelect, onColorFilter, onGridToggle, onSearch,
  } = props;

  const [searchText, setSearchText] = useState('');

  const handleSearchInput = useCallback((e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setSearchText(value);
    onSearch(value);
  }, [onSearch]);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const toolbarStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '12px',
    flexShrink: '0',
    flexWrap: 'wrap',
  };

  const btnStyle: Record<string, string> = {
    padding: '4px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#374151',
    lineHeight: '1.4',
  };

  const activeBtnStyle: Record<string, string> = {
    ...btnStyle,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6',
  };

  const zoomText: Record<string, string> = {
    fontSize: '12px',
    color: '#64748b',
    minWidth: '40px',
    textAlign: 'center',
    cursor: 'pointer',
  };

  const separatorStyle: Record<string, string> = {
    width: '1px',
    height: '20px',
    backgroundColor: '#e2e8f0',
    margin: '0 4px',
  };

  const inputStyle: Record<string, string> = {
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    width: '120px',
    outline: 'none',
  };

  // Color swatches — click selects color for new cards; if already selected,
  // toggles color filter. Click active filter to clear.
  const swatches = CARD_COLORS.map((color: string) => {
    const isActive = color === selectedColor;
    const isFiltered = color === colorFilter;

    const handleSwatchClick = () => {
      if (isActive && onColorFilter) {
        // Already selected: toggle filter
        onColorFilter(isFiltered ? null : color);
      } else {
        onColorSelect(color);
      }
    };

    let borderStyle = '1px solid rgba(0,0,0,0.15)';
    if (isFiltered) {
      borderStyle = '3px solid #ef4444';
    } else if (isActive) {
      borderStyle = '2px solid #3b82f6';
    }

    const isTransparent = color === 'transparent';
    return createElement('button', {
      key: color,
      title: isTransparent ? 'Transparent' : color,
      style: {
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: isTransparent ? '#ffffff' : color,
        backgroundImage: isTransparent
          ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)'
          : 'none',
        backgroundSize: isTransparent ? '6px 6px' : 'auto',
        backgroundPosition: isTransparent ? '0 0, 3px 3px' : '0 0',
        border: borderStyle,
        cursor: 'pointer',
        padding: '0',
        flexShrink: '0',
        opacity: isFiltered ? '1' : (colorFilter ? '0.5' : '1'),
      },
      onClick: handleSwatchClick,
      'aria-label': isFiltered ? `Clear color filter ${color}` : `Select color ${color}`,
      'data-testid': `color-swatch-${color}`,
    });
  });

  return createElement('div', {
    className: 'board-toolbar',
    style: toolbarStyle,
    role: 'toolbar',
    'aria-label': 'Board toolbar',
    'data-testid': 'board-toolbar',
  },
    // New card button
    createElement('button', {
      style: btnStyle,
      onClick: onNewCard,
      'data-testid': 'btn-new-card',
      'aria-label': 'New card',
    }, '+ New Card'),

    createElement('div', { style: separatorStyle }),

    // Zoom controls
    createElement('button', {
      style: btnStyle,
      onClick: onZoomOut,
      'data-testid': 'btn-zoom-out',
      'aria-label': 'Zoom out',
    }, '-'),
    createElement('span', {
      style: zoomText,
      onClick: onZoomReset,
      'data-testid': 'zoom-level',
      role: 'status',
      'aria-label': `Zoom ${Math.round(zoom * 100)}%`,
    }, `${Math.round(zoom * 100)}%`),
    createElement('button', {
      style: btnStyle,
      onClick: onZoomIn,
      'data-testid': 'btn-zoom-in',
      'aria-label': 'Zoom in',
    }, '+'),

    createElement('div', { style: separatorStyle }),

    // Color palette
    ...swatches,

    createElement('div', { style: separatorStyle }),

    // Grid toggle
    createElement('button', {
      style: gridEnabled ? activeBtnStyle : btnStyle,
      onClick: onGridToggle,
      'data-testid': 'btn-grid-toggle',
      'aria-label': gridEnabled ? 'Disable grid snapping' : 'Enable grid snapping',
      'aria-pressed': String(gridEnabled),
    }, 'Grid'),

    createElement('div', { style: separatorStyle }),

    // Search
    createElement('input', {
      type: 'text',
      placeholder: 'Search cards...',
      value: searchText,
      onInput: handleSearchInput,
      style: inputStyle,
      'data-testid': 'search-input',
      'aria-label': 'Search cards',
    }),
  );
}
