// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * TreeNav — Accessible tree navigation component built on NavWrapper.
 *
 * Renders a hierarchical tree with expand/collapse toggling, connector lines,
 * keyboard navigation, and optional custom node rendering. Wraps content in
 * NavWrapper with role="tree" and assigns role="treeitem" to each node row.
 */

import { createElement, type FunctionComponent } from 'specifyjs';
import { useState, useCallback, useMemo, useRef, useEffect } from 'specifyjs/hooks';
import { NavWrapper, buildNavItemStyle, useHover } from '../../wrapper/src/NavWrapper';
import type { NavItemStyle, NavWrapperStyle } from '../../wrapper/src/NavWrapper';
import { TreeNode } from './TreeNode';
import type { TreeNodeData } from './TreeNode';

// -- Props ------------------------------------------------------------------

export interface TreeNavProps {
  /** Tree data structure */
  root: TreeNodeData;
  /** Fired when a node label is clicked */
  onNodeClick?: (node: TreeNode) => void;
  /** Fired when a node is expanded */
  onNodeExpand?: (node: TreeNode) => void;
  /** Fired when a node is collapsed */
  onNodeCollapse?: (node: TreeNode) => void;
  /** Id of the currently selected node */
  selectedId?: string;
  /** Start with all nodes expanded (default: false) */
  expandAll?: boolean;
  /** Color of connector lines (default: '#000') */
  lineColor?: string;
  /** Width of connector lines in px (default: 1) */
  lineWidth?: number;
  /** Pixels of indentation per depth level (default: 20) */
  indentPx?: number;
  /** Icon shown for expanded non-leaf nodes (default: '\u2212') */
  iconExpanded?: string;
  /** Icon shown for collapsed non-leaf nodes (default: '+') */
  iconCollapsed?: string;
  /** Styling for individual node items */
  nodeStyle?: NavItemStyle;
  /** Styling for the outer NavWrapper */
  wrapperStyle?: NavWrapperStyle;
  /** Custom node renderer for full control over node appearance */
  renderNode?: (node: TreeNode, isSelected: boolean) => unknown;
}

// -- Helpers ----------------------------------------------------------------

/**
 * Recursively expand all nodes in a TreeNode tree.
 */
function expandAllNodes(node: TreeNode): void {
  node.expanded = true;
  for (const child of node.children) {
    expandAllNodes(child);
  }
}

/**
 * Collect visible (expanded) nodes into a flat list for rendering.
 */
function flattenVisible(node: TreeNode, list: TreeNode[] = []): TreeNode[] {
  list.push(node);
  if (node.expanded) {
    for (const child of node.children) {
      flattenVisible(child, list);
    }
  }
  return list;
}

/**
 * Check if a node is the last child of its parent.
 */
function isLastChild(node: TreeNode): boolean {
  if (!node.parent) return true;
  const siblings = node.parent.children;
  return siblings[siblings.length - 1] === node;
}

// -- TreeNodeRow (internal) -------------------------------------------------

interface TreeNodeRowProps {
  node: TreeNode;
  isSelected: boolean;
  indentPx: number;
  lineColor: string;
  lineWidth: number;
  iconExpanded: string;
  iconCollapsed: string;
  nodeStyle: NavItemStyle;
  renderNode?: (node: TreeNode, isSelected: boolean) => unknown;
  onToggle: (node: TreeNode) => void;
  onClick: (node: TreeNode) => void;
  focusedId: string | null;
}

function TreeNodeRow(props: TreeNodeRowProps) {
  const {
    node,
    isSelected,
    indentPx,
    lineColor,
    lineWidth,
    iconExpanded,
    iconCollapsed,
    nodeStyle,
    renderNode,
    onToggle,
    onClick,
    focusedId,
  } = props;

  const hoverState = useHover();
  const rowRef = useRef<HTMLElement | null>(null);
  const isFocused = focusedId === node.id;

  // Focus management
  useEffect(() => {
    if (isFocused && rowRef.current) {
      rowRef.current.focus();
    }
  }, [isFocused]);

  const isLeaf = node.isLeaf();
  const depth = node.depth;

  // Build connector line segments for each depth level
  const connectors: unknown[] = [];
  for (let d = 0; d < depth; d++) {
    // Walk up the ancestor chain to find the ancestor at depth d
    let ancestor: TreeNode | null = node;
    for (let i = 0; i < depth - d; i++) {
      ancestor = ancestor ? ancestor.parent : null;
    }
    // Show a vertical continuation line if the ancestor is NOT the last child
    const showVertical = ancestor ? !isLastChild(ancestor) : false;

    connectors.push(
      createElement('span', {
        key: `connector-${d}`,
        'aria-hidden': 'true',
        style: {
          display: 'inline-block',
          width: `${indentPx}px`,
          height: '100%',
          position: 'relative' as const,
          flexShrink: '0',
          ...(showVertical
            ? {
                borderLeft: `${lineWidth}px solid ${lineColor}`,
              }
            : {}),
        },
      }),
    );
  }

  // Horizontal connector from parent's vertical line to this node
  const horizontalConnector =
    depth > 0
      ? createElement('span', {
          'aria-hidden': 'true',
          style: {
            display: 'inline-block',
            width: `${Math.floor(indentPx / 2)}px`,
            height: '0',
            borderTop: `${lineWidth}px solid ${lineColor}`,
            flexShrink: '0',
            alignSelf: 'center',
            marginLeft: `-${indentPx}px`,
          },
        })
      : null;

  // Expand/collapse toggle icon
  const toggleIcon = !isLeaf
    ? createElement(
        'span',
        {
          'aria-hidden': 'true',
          role: 'button',
          tabIndex: 0,
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            fontSize: '14px',
            lineHeight: '1',
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: '0',
            marginRight: '4px',
            fontFamily: 'monospace',
          },
          onClick: (e: Event) => {
            e.stopPropagation();
            onToggle(node);
          },
        },
        node.expanded ? iconExpanded : iconCollapsed,
      )
    : createElement('span', {
        'aria-hidden': 'true',
        style: {
          display: 'inline-block',
          width: '18px',
          flexShrink: '0',
          marginRight: '4px',
        },
      });

  // Node content (custom renderer or default label)
  const nodeContent = renderNode
    ? renderNode(node, isSelected)
    : createElement(
        'span',
        {
          style: {
            flex: '1',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
        node.icon
          ? createElement(
              'span',
              { style: { marginRight: '6px' } },
              node.icon,
            )
          : null,
        node.label,
      );

  // Row styling
  const itemStyle = buildNavItemStyle(nodeStyle, {
    hover: hoverState.hover,
    active: isSelected,
  });

  return createElement(
    'div',
    {
      ref: rowRef,
      role: 'treeitem',
      'aria-expanded': isLeaf ? undefined : String(node.expanded),
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-level': depth + 1,
      tabIndex: isFocused ? 0 : -1,
      style: {
        ...itemStyle,
        display: 'flex',
        alignItems: 'stretch',
        padding: '0',
      },
      onMouseEnter: hoverState.onMouseEnter,
      onMouseLeave: hoverState.onMouseLeave,
      onClick: () => onClick(node),
    },
    // Indentation with connector lines
    ...connectors,
    horizontalConnector,
    // Inner content area with padding from nodeStyle
    createElement(
      'span',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          flex: '1',
          padding: nodeStyle.padding ?? '6px 10px',
          minWidth: '0',
        },
      },
      toggleIcon,
      nodeContent,
    ),
  );
}

// -- TreeNav (main component) -----------------------------------------------

export function TreeNav(props: TreeNavProps) {
  const {
    root: rootData,
    onNodeClick,
    onNodeExpand,
    onNodeCollapse,
    selectedId,
    expandAll: expandAllProp = false,
    lineColor = '#000',
    lineWidth = 1,
    indentPx = 20,
    iconExpanded = '\u2212',
    iconCollapsed = '+',
    nodeStyle = {},
    wrapperStyle,
    renderNode,
  } = props;

  // Build tree from data
  const [tree, setTree] = useState<TreeNode>(() => {
    const t = TreeNode.fromData(rootData);
    if (expandAllProp) expandAllNodes(t);
    return t;
  });

  // Track focused node id for keyboard navigation
  const [focusedId, setFocusedId] = useState<string | null>(rootData.id);

  // Flatten visible nodes for rendering and keyboard nav
  const visibleNodes = useMemo(() => flattenVisible(tree), [tree]);

  // Force re-render by cloning tree reference
  const forceUpdate = useCallback(() => {
    setTree((prev: TreeNode) => {
      // Return a new reference to trigger state update
      // We reuse the same tree object but wrap in Object.create
      // to get a new reference while keeping identity
      const clone = Object.create(Object.getPrototypeOf(prev));
      Object.assign(clone, prev);
      return clone;
    });
  }, []);

  const handleToggle = useCallback(
    (node: TreeNode) => {
      node.toggle();
      if (node.expanded) {
        onNodeExpand?.(node);
      } else {
        onNodeCollapse?.(node);
      }
      forceUpdate();
    },
    [onNodeExpand, onNodeCollapse, forceUpdate],
  );

  const handleClick = useCallback(
    (node: TreeNode) => {
      setFocusedId(node.id);
      onNodeClick?.(node);
    },
    [onNodeClick],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: Event) => {
      const ke = e as KeyboardEvent;
      if (!focusedId) return;

      const currentIndex = visibleNodes.findIndex((n: TreeNode) => n.id === focusedId);
      if (currentIndex === -1) return;
      const currentNode = visibleNodes[currentIndex];

      switch (ke.key) {
        case 'ArrowDown': {
          ke.preventDefault();
          const next = visibleNodes[currentIndex + 1];
          if (next) setFocusedId(next.id);
          break;
        }
        case 'ArrowUp': {
          ke.preventDefault();
          const prev = visibleNodes[currentIndex - 1];
          if (prev) setFocusedId(prev.id);
          break;
        }
        case 'ArrowRight': {
          ke.preventDefault();
          if (!currentNode.isLeaf()) {
            if (!currentNode.expanded) {
              handleToggle(currentNode);
            } else if (currentNode.children.length > 0) {
              setFocusedId(currentNode.children[0].id);
            }
          }
          break;
        }
        case 'ArrowLeft': {
          ke.preventDefault();
          if (!currentNode.isLeaf() && currentNode.expanded) {
            handleToggle(currentNode);
          } else if (currentNode.parent) {
            setFocusedId(currentNode.parent.id);
          }
          break;
        }
        case 'Enter': {
          ke.preventDefault();
          handleClick(currentNode);
          break;
        }
        case ' ': {
          ke.preventDefault();
          if (!currentNode.isLeaf()) {
            handleToggle(currentNode);
          }
          break;
        }
        case 'Home': {
          ke.preventDefault();
          if (visibleNodes.length > 0) setFocusedId(visibleNodes[0].id);
          break;
        }
        case 'End': {
          ke.preventDefault();
          if (visibleNodes.length > 0)
            setFocusedId(visibleNodes[visibleNodes.length - 1].id);
          break;
        }
      }
    },
    [focusedId, visibleNodes, handleToggle, handleClick],
  );

  // Render visible node rows
  const rows = visibleNodes.map((node: TreeNode) =>
    createElement(TreeNodeRow as unknown as FunctionComponent, {
      key: node.id,
      node,
      isSelected: node.id === selectedId,
      indentPx,
      lineColor,
      lineWidth,
      iconExpanded,
      iconCollapsed,
      nodeStyle,
      renderNode,
      onToggle: handleToggle,
      onClick: handleClick,
      focusedId,
    }),
  );

  return createElement(
    NavWrapper,
    {
      role: 'tree',
      ariaLabel: 'Tree navigation',
      styling: wrapperStyle,
      keyboardNav: false, // We handle keyboard nav ourselves
    },
    createElement(
      'div',
      {
        onKeyDown: handleKeyDown,
        style: { outline: 'none' },
      },
      ...rows,
    ),
  );
}
