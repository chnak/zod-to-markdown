import { z } from 'zod';
import { zodSchemaToMarkdown } from './index';

describe('zodSchemaToMarkdown', () => {
  it('should convert a simple object schema to markdown', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const expected = `- name
  - String
- age
  - Number
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert an array schema to markdown', () => {
    const schema = z.array(z.string());

    const expected = `- Array
  - String
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert a union schema to markdown', () => {
    const schema = z.union([z.string(), z.number()]);

    const expected = `- Union
  - String
  |
  - Number
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodEffects (transform) to markdown', () => {
    const schema = z.string().transform(val => val.length);

    const expected = `- Effects (transform)
  - String
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodDiscriminatedUnion to markdown', () => {
    const schema = z.discriminatedUnion('type', [
      z.object({ type: z.literal('a'), a: z.string() }),
      z.object({ type: z.literal('b'), b: z.number() })
    ]);

    const expected = `- DiscriminatedUnion (key: type)
  - type
    - Literal: "a"
  - a
    - String
  |
  - type
    - Literal: "b"
  - b
    - Number
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodIntersection to markdown', () => {
    const schema = z.object({ a: z.string() }).and(z.object({ b: z.number() }));

    const expected = `- Intersection
  Left:
    - a
      - String
  Right:
    - b
      - Number
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodRecord to markdown', () => {
    const schema = z.record(z.string(), z.number());

    const expected = `- Record
  Key:
    - String
  Value:
    - Number
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodTuple to markdown', () => {
    const schema = z.tuple([z.string(), z.number()]);

    const expected = `- Tuple
  [0]:
    - String
  [1]:
    - Number
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodLiteral to markdown', () => {
    const schema = z.literal('hello');

    const expected = `- Literal: "hello"
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodBigInt to markdown', () => {
    const schema = z.bigint();

    const expected = `- BigInt
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodDate to markdown', () => {
    const schema = z.date();

    const expected = `- Date
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodNaN to markdown', () => {
    const schema = z.nan();

    const expected = `- NaN
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodNever to markdown', () => {
    const schema = z.never();

    const expected = `- Never
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodUnknown to markdown', () => {
    const schema = z.unknown();

    const expected = `- Unknown
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });

  it('should convert ZodVoid to markdown', () => {
    const schema = z.void();

    const expected = `- Void
`;

    expect(zodSchemaToMarkdown(schema)).toBe(expected);
  });
});