// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * types.ts -- All data model interfaces for the Board component family.
 */

// ---------------------------------------------------------------------------
// Content types
// ---------------------------------------------------------------------------

export interface TextContent {
  text: string;
}

export interface JsonContent {
  [key: string]: unknown;
}

export interface TaskContent {
  [key: string]: unknown;
}

export interface ProjectContent {
  project_id: string;
  project_name: string;
}

// ---------------------------------------------------------------------------
// Card type discriminator
// ---------------------------------------------------------------------------

export type CardType = 'text' | 'json' | 'task' | 'project';

// ---------------------------------------------------------------------------
// CardLink
// ---------------------------------------------------------------------------

export interface CardLink {
  link_id: string;
  link_name: string;
  target_card_id: string;
  color: string;
  attributes: Record<number, string>;
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export interface Card {
  type: 'card';
  card_id: string;
  card_type: CardType;
  card_title: string;
  card_link: CardLink[];
  content: TextContent | JsonContent | TaskContent | ProjectContent;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------

export interface Container {
  type: 'container';
  container_id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  contents: BoardItem[];
}

// ---------------------------------------------------------------------------
// BoardItem (union type)
// ---------------------------------------------------------------------------

export type BoardItem = Container | Card;

// ---------------------------------------------------------------------------
// BoardState
// ---------------------------------------------------------------------------

export interface BoardState {
  id: string;
  name: string;
  collection: BoardItem[];
  viewport: { panX: number; panY: number; zoom: number };
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

export function isCard(item: BoardItem): item is Card {
  return item.type === 'card';
}

export function isContainer(item: BoardItem): item is Container {
  return item.type === 'container';
}

// ---------------------------------------------------------------------------
// UUID generator with fallback
// ---------------------------------------------------------------------------

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: RFC 4122 v4 UUID pattern
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Helper: get item ID regardless of type
// ---------------------------------------------------------------------------

export function getItemId(item: BoardItem): string {
  return isCard(item) ? item.card_id : item.container_id;
}

// ---------------------------------------------------------------------------
// Helper: get item name/title regardless of type
// ---------------------------------------------------------------------------

export function getItemName(item: BoardItem): string {
  return isCard(item) ? item.card_title : item.name;
}
