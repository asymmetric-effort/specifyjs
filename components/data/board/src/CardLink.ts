// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * CardLink.ts -- SVG arrow renderer for unidirectional links between cards.
 * Uses quadratic bezier curves with arrow heads and midpoint labels.
 */

import { createElement } from '../../../../core/src/index';
import { useCallback } from '../../../../core/src/hooks/index';
import type { Card, CardLink } from './types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CardLinkOverlayProps {
  links: Array<{ source: Card; link: CardLink }>;
  cards: Card[];
  selectedLinkId: string | null;
  onSelectLink: (linkId: string | null) => void;
  canvasWidth: number;
  canvasHeight: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCardAnchors(card: Card): { top: { x: number; y: number }; right: { x: number; y: number }; bottom: { x: number; y: number }; left: { x: number; y: number } } {
  const cx = card.position.x + card.size.width / 2;
  const cy = card.position.y + card.size.height / 2;
  return {
    top: { x: cx, y: card.position.y },
    right: { x: card.position.x + card.size.width, y: cy },
    bottom: { x: cx, y: card.position.y + card.size.height },
    left: { x: card.position.x, y: cy },
  };
}

function getNearestAnchors(source: Card, target: Card): { from: { x: number; y: number }; to: { x: number; y: number } } {
  const sa = getCardAnchors(source);
  const ta = getCardAnchors(target);
  const sourceAnchors = [sa.top, sa.right, sa.bottom, sa.left];
  const targetAnchors = [ta.top, ta.right, ta.bottom, ta.left];

  let bestDist = Infinity;
  let bestFrom = sa.right;
  let bestTo = ta.left;

  for (let i = 0; i < sourceAnchors.length; i++) {
    for (let j = 0; j < targetAnchors.length; j++) {
      const dx = targetAnchors[j].x - sourceAnchors[i].x;
      const dy = targetAnchors[j].y - sourceAnchors[i].y;
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        bestFrom = sourceAnchors[i];
        bestTo = targetAnchors[j];
      }
    }
  }

  return { from: bestFrom, to: bestTo };
}

// ---------------------------------------------------------------------------
// Arrow marker definition ID
// ---------------------------------------------------------------------------

const ARROW_MARKER_ID = 'board-card-link-arrowhead';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CardLinkOverlay(props: CardLinkOverlayProps) {
  const { links, cards, selectedLinkId, onSelectLink, canvasWidth, canvasHeight } = props;

  const cardMap = new Map<string, Card>();
  for (let i = 0; i < cards.length; i++) {
    cardMap.set(cards[i].card_id, cards[i]);
  }

  const handleLineClick = useCallback((linkId: string) => {
    onSelectLink(linkId);
  }, [onSelectLink]);

  const lineElements: unknown[] = [];

  for (let i = 0; i < links.length; i++) {
    const { source, link } = links[i];
    const targetCard = cardMap.get(link.target_card_id);
    if (!targetCard) continue;

    const { from, to } = getNearestAnchors(source, targetCard);
    const isSelected = link.link_id === selectedLinkId;
    const strokeColor = isSelected ? '#3b82f6' : (link.color || '#94a3b8');

    // Compute quadratic bezier control point (perpendicular offset)
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const curveOffset = Math.min(40, dist * 0.15);
    const nx = dist > 0 ? -dy / dist : 0;
    const ny = dist > 0 ? dx / dist : 0;
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const cpX = midX + nx * curveOffset;
    const cpY = midY + ny * curveOffset;
    const pathD = `M ${from.x} ${from.y} Q ${cpX} ${cpY} ${to.x} ${to.y}`;

    // Invisible hit area (wider stroke for easier clicking)
    lineElements.push(
      createElement('path', {
        key: `hit-${link.link_id}`,
        d: pathD,
        fill: 'none',
        stroke: 'transparent',
        'stroke-width': '12',
        style: { cursor: 'pointer' },
        onClick: () => handleLineClick(link.link_id),
        'data-testid': `link-hit-${link.link_id}`,
      }),
    );

    // Visible curve with arrow marker
    lineElements.push(
      createElement('path', {
        key: link.link_id,
        d: pathD,
        fill: 'none',
        stroke: strokeColor,
        'stroke-width': isSelected ? '3' : '2',
        'pointer-events': 'none',
        'marker-end': `url(#${ARROW_MARKER_ID})`,
        'data-testid': `link-${link.link_id}`,
      }),
    );

    // Label at midpoint
    if (link.link_name) {
      lineElements.push(
        createElement('text', {
          key: `label-${link.link_id}`,
          x: String(cpX),
          y: String(cpY - 6),
          'text-anchor': 'middle',
          fill: '#64748b',
          'font-size': '11',
          'pointer-events': 'none',
          'data-testid': `link-label-${link.link_id}`,
        }, link.link_name),
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
    zIndex: '9999',
  };

  // Arrow marker definition
  const markerDef = createElement('defs', {},
    createElement('marker', {
      id: ARROW_MARKER_ID,
      viewBox: '0 0 10 10',
      refX: '10',
      refY: '5',
      markerWidth: '8',
      markerHeight: '8',
      orient: 'auto-start-reverse',
    },
      createElement('path', {
        d: 'M 0 0 L 10 5 L 0 10 z',
        fill: '#94a3b8',
      }),
    ),
  );

  return createElement('svg', {
    style: svgStyle,
    width: String(canvasWidth),
    height: String(canvasHeight),
    className: 'card-link-overlay',
    'data-testid': 'card-link-overlay',
    role: 'img',
    'aria-label': 'Card links',
  },
    markerDef,
    createElement('g', { style: { pointerEvents: 'auto' } }, ...lineElements),
  );
}
