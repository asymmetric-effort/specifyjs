// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import {
  generateUUID,
  isCard,
  isContainer,
  getItemId,
  getItemName,
} from '../src/types';
import type {
  Card,
  Container,
  BoardItem,
  BoardState,
  CardLink,
  TextContent,
  JsonContent,
  TaskContent,
  ProjectContent,
  CardType,
} from '../src/types';

// ---------------------------------------------------------------------------
// generateUUID
// ---------------------------------------------------------------------------

describe('generateUUID', () => {
  it('returns a string', () => {
    const uuid = generateUUID();
    expect(typeof uuid).toBe('string');
  });

  it('returns a valid UUID v4 format', () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(uuidRegex.test(uuid)).toBe(true);
  });

  it('generates unique values on each call', () => {
    const uuids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      uuids.add(generateUUID());
    }
    expect(uuids.size).toBe(50);
  });

  it('works when crypto.randomUUID is not available', () => {
    const original = crypto.randomUUID;
    try {
      (crypto as any).randomUUID = undefined;
      const uuid = generateUUID();
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBe(36);
      // Check format: 8-4-4-4-12
      const parts = uuid.split('-');
      expect(parts.length).toBe(5);
      expect(parts[0].length).toBe(8);
      expect(parts[1].length).toBe(4);
      expect(parts[2].length).toBe(4);
      expect(parts[3].length).toBe(4);
      expect(parts[4].length).toBe(12);
    } finally {
      (crypto as any).randomUUID = original;
    }
  });

  it('fallback generates version 4 marker', () => {
    const original = crypto.randomUUID;
    try {
      (crypto as any).randomUUID = undefined;
      const uuid = generateUUID();
      // 3rd group starts with '4'
      expect(uuid.charAt(14)).toBe('4');
      // 4th group starts with 8, 9, a, or b
      expect('89ab'.includes(uuid.charAt(19))).toBe(true);
    } finally {
      (crypto as any).randomUUID = original;
    }
  });
});

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

describe('isCard', () => {
  it('returns true for card items', () => {
    const card: Card = {
      type: 'card',
      card_id: 'c1',
      card_type: 'text',
      card_title: 'Test',
      card_link: [],
      content: { text: '' },
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
      color: '#fff',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(isCard(card)).toBe(true);
  });

  it('returns false for container items', () => {
    const container: Container = {
      type: 'container',
      container_id: 'ct1',
      name: 'Test Container',
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      contents: [],
    };
    expect(isCard(container)).toBe(false);
  });
});

describe('isContainer', () => {
  it('returns true for container items', () => {
    const container: Container = {
      type: 'container',
      container_id: 'ct1',
      name: 'Group A',
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      contents: [],
    };
    expect(isContainer(container)).toBe(true);
  });

  it('returns false for card items', () => {
    const card: Card = {
      type: 'card',
      card_id: 'c1',
      card_type: 'text',
      card_title: 'Test',
      card_link: [],
      content: { text: 'hello' },
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
      color: '#fef9c3',
      createdAt: 1000,
      updatedAt: 1000,
    };
    expect(isContainer(card)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getItemId
// ---------------------------------------------------------------------------

describe('getItemId', () => {
  it('returns card_id for cards', () => {
    const card: Card = {
      type: 'card',
      card_id: 'my-card-id',
      card_type: 'json',
      card_title: 'Data',
      card_link: [],
      content: {},
      position: { x: 10, y: 20 },
      size: { width: 200, height: 150 },
      color: '#fff',
      createdAt: 0,
      updatedAt: 0,
    };
    expect(getItemId(card)).toBe('my-card-id');
  });

  it('returns container_id for containers', () => {
    const container: Container = {
      type: 'container',
      container_id: 'my-container-id',
      name: 'Box',
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 },
      contents: [],
    };
    expect(getItemId(container)).toBe('my-container-id');
  });
});

// ---------------------------------------------------------------------------
// getItemName
// ---------------------------------------------------------------------------

describe('getItemName', () => {
  it('returns card_title for cards', () => {
    const card: Card = {
      type: 'card',
      card_id: 'c1',
      card_type: 'text',
      card_title: 'My Card Title',
      card_link: [],
      content: { text: '' },
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
      color: '#fff',
      createdAt: 0,
      updatedAt: 0,
    };
    expect(getItemName(card)).toBe('My Card Title');
  });

  it('returns name for containers', () => {
    const container: Container = {
      type: 'container',
      container_id: 'ct1',
      name: 'Sprint 1',
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 },
      contents: [],
    };
    expect(getItemName(container)).toBe('Sprint 1');
  });
});

// ---------------------------------------------------------------------------
// Interface shape tests (compile-time validation + runtime checks)
// ---------------------------------------------------------------------------

describe('BoardState interface', () => {
  it('has required fields', () => {
    const state: BoardState = {
      id: 'board-1',
      name: 'My Board',
      collection: [],
      viewport: { panX: 0, panY: 0, zoom: 1 },
    };
    expect(state.id).toBe('board-1');
    expect(state.name).toBe('My Board');
    expect(state.collection).toEqual([]);
    expect(state.viewport.zoom).toBe(1);
  });

  it('collection can contain mixed items', () => {
    const card: Card = {
      type: 'card',
      card_id: 'c1',
      card_type: 'text',
      card_title: 'Note',
      card_link: [],
      content: { text: 'hello' },
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
      color: '#fef9c3',
      createdAt: 0,
      updatedAt: 0,
    };
    const container: Container = {
      type: 'container',
      container_id: 'ct1',
      name: 'Group',
      position: { x: 300, y: 0 },
      size: { width: 400, height: 300 },
      contents: [],
    };
    const state: BoardState = {
      id: 'b1',
      name: 'Test',
      collection: [card, container],
      viewport: { panX: 0, panY: 0, zoom: 1 },
    };
    expect(state.collection.length).toBe(2);
  });
});

describe('Card interface', () => {
  it('supports all card types', () => {
    const types: CardType[] = ['text', 'json', 'task', 'project'];
    for (let i = 0; i < types.length; i++) {
      const card: Card = {
        type: 'card',
        card_id: `card-${i}`,
        card_type: types[i],
        card_title: `Card ${i}`,
        card_link: [],
        content: types[i] === 'text' ? { text: '' } : {},
        position: { x: 0, y: 0 },
        size: { width: 200, height: 150 },
        color: '#fff',
        createdAt: 0,
        updatedAt: 0,
      };
      expect(card.card_type).toBe(types[i]);
    }
  });

  it('supports optional fields', () => {
    const card: Card = {
      type: 'card',
      card_id: 'c1',
      card_type: 'text',
      card_title: 'Test',
      card_link: [],
      content: { text: '' },
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
      color: '#fff',
      priority: 'high',
      assignee: 'john',
      tags: ['urgent', 'bug'],
      createdAt: 1000,
      updatedAt: 2000,
    };
    expect(card.priority).toBe('high');
    expect(card.assignee).toBe('john');
    expect(card.tags).toEqual(['urgent', 'bug']);
  });

  it('supports card_link array', () => {
    const link: CardLink = {
      link_id: 'link-1',
      link_name: 'depends on',
      target_card_id: 'c2',
      color: '#3b82f6',
      attributes: { 0: 'blocking' },
    };
    const card: Card = {
      type: 'card',
      card_id: 'c1',
      card_type: 'text',
      card_title: 'Origin',
      card_link: [link],
      content: { text: '' },
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
      color: '#fff',
      createdAt: 0,
      updatedAt: 0,
    };
    expect(card.card_link.length).toBe(1);
    expect(card.card_link[0].link_name).toBe('depends on');
  });
});

describe('Container interface', () => {
  it('supports nested containers', () => {
    const inner: Container = {
      type: 'container',
      container_id: 'inner',
      name: 'Inner',
      position: { x: 10, y: 10 },
      size: { width: 200, height: 150 },
      contents: [],
    };
    const outer: Container = {
      type: 'container',
      container_id: 'outer',
      name: 'Outer',
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      contents: [inner],
    };
    expect(outer.contents.length).toBe(1);
    expect(isContainer(outer.contents[0])).toBe(true);
  });

  it('can contain mixed cards and containers', () => {
    const card: Card = {
      type: 'card',
      card_id: 'c1',
      card_type: 'task',
      card_title: 'Do thing',
      card_link: [],
      content: {},
      position: { x: 0, y: 0 },
      size: { width: 200, height: 100 },
      color: '#fff',
      createdAt: 0,
      updatedAt: 0,
    };
    const container: Container = {
      type: 'container',
      container_id: 'ct1',
      name: 'Sprint',
      position: { x: 0, y: 0 },
      size: { width: 500, height: 400 },
      contents: [card],
    };
    expect(container.contents.length).toBe(1);
    expect(isCard(container.contents[0])).toBe(true);
  });
});

describe('CardLink interface', () => {
  it('has all required fields', () => {
    const link: CardLink = {
      link_id: 'l1',
      link_name: 'blocks',
      target_card_id: 'c2',
      color: '#ef4444',
      attributes: { 0: 'critical', 1: 'review' },
    };
    expect(link.link_id).toBe('l1');
    expect(link.link_name).toBe('blocks');
    expect(link.target_card_id).toBe('c2');
    expect(link.color).toBe('#ef4444');
    expect(link.attributes[0]).toBe('critical');
    expect(link.attributes[1]).toBe('review');
  });

  it('attributes can be empty', () => {
    const link: CardLink = {
      link_id: 'l2',
      link_name: 'related',
      target_card_id: 'c3',
      color: '#22c55e',
      attributes: {},
    };
    expect(Object.keys(link.attributes).length).toBe(0);
  });
});

describe('Content types', () => {
  it('TextContent has text field', () => {
    const content: TextContent = { text: 'Hello world' };
    expect(content.text).toBe('Hello world');
  });

  it('JsonContent is a Record', () => {
    const content: JsonContent = { name: 'Alice', age: 30, active: true };
    expect(content.name).toBe('Alice');
    expect(content.age).toBe(30);
  });

  it('TaskContent can be empty', () => {
    const content: TaskContent = {};
    expect(Object.keys(content).length).toBe(0);
  });

  it('ProjectContent has project_id and project_name', () => {
    const content: ProjectContent = { project_id: 'proj-1', project_name: 'Alpha' };
    expect(content.project_id).toBe('proj-1');
    expect(content.project_name).toBe('Alpha');
  });
});
