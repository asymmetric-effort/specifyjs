// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { validateNameInScope, validateNameInBoard, validateNameForNesting } from '../src/NamespaceValidator';
import type { Card, Container, BoardItem } from '../src/types';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeCard(id: string, title: string): Card {
  return {
    type: 'card',
    card_id: id,
    card_type: 'text',
    card_title: title,
    card_link: [],
    content: { text: '' },
    position: { x: 0, y: 0 },
    size: { width: 200, height: 150 },
    color: '#fff',
    createdAt: 0,
    updatedAt: 0,
  };
}

function makeContainer(id: string, name: string, contents: BoardItem[] = []): Container {
  return {
    type: 'container',
    container_id: id,
    name,
    position: { x: 0, y: 0 },
    size: { width: 400, height: 300 },
    contents,
  };
}

// ---------------------------------------------------------------------------
// validateNameInScope
// ---------------------------------------------------------------------------

describe('validateNameInScope', () => {
  it('returns true when no names conflict in an empty container', () => {
    const container = makeContainer('ct1', 'Group');
    expect(validateNameInScope('NewCard', container)).toBe(true);
  });

  it('returns false when name matches container name', () => {
    const container = makeContainer('ct1', 'Alpha');
    expect(validateNameInScope('Alpha', container)).toBe(false);
  });

  it('returns false when name matches a card inside the container', () => {
    const card = makeCard('c1', 'TaskA');
    const container = makeContainer('ct1', 'Group', [card]);
    expect(validateNameInScope('TaskA', container)).toBe(false);
  });

  it('returns true when name does not match any item', () => {
    const card = makeCard('c1', 'TaskA');
    const container = makeContainer('ct1', 'Group', [card]);
    expect(validateNameInScope('TaskB', container)).toBe(true);
  });

  it('detects conflict with deeply nested card', () => {
    const deepCard = makeCard('c-deep', 'DeepName');
    const inner = makeContainer('ct-inner', 'Inner', [deepCard]);
    const outer = makeContainer('ct-outer', 'Outer', [inner]);
    expect(validateNameInScope('DeepName', outer)).toBe(false);
  });

  it('detects conflict with nested container name', () => {
    const inner = makeContainer('ct-inner', 'Collider');
    const outer = makeContainer('ct-outer', 'Outer', [inner]);
    expect(validateNameInScope('Collider', outer)).toBe(false);
  });

  it('excludes item by ID when checking', () => {
    const card = makeCard('c1', 'Rename Me');
    const container = makeContainer('ct1', 'Group', [card]);
    // Renaming c1 to 'Rename Me' should be valid (same item)
    expect(validateNameInScope('Rename Me', container, 'c1')).toBe(true);
  });

  it('excludes container itself by ID', () => {
    const container = makeContainer('ct1', 'SameName');
    // Container renaming to its own name should be valid when excluded
    expect(validateNameInScope('SameName', container, 'ct1')).toBe(true);
  });

  it('still detects other conflicts when excluding an ID', () => {
    const card1 = makeCard('c1', 'Alpha');
    const card2 = makeCard('c2', 'Beta');
    const container = makeContainer('ct1', 'Group', [card1, card2]);
    // Renaming c1 to 'Beta' should fail (c2 already has that name)
    expect(validateNameInScope('Beta', container, 'c1')).toBe(false);
  });

  it('returns false for empty name', () => {
    const container = makeContainer('ct1', 'Group');
    expect(validateNameInScope('', container)).toBe(false);
  });

  it('handles 3 levels of nesting', () => {
    const l3Card = makeCard('c-l3', 'Level3Card');
    const l2 = makeContainer('ct-l2', 'Level2', [l3Card]);
    const l1 = makeContainer('ct-l1', 'Level1', [l2]);
    expect(validateNameInScope('Level3Card', l1)).toBe(false);
    expect(validateNameInScope('Level2', l1)).toBe(false);
    expect(validateNameInScope('NewName', l1)).toBe(true);
  });

  it('handles multiple items at same level', () => {
    const c1 = makeCard('c1', 'A');
    const c2 = makeCard('c2', 'B');
    const c3 = makeCard('c3', 'C');
    const container = makeContainer('ct1', 'Group', [c1, c2, c3]);
    expect(validateNameInScope('A', container)).toBe(false);
    expect(validateNameInScope('B', container)).toBe(false);
    expect(validateNameInScope('C', container)).toBe(false);
    expect(validateNameInScope('D', container)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateNameInBoard
// ---------------------------------------------------------------------------

describe('validateNameInBoard', () => {
  it('returns true when collection is empty', () => {
    expect(validateNameInBoard('Test', [])).toBe(true);
  });

  it('returns false when name matches a top-level card title', () => {
    const card = makeCard('c1', 'Duplicate');
    expect(validateNameInBoard('Duplicate', [card])).toBe(false);
  });

  it('returns false when name matches a top-level container name', () => {
    const container = makeContainer('ct1', 'Sprint 1');
    expect(validateNameInBoard('Sprint 1', [container])).toBe(false);
  });

  it('returns true when name is unique at top level', () => {
    const card = makeCard('c1', 'Alpha');
    const container = makeContainer('ct1', 'Beta');
    expect(validateNameInBoard('Gamma', [card, container])).toBe(true);
  });

  it('does NOT check nested items (sibling independence)', () => {
    const nestedCard = makeCard('c-nested', 'HiddenName');
    const container = makeContainer('ct1', 'Parent', [nestedCard]);
    // 'HiddenName' only exists inside the container, not at top level
    expect(validateNameInBoard('HiddenName', [container])).toBe(true);
  });

  it('excludes item by ID', () => {
    const card = makeCard('c1', 'MyName');
    expect(validateNameInBoard('MyName', [card], 'c1')).toBe(true);
  });

  it('still detects other conflicts when excluding an ID', () => {
    const card1 = makeCard('c1', 'Alpha');
    const card2 = makeCard('c2', 'Beta');
    expect(validateNameInBoard('Beta', [card1, card2], 'c1')).toBe(false);
  });

  it('returns false for empty name', () => {
    expect(validateNameInBoard('', [])).toBe(false);
  });

  it('handles mixed cards and containers', () => {
    const card = makeCard('c1', 'X');
    const container = makeContainer('ct1', 'Y');
    expect(validateNameInBoard('X', [card, container])).toBe(false);
    expect(validateNameInBoard('Y', [card, container])).toBe(false);
    expect(validateNameInBoard('Z', [card, container])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Sibling container independence
// ---------------------------------------------------------------------------

describe('sibling container independence', () => {
  it('two sibling containers CAN have items with the same name', () => {
    const cardA = makeCard('c-a', 'SharedName');
    const cardB = makeCard('c-b', 'SharedName');
    const containerA = makeContainer('ct-a', 'GroupA', [cardA]);
    const containerB = makeContainer('ct-b', 'GroupB', [cardB]);

    // Each container's scope is independent
    expect(validateNameInScope('SharedName', containerA)).toBe(false); // exists in A
    expect(validateNameInScope('SharedName', containerB)).toBe(false); // exists in B

    // But at board level, we only check top-level names (container names)
    expect(validateNameInBoard('SharedName', [containerA, containerB])).toBe(true);
  });

  it('sibling containers can independently have unique internal names', () => {
    const c1 = makeCard('c1', 'Task1');
    const c2 = makeCard('c2', 'Task2');
    const containerA = makeContainer('ct-a', 'Alpha', [c1]);
    const containerB = makeContainer('ct-b', 'Beta', [c2]);

    expect(validateNameInScope('Task2', containerA)).toBe(true);
    expect(validateNameInScope('Task1', containerB)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Parent-child namespace inheritance
// ---------------------------------------------------------------------------

describe('parent-child namespace inheritance', () => {
  it('a parent and descendant CANNOT share names', () => {
    const card = makeCard('c1', 'ParentName');
    const container = makeContainer('ct1', 'ParentName', [card]);
    // The container is named 'ParentName' and contains a card also named 'ParentName'
    // validateNameInScope checks container name + all descendants
    // A new item named 'ParentName' would conflict
    expect(validateNameInScope('ParentName', container)).toBe(false);
  });

  it('a child cannot duplicate ancestor container name', () => {
    const inner = makeContainer('ct-inner', 'InnerBox');
    const outer = makeContainer('ct-outer', 'OuterBox', [inner]);
    // Adding an item named 'OuterBox' inside outer should fail
    expect(validateNameInScope('OuterBox', outer)).toBe(false);
  });

  it('deeply nested item cannot share name with root container', () => {
    const deep = makeCard('c-deep', 'RootName');
    const mid = makeContainer('ct-mid', 'Mid', [deep]);
    const root = makeContainer('ct-root', 'RootName', [mid]);
    // 'RootName' appears both as root container name and deep card
    expect(validateNameInScope('RootName', root)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateNameForNesting
// ---------------------------------------------------------------------------

describe('validateNameForNesting', () => {
  it('validates name against target container scope', () => {
    const card = makeCard('c1', 'Existing');
    const container = makeContainer('ct1', 'Target', [card]);
    expect(validateNameForNesting('Existing', container)).toBe(false);
    expect(validateNameForNesting('NewItem', container)).toBe(true);
  });

  it('supports excludeId', () => {
    const card = makeCard('c1', 'Movable');
    const container = makeContainer('ct1', 'Target', [card]);
    expect(validateNameForNesting('Movable', container, 'c1')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Card name uniqueness (cards do NOT enforce uniqueness)
// ---------------------------------------------------------------------------

describe('card name uniqueness', () => {
  it('two cards with same name in same container are VALID (cards do not enforce uniqueness)', () => {
    const card1 = makeCard('c1', 'SameName');
    const card2 = makeCard('c2', 'SameName');
    const ct = makeContainer('ct1', 'Group', [card1, card2]);
    // validateNameInScope only checks container names, not card names
    // So adding another item named 'SameName' should be valid (no container has that name)
    expect(validateNameInScope('SameName', ct)).toBe(true);
  });

  it('two containers with same name in same scope are INVALID', () => {
    const inner1 = makeContainer('ct-a', 'DuplicateName');
    const inner2 = makeContainer('ct-b', 'DuplicateName');
    const outer = makeContainer('ct-outer', 'Parent', [inner1, inner2]);
    // The second container with 'DuplicateName' should conflict
    expect(validateNameInScope('DuplicateName', outer)).toBe(false);
  });

  it('card name matching container name is VALID (different types)', () => {
    const card = makeCard('c1', 'SharedLabel');
    const ct = makeContainer('ct1', 'Group', [card]);
    // 'SharedLabel' is only a card name, not a container name, so it should be valid
    expect(validateNameInScope('SharedLabel', ct)).toBe(true);
  });

  it('validateNameInBoard only checks container names, not card names', () => {
    const card1 = makeCard('c1', 'CardName');
    const card2 = makeCard('c2', 'CardName');
    // Two cards with same name at top level -- validateNameInBoard only checks containers
    expect(validateNameInBoard('CardName', [card1, card2])).toBe(true);
  });

  it('validateNameInBoard detects duplicate container names', () => {
    const ct1 = makeContainer('ct1', 'Sprint');
    const ct2 = makeContainer('ct2', 'Sprint');
    expect(validateNameInBoard('Sprint', [ct1, ct2])).toBe(false);
  });
});
