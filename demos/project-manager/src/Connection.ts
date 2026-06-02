// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Connection.ts -- SVG overlay for rendering connection lines between cards.
 */

import { createElement } from 'specifyjs';
import { useCallback } from 'specifyjs/hooks';
import type { ProjectCard, CardConnection } from './types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ConnectionsOverlayProps {
  connections: CardConnection[];
  cards: ProjectCard[];
  selectedConnectionId: string | null;
  onSelectConnection: (connectionId: string | null) => void;
  onDeleteConnection: (connectionId: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCardCenter(card: ProjectCard): { x: number; y: number } {
  return {
    x: card.position.x + card.size.width / 2,
    y: card.position.y + card.size.height / 2,
  };
}

function getStrokeDasharray(style?: 'solid' | 'dashed' | 'dotted'): string {
  switch (style) {
    case 'dashed': return '8,4';
    case 'dotted': return '2,4';
    default: return 'none';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConnectionsOverlay(props: ConnectionsOverlayProps) {
  const { connections, cards, selectedConnectionId, onSelectConnection, canvasWidth, canvasHeight } = props;

  const cardMap = new Map<string, ProjectCard>();
  for (let i = 0; i < cards.length; i++) {
    cardMap.set(cards[i].id, cards[i]);
  }

  const handleLineClick = useCallback((connectionId: string) => {
    onSelectConnection(connectionId);
  }, [onSelectConnection]);

  const lineElements: unknown[] = [];

  for (let i = 0; i < connections.length; i++) {
    const conn = connections[i];
    const fromCard = cardMap.get(conn.fromCardId);
    const toCard = cardMap.get(conn.toCardId);
    if (!fromCard || !toCard) continue;

    const from = getCardCenter(fromCard);
    const to = getCardCenter(toCard);
    const isSelected = conn.id === selectedConnectionId;
    const strokeColor = isSelected ? '#3b82f6' : '#94a3b8';
    const dashArray = getStrokeDasharray(conn.style);

    // Compute a perpendicular offset for the quadratic bezier control point
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const curveOffset = Math.min(40, dist * 0.15);
    // Perpendicular direction (normalized)
    const nx = dist > 0 ? -dy / dist : 0;
    const ny = dist > 0 ? dx / dist : 0;
    // Control point at midpoint offset perpendicular
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const cpX = midX + nx * curveOffset;
    const cpY = midY + ny * curveOffset;
    const pathD = `M ${from.x} ${from.y} Q ${cpX} ${cpY} ${to.x} ${to.y}`;

    // Invisible hit area (wider)
    lineElements.push(
      createElement('path', {
        key: `hit-${conn.id}`,
        d: pathD,
        fill: 'none',
        stroke: 'transparent',
        'stroke-width': '12',
        style: { cursor: 'pointer' },
        onClick: () => handleLineClick(conn.id),
        'data-testid': `connection-hit-${conn.id}`,
      }),
    );

    // Visible curve
    lineElements.push(
      createElement('path', {
        key: conn.id,
        d: pathD,
        fill: 'none',
        stroke: strokeColor,
        'stroke-width': isSelected ? '3' : '2',
        'stroke-dasharray': dashArray,
        'pointer-events': 'none',
        'data-testid': `connection-${conn.id}`,
      }),
    );

    // Label at midpoint (slightly above the curve)
    if (conn.label) {
      lineElements.push(
        createElement('text', {
          key: `label-${conn.id}`,
          x: String(cpX),
          y: String(cpY - 6),
          'text-anchor': 'middle',
          fill: '#64748b',
          'font-size': '11',
          'pointer-events': 'none',
        }, conn.label),
      );
    }
  }

  const svgStyle: Record<string, string> = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'visible',
  };

  return createElement('svg', {
    style: svgStyle,
    width: String(canvasWidth),
    height: String(canvasHeight),
    className: 'connections-overlay',
    'data-testid': 'connections-overlay',
    role: 'img',
    'aria-label': 'Card connections',
  },
    createElement('g', { style: { pointerEvents: 'auto' } }, ...lineElements),
  );
}
