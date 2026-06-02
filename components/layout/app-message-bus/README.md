# @specifyjs/layout-app-message-bus

Publish/subscribe message bus enabling communication between applications running inside the Unity Desktop.

## Usage

Wrap your app tree with `MessageBusProvider`, then use `useMessageBus()` or `useChannel()` inside any descendant.

## API

- `MessageBusProvider` -- Context provider
- `AppContextProvider` -- Sets the current app ID for message sender identification
- `useMessageBus()` -- Returns the full MessageBusContext
- `useChannel<T>(channel, handler)` -- Convenience hook for subscribing to a channel
- `useAppId()` -- Returns the current app ID from AppContext
