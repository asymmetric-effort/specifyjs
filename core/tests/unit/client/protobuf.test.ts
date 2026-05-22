// ============================================================================
// Protobuf / gRPC-Web client tests
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  defineMessage,
  encodeVarint,
  decodeVarint,
  encodeGrpcWebFrame,
  decodeGrpcWebFrame,
} from '../../../src/client/protobuf';
import type { FieldMap } from '../../../src/client/protobuf';

// ---------------------------------------------------------------------------
// defineMessage basics
// ---------------------------------------------------------------------------

describe('defineMessage', () => {
  it('creates a message type with name and fields', () => {
    const fields: FieldMap = {
      id: { tag: 1, type: 'uint32' },
    };
    const msg = defineMessage('Simple', fields);
    expect(msg.name).toBe('Simple');
    expect(msg.fields).toBe(fields);
    expect(typeof msg.encode).toBe('function');
    expect(typeof msg.decode).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Varint encoding edge cases
// ---------------------------------------------------------------------------

describe('varint encoding', () => {
  it('encodes 0', () => {
    expect(encodeVarint(0)).toEqual([0]);
  });

  it('encodes 1', () => {
    expect(encodeVarint(1)).toEqual([1]);
  });

  it('encodes 127 (max single byte)', () => {
    expect(encodeVarint(127)).toEqual([0x7f]);
  });

  it('encodes 128 (requires two bytes)', () => {
    expect(encodeVarint(128)).toEqual([0x80, 0x01]);
  });

  it('encodes 300', () => {
    // 300 = 0b100101100 → varint [0xAC, 0x02]
    expect(encodeVarint(300)).toEqual([0xac, 0x02]);
  });

  it('encodes large number (16383)', () => {
    // 16383 = 0x3FFF → varint [0xFF, 0x7F]
    expect(encodeVarint(16383)).toEqual([0xff, 0x7f]);
  });

  it('encodes large number (2^31 - 1)', () => {
    const bytes = encodeVarint(2147483647);
    expect(bytes.length).toBeGreaterThan(1);
    // Round-trip
    const [decoded] = decodeVarint(new Uint8Array(bytes), 0);
    expect(decoded).toBe(2147483647);
  });

  it('round-trips varint values', () => {
    const values = [0, 1, 127, 128, 255, 256, 16383, 16384, 65535, 100000, 2147483647];
    for (const v of values) {
      const encoded = encodeVarint(v);
      const [decoded] = decodeVarint(new Uint8Array(encoded), 0);
      expect(decoded).toBe(v >>> 0);
    }
  });

  it('decodes varint with offset', () => {
    const padding = new Uint8Array([0xff, 0xff]);
    const encoded = new Uint8Array([...padding, ...encodeVarint(42)]);
    const [value, newOffset] = decodeVarint(encoded, 2);
    expect(value).toBe(42);
    expect(newOffset).toBe(3);
  });

  it('throws on truncated varint', () => {
    // A byte with MSB set but no continuation
    expect(() => decodeVarint(new Uint8Array([0x80]), 0)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Round-trip: int32
// ---------------------------------------------------------------------------

describe('encode/decode int32', () => {
  const IntMsg = defineMessage<{ value: number }>('IntMsg', {
    value: { tag: 1, type: 'int32' },
  });

  it('round-trips positive int32', () => {
    const original = { value: 42 };
    const bytes = IntMsg.encode(original);
    const decoded = IntMsg.decode(bytes);
    expect(decoded.value).toBe(42);
  });

  it('round-trips zero', () => {
    const original = { value: 0 };
    const bytes = IntMsg.encode(original);
    const decoded = IntMsg.decode(bytes);
    expect(decoded.value).toBe(0);
  });

  it('round-trips max int32', () => {
    const original = { value: 2147483647 };
    const bytes = IntMsg.encode(original);
    const decoded = IntMsg.decode(bytes);
    expect(decoded.value).toBe(2147483647);
  });
});

// ---------------------------------------------------------------------------
// Round-trip: uint32
// ---------------------------------------------------------------------------

describe('encode/decode uint32', () => {
  const UintMsg = defineMessage<{ value: number }>('UintMsg', {
    value: { tag: 1, type: 'uint32' },
  });

  it('round-trips uint32', () => {
    const cases = [0, 1, 127, 128, 255, 65535, 4294967295];
    for (const v of cases) {
      const bytes = UintMsg.encode({ value: v });
      const decoded = UintMsg.decode(bytes);
      expect(decoded.value).toBe(v >>> 0);
    }
  });
});

// ---------------------------------------------------------------------------
// Round-trip: string
// ---------------------------------------------------------------------------

describe('encode/decode string', () => {
  const StrMsg = defineMessage<{ text: string }>('StrMsg', {
    text: { tag: 1, type: 'string' },
  });

  it('round-trips simple string', () => {
    const original = { text: 'hello world' };
    const bytes = StrMsg.encode(original);
    const decoded = StrMsg.decode(bytes);
    expect(decoded.text).toBe('hello world');
  });

  it('round-trips empty string', () => {
    const bytes = StrMsg.encode({ text: '' });
    const decoded = StrMsg.decode(bytes);
    expect(decoded.text).toBe('');
  });

  it('round-trips unicode string', () => {
    const text = 'Hello \u{1F600} world \u00E9\u00E0';
    const bytes = StrMsg.encode({ text });
    const decoded = StrMsg.decode(bytes);
    expect(decoded.text).toBe(text);
  });

  it('produces length-delimited encoding', () => {
    const bytes = StrMsg.encode({ text: 'abc' });
    // Field key: (1 << 3) | 2 = 0x0A, length: 3, then 'a','b','c'
    expect(bytes[0]).toBe(0x0a);
    expect(bytes[1]).toBe(3);
    expect(bytes[2]).toBe(0x61); // 'a'
    expect(bytes[3]).toBe(0x62); // 'b'
    expect(bytes[4]).toBe(0x63); // 'c'
  });
});

// ---------------------------------------------------------------------------
// Round-trip: bool
// ---------------------------------------------------------------------------

describe('encode/decode bool', () => {
  const BoolMsg = defineMessage<{ flag: boolean }>('BoolMsg', {
    flag: { tag: 1, type: 'bool' },
  });

  it('round-trips true', () => {
    const bytes = BoolMsg.encode({ flag: true });
    const decoded = BoolMsg.decode(bytes);
    expect(decoded.flag).toBe(true);
  });

  it('round-trips false', () => {
    const bytes = BoolMsg.encode({ flag: false });
    const decoded = BoolMsg.decode(bytes);
    expect(decoded.flag).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Round-trip: float64
// ---------------------------------------------------------------------------

describe('encode/decode float64', () => {
  const FloatMsg = defineMessage<{ value: number }>('FloatMsg', {
    value: { tag: 1, type: 'float64' },
  });

  it('round-trips float64', () => {
    const cases = [0, 1.5, -1.5, 3.14159265358979, Number.MAX_SAFE_INTEGER, 1e100];
    for (const v of cases) {
      const bytes = FloatMsg.encode({ value: v });
      const decoded = FloatMsg.decode(bytes);
      expect(decoded.value).toBe(v);
    }
  });

  it('round-trips special float values', () => {
    const bytes1 = FloatMsg.encode({ value: Infinity });
    expect(FloatMsg.decode(bytes1).value).toBe(Infinity);

    const bytes2 = FloatMsg.encode({ value: -Infinity });
    expect(FloatMsg.decode(bytes2).value).toBe(-Infinity);

    const bytes3 = FloatMsg.encode({ value: NaN });
    expect(FloatMsg.decode(bytes3).value).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// Round-trip: enum
// ---------------------------------------------------------------------------

describe('encode/decode enum', () => {
  const EnumMsg = defineMessage<{ status: number }>('EnumMsg', {
    status: { tag: 1, type: 'enum' },
  });

  it('round-trips enum values', () => {
    for (const v of [0, 1, 2, 127, 255]) {
      const bytes = EnumMsg.encode({ status: v });
      const decoded = EnumMsg.decode(bytes);
      expect(decoded.status).toBe(v);
    }
  });
});

// ---------------------------------------------------------------------------
// Round-trip: bytes
// ---------------------------------------------------------------------------

describe('encode/decode bytes', () => {
  const BytesMsg = defineMessage<{ data: Uint8Array }>('BytesMsg', {
    data: { tag: 1, type: 'bytes' },
  });

  it('round-trips byte array', () => {
    const data = new Uint8Array([0x00, 0x01, 0x02, 0xff]);
    const bytes = BytesMsg.encode({ data });
    const decoded = BytesMsg.decode(bytes);
    expect(decoded.data).toEqual(data);
  });

  it('round-trips empty bytes', () => {
    const data = new Uint8Array([]);
    const bytes = BytesMsg.encode({ data });
    const decoded = BytesMsg.decode(bytes);
    expect(decoded.data).toEqual(data);
  });
});

// ---------------------------------------------------------------------------
// Repeated fields
// ---------------------------------------------------------------------------

describe('repeated fields', () => {
  const ListMsg = defineMessage<{ items: number[] }>('ListMsg', {
    items: { tag: 1, type: 'uint32', repeated: true },
  });

  it('round-trips repeated uint32', () => {
    const original = { items: [1, 2, 3, 100, 200] };
    const bytes = ListMsg.encode(original);
    const decoded = ListMsg.decode(bytes);
    expect(decoded.items).toEqual([1, 2, 3, 100, 200]);
  });

  it('round-trips empty repeated field', () => {
    const original = { items: [] as number[] };
    const bytes = ListMsg.encode(original);
    const decoded = ListMsg.decode(bytes);
    expect(decoded.items).toEqual([]);
  });

  it('round-trips single-element repeated field', () => {
    const bytes = ListMsg.encode({ items: [42] });
    const decoded = ListMsg.decode(bytes);
    expect(decoded.items).toEqual([42]);
  });

  const StrListMsg = defineMessage<{ names: string[] }>('StrListMsg', {
    names: { tag: 1, type: 'string', repeated: true },
  });

  it('round-trips repeated strings', () => {
    const original = { names: ['alice', 'bob', 'charlie'] };
    const bytes = StrListMsg.encode(original);
    const decoded = StrListMsg.decode(bytes);
    expect(decoded.names).toEqual(['alice', 'bob', 'charlie']);
  });
});

// ---------------------------------------------------------------------------
// Complex message with multiple field types
// ---------------------------------------------------------------------------

describe('complex message', () => {
  interface UserMessage {
    id: number;
    name: string;
    email: string;
    active: boolean;
    score: number;
    role: number;
    tags: string[];
  }

  const UserMsg = defineMessage<UserMessage>('UserMessage', {
    id: { tag: 1, type: 'uint32' },
    name: { tag: 2, type: 'string' },
    email: { tag: 3, type: 'string' },
    active: { tag: 4, type: 'bool' },
    score: { tag: 5, type: 'float64' },
    role: { tag: 6, type: 'enum' },
    tags: { tag: 7, type: 'string', repeated: true },
  });

  it('round-trips a complex message', () => {
    const user: UserMessage = {
      id: 12345,
      name: 'Jane Doe',
      email: 'jane@example.com',
      active: true,
      score: 98.6,
      role: 2,
      tags: ['admin', 'verified'],
    };

    const bytes = UserMsg.encode(user);
    const decoded = UserMsg.decode(bytes);

    expect(decoded.id).toBe(12345);
    expect(decoded.name).toBe('Jane Doe');
    expect(decoded.email).toBe('jane@example.com');
    expect(decoded.active).toBe(true);
    expect(decoded.score).toBeCloseTo(98.6);
    expect(decoded.role).toBe(2);
    expect(decoded.tags).toEqual(['admin', 'verified']);
  });

  it('encodes to a non-empty Uint8Array', () => {
    const bytes = UserMsg.encode({
      id: 1,
      name: 'a',
      email: 'b',
      active: false,
      score: 0,
      role: 0,
      tags: [],
    });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Empty messages
// ---------------------------------------------------------------------------

describe('empty messages', () => {
  const EmptyMsg = defineMessage<Record<string, never>>('Empty', {});

  it('encodes empty message to zero bytes', () => {
    const bytes = EmptyMsg.encode({} as Record<string, never>);
    expect(bytes.length).toBe(0);
  });

  it('decodes zero bytes to empty object', () => {
    const decoded = EmptyMsg.decode(new Uint8Array(0));
    expect(decoded).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Missing optional fields
// ---------------------------------------------------------------------------

describe('missing optional fields', () => {
  interface OptionalFields {
    id?: number;
    name?: string;
    active?: boolean;
    score?: number;
  }

  const OptMsg = defineMessage<OptionalFields>('OptMsg', {
    id: { tag: 1, type: 'uint32' },
    name: { tag: 2, type: 'string' },
    active: { tag: 3, type: 'bool' },
    score: { tag: 4, type: 'float64' },
  });

  it('encodes message with all fields missing', () => {
    const bytes = OptMsg.encode({});
    expect(bytes.length).toBe(0);
    const decoded = OptMsg.decode(bytes);
    // Decoded should not have the optional fields set
    expect(decoded.id).toBeUndefined();
    expect(decoded.name).toBeUndefined();
  });

  it('encodes message with some fields missing', () => {
    const bytes = OptMsg.encode({ id: 10, name: 'test' });
    const decoded = OptMsg.decode(bytes);
    expect(decoded.id).toBe(10);
    expect(decoded.name).toBe('test');
    expect(decoded.active).toBeUndefined();
    expect(decoded.score).toBeUndefined();
  });

  it('handles null fields as missing', () => {
    const bytes = OptMsg.encode({ id: 5, name: null as unknown as string });
    const decoded = OptMsg.decode(bytes);
    expect(decoded.id).toBe(5);
    expect(decoded.name).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// gRPC-Web framing
// ---------------------------------------------------------------------------

describe('gRPC-Web framing', () => {
  it('encodes a data frame', () => {
    const data = new Uint8Array([0x01, 0x02, 0x03]);
    const frame = encodeGrpcWebFrame(data, 0);
    expect(frame.length).toBe(5 + 3);
    expect(frame[0]).toBe(0); // flags
    // Big-endian length = 3
    expect(frame[1]).toBe(0);
    expect(frame[2]).toBe(0);
    expect(frame[3]).toBe(0);
    expect(frame[4]).toBe(3);
    expect(frame[5]).toBe(0x01);
    expect(frame[6]).toBe(0x02);
    expect(frame[7]).toBe(0x03);
  });

  it('encodes a trailer frame', () => {
    const data = new Uint8Array([0xaa]);
    const frame = encodeGrpcWebFrame(data, 0x80);
    expect(frame[0]).toBe(0x80);
  });

  it('decodes a data frame', () => {
    const data = new Uint8Array([10, 20, 30, 40, 50]);
    const frame = encodeGrpcWebFrame(data, 0);
    const [flags, decoded, consumed] = decodeGrpcWebFrame(frame);
    expect(flags).toBe(0);
    expect(decoded).toEqual(data);
    expect(consumed).toBe(5 + 5);
  });

  it('round-trips empty frame', () => {
    const data = new Uint8Array([]);
    const frame = encodeGrpcWebFrame(data, 0);
    expect(frame.length).toBe(5);
    const [flags, decoded, consumed] = decodeGrpcWebFrame(frame);
    expect(flags).toBe(0);
    expect(decoded.length).toBe(0);
    expect(consumed).toBe(5);
  });

  it('round-trips large frame', () => {
    const data = new Uint8Array(1024);
    for (let i = 0; i < data.length; i++) data[i] = i & 0xff;
    const frame = encodeGrpcWebFrame(data, 0);
    const [flags, decoded, consumed] = decodeGrpcWebFrame(frame);
    expect(flags).toBe(0);
    expect(decoded).toEqual(data);
    expect(consumed).toBe(5 + 1024);
  });

  it('throws on truncated frame header', () => {
    expect(() => decodeGrpcWebFrame(new Uint8Array([0, 0, 0]))).toThrow('too short');
  });

  it('throws on incomplete frame data', () => {
    // Header says length=10 but only 2 bytes of data
    const bad = new Uint8Array([0, 0, 0, 0, 10, 0x01, 0x02]);
    expect(() => decodeGrpcWebFrame(bad)).toThrow('incomplete');
  });

  it('encodes a protobuf message inside a gRPC-Web frame and decodes it back', () => {
    interface Ping {
      seq: number;
      payload: string;
    }

    const PingMsg = defineMessage<Ping>('Ping', {
      seq: { tag: 1, type: 'uint32' },
      payload: { tag: 2, type: 'string' },
    });

    const original: Ping = { seq: 7, payload: 'hello' };
    const encoded = PingMsg.encode(original);
    const frame = encodeGrpcWebFrame(encoded, 0);

    const [flags, data] = decodeGrpcWebFrame(frame);
    expect(flags).toBe(0);
    const decoded = PingMsg.decode(data);
    expect(decoded.seq).toBe(7);
    expect(decoded.payload).toBe('hello');
  });
});
