/**
 * Tests for protobuf.ts decode paths: decodeFieldValue, skipField, defineMessage.decode.
 */
import { describe, it, expect } from 'vitest';
import { defineMessage } from '../../../src/client/protobuf';
import type { FieldMap } from '../../../src/client/protobuf';

describe('defineMessage — decode', () => {
  it('round-trips bool field', () => {
    const Msg = defineMessage<{ active: boolean }>('BoolMsg', {
      active: { tag: 1, type: 'bool' },
    });
    const encoded = Msg.encode({ active: true });
    const decoded = Msg.decode(encoded);
    expect(decoded.active).toBe(true);

    const encodedFalse = Msg.encode({ active: false });
    const decodedFalse = Msg.decode(encodedFalse);
    // false may be omitted (proto3 default), so it may be undefined
    expect(decodedFalse.active === false || decodedFalse.active === undefined).toBe(true);
  });

  it('round-trips int32 field (sign-extended)', () => {
    const Msg = defineMessage<{ value: number }>('Int32Msg', {
      value: { tag: 1, type: 'int32' },
    });
    const encoded = Msg.encode({ value: -1 });
    const decoded = Msg.decode(encoded);
    expect(decoded.value).toBe(-1);
  });

  it('round-trips uint32 field', () => {
    const Msg = defineMessage<{ value: number }>('Uint32Msg', {
      value: { tag: 1, type: 'uint32' },
    });
    const encoded = Msg.encode({ value: 42 });
    const decoded = Msg.decode(encoded);
    expect(decoded.value).toBe(42);
  });

  it('round-trips enum field', () => {
    const Msg = defineMessage<{ status: number }>('EnumMsg', {
      status: { tag: 1, type: 'enum' },
    });
    const encoded = Msg.encode({ status: 2 });
    const decoded = Msg.decode(encoded);
    expect(decoded.status).toBe(2);
  });

  it('round-trips string field', () => {
    const Msg = defineMessage<{ name: string }>('StringMsg', {
      name: { tag: 1, type: 'string' },
    });
    const encoded = Msg.encode({ name: 'hello world' });
    const decoded = Msg.decode(encoded);
    expect(decoded.name).toBe('hello world');
  });

  it('round-trips bytes field', () => {
    const Msg = defineMessage<{ data: Uint8Array }>('BytesMsg', {
      data: { tag: 1, type: 'bytes' },
    });
    const original = new Uint8Array([1, 2, 3, 4, 5]);
    const encoded = Msg.encode({ data: original });
    const decoded = Msg.decode(encoded);
    expect(decoded.data).toBeInstanceOf(Uint8Array);
    expect(Array.from(decoded.data)).toEqual([1, 2, 3, 4, 5]);
  });

  it('round-trips float64 field (64-bit)', () => {
    const Msg = defineMessage<{ value: number }>('Float64Msg', {
      value: { tag: 1, type: 'float64' },
    });
    const encoded = Msg.encode({ value: 3.14 });
    const decoded = Msg.decode(encoded);
    expect(decoded.value).toBeCloseTo(3.14, 4);
  });

  it('round-trips repeated field', () => {
    const Msg = defineMessage<{ tags: number[] }>('RepeatedMsg', {
      tags: { tag: 1, type: 'uint32', repeated: true },
    });
    const encoded = Msg.encode({ tags: [1, 2, 3] });
    const decoded = Msg.decode(encoded);
    expect(decoded.tags).toEqual([1, 2, 3]);
  });

  it('skips unknown fields during decode', () => {
    const MsgV1 = defineMessage<{ name: string; extra: number }>('V1', {
      name: { tag: 1, type: 'string' },
      extra: { tag: 2, type: 'uint32' },
    });
    const MsgV2 = defineMessage<{ name: string }>('V2', {
      name: { tag: 1, type: 'string' },
      // tag 2 is unknown in V2
    });

    const encoded = MsgV1.encode({ name: 'test', extra: 99 });
    // Decode with V2 which doesn't know about tag 2 — should skip it
    const decoded = MsgV2.decode(encoded);
    expect(decoded.name).toBe('test');
  });

  it('skips unknown varint fields', () => {
    // Encode a message with an unknown varint field
    const WithExtra = defineMessage<{ a: number; b: number }>('WithExtra', {
      a: { tag: 1, type: 'uint32' },
      b: { tag: 2, type: 'uint32' },
    });
    const WithoutExtra = defineMessage<{ a: number }>('WithoutExtra', {
      a: { tag: 1, type: 'uint32' },
    });

    const encoded = WithExtra.encode({ a: 10, b: 20 });
    const decoded = WithoutExtra.decode(encoded);
    expect(decoded.a).toBe(10);
  });

  it('skips unknown length-delimited fields', () => {
    const WithString = defineMessage<{ a: number; name: string }>('WithString', {
      a: { tag: 1, type: 'uint32' },
      name: { tag: 2, type: 'string' },
    });
    const JustA = defineMessage<{ a: number }>('JustA', {
      a: { tag: 1, type: 'uint32' },
    });

    const encoded = WithString.encode({ a: 42, name: 'hello' });
    const decoded = JustA.decode(encoded);
    expect(decoded.a).toBe(42);
  });

  it('skips unknown 64-bit fields', () => {
    const WithFloat64 = defineMessage<{ a: number; d: number }>('WithFloat64', {
      a: { tag: 1, type: 'uint32' },
      d: { tag: 2, type: 'float64' },
    });
    const JustA = defineMessage<{ a: number }>('JustA2', {
      a: { tag: 1, type: 'uint32' },
    });

    const encoded = WithFloat64.encode({ a: 7, d: 1.5 });
    const decoded = JustA.decode(encoded);
    expect(decoded.a).toBe(7);
  });

  it('handles multiple fields in a message', () => {
    const Msg = defineMessage<{ id: number; name: string; active: boolean }>('Multi', {
      id: { tag: 1, type: 'uint32' },
      name: { tag: 2, type: 'string' },
      active: { tag: 3, type: 'bool' },
    });
    const encoded = Msg.encode({ id: 42, name: 'test', active: true });
    const decoded = Msg.decode(encoded);
    expect(decoded.id).toBe(42);
    expect(decoded.name).toBe('test');
    expect(decoded.active).toBe(true);
  });
});
