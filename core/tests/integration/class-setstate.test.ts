// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Integration tests for class component setState triggering re-renders.
 * Regression tests for GitHub issue #35.
 *
 * setState updates are batched via scheduleMicrotask, so tests use
 * flushMicrotasks() to process pending updates before asserting.
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  fn,
  spyOn,
  mock,
} from '@asymmetric-effort/nogginlessdom';
import { createElement, Component, PureComponent } from '../../src/index';
import { createRoot } from '../../src/dom/create-root';

/** Flush pending microtasks by awaiting a resolved promise. */
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => {
    queueMicrotask(resolve);
  });
}

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('class component setState re-render (issue #35)', () => {
  it('setState with object updates the DOM', async () => {
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
    await flushMicrotasks();
    expect(container.innerHTML).toBe('<div>Count: 1</div>');
  });

  it('setState with functional updater receives previous state', async () => {
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
    await flushMicrotasks();
    expect(container.innerHTML).toBe('<div>Count: 15</div>');
  });

  it('multiple setState calls coalesce into final state', async () => {
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
    await flushMicrotasks();

    // Final state should be count: 3
    expect(container.innerHTML).toBe('<div>Count: 3</div>');
  });

  it('setState in componentDidMount triggers re-render', async () => {
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

    // componentDidMount fires setState, which defers via microtask
    await flushMicrotasks();
    expect(container.innerHTML).toBe('<div>Loaded</div>');
  });

  it('forceUpdate triggers re-render without state change', async () => {
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
    await flushMicrotasks();
    expect(container.innerHTML).toBe('<div>updated</div>');
  });

  it('setState callback is called after re-render', async () => {
    let instanceRef: Counter | null = null;
    const callback = fn();

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
    await flushMicrotasks();

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

  it('PureComponent skips re-render when state is shallowly equal', async () => {
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

    // Set to same value — PureComponent should skip re-render
    instanceRef!.setState({ count: 0 });
    await flushMicrotasks();
    expect(container.innerHTML).toBe('<div>Count: 0</div>');
  });

  it('PureComponent re-renders when state actually changes', async () => {
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
    await flushMicrotasks();
    expect(container.innerHTML).toBe('<div>Count: 5</div>');
  });

  it('forceUpdate bypasses shouldComponentUpdate on PureComponent', async () => {
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
    await flushMicrotasks();
    expect(container.innerHTML).toBe('<div>b</div>');
  });
});
