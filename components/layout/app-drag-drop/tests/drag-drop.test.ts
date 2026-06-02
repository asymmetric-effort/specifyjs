// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from '@asymmetric-effort/nogginlessdom';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import {
  DragDropProvider,
  useDragDrop,
  useDropZone,
} from '../src/index';
import type { DragDropContextValue, DragPayload, DropZone } from '../src/index';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

async function flush(): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await new Promise<void>((r) => queueMicrotask(r));
  }
}

function setup() {
  let ctx: DragDropContextValue = null as unknown as DragDropContextValue;

  function Inspector() {
    ctx = useDragDrop();
    return createElement('div', { id: 'inspector' }, String(ctx.isDragging));
  }

  const root = createRoot(container);
  root.render(
    createElement(DragDropProvider, null,
      createElement(Inspector, null),
    ),
  );

  return { getCtx: () => ctx, flush, root };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DragDropProvider', () => {
  it('renders children', () => {
    setup();
    expect(container.querySelector('#inspector')).not.toBeNull();
  });

  it('provides DragDropContext with required methods and state', () => {
    const { getCtx } = setup();
    const ctx = getCtx();
    expect(typeof ctx.startDrag).toBe('function');
    expect(typeof ctx.cancelDrag).toBe('function');
    expect(typeof ctx.registerDropZone).toBe('function');
    expect(ctx.currentDrag).toBeNull();
    expect(ctx.isDragging).toBe(false);
  });
});

describe('startDrag', () => {
  it('sets isDragging to true', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({
      type: 'text/plain',
      data: 'hello',
      sourceAppId: 'app-a',
    });
    await flush();
    expect(getCtx().isDragging).toBe(true);
  });

  it('sets currentDrag to the payload', async () => {
    const { getCtx, flush } = setup();
    const payload: DragPayload = {
      type: 'application/file',
      data: { name: 'readme.txt' },
      sourceAppId: 'files',
    };
    getCtx().startDrag(payload);
    await flush();
    expect(getCtx().currentDrag).not.toBeNull();
    expect(getCtx().currentDrag!.type).toBe('application/file');
    expect(getCtx().currentDrag!.data).toEqual({ name: 'readme.txt' });
    expect(getCtx().currentDrag!.sourceAppId).toBe('files');
  });

  it('renders a drag preview overlay when dragging', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({
      type: 'text/plain',
      data: 'hello',
      sourceAppId: 'app-a',
    });
    await flush();
    const preview = container.querySelector('.drag-drop-preview');
    expect(preview).not.toBeNull();
  });

  it('shows custom preview text when preview is set', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({
      type: 'text/plain',
      data: 'hello',
      sourceAppId: 'app-a',
      preview: 'Custom Preview',
    });
    await flush();
    const preview = container.querySelector('.drag-drop-preview');
    expect(preview).not.toBeNull();
    expect(preview!.textContent).toContain('Custom Preview');
  });

  it('shows type in default preview text', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({
      type: 'application/widget',
      data: {},
      sourceAppId: 'app-a',
    });
    await flush();
    const preview = container.querySelector('.drag-drop-preview');
    expect(preview!.textContent).toContain('application/widget');
  });
});

describe('cancelDrag', () => {
  it('sets isDragging to false', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({
      type: 'text/plain',
      data: 'hello',
      sourceAppId: 'app-a',
    });
    await flush();
    expect(getCtx().isDragging).toBe(true);
    getCtx().cancelDrag();
    await flush();
    expect(getCtx().isDragging).toBe(false);
  });

  it('sets currentDrag to null', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({
      type: 'text/plain',
      data: 'hello',
      sourceAppId: 'app-a',
    });
    await flush();
    getCtx().cancelDrag();
    await flush();
    expect(getCtx().currentDrag).toBeNull();
  });

  it('removes drag preview overlay', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({
      type: 'text/plain',
      data: 'hello',
      sourceAppId: 'app-a',
    });
    await flush();
    expect(container.querySelector('.drag-drop-preview')).not.toBeNull();
    getCtx().cancelDrag();
    await flush();
    expect(container.querySelector('.drag-drop-preview')).toBeNull();
  });

  it('is safe to call when no drag is in progress', async () => {
    const { getCtx, flush } = setup();
    expect(() => getCtx().cancelDrag()).not.toThrow();
    await flush();
    expect(getCtx().isDragging).toBe(false);
  });
});

describe('registerDropZone', () => {
  it('returns a cleanup function', () => {
    const { getCtx } = setup();
    const cleanup = getCtx().registerDropZone('zone-1', {
      acceptTypes: ['text/plain'],
      onDrop: () => {},
    });
    expect(typeof cleanup).toBe('function');
  });

  it('cleanup removes the drop zone', () => {
    const { getCtx } = setup();
    const onDrop = vi.fn();
    const cleanup = getCtx().registerDropZone('zone-1', {
      acceptTypes: ['text/plain'],
      onDrop,
    });
    cleanup();
    // Zone should be removed; no error expected
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('supports registering multiple drop zones', () => {
    const { getCtx } = setup();
    const c1 = getCtx().registerDropZone('zone-1', {
      acceptTypes: ['text/plain'],
      onDrop: () => {},
    });
    const c2 = getCtx().registerDropZone('zone-2', {
      acceptTypes: ['application/json'],
      onDrop: () => {},
    });
    expect(typeof c1).toBe('function');
    expect(typeof c2).toBe('function');
    c1();
    c2();
  });

  it('can re-register a zone with the same id', () => {
    const { getCtx } = setup();
    const onDrop1 = vi.fn();
    const onDrop2 = vi.fn();
    const c1 = getCtx().registerDropZone('zone-1', {
      acceptTypes: ['text/plain'],
      onDrop: onDrop1,
    });
    const c2 = getCtx().registerDropZone('zone-1', {
      acceptTypes: ['text/plain'],
      onDrop: onDrop2,
    });
    // Both cleanups should work without error
    c1();
    c2();
  });
});

describe('useDropZone', () => {
  it('returns isOver as false initially', async () => {
    let dropState: { isOver: boolean; canDrop: boolean; zoneId: string } | null = null;

    function DropTarget() {
      dropState = useDropZone({
        acceptTypes: ['text/plain'],
        onDrop: () => {},
        zoneId: 'target-1',
      });
      return createElement('div', { 'data-dropzone-id': dropState.zoneId }, 'target');
    }

    const root = createRoot(container);
    root.render(
      createElement(DragDropProvider, null,
        createElement(DropTarget, null),
      ),
    );
    await flush();
    expect(dropState!.isOver).toBe(false);
  });

  it('returns canDrop as false when not dragging', async () => {
    let dropState: { isOver: boolean; canDrop: boolean; zoneId: string } | null = null;

    function DropTarget() {
      dropState = useDropZone({
        acceptTypes: ['text/plain'],
        onDrop: () => {},
        zoneId: 'target-1',
      });
      return createElement('div', { 'data-dropzone-id': dropState.zoneId }, 'target');
    }

    const root = createRoot(container);
    root.render(
      createElement(DragDropProvider, null,
        createElement(DropTarget, null),
      ),
    );
    await flush();
    expect(dropState!.canDrop).toBe(false);
  });

  it('returns canDrop as true when dragging a compatible type', async () => {
    let dropState: { isOver: boolean; canDrop: boolean; zoneId: string } | null = null;
    let ctx: DragDropContextValue;

    function DropTarget() {
      ctx = useDragDrop();
      dropState = useDropZone({
        acceptTypes: ['text/plain'],
        onDrop: () => {},
        zoneId: 'target-1',
      });
      return createElement('div', { 'data-dropzone-id': dropState.zoneId }, 'target');
    }

    const root = createRoot(container);
    root.render(
      createElement(DragDropProvider, null,
        createElement(DropTarget, null),
      ),
    );
    await flush();
    ctx!.startDrag({ type: 'text/plain', data: 'hello', sourceAppId: 'a' });
    await flush();
    expect(dropState!.canDrop).toBe(true);
  });

  it('returns canDrop as false when dragging an incompatible type', async () => {
    let dropState: { isOver: boolean; canDrop: boolean; zoneId: string } | null = null;
    let ctx: DragDropContextValue;

    function DropTarget() {
      ctx = useDragDrop();
      dropState = useDropZone({
        acceptTypes: ['text/plain'],
        onDrop: () => {},
        zoneId: 'target-1',
      });
      return createElement('div', { 'data-dropzone-id': dropState.zoneId }, 'target');
    }

    const root = createRoot(container);
    root.render(
      createElement(DragDropProvider, null,
        createElement(DropTarget, null),
      ),
    );
    await flush();
    ctx!.startDrag({ type: 'application/json', data: {}, sourceAppId: 'a' });
    await flush();
    expect(dropState!.canDrop).toBe(false);
  });

  it('generates a stable zoneId when not provided', async () => {
    let dropState: { isOver: boolean; canDrop: boolean; zoneId: string } | null = null;

    function DropTarget() {
      dropState = useDropZone({
        acceptTypes: ['text/plain'],
        onDrop: () => {},
      });
      return createElement('div', { 'data-dropzone-id': dropState.zoneId }, 'target');
    }

    const root = createRoot(container);
    root.render(
      createElement(DragDropProvider, null,
        createElement(DropTarget, null),
      ),
    );
    await flush();
    expect(dropState!.zoneId).toBeTruthy();
    expect(dropState!.zoneId.startsWith('zone-')).toBe(true);
  });
});

describe('drag state transitions', () => {
  it('transitions: idle -> dragging -> idle (cancel)', async () => {
    const { getCtx, flush } = setup();
    expect(getCtx().isDragging).toBe(false);
    expect(getCtx().currentDrag).toBeNull();

    getCtx().startDrag({ type: 'a', data: 1, sourceAppId: 'x' });
    await flush();
    expect(getCtx().isDragging).toBe(true);
    expect(getCtx().currentDrag).not.toBeNull();

    getCtx().cancelDrag();
    await flush();
    expect(getCtx().isDragging).toBe(false);
    expect(getCtx().currentDrag).toBeNull();
  });

  it('starting a new drag replaces the current one', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({ type: 'a', data: 1, sourceAppId: 'x' });
    await flush();
    expect(getCtx().currentDrag!.type).toBe('a');

    getCtx().startDrag({ type: 'b', data: 2, sourceAppId: 'y' });
    await flush();
    expect(getCtx().currentDrag!.type).toBe('b');
    expect(getCtx().currentDrag!.data).toBe(2);
  });
});

describe('Escape key cancels drag', () => {
  it('cancels drag on Escape keydown', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({ type: 'a', data: 1, sourceAppId: 'x' });
    await flush();
    expect(getCtx().isDragging).toBe(true);

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    await flush();
    expect(getCtx().isDragging).toBe(false);
  });
});

describe('mouseup completes drag', () => {
  it('completes drag on mouseup', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({ type: 'a', data: 1, sourceAppId: 'x' });
    await flush();
    expect(getCtx().isDragging).toBe(true);

    const event = new MouseEvent('mouseup', { clientX: 100, clientY: 100 });
    document.dispatchEvent(event);
    await flush();
    expect(getCtx().isDragging).toBe(false);
  });
});

describe('DragPayload types', () => {
  it('supports string data', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({ type: 'text/plain', data: 'hello', sourceAppId: 'a' });
    await flush();
    expect(getCtx().currentDrag!.data).toBe('hello');
  });

  it('supports object data', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({ type: 'app/card', data: { id: 1, name: 'test' }, sourceAppId: 'a' });
    await flush();
    expect(getCtx().currentDrag!.data).toEqual({ id: 1, name: 'test' });
  });

  it('supports array data', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({ type: 'app/list', data: [1, 2, 3], sourceAppId: 'a' });
    await flush();
    expect(getCtx().currentDrag!.data).toEqual([1, 2, 3]);
  });

  it('supports null data', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({ type: 'app/empty', data: null, sourceAppId: 'a' });
    await flush();
    expect(getCtx().currentDrag!.data).toBeNull();
  });

  it('preserves sourceAppId', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({ type: 'x', data: 1, sourceAppId: 'my-app-123' });
    await flush();
    expect(getCtx().currentDrag!.sourceAppId).toBe('my-app-123');
  });
});

describe('drop zone type matching', () => {
  it('accepts multiple types', () => {
    const { getCtx } = setup();
    const onDrop = vi.fn();
    getCtx().registerDropZone('multi', {
      acceptTypes: ['text/plain', 'application/json', 'image/png'],
      onDrop,
    });
    // Just verifying registration works
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('empty acceptTypes means nothing is accepted', async () => {
    let dropState: { isOver: boolean; canDrop: boolean; zoneId: string } | null = null;
    let ctx: DragDropContextValue;

    function DropTarget() {
      ctx = useDragDrop();
      dropState = useDropZone({
        acceptTypes: [],
        onDrop: () => {},
        zoneId: 'empty-zone',
      });
      return createElement('div', { 'data-dropzone-id': dropState.zoneId }, 'target');
    }

    const root = createRoot(container);
    root.render(
      createElement(DragDropProvider, null,
        createElement(DropTarget, null),
      ),
    );
    await flush();
    ctx!.startDrag({ type: 'text/plain', data: 'x', sourceAppId: 'a' });
    await flush();
    expect(dropState!.canDrop).toBe(false);
  });
});

describe('preview overlay styling', () => {
  it('has position fixed and high z-index', async () => {
    const { getCtx, flush } = setup();
    getCtx().startDrag({ type: 'a', data: 1, sourceAppId: 'x' });
    await flush();
    const preview = container.querySelector('.drag-drop-preview') as HTMLElement;
    expect(preview).not.toBeNull();
    expect(preview.style.position).toBe('fixed');
    expect(preview.style.zIndex).toBe('10000');
    expect(preview.style.pointerEvents).toBe('none');
  });
});
