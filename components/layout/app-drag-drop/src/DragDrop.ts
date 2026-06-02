// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * DragDrop -- Typed drag-and-drop system for inter-app content transfer.
 *
 * Provides a context-based drag-and-drop protocol where apps can initiate drags
 * with typed payloads and register drop zones that accept specific types.
 * The drag preview is rendered as a positioned overlay above all windows.
 */

import { createElement } from 'specifyjs';
import { createContext } from 'specifyjs';
import { useState, useCallback, useMemo, useContext, useEffect, useRef } from 'specifyjs/hooks';
import type { SpecNode } from 'specifyjs';
import { useAppId } from '../../app-message-bus/src/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DragPayload<T = unknown> {
  /** MIME-like type identifier (e.g., "application/project-card", "text/plain") */
  type: string;
  /** The dragged data */
  data: T;
  /** Source app ID */
  sourceAppId: string;
  /** Optional visual preview element */
  preview?: unknown;
}

export interface DropZone {
  /** Types this zone accepts */
  acceptTypes: string[];
  /** Called when a compatible drag enters the zone */
  onDragEnter?: (payload: DragPayload) => void;
  /** Called when drag leaves the zone */
  onDragLeave?: () => void;
  /** Called when a compatible payload is dropped */
  onDrop: (payload: DragPayload) => void;
}

export interface DragDropContextValue {
  /** Start dragging a payload */
  startDrag(payload: DragPayload): void;
  /** Cancel the current drag operation */
  cancelDrag(): void;
  /** Register a drop zone. Returns cleanup function. */
  registerDropZone(zoneId: string, zone: DropZone): () => void;
  /** Current drag state (null if no drag in progress) */
  currentDrag: DragPayload | null;
  /** Whether a drag is in progress */
  isDragging: boolean;
}

export interface DragDropProviderProps {
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/* v8 ignore start -- default context value, only used without Provider */
const DragDropContext = createContext<DragDropContextValue>({
  startDrag: () => {},
  cancelDrag: () => {},
  registerDropZone: () => () => {},
  currentDrag: null,
  isDragging: false,
});
/* v8 ignore stop */

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DragDropProvider(props: DragDropProviderProps): SpecNode {
  const [currentDrag, setCurrentDrag] = useState<DragPayload | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dropZonesRef = useRef<Map<string, DropZone>>(new Map());
  const activeZoneRef = useRef<string | null>(null);

  const isDragging = currentDrag !== null;

  const startDrag = useCallback(
    ((...args: unknown[]) => {
      const payload = args[0] as DragPayload;
      setCurrentDrag(payload);
    }) as (...args: unknown[]) => unknown,
    [],
  ) as DragDropContextValue['startDrag'];

  const cancelDrag = useCallback(
    ((..._args: unknown[]) => {
      // Notify active zone of drag leave
      if (activeZoneRef.current) {
        const zone = dropZonesRef.current.get(activeZoneRef.current);
        if (zone && zone.onDragLeave) {
          zone.onDragLeave();
        }
        activeZoneRef.current = null;
      }
      setCurrentDrag(null);
    }) as (...args: unknown[]) => unknown,
    [],
  ) as DragDropContextValue['cancelDrag'];

  const registerDropZone = useCallback(
    ((...args: unknown[]) => {
      const zoneId = args[0] as string;
      const zone = args[1] as DropZone;
      dropZonesRef.current = new Map(dropZonesRef.current);
      dropZonesRef.current.set(zoneId, zone);

      return () => {
        dropZonesRef.current = new Map(dropZonesRef.current);
        dropZonesRef.current.delete(zoneId);
        if (activeZoneRef.current === zoneId) {
          activeZoneRef.current = null;
        }
      };
    }) as (...args: unknown[]) => unknown,
    [],
  ) as DragDropContextValue['registerDropZone'];

  // Handle mousemove and mouseup during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: Event) => {
      const me = e as MouseEvent;
      setMousePos({ x: me.clientX, y: me.clientY });

      // Hit-test drop zones (using element at point)
      const elementAtPoint = document.elementFromPoint(me.clientX, me.clientY);
      if (!elementAtPoint) return;

      // Check if we're over any registered drop zone element
      let foundZoneId: string | null = null;
      const zones = dropZonesRef.current;
      zones.forEach((_zone: DropZone, zoneId: string) => {
        const zoneEl = document.querySelector(`[data-dropzone-id="${zoneId}"]`);
        if (zoneEl && zoneEl.contains(elementAtPoint)) {
          foundZoneId = zoneId;
        }
      });

      const prevZoneId = activeZoneRef.current;
      if (foundZoneId !== prevZoneId) {
        // Leave previous zone
        if (prevZoneId) {
          const prevZone = zones.get(prevZoneId);
          if (prevZone && prevZone.onDragLeave) {
            prevZone.onDragLeave();
          }
        }
        // Enter new zone
        if (foundZoneId) {
          const newZone = zones.get(foundZoneId);
          if (newZone && newZone.onDragEnter && currentDrag) {
            if (newZone.acceptTypes.indexOf(currentDrag.type) !== -1) {
              newZone.onDragEnter(currentDrag);
            }
          }
        }
        activeZoneRef.current = foundZoneId;
      }
    };

    const handleMouseUp = (_e: Event) => {
      // Check if we're over a compatible drop zone
      const activeId = activeZoneRef.current;
      if (activeId && currentDrag) {
        const zone = dropZonesRef.current.get(activeId);
        if (zone && zone.acceptTypes.indexOf(currentDrag.type) !== -1) {
          zone.onDrop(currentDrag);
        }
      }
      activeZoneRef.current = null;
      setCurrentDrag(null);
    };

    const handleKeyDown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Escape') {
        cancelDrag();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging, currentDrag, cancelDrag]);

  const value: DragDropContextValue = useMemo(
    () => ({
      startDrag,
      cancelDrag,
      registerDropZone,
      currentDrag,
      isDragging,
    }),
    [startDrag, cancelDrag, registerDropZone, currentDrag, isDragging],
  );

  // Render drag preview overlay when dragging
  const previewEl = isDragging
    ? createElement('div', {
        className: 'drag-drop-preview',
        style: {
          position: 'fixed',
          left: `${mousePos.x + 12}px`,
          top: `${mousePos.y + 12}px`,
          pointerEvents: 'none',
          zIndex: '10000',
          opacity: '0.8',
          padding: '6px 10px',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          color: '#ffffff',
          borderRadius: '4px',
          fontSize: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
        },
      }, currentDrag && currentDrag.preview
        ? String(currentDrag.preview)
        : `Dragging ${currentDrag ? currentDrag.type : ''}`,
      )
    : null;

  return createElement(
    DragDropContext.Provider,
    { value },
    props.children,
    previewEl,
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Access the drag-drop context.
 */
export function useDragDrop(): DragDropContextValue {
  return useContext(DragDropContext);
}

/**
 * Make an element draggable with a typed payload.
 * Returns event handlers and state to attach to the draggable element.
 */
export function useDraggable<T>(type: string, data: T): {
  onMouseDown: (e: Event) => void;
  isDragging: boolean;
} {
  const ctx = useDragDrop();
  const appId = useAppId();

  const dataRef = useRef(data);
  dataRef.current = data;

  const onMouseDown = useCallback(
    (e: Event) => {
      e.preventDefault();
      ctx.startDrag({
        type,
        data: dataRef.current,
        sourceAppId: appId || '',
      });
    },
    [ctx, type, appId],
  );

  const isDragging = ctx.isDragging && ctx.currentDrag !== null && ctx.currentDrag.type === type;

  return useMemo(
    () => ({ onMouseDown, isDragging }),
    [onMouseDown, isDragging],
  );
}

/**
 * Make an element a drop zone that accepts specific drag types.
 * Returns state about the current drag interaction.
 */
export function useDropZone(config: DropZone & { zoneId?: string }): {
  isOver: boolean;
  canDrop: boolean;
  zoneId: string;
} {
  const ctx = useDragDrop();
  const [isOver, setIsOver] = useState(false);
  const zoneIdRef = useRef(config.zoneId || `zone-${Math.random().toString(36).slice(2, 10)}`);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const cleanup = ctx.registerDropZone(zoneIdRef.current, {
      acceptTypes: configRef.current.acceptTypes,
      onDragEnter: (payload: DragPayload) => {
        setIsOver(true);
        if (configRef.current.onDragEnter) configRef.current.onDragEnter(payload);
      },
      onDragLeave: () => {
        setIsOver(false);
        if (configRef.current.onDragLeave) configRef.current.onDragLeave();
      },
      onDrop: (payload: DragPayload) => {
        setIsOver(false);
        configRef.current.onDrop(payload);
      },
    });
    return cleanup;
  }, [ctx]);

  const canDrop = ctx.isDragging &&
    ctx.currentDrag !== null &&
    config.acceptTypes.indexOf(ctx.currentDrag.type) !== -1;

  return useMemo(
    () => ({ isOver, canDrop, zoneId: zoneIdRef.current }),
    [isOver, canDrop],
  );
}
