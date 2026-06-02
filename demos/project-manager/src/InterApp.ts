// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Inter-app integration layer for the Project Manager.
 *
 * This wrapper uses the MessageBus and DragDrop hooks to integrate the
 * project manager with other Unity Desktop applications. It publishes
 * card lifecycle events on the 'project-board' channel and registers a
 * drop zone that accepts 'text/plain' and 'application/json' payloads,
 * creating new cards from dropped content.
 *
 * This component MUST be rendered inside MessageBusProvider and
 * DragDropProvider (provided by UnityDesktop).
 */

import { createElement } from 'specifyjs';
import { useEffect, useRef, useCallback } from 'specifyjs/hooks';
import { useMessageBus } from '../../../components/layout/app-message-bus/src/index';
import { useDropZone } from '../../../components/layout/app-drag-drop/src/index';
import type { ProjectCard } from './types';

export interface InterAppWrapperProps {
  cards: ProjectCard[];
  onCardDropped: (title: string, description: string) => void;
  children: unknown;
}

export function InterAppWrapper(props: InterAppWrapperProps) {
  const { cards, onCardDropped, children } = props;
  const messageBus = useMessageBus();
  const prevCardsRef = useRef<ProjectCard[]>([]);

  // Track card changes and publish events
  useEffect(() => {
    const prevCards = prevCardsRef.current;
    const prevIds = new Set(prevCards.map((c) => c.id));
    const currIds = new Set(cards.map((c) => c.id));

    // Detect created cards
    for (const card of cards) {
      if (!prevIds.has(card.id)) {
        messageBus.publish('project-board', { event: 'card-created', card });
      }
    }

    // Detect deleted cards
    for (const card of prevCards) {
      if (!currIds.has(card.id)) {
        messageBus.publish('project-board', { event: 'card-deleted', cardId: card.id });
      }
    }

    // Detect updated cards
    for (const card of cards) {
      if (prevIds.has(card.id)) {
        const prev = prevCards.find((c) => c.id === card.id);
        if (prev && prev.updatedAt !== card.updatedAt) {
          messageBus.publish('project-board', { event: 'card-updated', card });
        }
      }
    }

    prevCardsRef.current = cards;
  }, [cards, messageBus]);

  // Register drop zone for incoming content
  const handleDrop = useCallback(
    (payload: { data: unknown; type: string }) => {
      if (payload.type === 'text/plain' && typeof payload.data === 'string') {
        onCardDropped(payload.data, '');
      } else if (payload.type === 'application/json') {
        const data = payload.data as Record<string, unknown>;
        onCardDropped(
          String(data.title || 'Dropped Item'),
          String(data.description || ''),
        );
      }
    },
    [onCardDropped],
  );

  const { isOver } = useDropZone({
    acceptTypes: ['text/plain', 'application/json', 'application/project-card'],
    onDrop: handleDrop,
  });

  const style: Record<string, string> = {
    width: '100%',
    height: '100%',
    ...(isOver ? { outline: '2px dashed #3b82f6', outlineOffset: '-2px' } : {}),
  };

  return createElement('div', {
    style,
    'data-dropzone-id': 'project-board-dropzone',
  }, children);
}
