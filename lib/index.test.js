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
