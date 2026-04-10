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

  it('should convert object schema with union to table', () => {
    const schema = z.object({
      type: z.union([z.string(), z.number()]),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| type (option 1) | String | - |
| type (option 2) | Number | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with union of objects to table', () => {
    const schema = z.object({
      data: z.union([
        z.object({ name: z.string() }),
        z.object({ age: z.number() }),
      ]),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| data (option 1): name | String | - |
| data (option 2): age | Number | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with discriminated union to table', () => {
    const schema = z.object({
      message: z.discriminatedUnion('role', [
        z.object({ role: z.literal('user'), name: z.string() }),
        z.object({ role: z.literal('admin'), level: z.number() }),
      ]),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| message (option 1): role | Literal("user") | - |
| message (option 1): name | String | - |
| message (option 2): role | Literal("admin") | - |
| message (option 2): level | Number | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with intersection to table', () => {
    const schema = z.object({
      merged: z.object({ a: z.string() }).and(z.object({ b: z.number() })),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| merged: a (Left) | String | - |
| merged: b (Right) | Number | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with optional of union to table', () => {
    const schema = z.object({
      value: z.string().optional(),
      data: z.union([z.string(), z.number()]).optional(),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| value | Optional<String> | - |
| data (option 1) | String | - |
| data (option 2) | Number | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with array of union to table', () => {
    const schema = z.object({
      items: z.array(z.union([z.string(), z.number()])),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| items[] (option 1) | String | - |
| items[] (option 2) | Number | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert union with optional object to table', () => {
    const schema = z.object({
      data: z.union([
        z.object({ name: z.string() }).optional(),
        z.object({ age: z.number() }),
      ]),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| data (option 1): name | Optional<String> | - |
| data (option 2): age | Number | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert array of union with objects to table', () => {
    const schema = z.object({
      items: z.array(z.union([
        z.object({ a: z.string() }),
        z.object({ b: z.number() }),
      ])),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| items[].a (option 1) | String | - |
| items[].b (option 2) | Number | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with ZodMap to table', () => {
    const schema = z.object({
      map: z.map(z.string(), z.number()),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| map | Map<String, Number> | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with ZodSet to table', () => {
    const schema = z.object({
      set: z.set(z.string()),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| set | Set<String> | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with ZodAny to table', () => {
    const schema = z.object({
      any: z.any(),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| any | Any | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with ZodLazy to table', () => {
    const schema = z.object({
      lazy: z.lazy(() => z.string()),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| lazy | Lazy(ZodString) | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with ZodFunction to table', () => {
    const schema = z.object({
      fn: z.function().args(z.string()).returns(z.number()),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| fn | Function(Tuple(String) => Number) | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });

  it('should convert object schema with ZodPromise to table', () => {
    const schema = z.object({
      promise: z.promise(z.string()),
    });

    const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| promise | Promise<String> | - |
`;

    expect(zodSchemaToTable(schema)).toBe(expected);
  });
});