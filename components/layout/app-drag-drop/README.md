# @specifyjs/layout-app-drag-drop

Typed drag-and-drop system for transferring content between windows in the Unity Desktop.

## Usage

Wrap your app tree with `DragDropProvider`, then use hooks inside any descendant.

## API

- `DragDropProvider` -- Context provider, renders drag preview overlay
- `useDragDrop()` -- Returns the full DragDropContext
- `useDraggable<T>(type, data)` -- Returns `{ onMouseDown, isDragging }`
- `useDropZone(config)` -- Returns `{ isOver, canDrop }`
