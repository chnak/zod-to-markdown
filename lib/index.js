"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodSchemaToMarkdown = exports.zodSchemaToTable = void 0;
const zod_1 = require("zod");
/**
 * 将 Zod schema 转换为表格形式的 Markdown
 * @param schema - 要转换的 Zod schema
 * @returns 表格形式的 Markdown 字符串
 */
function zodSchemaToTable(schema) {
    if (!(schema instanceof zod_1.z.ZodObject)) {
        return zodSchemaToMarkdown(schema);
    }
    // 收集所有嵌套字段
    const fields = [];
    collectFields(schema, '', fields);
    // 表头
    const rows = [];
    rows.push('| 字段 | 类型 | 描述 |');
    rows.push('|------|------|------|');
    fields.forEach(({ path, type, description }) => {
        rows.push(`| ${path} | ${type} | ${description} |`);
    });
    return rows.join('\n') + '\n';
}
exports.zodSchemaToTable = zodSchemaToTable;
/**
 * 递归收集所有嵌套字段
 */
function collectFields(schema, prefix, fields) {
    // 处理 Optional - 包装类型
    if (schema instanceof zod_1.z.ZodOptional) {
        const innerType = getTypeString(schema.unwrap());
        // 对于简单类型直接包装
        if (schema.unwrap() instanceof zod_1.z.ZodObject || schema.unwrap() instanceof zod_1.z.ZodArray) {
            collectFields(schema.unwrap(), prefix, fields);
        }
        else {
            fields.push({
                path: prefix,
                type: `Optional<${innerType}>`,
                description: schema.description || '-',
            });
        }
        return;
    }
    // 处理 Nullable - 包装类型
    if (schema instanceof zod_1.z.ZodNullable) {
        const innerType = getTypeString(schema.unwrap());
        if (schema.unwrap() instanceof zod_1.z.ZodObject || schema.unwrap() instanceof zod_1.z.ZodArray) {
            collectFields(schema.unwrap(), prefix, fields);
        }
        else {
            fields.push({
                path: prefix,
                type: `Nullable<${innerType}>`,
                description: schema.description || '-',
            });
        }
        return;
    }
    // 处理 Default
    if (schema instanceof zod_1.z.ZodDefault) {
        collectFields(schema.removeDefault(), prefix, fields);
        return;
    }
    // 处理 Array - 收集元素类型
    if (schema instanceof zod_1.z.ZodArray) {
        const element = schema.element;
        // 如果是对象数组，展开其字段
        if (element instanceof zod_1.z.ZodObject) {
            const innerFields = [];
            collectFields(element, '', innerFields);
            innerFields.forEach(field => {
                const fieldPath = field.path || 'value';
                fields.push({
                    path: `${prefix}[].${fieldPath}`,
                    type: field.type,
                    description: field.description,
                });
            });
        }
        else {
            // 非对象数组，保持原样
            fields.push({
                path: `${prefix}[]`,
                type: getTypeString(schema),
                description: schema.description || '-',
            });
        }
        return;
    }
    // 处理 ZodObject - 递归展开
    if (schema instanceof zod_1.z.ZodObject) {
        const shape = schema.shape;
        Object.keys(shape).forEach(key => {
            const subSchema = shape[key];
            const newPath = prefix ? `${prefix}.${key}` : key;
            collectFields(subSchema, newPath, fields);
        });
        return;
    }
    // 处理 Record
    if (schema instanceof zod_1.z.ZodRecord) {
        fields.push({
            path: prefix,
            type: `Record<${getTypeString(schema.keySchema)}, ${getTypeString(schema.valueSchema)}>`,
            description: schema.description || '-',
        });
        return;
    }
    // 处理 Tuple
    if (schema instanceof zod_1.z.ZodTuple) {
        const items = schema.items.map((item) => getTypeString(item)).join(', ');
        fields.push({
            path: prefix,
            type: `Tuple(${items})`,
            description: schema.description || '-',
        });
        return;
    }
    // 其他类型直接添加
    fields.push({
        path: prefix,
        type: getTypeString(schema),
        description: schema.description || '-',
    });
}
/**
 * 获取类型的字符串描述
 */
function getTypeString(schema) {
    if (schema instanceof zod_1.z.ZodOptional) {
        return `Optional<${getTypeString(schema.unwrap())}>`;
    }
    if (schema instanceof zod_1.z.ZodNullable) {
        return `Nullable<${getTypeString(schema.unwrap())}>`;
    }
    if (schema instanceof zod_1.z.ZodDefault) {
        return `Default<${getTypeString(schema.removeDefault())}>`;
    }
    if (schema instanceof zod_1.z.ZodArray) {
        return `Array<${getTypeString(schema.element)}>`;
    }
    if (schema instanceof zod_1.z.ZodString) {
        let result = 'String';
        if (schema.minLength !== null || schema.maxLength !== null) {
            const constraints = [];
            if (schema.minLength !== null)
                constraints.push(`min: ${schema.minLength}`);
            if (schema.maxLength !== null)
                constraints.push(`max: ${schema.maxLength}`);
            result += ` (${constraints.join(', ')})`;
        }
        return result;
    }
    if (schema instanceof zod_1.z.ZodNumber) {
        let result = 'Number';
        if (schema.minValue !== null || schema.maxValue !== null) {
            const constraints = [];
            if (schema.minValue !== null)
                constraints.push(`min: ${schema.minValue}`);
            if (schema.maxValue !== null)
                constraints.push(`max: ${schema.maxValue}`);
            result += ` (${constraints.join(', ')})`;
        }
        return result;
    }
    if (schema instanceof zod_1.z.ZodEnum) {
        return `Enum(${schema.options.join(' | ')})`;
    }
    if (schema instanceof zod_1.z.ZodLiteral) {
        return `Literal(${JSON.stringify(schema.value)})`;
    }
    if (schema instanceof zod_1.z.ZodBoolean)
        return 'Boolean';
    if (schema instanceof zod_1.z.ZodBigInt)
        return 'BigInt';
    if (schema instanceof zod_1.z.ZodDate)
        return 'Date';
    if (schema instanceof zod_1.z.ZodNaN)
        return 'NaN';
    if (schema instanceof zod_1.z.ZodNever)
        return 'Never';
    if (schema instanceof zod_1.z.ZodUnknown)
        return 'Unknown';
    if (schema instanceof zod_1.z.ZodVoid)
        return 'Void';
    if (schema instanceof zod_1.z.ZodRecord) {
        return `Record<${getTypeString(schema.keySchema)}, ${getTypeString(schema.valueSchema)}>`;
    }
    if (schema instanceof zod_1.z.ZodTuple) {
        const items = schema.items.map((item) => getTypeString(item)).join(', ');
        return `Tuple(${items})`;
    }
    if (schema instanceof zod_1.z.ZodUnion) {
        const options = schema.options.map((opt) => getTypeString(opt)).join(' | ');
        return `Union(${options})`;
    }
    if (schema instanceof zod_1.z.ZodDiscriminatedUnion) {
        return `DiscriminatedUnion(${schema.discriminator})`;
    }
    if (schema instanceof zod_1.z.ZodIntersection) {
        return 'Intersection';
    }
    if (schema instanceof zod_1.z.ZodEffects) {
        return `Effects(${schema._def.effect.type})`;
    }
    return schema.constructor.name;
}
function zodSchemaToMarkdown(schema, indentLevel = 0) {
    let markdown = "";
    const indent = "  ".repeat(indentLevel);
    if (schema instanceof zod_1.z.ZodObject) {
        const shape = schema.shape;
        Object.keys(shape).forEach((key) => {
            const subSchema = shape[key];
            const description = subSchema.description ? `: ${subSchema.description}` : "";
            markdown += `${indent}- ${key}${description}\n`;
            markdown += zodSchemaToMarkdown(subSchema, indentLevel + 1);
        });
    }
    else if (schema instanceof zod_1.z.ZodArray) {
        markdown += `${indent}- Array\n`;
        markdown += zodSchemaToMarkdown(schema.element, indentLevel + 1);
    }
    else if (schema instanceof zod_1.z.ZodString) {
        markdown += `${indent}- String`;
        if (schema.minLength !== null) {
            markdown += ` (minLength: ${schema.minLength})`;
        }
        if (schema.maxLength !== null) {
            markdown += ` (maxLength: ${schema.maxLength})`;
        }
        markdown += "\n";
    }
    else if (schema instanceof zod_1.z.ZodNumber) {
        markdown += `${indent}- Number`;
        if (schema.minValue !== null) {
            markdown += ` (minValue: ${schema.minValue})`;
        }
        if (schema.maxValue !== null) {
            markdown += ` (maxValue: ${schema.maxValue})`;
        }
        markdown += "\n";
    }
    else if (schema instanceof zod_1.z.ZodEnum) {
        const values = schema.options.join(", ");
        markdown += `${indent}- Enum: ${values}\n`;
    }
    else if (schema instanceof zod_1.z.ZodUnion) {
        markdown += `${indent}- Union\n`;
        schema.options.forEach((option, index) => {
            markdown += zodSchemaToMarkdown(option, indentLevel + 1);
            if (index < schema.options.length - 1) {
                markdown += `${indent}  |\n`;
            }
        });
    }
    else if (schema instanceof zod_1.z.ZodBoolean) {
        markdown += `${indent}- Boolean\n`;
    }
    else if (schema instanceof zod_1.z.ZodDefault) {
        markdown += `${indent}- Default: ${JSON.stringify(schema._def.defaultValue())}\n`;
        markdown += zodSchemaToMarkdown(schema.removeDefault(), indentLevel);
    }
    else if (schema instanceof zod_1.z.ZodOptional) {
        markdown += `${indent}- Optional\n`;
        markdown += zodSchemaToMarkdown(schema.unwrap(), indentLevel + 1);
    }
    else if (schema instanceof zod_1.z.ZodNullable) {
        markdown += `${indent}- Nullable\n`;
        markdown += zodSchemaToMarkdown(schema.unwrap(), indentLevel + 1);
    }
    else if (schema instanceof zod_1.z.ZodEffects) {
        const effectType = schema._def.effect.type;
        markdown += `${indent}- Effects (${effectType})\n`;
        markdown += zodSchemaToMarkdown(schema.innerType(), indentLevel + 1);
    }
    else if (schema instanceof zod_1.z.ZodDiscriminatedUnion) {
        const discriminator = schema.discriminator;
        markdown += `${indent}- DiscriminatedUnion (key: ${discriminator})\n`;
        schema.options.forEach((option, index) => {
            markdown += zodSchemaToMarkdown(option, indentLevel + 1);
            if (index < schema.options.length - 1) {
                markdown += `${indent}  |\n`;
            }
        });
    }
    else if (schema instanceof zod_1.z.ZodIntersection) {
        markdown += `${indent}- Intersection\n`;
        markdown += `${indent}  Left:\n`;
        markdown += zodSchemaToMarkdown(schema._def.left, indentLevel + 2);
        markdown += `${indent}  Right:\n`;
        markdown += zodSchemaToMarkdown(schema._def.right, indentLevel + 2);
    }
    else if (schema instanceof zod_1.z.ZodRecord) {
        markdown += `${indent}- Record\n`;
        markdown += `${indent}  Key:\n`;
        markdown += zodSchemaToMarkdown(schema.keySchema, indentLevel + 2);
        markdown += `${indent}  Value:\n`;
        markdown += zodSchemaToMarkdown(schema.valueSchema, indentLevel + 2);
    }
    else if (schema instanceof zod_1.z.ZodTuple) {
        markdown += `${indent}- Tuple\n`;
        schema.items.forEach((item, index) => {
            markdown += `${indent}  [${index}]:\n`;
            markdown += zodSchemaToMarkdown(item, indentLevel + 2);
        });
    }
    else if (schema instanceof zod_1.z.ZodLiteral) {
        markdown += `${indent}- Literal: ${JSON.stringify(schema.value)}\n`;
    }
    else if (schema instanceof zod_1.z.ZodBigInt) {
        markdown += `${indent}- BigInt\n`;
    }
    else if (schema instanceof zod_1.z.ZodDate) {
        markdown += `${indent}- Date\n`;
    }
    else if (schema instanceof zod_1.z.ZodNaN) {
        markdown += `${indent}- NaN\n`;
    }
    else if (schema instanceof zod_1.z.ZodNever) {
        markdown += `${indent}- Never\n`;
    }
    else if (schema instanceof zod_1.z.ZodUnknown) {
        markdown += `${indent}- Unknown\n`;
    }
    else if (schema instanceof zod_1.z.ZodVoid) {
        markdown += `${indent}- Void\n`;
    }
    else {
        markdown += `${indent}- Type: ${schema.constructor.name}\n`;
    }
    return markdown;
}
exports.zodSchemaToMarkdown = zodSchemaToMarkdown;
