# AppMessageBus

A publish/subscribe message bus for inter-app communication. Provides context-based messaging where apps can send typed messages to other apps (targeted or broadcast) and subscribe to specific channels.

## Import

```ts
import {
  MessageBusProvider,
  AppContextProvider,
  useMessageBus,
  useAppId,
  useChannel,
} from '@aspect/layout/app-message-bus';
import type {
  AppMessage,
  MessageBusContextValue,
  MessageBusProviderProps,
  AppContextProviderProps,
} from '@aspect/layout/app-message-bus';
```

## Provider Props

### MessageBusProviderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `unknown` | `undefined` | Child elements with access to the message bus |

### AppContextProviderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appId` | `string` | required | Unique identifier for the app |
| `children` | `unknown` | `undefined` | Child elements that inherit this app ID |

## AppMessage

| Field | Type | Description |
|-------|------|-------------|
| `channel` | `string` | Channel name (e.g., `'clipboard'`, `'data-update'`) |
| `from` | `string` | Sender app ID |
| `to` | `string \| null` | Target app ID, or null for broadcast |
| `payload` | `T` | Message payload |
| `timestamp` | `number` | Timestamp (ms since epoch) |

## Hooks

### `useMessageBus()`

Returns a `MessageBusContextValue` with `publish`, `subscribe`, and `subscribeAll`. Automatically injects the current app's ID as the sender.

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `publish` | `(channel: string, payload: T, to?: string) => void` | Publish a message. Omit `to` for broadcast |
| `subscribe` | `(channel: string, handler: (msg: AppMessage<T>) => void) => () => void` | Subscribe to a channel. Returns unsubscribe function |
| `subscribeAll` | `(handler: (msg: AppMessage) => void) => () => void` | Subscribe to all messages (for debugging/logging) |

### `useAppId()`

Returns the current app's ID string from the nearest `AppContextProvider`.

### `useChannel<T>(channel: string, handler: (msg: AppMessage<T>) => void)`

Convenience hook that subscribes to a channel with automatic cleanup on unmount. Uses a ref for the handler to avoid stale closures.

## Usage

```ts
import { createElement } from 'specifyjs';
import {
  MessageBusProvider,
  AppContextProvider,
  useMessageBus,
  useChannel,
} from '@aspect/layout/app-message-bus';

// Wrap your app tree with both providers
const app = createElement(MessageBusProvider, {},
  createElement(AppContextProvider, { appId: 'editor' }, editorApp),
  createElement(AppContextProvider, { appId: 'preview' }, previewApp),
);

// In a sending component
function Editor() {
  const bus = useMessageBus();

  const handleSave = () => {
    bus.publish('file-saved', { path: '/doc.md' });
  };
}

// In a receiving component
function Preview() {
  useChannel('file-saved', (msg) => {
    console.log('File saved by:', msg.from, msg.payload);
  });
}

// Targeted message to a specific app
function Sender() {
  const bus = useMessageBus();
  bus.publish('clipboard', { text: 'Hello' }, 'editor');
}
```

## Features

- Channel-based pub/sub with typed payloads.
- Targeted messages (specify `to` app ID) or broadcast (omit `to`).
- Broadcast messages skip the sender automatically.
- Targeted messages are only delivered to the specified app.
- `subscribeAll` enables cross-cutting concerns like logging or debugging.
- Subscriptions are stored in refs to avoid unnecessary re-renders.
- Each app identifies itself via `AppContextProvider`, and the message bus hooks automatically inject the sender ID.
