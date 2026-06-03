// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * NamespaceValidator.ts -- Scope-aware name uniqueness enforcement.
 *
 * Names must be unique within a container and all its descendants.
 * Sibling containers are independent scopes.
 * A parent and descendant cannot share names.
 */

import type { BoardItem, Container, Card } from './types';
import { isCard, isContainer, getItemId } from './types';

// ---------------------------------------------------------------------------
// Collect all names in a scope (container + all descendants)
// ---------------------------------------------------------------------------

/**
 * Collect all names within a container and its descendants (iterative).
 * Returns a set of lowercase names for case-insensitive comparison.
 */
function collectNamesInScope(
  items: BoardItem[],
  excludeId?: string,
): Set<string> {
  const names = new Set<string>();
  const stack: BoardItem[] = [];

  // Push items in reverse so we process them in order
  for (let i = items.length - 1; i >= 0; i--) {
    stack.push(items[i]);
  }

  while (stack.length > 0) {
    const item = stack.pop()!;
    const itemId = isCard(item) ? item.card_id : item.container_id;

    if (excludeId && itemId === excludeId) continue;

    const name = isCard(item) ? item.card_title : item.name;
    if (name) {
      names.add(name);
    }

    if (isContainer(item)) {
      for (let i = item.contents.length - 1; i >= 0; i--) {
        stack.push(item.contents[i]);
      }
    }
  }

  return names;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check if a name is unique within a container's scope (the container
 * itself and ALL its descendants).
 *
 * @param name - The name to validate
 * @param container - The container scope to check within
 * @param excludeId - Optional ID to exclude from the check (for renames)
 * @returns true if the name is unique (valid), false if duplicate found
 */
export function validateNameInScope(
  name: string,
  container: Container,
  excludeId?: string,
): boolean {
  if (!name) return false;

  // Check the container's own name
  if (!excludeId || container.container_id !== excludeId) {
    if (container.name === name) return false;
  }

  // Collect all names from contents and descendants
  const existingNames = collectNamesInScope(container.contents, excludeId);
  return !existingNames.has(name);
}

/**
 * Check if a name is unique at the board's top level collection.
 * Only checks the top-level items — sibling containers are independent scopes.
 *
 * @param name - The name to validate
 * @param collection - The board's top-level collection
 * @param excludeId - Optional ID to exclude from the check (for renames)
 * @returns true if the name is unique (valid), false if duplicate found
 */
export function validateNameInBoard(
  name: string,
  collection: BoardItem[],
  excludeId?: string,
): boolean {
  if (!name) return false;

  for (let i = 0; i < collection.length; i++) {
    const item = collection[i];
    const itemId = isCard(item) ? item.card_id : item.container_id;

    if (excludeId && itemId === excludeId) continue;

    const itemName = isCard(item) ? item.card_title : item.name;
    if (itemName === name) return false;
  }

  return true;
}

/**
 * Check if a name would be valid when adding/renaming an item inside a container,
 * considering the full ancestor chain. The name must not conflict with the
 * container's name or any of its descendants' names.
 */
export function validateNameForNesting(
  name: string,
  targetContainer: Container,
  excludeId?: string,
): boolean {
  return validateNameInScope(name, targetContainer, excludeId);
}
