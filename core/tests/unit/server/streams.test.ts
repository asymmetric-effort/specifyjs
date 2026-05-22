import { describe, it, expect, vi } from 'vitest';
import { renderToPipeableStream } from '../../../src/server/render-to-pipeable-stream';
import { renderToReadableStream } from '../../../src/server/render-to-readable-stream';
import { createElement } from '../../../src/index';
import { Writable } from 'stream';

describe('renderToPipeableStream', () => {
  it('pipes HTML to a writable stream', () => {
    const chunks: string[] = [];
    const writable = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk.toString());
        cb();
      },
    });

    const stream = renderToPipeableStream(createElement('div', null, 'streamed'));
    stream.pipe(writable);

    expect(chunks.join('')).toBe('<div>streamed</div>');
  });

  it('calls onShellReady', () => {
    const onShellReady = vi.fn();
    const writable = new Writable({
      write(_c, _e, cb) {
        cb();
      },
    });

    const stream = renderToPipeableStream(createElement('div', null, 'ready'), { onShellReady });
    stream.pipe(writable);

    expect(onShellReady).toHaveBeenCalledTimes(1);
  });

  it('calls onAllReady', () => {
    const onAllReady = vi.fn();
    const writable = new Writable({
      write(_c, _e, cb) {
        cb();
      },
    });

    const stream = renderToPipeableStream(createElement('div', null, 'all'), { onAllReady });
    stream.pipe(writable);

    expect(onAllReady).toHaveBeenCalledTimes(1);
  });

  it('abort prevents output', () => {
    const chunks: string[] = [];
    const writable = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk.toString());
        cb();
      },
    });

    const stream = renderToPipeableStream(createElement('div', null, 'aborted'));
    stream.abort(new Error('cancelled'));
    stream.pipe(writable);

    expect(chunks).toEqual([]);
  });

  it('abort calls onError', () => {
    const onError = vi.fn();
    const stream = renderToPipeableStream(createElement('div', null, 'err'), { onError });
    stream.abort(new Error('aborted'));
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('handles render errors', () => {
    const onShellError = vi.fn();
    const onError = vi.fn();
    const writable = new Writable({
      write(_c, _e, cb) {
        cb();
      },
    });

    // A component that throws
    const Broken = () => {
      throw new Error('render fail');
    };

    const stream = renderToPipeableStream(createElement(Broken, null), { onShellError, onError });
    stream.pipe(writable);

    expect(onShellError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('renderToReadableStream', () => {
  it('produces a ReadableStream with HTML', async () => {
    const stream = await renderToReadableStream(createElement('div', null, 'web'));
    const reader = stream.getReader();
    const { value, done } = await reader.read();
    const text = new TextDecoder().decode(value);
    expect(text).toBe('<div>web</div>');

    const end = await reader.read();
    expect(end.done).toBe(true);
  });

  it('handles render errors', async () => {
    const onError = vi.fn();
    const Broken = () => {
      throw new Error('stream fail');
    };

    const stream = await renderToReadableStream(createElement(Broken, null), { onError });

    const reader = stream.getReader();
    try {
      await reader.read();
    } catch {
      // Error expected
    }

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('handles aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();

    const stream = await renderToReadableStream(createElement('div', null, 'aborted'), {
      signal: controller.signal,
    });

    const reader = stream.getReader();
    const { done } = await reader.read();
    expect(done).toBe(true);
  });
});
