# TreeNav

**Category:** Navigation  
**Path:** `components/nav/treenav`

## Overview

Accessible tree navigation component built on NavWrapper.
Renders a hierarchical tree with expand/collapse toggling, connector lines,
keyboard navigation, and optional custom node rendering. Wraps content in
NavWrapper with role="tree" and assigns role="treeitem" to each node row.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `root` | `TreeNodeData` (required) | Tree data structure |
| `onNodeClick` | `(node: TreeNode) => void` | Fired when a node label is clicked |
| `onNodeExpand` | `(node: TreeNode) => void` | Fired when a node is expanded |
| `onNodeCollapse` | `(node: TreeNode) => void` | Fired when a node is collapsed |
| `selectedId` | `string` | Id of the currently selected node |
| `expandAll` | `boolean` | Start with all nodes expanded (default: false) |
| `lineColor` | `string` | Color of connector lines (default: '#000') |
| `lineWidth` | `number` | Width of connector lines in px (default: 1) |
| `indentPx` | `number` | Pixels of indentation per depth level (default: 20) |
| `iconExpanded` | `string` | Icon shown for expanded non-leaf nodes (default: '\u2212') |
| `iconCollapsed` | `string` | Icon shown for collapsed non-leaf nodes (default: '+') |
| `nodeStyle` | `NavItemStyle` | Styling for individual node items |
| `wrapperStyle` | `NavWrapperStyle` | Styling for the outer NavWrapper |
| `renderNode` | `(node: TreeNode, isSelected: boolean) => unknown` | Custom node renderer for full control over node appearance |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
