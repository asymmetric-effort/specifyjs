// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Board.ts -- Thin wrapper around the reusable Board component.
 * Re-exports the Board and its helpers from the library.
 * Keeps demo-specific helpers (computeFitAll) locally.
 */

import type { Card, BoardItem } from './types';
import { isCard, isContainer } from './types';

// Re-export the reusable Board component and helpers
export { Board } from '../../../components/data/board/src/Board';
export { snapToGrid, screenToCanvas } from '../../../components/data/board/src/Board';
export type { BoardProps } from '../../../components/data/board/src/Board';

// ---------------------------------------------------------------------------
// Demo-specific helper: fit-all bounding box calculation
// ---------------------------------------------------------------------------

/**
 * Collect all cards from a BoardItem tree (iterative).
 */
function collectAllCards(items: BoardItem[]): Card[] {
  const cards: Card[] = [];
  const stack: BoardItem[] = [...items];
  while (stack.length > 0) {
    const item = stack.pop()!;
    if (isCard(item)) {
      cards.push(item);
    } else if (isContainer(item)) {
      for (let i = item.contents.length - 1; i >= 0; i--) {
        stack.push(item.contents[i]);
      }
    }
  }
  return cards;
}

export function computeFitAll(
  collection: BoardItem[],
  containerWidth: number,
  containerHeight: number,
  padding?: number,
): { panX: number; panY: number; zoom: number } {
  const pad = padding ?? 40;
  const cards = collectAllCards(collection);
  if (cards.length === 0) {
    return { panX: 0, panY: 0, zoom: 1 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (c.position.x < minX) minX = c.position.x;
    if (c.position.y < minY) minY = c.position.y;
    const right = c.position.x + c.size.width;
    const bottom = c.position.y + c.size.height;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }
  const contentW = maxX - minX + pad * 2;
  const contentH = maxY - minY + pad * 2;
  const zoomX = containerWidth / contentW;
  const zoomY = containerHeight / contentH;
  const zoom = Math.max(0.25, Math.min(4.0, Math.min(zoomX, zoomY)));
  const panX = -minX * zoom + (containerWidth - (maxX - minX) * zoom) / 2;
  const panY = -minY * zoom + (containerHeight - (maxY - minY) * zoom) / 2;
  return { panX, panY, zoom };
}
