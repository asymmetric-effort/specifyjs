// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

export { UnityDesktop } from './UnityDesktop';
export type { UnityDesktopProps, UnityDesktopApp, UnityDesktopUser, ToastNotification } from './UnityDesktop';

export { UnityApp } from './UnityApp';
export type { UnityAppProps } from './UnityApp';

// Re-export message bus and drag-drop for convenience
export {
  MessageBusProvider,
  useMessageBus,
  useChannel,
  AppContextProvider,
  useAppId,
} from '../../../layout/app-message-bus/src/index';

export type {
  AppMessage,
  MessageBusContextValue,
  AppContextValue,
} from '../../../layout/app-message-bus/src/index';

export {
  DragDropProvider,
  useDragDrop,
  useDraggable,
  useDropZone,
} from '../../../layout/app-drag-drop/src/index';

export type {
  DragPayload,
  DropZone,
  DragDropContextValue,
} from '../../../layout/app-drag-drop/src/index';
