import { z } from 'zod';
import { zodSchemaToMarkdown, zodSchemaToTable } from './index';

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

describe('zodSchemaToTable', () => {
  it('should convert a simple object schema to table', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| name | String | - |
| age | Number | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with optional and nullable to table', () => {
    const schema = z.object({
      name: z.string().optional(),
      email: z.string().nullable(),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| name | Optional<String> | - |
| email | Nullable<String> | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with enum to table', () => {
    const schema = z.object({
      role: z.enum(['admin', 'user', 'guest']),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| role | Enum(admin | user | guest) | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with array to table', () => {
    const schema = z.object({
      tags: z.array(z.string()),
      scores: z.array(z.number()),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| tags[] | Array<String> | - |
| scores[] | Array<Number> | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with description to table', () => {
    const schema = z.object({
      name: z.string().describe('用户名称'),
      age: z.number().describe('用户年龄'),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| name | String | 用户名称 |
| age | Number | 用户年龄 |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with literal to table', () => {
    const schema = z.object({
      status: z.literal('active'),
      count: z.literal(1),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| status | Literal("active") | - |
| count | Literal(1) | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should fallback to markdown for non-object schema', () => {
    const schema = z.string();

    const expected = `- String
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });
});