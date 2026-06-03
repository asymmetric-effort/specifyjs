// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * types.ts -- Re-exports types from the reusable Board component library.
 * Keeps demo-specific interfaces (BoardStorage) locally.
 */

// Re-export all types from the reusable board library
export type {
  BoardState,
  BoardItem,
  Card,
  Container,
  CardLink,
  CardType,
  TextContent,
  JsonContent,
  TaskContent,
  ProjectContent,
} from '../../../components/data/board/src/types';

export {
  isCard,
  isContainer,
  generateUUID,
  getItemId,
  getItemName,
} from '../../../components/data/board/src/types';

// ---------------------------------------------------------------------------
// Demo-specific: storage interface
// ---------------------------------------------------------------------------

export interface BoardStorage {
  load(boardId: string): Promise<import('../../../components/data/board/src/types').BoardState>;
  save(boardId: string, state: import('../../../components/data/board/src/types').BoardState): Promise<void>;
}
