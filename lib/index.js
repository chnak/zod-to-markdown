"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodSchemaToMarkdown = void 0;
const zod_1 = require("zod");
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
