# AppDragDrop

A typed drag-and-drop system for inter-app content transfer. Provides a context-based protocol where apps can initiate drags with typed payloads and register drop zones that accept specific types. Includes a visual drag preview overlay.

## Import

```ts
import {
  DragDropProvider,
  useDragDrop,
  useDraggable,
  useDropZone,
} from '@aspect/layout/app-drag-drop';
import type {
  DragPayload,
  DropZone,
  DragDropContextValue,
  DragDropProviderProps,
} from '@aspect/layout/app-drag-drop';
```

## DragDropProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `unknown` | `undefined` | Child elements that will have access to the drag-drop context |

## DragPayload

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | MIME-like type identifier (e.g., `'application/project-card'`) |
| `data` | `T` | The dragged data |
| `sourceAppId` | `string` | Source app ID |
| `preview` | `unknown` | Optional visual preview element |

## Hooks

### `useDragDrop()`

Returns the full `DragDropContextValue` with `startDrag`, `cancelDrag`, `registerDropZone`, `currentDrag`, and `isDragging`.

### `useDraggable<T>(type: string, data: T)`

Makes an element draggable with a typed payload.

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `onMouseDown` | `(e: Event) => void` | Attach to the draggable element's `onMouseDown` |
| `isDragging` | `boolean` | Whether this type is currently being dragged |

### `useDropZone(config)`

Makes an element a drop zone that accepts specific drag types.

**Config:**

| Field | Type | Description |
|-------|------|-------------|
| `acceptTypes` | `string[]` | Types this zone accepts |
| `onDragEnter` | `(payload: DragPayload) => void` | Called when a compatible drag enters |
| `onDragLeave` | `() => void` | Called when drag leaves |
| `onDrop` | `(payload: DragPayload) => void` | Called when a compatible payload is dropped |
| `zoneId` | `string` | Optional custom zone ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `isOver` | `boolean` | Whether a compatible drag is over this zone |
| `canDrop` | `boolean` | Whether the current drag type is accepted |
| `zoneId` | `string` | The zone's identifier |

## Usage

```ts
import { createElement } from 'specifyjs';
import { DragDropProvider, useDraggable, useDropZone } from '@aspect/layout/app-drag-drop';

// Wrap your app with the provider
const app = createElement(DragDropProvider, {}, content);

// In a draggable component
function DraggableCard(props) {
  const { onMouseDown, isDragging } = useDraggable('application/card', props.card);
  return createElement('div', {
    onMouseDown,
    style: { opacity: isDragging ? '0.5' : '1' },
  }, props.card.title);
}

// In a drop zone component
function DropTarget() {
  const { isOver, canDrop, zoneId } = useDropZone({
    acceptTypes: ['application/card'],
    onDrop: (payload) => console.log('Dropped:', payload.data),
  });

  return createElement('div', {
    'data-dropzone-id': zoneId,
    style: { border: isOver ? '2px solid blue' : '2px dashed gray' },
  }, 'Drop here');
}
```

## Features

- MIME-like type system for drag payload classification.
- Drop zones only accept explicitly listed types.
- Visual drag preview overlay follows the cursor during drag operations.
- Escape key cancels the current drag.
- Source app ID is automatically injected via `useAppId` from the message bus.
- Drop zone hit-testing uses `document.elementFromPoint` with `data-dropzone-id` attribute matching.
- Enter/leave callbacks allow visual feedback on compatible drop targets.
