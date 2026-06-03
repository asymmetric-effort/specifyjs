# @specifyjs/board

Reusable whiteboard/canvas component family for SpecifyJS.

Provides a pan/zoom canvas with typed cards (text, json, task, project),
nestable containers with namespace enforcement, and SVG card links.

## Components

- **Board** -- Canvas with pan/zoom that renders a collection of BoardItems
- **Container** -- Nestable container with drag/resize/drop support
- **Card** -- Typed card renderer (TextCard, JsonCard, TaskCard, ProjectCard)
- **CardLink** -- SVG arrow renderer with labels between cards

## State Management

- **BoardReducer** -- useReducer-based state manager with undo/redo (50-state history)
- **NamespaceValidator** -- Scope-aware name uniqueness enforcement

## Usage

```typescript
import { Board, useBoardReducer } from '@specifyjs/board';
import { createElement } from 'specifyjs';

function MyBoard() {
  const { state, dispatch, undo, redo } = useBoardReducer();
  return createElement(Board, { state, dispatch });
}
```

## License

(c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
