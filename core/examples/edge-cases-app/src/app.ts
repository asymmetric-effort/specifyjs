import { createElement, Fragment, ErrorBoundary, forwardRef, createRef, memo } from '../../../src/index';
import { useState, useRef, useCallback, useEffect } from '../../../src/hooks/index';
import { createRoot } from '../../../src/dom/create-root';

// ============================================================================
// 1. Keyed List Reorder
// ============================================================================
function KeyedListSection() {
  const [items, setItems] = useState<string[]>(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon']);

  const reverse = useCallback(() => {
    setItems((prev: string[]) => [...prev].reverse());
  }, []);

  const shuffle = useCallback(() => {
    setItems((prev: string[]) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }, []);

  return createElement('section', { 'data-testid': 'keyed-list-section' },
    createElement('h2', null, 'Keyed List Reorder'),
    createElement('button', { onClick: reverse, 'data-testid': 'reverse-btn' }, 'Reverse'),
    createElement('button', { onClick: shuffle, 'data-testid': 'shuffle-btn' }, 'Shuffle'),
    createElement('ul', { 'data-testid': 'keyed-list' },
      ...items.map((item: string) =>
        createElement('li', {
          key: item,
          className: 'list-item',
          'data-testid': `item-${item.toLowerCase()}`,
        }, item),
      ),
    ),
    createElement('span', { 'data-testid': 'list-order' }, items.join(',')),
  );
}

// ============================================================================
// 2. Fragment Nesting
// ============================================================================
function InnerFragment() {
  return createElement(Fragment, null,
    createElement('span', { 'data-testid': 'frag-inner-1' }, 'Inner A'),
    createElement('span', { 'data-testid': 'frag-inner-2' }, 'Inner B'),
  );
}

function FragmentSection() {
  return createElement('section', { 'data-testid': 'fragment-section' },
    createElement('h2', null, 'Fragment Nesting'),
    createElement(Fragment, null,
      createElement('span', { 'data-testid': 'frag-outer-1' }, 'Outer A'),
      createElement(InnerFragment, null),
      createElement('span', { 'data-testid': 'frag-outer-2' }, 'Outer B'),
    ),
  );
}

// ============================================================================
// 3. Conditional Rendering
// ============================================================================
function ConditionalSection() {
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(false);

  return createElement('section', { 'data-testid': 'conditional-section' },
    createElement('h2', null, 'Conditional Rendering'),
    createElement('button', {
      onClick: () => setShowA((prev: boolean) => !prev),
      'data-testid': 'toggle-a',
    }, 'Toggle A'),
    createElement('button', {
      onClick: () => setShowB((prev: boolean) => !prev),
      'data-testid': 'toggle-b',
    }, 'Toggle B'),
    createElement('div', { 'data-testid': 'conditional-container' },
      showA ? createElement('div', { 'data-testid': 'panel-a' }, 'Panel A is visible') : null,
      showB ? createElement('div', { 'data-testid': 'panel-b' }, 'Panel B is visible') : null,
      !showA && !showB ? createElement('div', { 'data-testid': 'empty-state' }, 'Nothing to show') : null,
    ),
  );
}

// ============================================================================
// 4. Rapid State Updates
// ============================================================================
function RapidUpdatesSection() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((prev: number) => prev + 1);
  }, []);

  const incrementBy5 = useCallback(() => {
    // 5 synchronous functional updates in a row
    setCount((prev: number) => prev + 1);
    setCount((prev: number) => prev + 1);
    setCount((prev: number) => prev + 1);
    setCount((prev: number) => prev + 1);
    setCount((prev: number) => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  return createElement('section', { 'data-testid': 'rapid-updates-section' },
    createElement('h2', null, 'Rapid State Updates'),
    createElement('span', { 'data-testid': 'rapid-count' }, String(count)),
    createElement('button', { onClick: increment, 'data-testid': 'rapid-inc' }, '+1'),
    createElement('button', { onClick: incrementBy5, 'data-testid': 'rapid-inc5' }, '+5 (batch)'),
    createElement('button', { onClick: reset, 'data-testid': 'rapid-reset' }, 'Reset'),
  );
}

// ============================================================================
// 5. Error Boundary
// ============================================================================
function SafeChild() {
  return createElement('div', { 'data-testid': 'working-child' }, 'Child is working');
}

function ErrorBoundarySection() {
  const [errorCaught, setErrorCaught] = useState(false);

  const recover = useCallback(() => {
    setErrorCaught(false);
  }, []);

  return createElement('section', { 'data-testid': 'error-boundary-section' },
    createElement('h2', null, 'Error Boundary'),
    createElement('button', { onClick: recover, 'data-testid': 'recover-error' }, 'Recover'),
    createElement(ErrorBoundary, {
      fallback: createElement('div', { 'data-testid': 'error-fallback', className: 'error-fallback' }, 'Something went wrong'),
      onError: () => setErrorCaught(true),
    },
      createElement(SafeChild, null),
    ),
    createElement('span', { 'data-testid': 'error-status' }, errorCaught ? 'error-caught' : 'no-error'),
  );
}

// ============================================================================
// 6. Ref Attachment
// ============================================================================
const FancyInput = forwardRef(function FancyInput(props: { label: string }, ref: unknown) {
  return createElement('div', { 'data-testid': 'fancy-input-wrapper' },
    createElement('label', null, props.label),
    createElement('input', {
      type: 'text',
      ref: ref,
      'data-testid': 'fancy-input',
      placeholder: 'Type here...',
    }),
  );
});

function RefSection() {
  const inputRef = createRef<HTMLInputElement>();
  const [refValue, setRefValue] = useState('');

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const readRef = useCallback(() => {
    if (inputRef.current) {
      setRefValue(inputRef.current.value);
    }
  }, []);

  return createElement('section', { 'data-testid': 'ref-section' },
    createElement('h2', null, 'Ref Attachment'),
    createElement(FancyInput, { label: 'Forwarded ref input: ', ref: inputRef }),
    createElement('button', { onClick: focusInput, 'data-testid': 'focus-btn' }, 'Focus Input'),
    createElement('button', { onClick: readRef, 'data-testid': 'read-ref-btn' }, 'Read Ref Value'),
    createElement('span', { 'data-testid': 'ref-readout' }, refValue),
  );
}

// ============================================================================
// 7. Event Delegation
// ============================================================================
function EventDelegationSection() {
  const [log, setLog] = useState<string[]>([]);

  const handleContainerClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const id = target.getAttribute('data-testid') || target.tagName;
    setLog((prev: string[]) => [...prev, `container:${id}`]);
  }, []);

  const handleInnerClick = useCallback((e: Event) => {
    e.stopPropagation();
    setLog((prev: string[]) => [...prev, 'inner-stopped']);
  }, []);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return createElement('section', { 'data-testid': 'event-delegation-section' },
    createElement('h2', null, 'Event Delegation'),
    createElement('div', {
      onClick: handleContainerClick,
      'data-testid': 'event-container',
      style: { padding: '12px', border: '1px dashed #9ca3af', borderRadius: '4px' },
    },
      createElement('button', { 'data-testid': 'bubble-btn' }, 'Click (bubbles)'),
      createElement('button', { onClick: handleInnerClick, 'data-testid': 'stop-btn' }, 'Click (stops)'),
      createElement('div', { 'data-testid': 'nested-target' },
        createElement('span', { 'data-testid': 'deep-child' }, 'Deep child'),
      ),
    ),
    createElement('button', { onClick: clearLog, 'data-testid': 'clear-log' }, 'Clear Log'),
    createElement('div', { 'data-testid': 'event-log', className: 'event-log' }, log.join(' | ')),
  );
}

// ============================================================================
// 8. SVG Rendering
// ============================================================================
function SvgSection() {
  const [radius, setRadius] = useState(40);

  const grow = useCallback(() => {
    setRadius((prev: number) => Math.min(prev + 10, 80));
  }, []);

  const shrink = useCallback(() => {
    setRadius((prev: number) => Math.max(prev - 10, 10));
  }, []);

  return createElement('section', { 'data-testid': 'svg-section' },
    createElement('h2', null, 'SVG Rendering'),
    createElement('svg', {
      width: '200',
      height: '200',
      viewBox: '0 0 200 200',
      'data-testid': 'svg-element',
      xmlns: 'http://www.w3.org/2000/svg',
    },
      createElement('circle', {
        cx: '100',
        cy: '100',
        r: String(radius),
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: '2',
        'data-testid': 'svg-circle',
      }),
      createElement('text', {
        x: '100',
        y: '105',
        textAnchor: 'middle',
        fill: '#fff',
        fontSize: '14',
        'data-testid': 'svg-text',
      }, `r=${radius}`),
    ),
    createElement('button', { onClick: grow, 'data-testid': 'svg-grow' }, 'Grow'),
    createElement('button', { onClick: shrink, 'data-testid': 'svg-shrink' }, 'Shrink'),
    createElement('span', { 'data-testid': 'svg-radius' }, String(radius)),
  );
}

// ============================================================================
// 9. Memo (prevents unnecessary re-renders)
// ============================================================================
let memoRenderCount = 0;

const MemoChild = memo(function MemoChild(props: { value: number }) {
  memoRenderCount++;
  return createElement('span', { 'data-testid': 'memo-child-value' }, String(props.value));
});

function MemoSection() {
  const [stableValue, _setStableValue] = useState(42);
  const [otherState, setOtherState] = useState(0);

  return createElement('section', { 'data-testid': 'memo-section' },
    createElement('h2', null, 'Memo Optimization'),
    createElement(MemoChild, { value: stableValue }),
    createElement('button', {
      onClick: () => setOtherState((prev: number) => prev + 1),
      'data-testid': 'memo-trigger',
    }, 'Update Other State'),
    createElement('span', { 'data-testid': 'memo-other' }, String(otherState)),
  );
}

// ============================================================================
// Root App
// ============================================================================
function EdgeCasesApp() {
  return createElement('div', { id: 'edge-cases-app' },
    createElement('h1', null, 'Rendering Edge Cases'),
    createElement(KeyedListSection, null),
    createElement(FragmentSection, null),
    createElement(ConditionalSection, null),
    createElement(RapidUpdatesSection, null),
    createElement(ErrorBoundarySection, null),
    createElement(RefSection, null),
    createElement(EventDelegationSection, null),
    createElement(SvgSection, null),
    createElement(MemoSection, null),
  );
}

// Mount
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(createElement(EdgeCasesApp, null));
}

export { EdgeCasesApp };
