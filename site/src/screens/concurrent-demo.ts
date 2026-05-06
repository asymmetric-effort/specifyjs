// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from 'specifyjs';
import { useState, useTransition, useDeferredValue, useMemo, useCallback, useHead } from 'specifyjs/hooks';

export function ConcurrentDemo() {
  useHead({
    title: 'Concurrent Rendering — SpecifyJS',
    description: 'Lane-based concurrent rendering with useTransition, useDeferredValue, and time-slicing demos.',
    keywords: 'specifyjs, concurrent rendering, useTransition, useDeferredValue, time slicing',
    author: 'Asymmetric Effort, LLC',
  });

  return createElement('div', null,
    createElement('div', { className: 'section' },
      createElement('h2', null, 'Concurrent Rendering'),
      createElement('p', { style: { color: '#64748b', marginBottom: '24px' } },
        'SpecifyJS implements lane-based concurrent rendering. useTransition and useDeferredValue let you keep the UI responsive during expensive updates.',
      ),
    ),
    createElement('div', { className: 'preview-grid' },
      createElement('div', { className: 'preview-card' },
        createElement('div', { className: 'preview-header' }, 'useDeferredValue — Filterable List'),
        createElement('div', { className: 'preview-body' }, createElement(DeferredFilterDemo, null)),
      ),
      createElement('div', { className: 'preview-card' },
        createElement('div', { className: 'preview-header' }, 'useTransition — Tab Switch'),
        createElement('div', { className: 'preview-body' }, createElement(TransitionTabDemo, null)),
      ),
      createElement('div', { className: 'preview-card' },
        createElement('div', { className: 'preview-header' }, 'Batched State Updates'),
        createElement('div', { className: 'preview-body' }, createElement(BatchedUpdatesDemo, null)),
      ),
      createElement('div', { className: 'preview-card' },
        createElement('div', { className: 'preview-header' }, 'Lane Priority Visualization'),
        createElement('div', { className: 'preview-body' }, createElement(LanePriorityDemo, null)),
      ),
    ),
  );
}

function DeferredFilterDemo() {
  const allItems = useMemo(() =>
    Array.from({ length: 200 }, (_, i) => `Item ${i + 1} — ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][i % 5]} category`),
  []);

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    if (!deferredQuery) return allItems.slice(0, 20);
    return allItems.filter(item => item.toLowerCase().includes(deferredQuery.toLowerCase()));
  }, [deferredQuery, allItems]);

  return createElement('div', null,
    createElement('input', {
      type: 'text', value: query, placeholder: 'Filter 200 items...', 'aria-label': 'Filter items',
      onInput: (e: Event) => setQuery((e.target as HTMLInputElement).value),
      style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', marginBottom: '8px' },
    }),
    createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginBottom: '8px' } },
      `Showing ${filtered.length} of ${allItems.length} items (deferred: "${deferredQuery}")`,
    ),
    createElement('div', { style: { maxHeight: '150px', overflowY: 'auto', fontSize: '13px' } },
      ...filtered.slice(0, 30).map(item =>
        createElement('div', { key: item, style: { padding: '3px 0', borderBottom: '1px solid #f1f5f9' } }, item),
      ),
      filtered.length > 30
        ? createElement('div', { style: { padding: '6px 0', color: '#94a3b8', fontStyle: 'italic' } },
            `...and ${filtered.length - 30} more`,
          )
        : null,
    ),
  );
}

function TransitionTabDemo() {
  const tabs = ['Fast', 'Medium', 'Slow'];
  const [activeTab, setActiveTab] = useState(0);
  const [isPending, startTransition] = useTransition();

  const switchTab = useCallback((idx: number) => {
    startTransition(() => {
      setActiveTab(idx);
    });
  }, [startTransition]);

  const tabContent = useMemo(() => {
    const items = Array.from({ length: 50 }, (_, i) => `${tabs[activeTab]} item ${i + 1}`);
    return items;
  }, [activeTab]);

  const tabBtnStyle = (isActive: boolean) => ({
    padding: '6px 14px',
    border: 'none',
    borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? '#3b82f6' : '#64748b',
  });

  return createElement('div', null,
    createElement('div', { style: { display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '8px' } },
      ...tabs.map((tab, i) =>
        createElement('button', { key: tab, style: tabBtnStyle(i === activeTab), onClick: () => switchTab(i) }, tab),
      ),
    ),
    isPending
      ? createElement('div', { style: { fontSize: '13px', color: '#f59e0b', marginBottom: '4px' } }, 'Transition pending...')
      : null,
    createElement('div', { style: { maxHeight: '120px', overflowY: 'auto', fontSize: '13px' } },
      ...tabContent.slice(0, 10).map(item =>
        createElement('div', { key: item, style: { padding: '2px 0' } }, item),
      ),
    ),
  );
}

function BatchedUpdatesDemo() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [renderCount, setRenderCount] = useState(0);

  // Count renders
  const count = renderCount + 1;
  if (count !== renderCount + 1) setRenderCount(count);

  const handleBatched = useCallback(() => {
    // These are batched — only one re-render
    setA(prev => prev + 1);
    setB(prev => prev + 1);
  }, []);

  return createElement('div', null,
    createElement('div', { style: { display: 'flex', gap: '16px', marginBottom: '12px' } },
      createElement('div', null,
        createElement('span', { style: { fontSize: '13px', color: '#64748b' } }, 'A: '),
        createElement('span', { style: { fontSize: '18px', fontWeight: '700' } }, String(a)),
      ),
      createElement('div', null,
        createElement('span', { style: { fontSize: '13px', color: '#64748b' } }, 'B: '),
        createElement('span', { style: { fontSize: '18px', fontWeight: '700' } }, String(b)),
      ),
    ),
    createElement('button', {
      onClick: handleBatched,
      style: { padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: '#f8fafc' },
    }, 'Increment Both (Batched)'),
    createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' } },
      'Both values update in a single render cycle thanks to automatic batching.',
    ),
  );
}

function LanePriorityDemo() {
  const lanes = [
    { name: 'SyncLane', value: 1, color: '#ef4444', desc: 'flushSync — highest priority' },
    { name: 'DefaultLane', value: 4, color: '#f59e0b', desc: 'Normal useState/useReducer' },
    { name: 'TransitionLane', value: 8, color: '#3b82f6', desc: 'startTransition — interruptible' },
    { name: 'IdleLane', value: 64, color: '#94a3b8', desc: 'Background work — lowest priority' },
  ];

  return createElement('div', null,
    createElement('p', { style: { fontSize: '13px', color: '#64748b', marginBottom: '12px' } },
      'SpecifyJS uses a bitmask-based lane system for priority scheduling:',
    ),
    ...lanes.map(lane =>
      createElement('div', {
        key: lane.name,
        style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
      },
        createElement('div', {
          style: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: lane.color, flexShrink: '0' },
        }),
        createElement('div', null,
          createElement('div', { style: { fontSize: '14px', fontWeight: '600' } }, lane.name),
          createElement('div', { style: { fontSize: '12px', color: '#94a3b8' } }, lane.desc),
        ),
      ),
    ),
  );
}
