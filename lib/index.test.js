"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const index_1 = require("./index");
describe('zodSchemaToMarkdown', () => {
    it('should convert a simple object schema to markdown', () => {
        const schema = zod_1.z.object({
            name: zod_1.z.string(),
            age: zod_1.z.number(),
        });
        const expected = `- name
  - String
- age
  - Number
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert an array schema to markdown', () => {
        const schema = zod_1.z.array(zod_1.z.string());
        const expected = `- Array
  - String
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert a union schema to markdown', () => {
        const schema = zod_1.z.union([zod_1.z.string(), zod_1.z.number()]);
        const expected = `- Union
  - String
  |
  - Number
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodEffects (transform) to markdown', () => {
        const schema = zod_1.z.string().transform(val => val.length);
        const expected = `- Effects (transform)
  - String
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodDiscriminatedUnion to markdown', () => {
        const schema = zod_1.z.discriminatedUnion('type', [
            zod_1.z.object({ type: zod_1.z.literal('a'), a: zod_1.z.string() }),
            zod_1.z.object({ type: zod_1.z.literal('b'), b: zod_1.z.number() })
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
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodIntersection to markdown', () => {
        const schema = zod_1.z.object({ a: zod_1.z.string() }).and(zod_1.z.object({ b: zod_1.z.number() }));
        const expected = `- Intersection
  Left:
    - a
      - String
  Right:
    - b
      - Number
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodRecord to markdown', () => {
        const schema = zod_1.z.record(zod_1.z.string(), zod_1.z.number());
        const expected = `- Record
  Key:
    - String
  Value:
    - Number
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodTuple to markdown', () => {
        const schema = zod_1.z.tuple([zod_1.z.string(), zod_1.z.number()]);
        const expected = `- Tuple
  [0]:
    - String
  [1]:
    - Number
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodLiteral to markdown', () => {
        const schema = zod_1.z.literal('hello');
        const expected = `- Literal: "hello"
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodBigInt to markdown', () => {
        const schema = zod_1.z.bigint();
        const expected = `- BigInt
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodDate to markdown', () => {
        const schema = zod_1.z.date();
        const expected = `- Date
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodNaN to markdown', () => {
        const schema = zod_1.z.nan();
        const expected = `- NaN
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodNever to markdown', () => {
        const schema = zod_1.z.never();
        const expected = `- Never
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodUnknown to markdown', () => {
        const schema = zod_1.z.unknown();
        const expected = `- Unknown
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
    it('should convert ZodVoid to markdown', () => {
        const schema = zod_1.z.void();
        const expected = `- Void
`;
        expect((0, index_1.zodSchemaToMarkdown)(schema)).toBe(expected);
    });
});
describe('zodSchemaToTable', () => {
    it('should convert a simple object schema to table', () => {
        const schema = zod_1.z.object({
            name: zod_1.z.string(),
            age: zod_1.z.number(),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| name | String | - |
| age | Number | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with optional and nullable to table', () => {
        const schema = zod_1.z.object({
            name: zod_1.z.string().optional(),
            email: zod_1.z.string().nullable(),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| name | Optional<String> | - |
| email | Nullable<String> | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with enum to table', () => {
        const schema = zod_1.z.object({
            role: zod_1.z.enum(['admin', 'user', 'guest']),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| role | Enum(admin | user | guest) | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with array to table', () => {
        const schema = zod_1.z.object({
            tags: zod_1.z.array(zod_1.z.string()),
            scores: zod_1.z.array(zod_1.z.number()),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| tags[] | Array<String> | - |
| scores[] | Array<Number> | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with description to table', () => {
        const schema = zod_1.z.object({
            name: zod_1.z.string().describe('用户名称'),
            age: zod_1.z.number().describe('用户年龄'),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| name | String | 用户名称 |
| age | Number | 用户年龄 |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with literal to table', () => {
        const schema = zod_1.z.object({
            status: zod_1.z.literal('active'),
            count: zod_1.z.literal(1),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| status | Literal("active") | - |
| count | Literal(1) | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should fallback to markdown for non-object schema', () => {
        const schema = zod_1.z.string();
        const expected = `- String
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with union to table', () => {
        const schema = zod_1.z.object({
            type: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| type (option 1) | String | - |
| type (option 2) | Number | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with union of objects to table', () => {
        const schema = zod_1.z.object({
            data: zod_1.z.union([
                zod_1.z.object({ name: zod_1.z.string() }),
                zod_1.z.object({ age: zod_1.z.number() }),
            ]),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| data (option 1): name | String | - |
| data (option 2): age | Number | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with discriminated union to table', () => {
        const schema = zod_1.z.object({
            message: zod_1.z.discriminatedUnion('role', [
                zod_1.z.object({ role: zod_1.z.literal('user'), name: zod_1.z.string() }),
                zod_1.z.object({ role: zod_1.z.literal('admin'), level: zod_1.z.number() }),
            ]),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| message (option 1): role | Literal("user") | - |
| message (option 1): name | String | - |
| message (option 2): role | Literal("admin") | - |
| message (option 2): level | Number | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with intersection to table', () => {
        const schema = zod_1.z.object({
            merged: zod_1.z.object({ a: zod_1.z.string() }).and(zod_1.z.object({ b: zod_1.z.number() })),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| merged: a (Left) | String | - |
| merged: b (Right) | Number | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with optional of union to table', () => {
        const schema = zod_1.z.object({
            value: zod_1.z.string().optional(),
            data: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| value | Optional<String> | - |
| data (option 1) | String | - |
| data (option 2) | Number | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with array of union to table', () => {
        const schema = zod_1.z.object({
            items: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| items[] (option 1) | String | - |
| items[] (option 2) | Number | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert union with optional object to table', () => {
        const schema = zod_1.z.object({
            data: zod_1.z.union([
                zod_1.z.object({ name: zod_1.z.string() }).optional(),
                zod_1.z.object({ age: zod_1.z.number() }),
            ]),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| data (option 1): name | Optional<String> | - |
| data (option 2): age | Number | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert array of union with objects to table', () => {
        const schema = zod_1.z.object({
            items: zod_1.z.array(zod_1.z.union([
                zod_1.z.object({ a: zod_1.z.string() }),
                zod_1.z.object({ b: zod_1.z.number() }),
            ])),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| items[].a (option 1) | String | - |
| items[].b (option 2) | Number | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with ZodMap to table', () => {
        const schema = zod_1.z.object({
            map: zod_1.z.map(zod_1.z.string(), zod_1.z.number()),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| map | Map<String, Number> | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with ZodSet to table', () => {
        const schema = zod_1.z.object({
            set: zod_1.z.set(zod_1.z.string()),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| set | Set<String> | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with ZodAny to table', () => {
        const schema = zod_1.z.object({
            any: zod_1.z.any(),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| any | Any | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with ZodLazy to table', () => {
        const schema = zod_1.z.object({
            lazy: zod_1.z.lazy(() => zod_1.z.string()),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| lazy | Lazy(ZodString) | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with ZodFunction to table', () => {
        const schema = zod_1.z.object({
            fn: zod_1.z.function().args(zod_1.z.string()).returns(zod_1.z.number()),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| fn | Function(Tuple(String) => Number) | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
    it('should convert object schema with ZodPromise to table', () => {
        const schema = zod_1.z.object({
            promise: zod_1.z.promise(zod_1.z.string()),
        });
        const expected = `| 字段 | 类型 | 描述 |
|------|------|------|
| promise | Promise<String> | - |
`;
        expect((0, index_1.zodSchemaToTable)(schema)).toBe(expected);
    });
});
