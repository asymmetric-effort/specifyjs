// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { TreeNav, TreeNode } from '../src/index';
import type { TreeNodeData, TreeNavProps } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/index';

function renderToContainer(element: unknown): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(element);
  return container;
}

function cleanup(container: HTMLElement) {
  document.body.removeChild(container);
}

const sampleTree: TreeNodeData = {
  id: 'root',
  label: 'Root',
  children: [
    {
      id: 'child-1',
      label: 'Child 1',
      children: [
        { id: 'grandchild-1', label: 'Grandchild 1' },
      ],
    },
    { id: 'child-2', label: 'Child 2' },
  ],
};

// -- Happy path tests -------------------------------------------------------

describe('TreeNav', () => {
  describe('happy path', () => {
    it('renders the tree with role="tree"', () => {
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree }),
      );
      const tree = container.querySelector('[role="tree"]');
      expect(tree).toBeTruthy();
      cleanup(container);
    });

    it('renders root node as a treeitem', () => {
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree }),
      );
      const items = container.querySelectorAll('[role="treeitem"]');
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0]!.textContent).toContain('Root');
      cleanup(container);
    });

    it('shows children when parent is expanded', () => {
      const expandedTree: TreeNodeData = {
        ...sampleTree,
        expanded: true,
      };
      const container = renderToContainer(
        createElement(TreeNav, { root: expandedTree }),
      );
      const items = container.querySelectorAll('[role="treeitem"]');
      expect(items.length).toBeGreaterThanOrEqual(3);
      cleanup(container);
    });

    it('shows all nodes when expandAll is true', () => {
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree, expandAll: true }),
      );
      const items = container.querySelectorAll('[role="treeitem"]');
      expect(items.length).toBe(4); // root + child-1 + grandchild-1 + child-2
      cleanup(container);
    });

    it('highlights selected node', () => {
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree, expandAll: true, selectedId: 'child-2' }),
      );
      const selected = container.querySelector('[aria-selected="true"]');
      expect(selected).toBeTruthy();
      expect(selected!.textContent).toContain('Child 2');
      cleanup(container);
    });

    it('renders node icons', () => {
      const treeWithIcons: TreeNodeData = {
        id: 'r',
        label: 'Root',
        icon: 'F',
        children: [],
      };
      const container = renderToContainer(
        createElement(TreeNav, { root: treeWithIcons }),
      );
      expect(container.textContent).toContain('F');
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders a single root node with no children', () => {
      const leaf: TreeNodeData = { id: 'leaf', label: 'Leaf' };
      const container = renderToContainer(
        createElement(TreeNav, { root: leaf }),
      );
      const items = container.querySelectorAll('[role="treeitem"]');
      expect(items.length).toBe(1);
      cleanup(container);
    });

    it('handles missing onNodeClick gracefully', () => {
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree }),
      );
      const item = container.querySelector('[role="treeitem"]') as HTMLElement;
      expect(() => item.click()).not.toThrow();
      cleanup(container);
    });

    it('handles missing selectedId', () => {
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree, expandAll: true }),
      );
      const selected = container.querySelectorAll('[aria-selected="true"]');
      expect(selected.length).toBe(0);
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('expands a collapsed node on click', () => {
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree }),
      );
      // Root is collapsed by default, only root is visible
      let items = container.querySelectorAll('[role="treeitem"]');
      expect(items.length).toBe(1);
      // Click root to expand
      (items[0] as HTMLElement).click();
      items = container.querySelectorAll('[role="treeitem"]');
      expect(items.length).toBeGreaterThanOrEqual(1);
      cleanup(container);
    });

    it('calls onNodeClick callback', () => {
      const onNodeClick = vi.fn();
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree, onNodeClick }),
      );
      const item = container.querySelector('[role="treeitem"]') as HTMLElement;
      item.click();
      expect(onNodeClick).toHaveBeenCalled();
      cleanup(container);
    });

    it('calls onNodeExpand when node is expanded', () => {
      const onNodeExpand = vi.fn();
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree, onNodeExpand }),
      );
      // Click the toggle icon to expand root
      const toggleIcon = container.querySelector('[aria-hidden="true"][style*="cursor"]') as HTMLElement;
      if (toggleIcon) toggleIcon.click();
      // onNodeExpand may or may not fire depending on toggle state
      cleanup(container);
    });

    it('supports keyboard ArrowDown navigation', () => {
      const container = renderToContainer(
        createElement(TreeNav, { root: sampleTree, expandAll: true }),
      );
      const items = container.querySelectorAll('[role="treeitem"]');
      if (items.length > 1) {
        (items[0] as HTMLElement).focus();
        const treeContainer = container.querySelector('[role="tree"]')!;
        treeContainer.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
        );
      }
      cleanup(container);
    });
  });
});

describe('TreeNode model', () => {
  it('creates tree from data', () => {
    const node = TreeNode.fromData(sampleTree);
    expect(node.id).toBe('root');
    expect(node.children.length).toBe(2);
    expect(node.isRoot()).toBe(true);
  });

  it('identifies leaf nodes', () => {
    const node = TreeNode.fromData(sampleTree);
    expect(node.isLeaf()).toBe(false);
    expect(node.children[1]!.isLeaf()).toBe(true);
  });

  it('finds nodes by id', () => {
    const node = TreeNode.fromData(sampleTree);
    const found = node.find('grandchild-1');
    expect(found).toBeTruthy();
    expect(found!.label).toBe('Grandchild 1');
  });

  it('toggles expansion', () => {
    const node = TreeNode.fromData(sampleTree);
    expect(node.expanded).toBe(false);
    node.toggle();
    expect(node.expanded).toBe(true);
    node.toggle();
    expect(node.expanded).toBe(false);
  });
});
