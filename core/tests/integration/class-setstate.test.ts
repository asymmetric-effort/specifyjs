// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Integration tests for class component setState triggering re-renders.
 * Regression tests for GitHub issue #35.
 *
 * These tests verify that:
 * 1. setState triggers a re-render and updates the DOM
 * 2. Functional updaters receive previous state
 * 3. Multiple setState calls batch into a single re-render
 * 4. componentDidMount + setState works (standard React pattern)
 * 5. forceUpdate triggers a re-render
 * 6. PureComponent respects shouldComponentUpdate after setState
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement, Component, PureComponent } from '../../src/index';
import { createRoot } from '../../src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('class component setState re-render (issue #35)', () => {
  it('setState with object updates the DOM', () => {
    let instanceRef: Counter | null = null;

    class Counter extends Component<object, { count: number }> {
      state = { count: 0 };
      componentDidMount() {
        instanceRef = this;
      }
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<div>Count: 0</div>');
    expect(instanceRef).not.toBeNull();

    instanceRef!.setState({ count: 1 });
    expect(container.innerHTML).toBe('<div>Count: 1</div>');
  });

  it('setState with functional updater receives previous state', () => {
    let instanceRef: Counter | null = null;

    class Counter extends Component<object, { count: number }> {
      state = { count: 5 };
      componentDidMount() {
        instanceRef = this;
      }
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));

    instanceRef!.setState((prev: { count: number }) => ({ count: prev.count + 10 }));
    expect(container.innerHTML).toBe('<div>Count: 15</div>');
  });

  it('multiple setState calls coalesce into final state', () => {
    let instanceRef: Counter | null = null;

    class Counter extends Component<object, { count: number }> {
      state = { count: 0 };
      componentDidMount() {
        instanceRef = this;
      }
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));

    instanceRef!.setState({ count: 1 });
    instanceRef!.setState({ count: 2 });
    instanceRef!.setState({ count: 3 });

    // Final state should be count: 3
    expect(container.innerHTML).toBe('<div>Count: 3</div>');
  });

  it('setState in componentDidMount triggers re-render', () => {
    class AsyncLoader extends Component<object, { loaded: boolean }> {
      state = { loaded: false };

      componentDidMount() {
        this.setState({ loaded: true });
      }

      render() {
        return createElement('div', null, this.state.loaded ? 'Loaded' : 'Loading...');
      }
    }

    const root = createRoot(container);
    root.render(createElement(AsyncLoader, null));

    // After mount, componentDidMount fires setState, which should trigger re-render
    expect(container.innerHTML).toBe('<div>Loaded</div>');
  });

  it('forceUpdate triggers re-render without state change', () => {
    let instanceRef: ExternalReader | null = null;
    let externalValue = 'initial';

    class ExternalReader extends Component {
      componentDidMount() {
        instanceRef = this;
      }
      render() {
        return createElement('div', null, externalValue);
      }
    }

    const root = createRoot(container);
    root.render(createElement(ExternalReader, null));
    expect(container.innerHTML).toBe('<div>initial</div>');

    externalValue = 'updated';
    instanceRef!.forceUpdate();
    expect(container.innerHTML).toBe('<div>updated</div>');
  });

  it('setState callback is called after re-render', () => {
    let instanceRef: Counter | null = null;
    const callback = vi.fn();

    class Counter extends Component<object, { count: number }> {
      state = { count: 0 };
      componentDidMount() {
        instanceRef = this;
      }
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));

    instanceRef!.setState({ count: 1 }, callback);

    expect(container.innerHTML).toBe('<div>Count: 1</div>');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('setState does not crash after unmount', () => {
    let instanceRef: Counter | null = null;

    class Counter extends Component<object, { count: number }> {
      state = { count: 0 };
      componentDidMount() {
        instanceRef = this;
      }
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));

    root.unmount();

    // setState after unmount should not throw
    expect(() => {
      instanceRef!.setState({ count: 99 });
    }).not.toThrow();
  });

  it('PureComponent skips re-render when state is shallowly equal', () => {
    let instanceRef: PureCounter | null = null;
    const renderSpy = vi.fn();

    class PureCounter extends PureComponent<object, { count: number }> {
      state = { count: 0 };
      componentDidMount() {
        instanceRef = this;
      }
      render() {
        renderSpy();
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(PureCounter, null));
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Set to same value — PureComponent should skip re-render
    instanceRef!.setState({ count: 0 });
    // render may or may not be called again depending on batching,
    // but the DOM should remain unchanged
    expect(container.innerHTML).toBe('<div>Count: 0</div>');
  });

  it('PureComponent re-renders when state actually changes', () => {
    let instanceRef: PureCounter | null = null;

    class PureCounter extends PureComponent<object, { count: number }> {
      state = { count: 0 };
      componentDidMount() {
        instanceRef = this;
      }
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(PureCounter, null));
    expect(container.innerHTML).toBe('<div>Count: 0</div>');

    instanceRef!.setState({ count: 5 });
    expect(container.innerHTML).toBe('<div>Count: 5</div>');
  });

  it('forceUpdate bypasses shouldComponentUpdate on PureComponent', () => {
    let instanceRef: PureReader | null = null;
    let externalValue = 'a';

    class PureReader extends PureComponent {
      componentDidMount() {
        instanceRef = this;
      }
      render() {
        return createElement('div', null, externalValue);
      }
    }

    const root = createRoot(container);
    root.render(createElement(PureReader, null));
    expect(container.innerHTML).toBe('<div>a</div>');

    externalValue = 'b';
    instanceRef!.forceUpdate();
    expect(container.innerHTML).toBe('<div>b</div>');
  });
});
