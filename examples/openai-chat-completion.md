# OpenAI Chat Completion Schema

完整的 OpenAI API Schema 转换为 Markdown 文档的示例。

## TypeScript 定义

```typescript
const messageSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('system'),
    content: z.string(),
    name: z.string().optional(),
  }),
  z.object({
    role: z.literal('user'),
    content: z.union([z.string(), z.array(z.object({
      type: z.literal('text'),
      text: z.string(),
    }))]),
    name: z.string().optional(),
  }),
  z.object({
    role: z.literal('assistant'),
    content: z.string().nullable(),
    tool_calls: z.array(z.object({
      id: z.string(),
      type: z.literal('function'),
      function: z.object({
        name: z.string(),
        arguments: z.string(),
      }),
    })).optional(),
    name: z.string().optional(),
  }),
  z.object({
    role: z.literal('tool'),
    content: z.union([z.string(), z.object({
      type: z.literal('image_url'),
      image_url: z.object({
        url: z.string(),
        detail: z.enum(['low', 'high', 'auto']).optional(),
      }),
    })]),
    tool_call_id: z.string(),
    name: z.string().optional(),
  }),
]);

const chatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(messageSchema),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  n: z.number().int().min(1).optional(),
  stream: z.boolean().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  max_tokens: z.number().int().optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  logit_bias: z.record(z.string(), z.number()).optional(),
  user: z.string().optional(),
});
```

## 生成的 Markdown 文档

```markdown
- model
  - String
- messages
  - Array
    - DiscriminatedUnion (key: role)
      - role
        - Literal: "system"
      - content
        - String
      - name
        - Optional
          - String
      |
      - role
        - Literal: "user"
      - content
        - Union
          - String
          |
          - Array
            - type
              - Literal: "text"
            - text
              - String
      - name
        - Optional
          - String
      |
      - role
        - Literal: "assistant"
      - content
        - Nullable
          - String
      - tool_calls
        - Optional
          - Array
            - id
              - String
            - type
              - Literal: "function"
            - function
              - name
                - String
              - arguments
                - String
      - name
        - Optional
          - String
      |
      - role
        - Literal: "tool"
      - content
        - Union
          - String
          |
          - type
            - Literal: "image_url"
          - image_url
            - url
              - String
            - detail
              - Optional
                - Enum: low, high, auto
      - tool_call_id
        - String
      - name
        - Optional
          - String
- temperature
  - Optional
    - Number (minValue: 0) (maxValue: 2)
- top_p
  - Optional
    - Number (minValue: 0) (maxValue: 1)
- n
  - Optional
    - Number (minValue: 1)
- stream
  - Optional
    - Boolean
- stop
  - Optional
    - Union
      - String
      |
      - Array
        - String
- max_tokens
  - Optional
    - Number
- presence_penalty
  - Optional
    - Number (minValue: -2) (maxValue: 2)
- frequency_penalty
  - Optional
    - Number (minValue: -2) (maxValue: 2)
- logit_bias
  - Optional
    - Record
      Key:
        - String
      Value:
        - Number
- user
  - Optional
    - String
```

## 使用的类型覆盖

| 类型 | 出现位置 |
|------|----------|
| `ZodDiscriminatedUnion` | `messages` 数组元素，role 鉴别键 |
| `ZodObject` | 顶层 schema 和各 message 类型 |
| `ZodArray` | `messages`, `tool_calls`, `stop` |
| `ZodOptional` | `name`, `tool_calls`, `detail` 等 |
| `ZodNullable` | `content` (assistant) |
| `ZodUnion` | `content`, `stop` |
| `ZodLiteral` | `role` 值，`type` 值 |
| `ZodEnum` | `detail` 枚举 |
| `ZodRecord` | `logit_bias` |
| `ZodString` | 各种字符串字段 |
| `ZodNumber` | 各种数字字段，带 min/max 约束 |
| `ZodBoolean` | `stream` |
