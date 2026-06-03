// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Card.ts -- Re-exports the CardComponent from the reusable Board library.
 * Keeps demo-specific constants (context menu colors, priority options).
 */

// Re-export the reusable Card component and its constants
export { CardComponent as Card, PRIORITY_COLORS, CARD_TYPE_OPTIONS } from '../../../components/data/board/src/Card';
export type { CardComponentProps as CardProps } from '../../../components/data/board/src/Card';

// Demo-specific: context menu color options (same as toolbar CARD_COLORS)
import { CARD_COLORS } from './Toolbar';
export const CONTEXT_MENU_COLORS = CARD_COLORS;

export const PRIORITY_OPTIONS: Array<{ label: string; value: 'low' | 'medium' | 'high' | 'critical' }> = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];
