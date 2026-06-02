// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * types.ts -- Interfaces for the Whiteboard Project Manager.
 */

export interface ProjectCard {
  id: string;
  title: string;
  description: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CardConnection {
  id: string;
  fromCardId: string;
  toCardId: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface BoardState {
  cards: ProjectCard[];
  connections: CardConnection[];
  viewport: {
    panX: number;
    panY: number;
    zoom: number;
  };
}

export interface BoardStorage {
  load(boardId: string): Promise<BoardState>;
  save(boardId: string, state: BoardState): Promise<void>;
}
