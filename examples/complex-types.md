# Zod to Markdown - Complex Types Examples

This document demonstrates the `zodSchemaToMarkdown` function's support for complex Zod types used in OpenAI API schemas.

## ZodEffects (Transform)

```typescript
const schema = z.string().transform(val => val.length);
```

Output:
```markdown
- Effects (transform)
  - String
```

## ZodDiscriminatedUnion

```typescript
const schema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('a'), a: z.string() }),
  z.object({ type: z.literal('b'), b: z.number() })
]);
```

Output:
```markdown
- DiscriminatedUnion (key: type)
  - type
    - Literal: "a"
  - a
    - String
  |
  - type
    - Literal: "b"
  - b
    - Number
```

## ZodIntersection

```typescript
const schema = z.object({ a: z.string() }).and(z.object({ b: z.number() }));
```

Output:
```markdown
- Intersection
  Left:
    - a
      - String
  Right:
    - b
      - Number
```

## ZodRecord

```typescript
const schema = z.record(z.string(), z.number());
```

Output:
```markdown
- Record
  Key:
    - String
  Value:
    - Number
```

## ZodTuple

```typescript
const schema = z.tuple([z.string(), z.number()]);
```

Output:
```markdown
- Tuple
  [0]:
    - String
  [1]:
    - Number
```

## ZodLiteral

```typescript
const schema = z.literal('hello');
```

Output:
```markdown
- Literal: "hello"
```

## Primitive Types

### ZodBigInt
```typescript
z.bigint()
```
Output:
```markdown
- BigInt
```

### ZodDate
```typescript
z.date()
```
Output:
```markdown
- Date
```

### ZodNaN
```typescript
z.nan()
```
Output:
```markdown
- NaN
```

### ZodNever
```typescript
z.never()
```
Output:
```markdown
- Never
```

### ZodUnknown
```typescript
z.unknown()
```
Output:
```markdown
- Unknown
```

### ZodVoid
```typescript
z.void()
```
Output:
```markdown
- Void
```
