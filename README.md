# zod-to-markdown

将 Zod schema 转换为 Markdown 文档的工具函数。

## 安装

```bash
npm install @chnak/zod-to-markdown
```

## 使用方法

### ESM / TypeScript

```typescript
import { zodSchemaToMarkdown } from '@chnak/zod-to-markdown';
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const markdown = zodSchemaToMarkdown(schema);
console.log(markdown);
```

### CommonJS / Node.js

```javascript
const { zodSchemaToMarkdown } = require('@chnak/zod-to-markdown');
const { z } = require('zod');

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const markdown = zodSchemaToMarkdown(schema);
console.log(markdown);
```

### 输出结果

```markdown
- name
  - String
- age
  - Number
```

## 支持的 Zod 类型

### 基础类型
- `ZodObject` - 对象 schema，包含嵌套属性
- `ZodArray` - 数组 schema，包含元素类型
- `ZodString` - 字符串，可选 minLength/maxLength
- `ZodNumber` - 数字，可选 minValue/maxValue
- `ZodBoolean` - 布尔类型
- `ZodEnum` - 枚举值
- `ZodBigInt` - BigInt 类型
- `ZodDate` - Date 类型

### 工具类型
- `ZodOptional` - 可选属性
- `ZodNullable` - 可为空属性
- `ZodDefault` - 默认值
- `ZodEffects` - transform/coerce 效果

### 高级类型
- `ZodUnion` - 联合类型
- `ZodDiscriminatedUnion` - 带鉴别键的联合类型
- `ZodIntersection` - 交叉类型
- `ZodRecord` - Record（字典）类型
- `ZodTuple` - 元组类型

### 特殊类型
- `ZodLiteral` - 字面量值（如 `"hello"`, `1`, `true`）
- `ZodNaN` - NaN 类型
- `ZodNever` - Never 类型
- `ZodUnknown` - Unknown 类型
- `ZodVoid` - Void 类型

## 示例

### 复杂 Schema

```typescript
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
  role: z.enum(['admin', 'user', 'guest']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

console.log(zodSchemaToMarkdown(userSchema));
```

输出：
```markdown
- id
  - String
- name
  - String
- email
  - String
- age
  - Optional
    - Number
- role
  - Enum: admin, user, guest
- metadata
  - Optional
    - Record
      Key:
        - String
      Value:
        - Unknown
```

### 鉴别联合类型 (Discriminated Union)

```typescript
const messageSchema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('user'), content: z.string() }),
  z.object({ role: z.literal('assistant'), content: z.string() }),
]);

console.log(zodSchemaToMarkdown(messageSchema));
```

输出：
```markdown
- DiscriminatedUnion (key: role)
  - role
    - Literal: "user"
  - content
    - String
  |
  - role
    - Literal: "assistant"
  - content
    - String
```

### Transform 效果

```typescript
const transformedSchema = z.string().transform(val => val.length);

console.log(zodSchemaToMarkdown(transformedSchema));
```

输出：
```markdown
- Effects (transform)
  - String
```

## API

### `zodSchemaToMarkdown(schema, indentLevel?)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `schema` | `z.ZodTypeAny` | 要转换的 Zod schema |
| `indentLevel` | `number` | 初始缩进级别（默认: `0`） |

返回转换后的 Markdown 字符串。

## License

MIT License
