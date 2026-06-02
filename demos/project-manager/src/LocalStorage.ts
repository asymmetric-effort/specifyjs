// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * LocalStorage.ts -- localStorage persistence implementation for BoardStorage.
 */

import type { BoardState, BoardStorage } from './types';

const DEFAULT_STATE: BoardState = {
  cards: [],
  connections: [],
  viewport: { panX: 0, panY: 0, zoom: 1 },
};

export class LocalBoardStorage implements BoardStorage {
  async load(boardId: string): Promise<BoardState> {
    try {
      const raw = localStorage.getItem('board:' + boardId);
      if (!raw) return DEFAULT_STATE;
      const parsed = JSON.parse(raw);
      return parsed as BoardState;
    } catch {
      return DEFAULT_STATE;
    }
  }

  async save(boardId: string, state: BoardState): Promise<void> {
    try {
      localStorage.setItem('board:' + boardId, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }
}
