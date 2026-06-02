# Project Manager - Whiteboard Demo

A whiteboard-style project management app for the SpecifyJS Unity Desktop. Cards are freely positioned on a 2D canvas (like sticky notes on a physical board).

## Features

- Infinite 2D canvas with pan (shift+click drag or middle-click) and zoom (ctrl+scroll)
- Draggable, resizable sticky-note cards with color coding and priority indicators
- Inline card editing (double-click to edit title and description)
- SVG connection lines between related cards
- Toolbar with new card, zoom controls, color palette, grid toggle, and search
- Undo/redo with 50-state history stack
- localStorage persistence with debounced auto-save

## Running Tests

From the `core/` directory:

```bash
bun test --preload ./tests/setup-nogginlessdom.ts --preload ./tests/setup.ts ../demos/project-manager/tests/
```

## Architecture

| File | Purpose |
|------|---------|
| `types.ts` | ProjectCard, CardConnection, BoardState, BoardStorage interfaces |
| `BoardState.ts` | useReducer-based state management with undo/redo |
| `Board.ts` | Main canvas with pan/zoom and card rendering |
| `Card.ts` | Individual sticky note component |
| `CardEditor.ts` | Inline edit overlay for card title/description |
| `Connection.ts` | SVG overlay for lines between cards |
| `Toolbar.ts` | Toolbar with new card, zoom, color, grid, search |
| `LocalStorage.ts` | localStorage persistence |
| `index.ts` | ProjectManagerApp entry point |
