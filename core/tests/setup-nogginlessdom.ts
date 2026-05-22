// NogginLessDom DOM environment setup for tests
import {
  createWindow,
  Document,
  Element,
  Node,
  Event,
  NodeList,
} from '@asymmetric-effort/nogginlessdom';
import { setComponentIdsEnabled } from '../src/shared/component-registry';

const win = createWindow();
const doc = win.document;

if (!doc.body) {
  const body = doc.createElement('body');
  (doc as any).appendChild(body);
}

(globalThis as any).window = win;
(globalThis as any).document = doc;
(globalThis as any).Document = Document;
(globalThis as any).DocumentFragment = class DocumentFragment {};
(globalThis as any).Element = Element;
(globalThis as any).HTMLElement = Element;
(globalThis as any).HTMLDivElement = Element;
(globalThis as any).Node = Node;
(globalThis as any).NodeList = NodeList;
(globalThis as any).Event = Event;
(globalThis as any).MouseEvent = Event;
(globalThis as any).KeyboardEvent = Event;
(globalThis as any).CustomEvent = Event;
(globalThis as any).MutationObserver = class MutationObserver {
  observe() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

setComponentIdsEnabled(false);
