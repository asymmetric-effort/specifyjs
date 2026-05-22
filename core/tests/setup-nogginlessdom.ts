import {
  createWindow,
  Document,
  Element,
  Node,
  Event,
  DocumentFragment,
} from '@asymmetric-effort/nogginlessdom';

const win = createWindow();
(globalThis as any).window = win;
(globalThis as any).document = win.document;
(globalThis as any).Document = Document;
(globalThis as any).Element = Element;
(globalThis as any).Node = Node;
(globalThis as any).Event = Event;
(globalThis as any).DocumentFragment = DocumentFragment;
(globalThis as any).HTMLElement = Element;
(globalThis as any).MouseEvent = class MouseEvent extends Event {
  constructor(type: string, opts?: any) {
    super(type, opts);
  }
};
(globalThis as any).KeyboardEvent = class KeyboardEvent extends Event {
  key: string;
  constructor(type: string, opts?: any) {
    super(type, opts);
    this.key = opts?.key || '';
  }
};
