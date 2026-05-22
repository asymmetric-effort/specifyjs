/**
 * Tests for renderToPipeableStream chunked streaming.
 */
import { describe, it, expect, vi } from 'vitest';
import { Writable } from 'stream';
import { renderToPipeableStream } from '../../../src/server/render-to-pipeable-stream';
import { createElement } from '../../../src/index';

function createMockWritable(): Writable & { chunks: string[]; ended: boolean } {
  const chunks: string[] = [];
  let ended = false;
  const writable = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
    final(callback) {
      ended = true;
      callback();
    },
  });
  return Object.assign(writable, { chunks, ended });
}

describe('renderToPipeableStream', () => {
  it('renders small content in one shot', () => {
    const stream = renderToPipeableStream(createElement('div', null, 'hello'));
    const dest = createMockWritable();
    stream.pipe(dest);
    expect(dest.chunks.join('')).toContain('hello');
  });

  it('calls onShellReady and onAllReady', () => {
    const onShellReady = vi.fn();
    const onAllReady = vi.fn();
    const stream = renderToPipeableStream(createElement('div', null, 'test'), {
      onShellReady,
      onAllReady,
    });
    const dest = createMockWritable();
    stream.pipe(dest);
    expect(onShellReady).toHaveBeenCalledOnce();
    expect(onAllReady).toHaveBeenCalledOnce();
  });

  it('writes large content in chunks', async () => {
    const bigText = 'x'.repeat(20000);
    let allReady = false;
    const stream = renderToPipeableStream(createElement('div', null, bigText), {
      progressiveChunkSize: 1000,
      onAllReady: () => {
        allReady = true;
      },
    });
    const dest = createMockWritable();
    stream.pipe(dest);
    // Wait for chunked writes to complete via setImmediate
    await new Promise((r) => setTimeout(r, 500));
    expect(dest.chunks.length).toBeGreaterThan(1);
    expect(allReady).toBe(true);
  });

  it('handles abort before pipe', () => {
    const stream = renderToPipeableStream(createElement('div', null, 'content'));
    stream.abort();
    const dest = createMockWritable();
    stream.pipe(dest);
    expect(dest.chunks).toHaveLength(0);
  });

  it('calls onError when abort is called with reason', () => {
    const onError = vi.fn();
    const stream = renderToPipeableStream(createElement('div', null, 'content'), { onError });
    stream.abort(new Error('cancelled'));
    expect(onError).toHaveBeenCalledWith(new Error('cancelled'));
  });

  it('calls onShellError and onError on render failure', () => {
    const onShellError = vi.fn();
    const onError = vi.fn();
    // Use a component that throws during render
    function BadComp(): any {
      throw new Error('render failure');
    }
    const stream = renderToPipeableStream(createElement(BadComp, null), { onShellError, onError });
    const dest = createMockWritable();
    stream.pipe(dest);
    expect(onShellError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});
