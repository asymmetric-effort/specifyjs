// NogginLessDom DOM environment setup for tests
// Uses typed HTML elements, typed events, and real MutationObserver
// from nogginlessdom instead of base Element/Event stubs.
import {
  createWindow,
  Document,
  DocumentFragment,
  Element,
  Node,
  NodeList,
  // Typed HTML Elements (#88)
  HTMLAnchorElement,
  HTMLButtonElement,
  HTMLInputElement,
  HTMLSelectElement,
  HTMLTextAreaElement,
  HTMLFormElement,
  HTMLImageElement,
  HTMLLabelElement,
  HTMLOptionElement,
  HTMLDialogElement,
  HTMLCanvasElement,
  HTMLTemplateElement,
  HTMLIFrameElement,
  HTMLVideoElement,
  HTMLAudioElement,
  HTMLProgressElement,
  HTMLMeterElement,
  HTMLDetailsElement,
  HTMLTableElement,
  HTMLTableRowElement,
  HTMLTableCellElement,
  HTMLFieldSetElement,
  HTMLScriptElement,
  HTMLSlotElement,
  // Typed Events (#89)
  Event,
  CustomEvent,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  InputEvent,
  WheelEvent,
  PointerEvent,
  TouchEvent,
  DragEvent,
  ClipboardEvent,
  // Real MutationObserver (#90)
  MutationObserver,
  MutationRecord,
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
(globalThis as any).DocumentFragment = DocumentFragment;
(globalThis as any).Element = Element;
(globalThis as any).Node = Node;
(globalThis as any).NodeList = NodeList;

// Typed HTML elements — each has type-specific properties
// (value, checked, disabled, validity, selectedIndex, etc.)
(globalThis as any).HTMLElement = Element;
(globalThis as any).HTMLDivElement = Element;
(globalThis as any).HTMLSpanElement = Element;
(globalThis as any).HTMLAnchorElement = HTMLAnchorElement;
(globalThis as any).HTMLButtonElement = HTMLButtonElement;
(globalThis as any).HTMLInputElement = HTMLInputElement;
(globalThis as any).HTMLSelectElement = HTMLSelectElement;
(globalThis as any).HTMLTextAreaElement = HTMLTextAreaElement;
(globalThis as any).HTMLFormElement = HTMLFormElement;
(globalThis as any).HTMLImageElement = HTMLImageElement;
(globalThis as any).HTMLLabelElement = HTMLLabelElement;
(globalThis as any).HTMLOptionElement = HTMLOptionElement;
(globalThis as any).HTMLDialogElement = HTMLDialogElement;
(globalThis as any).HTMLCanvasElement = HTMLCanvasElement;
(globalThis as any).HTMLTemplateElement = HTMLTemplateElement;
(globalThis as any).HTMLIFrameElement = HTMLIFrameElement;
(globalThis as any).HTMLVideoElement = HTMLVideoElement;
(globalThis as any).HTMLAudioElement = HTMLAudioElement;
(globalThis as any).HTMLProgressElement = HTMLProgressElement;
(globalThis as any).HTMLMeterElement = HTMLMeterElement;
(globalThis as any).HTMLDetailsElement = HTMLDetailsElement;
(globalThis as any).HTMLTableElement = HTMLTableElement;
(globalThis as any).HTMLTableRowElement = HTMLTableRowElement;
(globalThis as any).HTMLTableCellElement = HTMLTableCellElement;
(globalThis as any).HTMLFieldSetElement = HTMLFieldSetElement;
(globalThis as any).HTMLScriptElement = HTMLScriptElement;
(globalThis as any).HTMLSlotElement = HTMLSlotElement;

// Typed events — each has correct properties
// (clientX/clientY, key, dataTransfer, touches, deltaY, etc.)
(globalThis as any).Event = Event;
(globalThis as any).CustomEvent = CustomEvent;
(globalThis as any).MouseEvent = MouseEvent;
(globalThis as any).KeyboardEvent = KeyboardEvent;
(globalThis as any).FocusEvent = FocusEvent;
(globalThis as any).InputEvent = InputEvent;
(globalThis as any).WheelEvent = WheelEvent;
(globalThis as any).PointerEvent = PointerEvent;
(globalThis as any).TouchEvent = TouchEvent;
(globalThis as any).DragEvent = DragEvent;
(globalThis as any).ClipboardEvent = ClipboardEvent;

// Real MutationObserver — tracks actual DOM mutations
(globalThis as any).MutationObserver = MutationObserver;
(globalThis as any).MutationRecord = MutationRecord;

setComponentIdsEnabled(false);
