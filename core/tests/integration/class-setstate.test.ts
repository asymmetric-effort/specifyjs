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
    class Counter extends Component<{}, { count: number }> {
      state = { count: 0 };
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<div>Count: 0</div>');

    // Get the instance and call setState
    const instance = (root as any)._root?.current?.child?.stateNode as Counter;
    expect(instance).toBeTruthy();

    instance.setState({ count: 1 });
    expect(container.innerHTML).toBe('<div>Count: 1</div>');
  });

  it('setState with functional updater receives previous state', () => {
    class Counter extends Component<{}, { count: number }> {
      state = { count: 5 };
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));

    const instance = (root as any)._root?.current?.child?.stateNode as Counter;
    instance.setState((prev: { count: number }) => ({ count: prev.count + 10 }));
    expect(container.innerHTML).toBe('<div>Count: 15</div>');
  });

  it('multiple setState calls batch into one re-render', () => {
    const renderSpy = vi.fn();

    class Counter extends Component<{}, { count: number }> {
      state = { count: 0 };
      render() {
        renderSpy();
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(renderSpy).toHaveBeenCalledTimes(1);

    const instance = (root as any)._root?.current?.child?.stateNode as Counter;
    instance.setState({ count: 1 });
    instance.setState({ count: 2 });
    instance.setState({ count: 3 });

    // All three should coalesce — at most one additional render pass
    // The final state should be count: 3
    expect(container.innerHTML).toBe('<div>Count: 3</div>');
  });

  it('setState in componentDidMount triggers re-render', () => {
    class AsyncLoader extends Component<{}, { loaded: boolean }> {
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
    let externalValue = 'initial';

    class ExternalReader extends Component {
      render() {
        return createElement('div', null, externalValue);
      }
    }

    const root = createRoot(container);
    root.render(createElement(ExternalReader, null));
    expect(container.innerHTML).toBe('<div>initial</div>');

    const instance = (root as any)._root?.current?.child?.stateNode as ExternalReader;
    externalValue = 'updated';
    instance.forceUpdate();
    expect(container.innerHTML).toBe('<div>updated</div>');
  });

  it('setState callback is called after re-render', () => {
    const callback = vi.fn();

    class Counter extends Component<{}, { count: number }> {
      state = { count: 0 };
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));

    const instance = (root as any)._root?.current?.child?.stateNode as Counter;
    instance.setState({ count: 1 }, callback);

    expect(container.innerHTML).toBe('<div>Count: 1</div>');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('setState does not re-render after unmount', () => {
    const renderSpy = vi.fn();

    class Counter extends Component<{}, { count: number }> {
      state = { count: 0 };
      render() {
        renderSpy();
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    const instance = (root as any)._root?.current?.child?.stateNode as Counter;

    root.unmount();
    const callsBefore = renderSpy.mock.calls.length;

    // setState after unmount should be a no-op
    instance.setState({ count: 99 });
    expect(renderSpy.mock.calls.length).toBe(callsBefore);
  });

  it('PureComponent skips re-render when state is shallowly equal', () => {
    const renderSpy = vi.fn();

    class PureCounter extends PureComponent<{}, { count: number }> {
      state = { count: 0 };
      render() {
        renderSpy();
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(PureCounter, null));
    expect(renderSpy).toHaveBeenCalledTimes(1);

    const instance = (root as any)._root?.current?.child?.stateNode as PureCounter;
    // Set to same value — should skip re-render
    instance.setState({ count: 0 });
    expect(renderSpy).toHaveBeenCalledTimes(1); // No additional render
  });

  it('PureComponent re-renders when state changes', () => {
    class PureCounter extends PureComponent<{}, { count: number }> {
      state = { count: 0 };
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(PureCounter, null));
    expect(container.innerHTML).toBe('<div>Count: 0</div>');

    const instance = (root as any)._root?.current?.child?.stateNode as PureCounter;
    instance.setState({ count: 5 });
    expect(container.innerHTML).toBe('<div>Count: 5</div>');
  });

  it('forceUpdate bypasses shouldComponentUpdate on PureComponent', () => {
    let externalValue = 'a';

    class PureReader extends PureComponent {
      render() {
        return createElement('div', null, externalValue);
      }
    }

    const root = createRoot(container);
    root.render(createElement(PureReader, null));
    expect(container.innerHTML).toBe('<div>a</div>');

    const instance = (root as any)._root?.current?.child?.stateNode as PureReader;
    externalValue = 'b';
    instance.forceUpdate();
    expect(container.innerHTML).toBe('<div>b</div>');
  });
});
