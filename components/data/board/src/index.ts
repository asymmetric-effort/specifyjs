// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

// Types
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
} from './types';

export { isCard, isContainer, generateUUID, getItemId, getItemName } from './types';

// Namespace validation
export { validateNameInScope, validateNameInBoard, validateNameForNesting } from './NamespaceValidator';

// State management
export type { BoardAction, HistoryState, UseBoardReducerResult } from './BoardReducer';
export { boardReducer, historyReducer, useBoardReducer, DEFAULT_BOARD_STATE } from './BoardReducer';

// Components
export { Board } from './Board';
export type { BoardProps } from './Board';

export { ContainerComponent } from './Container';
export type { ContainerComponentProps } from './Container';

export { CardComponent, PRIORITY_COLORS, CARD_TYPE_OPTIONS } from './Card';
export type { CardComponentProps } from './Card';

export { CardLinkOverlay } from './CardLink';
export type { CardLinkOverlayProps } from './CardLink';
