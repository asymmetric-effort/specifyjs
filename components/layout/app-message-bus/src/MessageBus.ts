// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * MessageBus -- Publish/subscribe message bus for inter-app communication.
 *
 * Provides a context-based message bus that apps can use to send typed messages
 * to other apps (targeted or broadcast). Also provides an AppContext so each
 * app can identify itself as the sender.
 */

import { createElement } from 'specifyjs';
import { createContext } from 'specifyjs';
import { useState, useCallback, useMemo, useContext, useEffect, useRef } from 'specifyjs/hooks';
import type { SpecNode } from 'specifyjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppMessage<T = unknown> {
  /** Channel name (e.g., "clipboard", "data-update", "file-open") */
  channel: string;
  /** Sender app ID */
  from: string;
  /** Optional target app ID (null = broadcast) */
  to?: string | null;
  /** Message payload */
  payload: T;
  /** Timestamp */
  timestamp: number;
}

export interface MessageBusContextValue {
  /** Publish a message to a channel */
  publish<T>(channel: string, payload: T, to?: string): void;

  /** Subscribe to a channel. Returns unsubscribe function. */
  subscribe<T>(channel: string, handler: (message: AppMessage<T>) => void): () => void;

  /** Subscribe to all messages (for debugging/logging) */
  subscribeAll(handler: (message: AppMessage) => void): () => void;
}

export interface MessageBusProviderProps {
  children?: unknown;
}

// ---------------------------------------------------------------------------
// AppContext -- Provides the current app ID to descendants
// ---------------------------------------------------------------------------

export interface AppContextValue {
  appId: string;
}

/* v8 ignore start -- default context value, only used without Provider */
const AppContext = createContext<AppContextValue>({
  appId: '',
});
/* v8 ignore stop */

export interface AppContextProviderProps {
  appId: string;
  children?: unknown;
}

export function AppContextProvider(props: AppContextProviderProps): SpecNode {
  const value = useMemo(() => ({ appId: props.appId }), [props.appId]);
  return createElement(AppContext.Provider, { value }, props.children);
}

export function useAppId(): string {
  const ctx = useContext(AppContext);
  return ctx.appId;
}

// ---------------------------------------------------------------------------
// Subscription types (internal)
// ---------------------------------------------------------------------------

interface ChannelSubscription {
  channel: string;
  handler: (message: AppMessage) => void;
  appId: string;
}

interface GlobalSubscription {
  handler: (message: AppMessage) => void;
}

// ---------------------------------------------------------------------------
// MessageBusContext
// ---------------------------------------------------------------------------

/* v8 ignore start -- default context value, only used without Provider */
const MessageBusContext = createContext<MessageBusContextValue>({
  publish: () => {},
  subscribe: () => () => {},
  subscribeAll: () => () => {},
});
/* v8 ignore stop */

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function MessageBusProvider(props: MessageBusProviderProps): SpecNode {
  // Use refs for subscriptions to avoid stale closures and unnecessary re-renders
  const channelSubsRef = useRef<ChannelSubscription[]>([]);
  const globalSubsRef = useRef<GlobalSubscription[]>([]);

  const publish = useCallback(
    ((...args: unknown[]) => {
      const channel = args[0] as string;
      const payload = args[1] as unknown;
      const to = args[2] as string | undefined;

      // The sender appId must come from the calling component's AppContext.
      // We look it up via a trick: we store the appId on the message and let
      // the hook wrapper supply it. But since publish is on the context,
      // we need a way to know who's calling. We use a ref-based approach:
      // the actual publish call is wrapped by useMessageBus() which injects from.
      // Here in the raw context, we accept from as part of a hidden 4th arg.
      const from = args[3] as string || '';

      const message: AppMessage = {
        channel,
        from,
        to: to || null,
        payload,
        timestamp: Date.now(),
      };

      // Deliver to channel subscribers
      const channelSubs = channelSubsRef.current;
      for (let i = 0; i < channelSubs.length; i++) {
        const sub = channelSubs[i];
        if (sub.channel !== channel) continue;

        // Targeted message: only deliver to specified app
        if (message.to && sub.appId !== message.to) continue;

        // Broadcast: skip sender
        if (!message.to && sub.appId === from) continue;

        sub.handler(message);
      }

      // Deliver to global subscribers
      const globalSubs = globalSubsRef.current;
      for (let i = 0; i < globalSubs.length; i++) {
        globalSubs[i].handler(message);
      }
    }) as (...args: unknown[]) => unknown,
    [],
  ) as MessageBusContextValue['publish'];

  const subscribe = useCallback(
    ((...args: unknown[]) => {
      const channel = args[0] as string;
      const handler = args[1] as (message: AppMessage) => void;
      const appId = args[2] as string || '';

      const sub: ChannelSubscription = { channel, handler, appId };
      channelSubsRef.current = [...channelSubsRef.current, sub];

      return () => {
        channelSubsRef.current = channelSubsRef.current.filter(
          (s: ChannelSubscription) => s !== sub,
        );
      };
    }) as (...args: unknown[]) => unknown,
    [],
  ) as MessageBusContextValue['subscribe'];

  const subscribeAll = useCallback(
    ((...args: unknown[]) => {
      const handler = args[0] as (message: AppMessage) => void;

      const sub: GlobalSubscription = { handler };
      globalSubsRef.current = [...globalSubsRef.current, sub];

      return () => {
        globalSubsRef.current = globalSubsRef.current.filter(
          (s: GlobalSubscription) => s !== sub,
        );
      };
    }) as (...args: unknown[]) => unknown,
    [],
  ) as MessageBusContextValue['subscribeAll'];

  const value: MessageBusContextValue = useMemo(
    () => ({ publish, subscribe, subscribeAll }),
    [publish, subscribe, subscribeAll],
  );

  return createElement(MessageBusContext.Provider, { value }, props.children);
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Access the message bus context. Wraps publish and subscribe to
 * automatically inject the current app's ID.
 */
export function useMessageBus(): MessageBusContextValue {
  const ctx = useContext(MessageBusContext);
  const appId = useAppId();

  // Wrap publish to inject sender appId
  const publish = useCallback(
    ((...args: unknown[]) => {
      const channel = args[0] as string;
      const payload = args[1] as unknown;
      const to = args[2] as string | undefined;
      // Call raw publish with hidden 4th arg for sender ID
      (ctx.publish as (...a: unknown[]) => void)(channel, payload, to, appId);
    }) as (...args: unknown[]) => unknown,
    [ctx.publish, appId],
  ) as MessageBusContextValue['publish'];

  // Wrap subscribe to inject subscriber appId
  const subscribe = useCallback(
    ((...args: unknown[]) => {
      const channel = args[0] as string;
      const handler = args[1] as (message: AppMessage) => void;
      // Call raw subscribe with hidden 3rd arg for subscriber ID
      return (ctx.subscribe as (...a: unknown[]) => () => void)(channel, handler, appId);
    }) as (...args: unknown[]) => unknown,
    [ctx.subscribe, appId],
  ) as MessageBusContextValue['subscribe'];

  return useMemo(
    () => ({ publish, subscribe, subscribeAll: ctx.subscribeAll }),
    [publish, subscribe, ctx.subscribeAll],
  );
}

/**
 * Convenience hook for subscribing to a channel with auto-cleanup.
 */
export function useChannel<T>(
  channel: string,
  handler: (message: AppMessage<T>) => void,
): void {
  const bus = useMessageBus();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = bus.subscribe<T>(channel, (msg: AppMessage<T>) => {
      handlerRef.current(msg);
    });
    return unsubscribe;
  }, [bus, channel]);
}
