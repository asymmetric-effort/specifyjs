// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { SceneObject } from './scene-object';

/** Scene graph that manages a hierarchy of scene objects. */
export class SceneGraph {
  /** Invisible root node. All registered objects are children of root. */
  readonly root: SceneObject;

  constructor() {
    this.root = new SceneObject('__root__');
    this.root.visible = false;
  }

  /** Register a scene object by adding it as a child of the root. */
  register(obj: SceneObject): void {
    this.root.addChild(obj);
  }

  /** Unregister a scene object by id. Removes it from its parent. */
  unregister(id: string): void {
    const found = this.findById(id);
    if (found && found.parent) {
      found.parent.removeChild(found);
    }
  }

  /**
   * Depth-first traversal of all objects in the scene graph.
   * Uses an iterative approach with an explicit stack.
   */
  traverse(callback: (obj: SceneObject) => void): void {
    const stack: SceneObject[] = [];
    // Push children in reverse so leftmost is processed first
    for (let i = this.root.children.length - 1; i >= 0; i--) {
      stack.push(this.root.children[i]!);
    }
    while (stack.length > 0) {
      const node = stack.pop()!;
      callback(node);
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]!);
      }
    }
  }

  /** Return all visible objects via depth-first traversal. */
  getVisibleObjects(): SceneObject[] {
    const result: SceneObject[] = [];
    this.traverse((obj) => {
      if (obj.visible) {
        result.push(obj);
      }
    });
    return result;
  }

  /** Find an object by id using depth-first search. Returns null if not found. */
  private findById(id: string): SceneObject | null {
    let found: SceneObject | null = null;
    this.traverse((obj) => {
      if (obj.id === id) {
        found = obj;
      }
    });
    return found;
  }
}
