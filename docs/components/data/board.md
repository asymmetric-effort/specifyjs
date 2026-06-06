# Board

A canvas-based board component with pan/zoom for rendering draggable cards and containers. Supports nested containers, card links, context menus, search filtering, and undo/redo history.

## Import

```ts
import { Board } from '@aspect/data/board';
import type { BoardProps } from '@aspect/data/board';
import { useBoardReducer } from '@aspect/data/board';
import type { BoardState, BoardItem, Card, Container, CardType } from '@aspect/data/board';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `BoardState` | required | The board state containing items, viewport, and metadata |
| `dispatch` | `(action: BoardAction) => void` | required | Dispatch function for board state mutations |
| `selectedId` | `string \| null` | `null` | ID of the currently selected item |
| `onSelectItem` | `(itemId: string \| null) => void` | `undefined` | Called when an item is selected or deselected |
| `gridEnabled` | `boolean` | `false` | Enable snap-to-grid (20px grid) |
| `searchQuery` | `string` | `''` | Search text to filter/dim non-matching items |
| `colorFilter` | `string \| null` | `null` | Color hex to filter cards by color |
| `onOpenProject` | `(projectId: string) => void` | `undefined` | Called when a project-type card is opened |
| `onCardContextMenu` | `(cardId: string, pos: { x: number; y: number }) => void` | `undefined` | Called when a card context menu is triggered |
| `onUpdateItem` | `(cardId: string, updates: { card_title?: string; content?: unknown }) => void` | `undefined` | Called when a card is updated inline |

## BoardState

```ts
interface BoardState {
  id: string;
  name: string;
  collection: BoardItem[];
  viewport: { panX: number; panY: number; zoom: number };
}
```

## BoardAction types

| Action | Description |
|--------|-------------|
| `ADD_ITEM` | Add a card or container to the board or inside a container |
| `REMOVE_ITEM` | Remove an item by ID from anywhere in the tree |
| `MOVE_ITEM` | Update an item's position |
| `RESIZE_ITEM` | Update an item's size |
| `UPDATE_CARD` | Partially update a card's properties |
| `CHANGE_CARD_TYPE` | Change a card's type (text, json, task, project) |
| `ADD_CONTAINER` | Add a new container |
| `NEST_ITEM` | Move an item into a container |
| `UNNEST_ITEM` | Move an item out of a container to the top level |
| `ADD_LINK` | Add a link between cards |
| `REMOVE_LINK` | Remove a card link |
| `PAN` | Update viewport pan offset |
| `ZOOM` | Update viewport zoom level (clamped 0.25 - 4.0) |
| `SET_BOARD` | Replace the entire board state |
| `RENAME_BOARD` | Rename the board |

## Card types

| Type | Content Interface |
|------|-------------------|
| `text` | `{ text: string }` |
| `json` | `{ [key: string]: unknown }` |
| `task` | `{ [key: string]: unknown }` |
| `project` | `{ project_id: string; project_name: string }` |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Board, useBoardReducer } from '@aspect/data/board';

function MyBoard() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useBoardReducer();

  return createElement(Board, {
    state,
    dispatch,
    gridEnabled: true,
    onSelectItem: (id) => console.log('Selected:', id),
  });
}
```

## Features

- Pan via middle-click or shift+left-click drag. Two-finger touch pan on mobile.
- Zoom via ctrl+scroll wheel. Pinch-to-zoom on touch devices. Zoom clamped between 0.25x and 4.0x.
- Cards support drag-and-drop into containers with visual drop target highlighting.
- Card-to-card links rendered as an SVG overlay with drag-to-connect interaction.
- Context menus for cards (change color, change type, detach, delete), containers (detach, delete), and links (change edge type, delete).
- Search query dims non-matching items. Color filter dims cards that don't match.
- `useBoardReducer` hook provides undo/redo with a 50-state history stack.
- Nested containers with coordinate conversion between container-relative and canvas-absolute positions.

## Accessibility

- The board canvas uses `role="application"` with an `aria-label` reflecting the board name.
- The canvas is keyboard-focusable via `tabIndex`.
- Context menus use `role="menu"` with `role="menuitem"` on each option.
