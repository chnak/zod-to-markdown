import { z } from "zod";

export function zodSchemaToMarkdown(schema: z.ZodTypeAny, indentLevel: number = 0): string {
    let markdown = "";
  
    const indent = "  ".repeat(indentLevel);
  
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      Object.keys(shape).forEach((key) => {
        const subSchema = shape[key];
        const description = subSchema.description ? `: ${subSchema.description}` : "";
        markdown += `${indent}- ${key}${description}\n`;
        markdown += zodSchemaToMarkdown(subSchema, indentLevel + 1);
      });
    } else if (schema instanceof z.ZodArray) {
      markdown += `${indent}- Array\n`;
      markdown += zodSchemaToMarkdown(schema.element, indentLevel + 1);
    } else if (schema instanceof z.ZodString) {
      markdown += `${indent}- String`;
      if (schema.minLength !== null) {
        markdown += ` (minLength: ${schema.minLength})`;
      }
      if (schema.maxLength !== null) {
        markdown += ` (maxLength: ${schema.maxLength})`;
      }
      markdown += "\n";
    } else if (schema instanceof z.ZodNumber) {
      markdown += `${indent}- Number`;
      if (schema.minValue !== null) {
        markdown += ` (minValue: ${schema.minValue})`;
      }
      if (schema.maxValue !== null) {
        markdown += ` (maxValue: ${schema.maxValue})`;
      }
      markdown += "\n";
    } else if (schema instanceof z.ZodEnum) {
      const values = schema.options.join(", ");
      markdown += `${indent}- Enum: ${values}\n`;
    } else if (schema instanceof z.ZodUnion) {
      markdown += `${indent}- Union\n`;
      schema.options.forEach((option: z.ZodTypeAny, index: number) => {
        markdown += zodSchemaToMarkdown(option, indentLevel + 1);
        if (index < schema.options.length - 1) {
          markdown += `${indent}  |\n`;
        }
      });
    } else if (schema instanceof z.ZodBoolean) {
      markdown += `${indent}- Boolean\n`;
    } else if (schema instanceof z.ZodDefault) {
      markdown += `${indent}- Default: ${JSON.stringify(schema._def.defaultValue())}\n`;
      markdown += zodSchemaToMarkdown(schema.removeDefault(), indentLevel);
    } else if (schema instanceof z.ZodOptional) {
      markdown += `${indent}- Optional\n`;
      markdown += zodSchemaToMarkdown(schema.unwrap(), indentLevel + 1);
    } else if (schema instanceof z.ZodNullable) {
      markdown += `${indent}- Nullable\n`;
      markdown += zodSchemaToMarkdown(schema.unwrap(), indentLevel + 1);
    } else if (schema instanceof z.ZodEffects) {
      const effectType = schema._def.effect.type;
      markdown += `${indent}- Effects (${effectType})\n`;
      markdown += zodSchemaToMarkdown(schema.innerType(), indentLevel + 1);
    } else if (schema instanceof z.ZodDiscriminatedUnion) {
      const discriminator = schema.discriminator;
      markdown += `${indent}- DiscriminatedUnion (key: ${discriminator})\n`;
      schema.options.forEach((option: z.ZodTypeAny, index: number) => {
        markdown += zodSchemaToMarkdown(option, indentLevel + 1);
        if (index < schema.options.length - 1) {
          markdown += `${indent}  |\n`;
        }
      });
    } else if (schema instanceof z.ZodIntersection) {
      markdown += `${indent}- Intersection\n`;
      markdown += `${indent}  Left:\n`;
      markdown += zodSchemaToMarkdown(schema._def.left, indentLevel + 2);
      markdown += `${indent}  Right:\n`;
      markdown += zodSchemaToMarkdown(schema._def.right, indentLevel + 2);
    } else if (schema instanceof z.ZodRecord) {
      markdown += `${indent}- Record\n`;
      markdown += `${indent}  Key:\n`;
      markdown += zodSchemaToMarkdown(schema.keySchema, indentLevel + 2);
      markdown += `${indent}  Value:\n`;
      markdown += zodSchemaToMarkdown(schema.valueSchema, indentLevel + 2);
    } else if (schema instanceof z.ZodTuple) {
      markdown += `${indent}- Tuple\n`;
      schema.items.forEach((item: z.ZodTypeAny, index: number) => {
        markdown += `${indent}  [${index}]:\n`;
        markdown += zodSchemaToMarkdown(item, indentLevel + 2);
      });
    } else if (schema instanceof z.ZodLiteral) {
      markdown += `${indent}- Literal: ${JSON.stringify(schema.value)}\n`;
    } else if (schema instanceof z.ZodBigInt) {
      markdown += `${indent}- BigInt\n`;
    } else if (schema instanceof z.ZodDate) {
      markdown += `${indent}- Date\n`;
    } else if (schema instanceof z.ZodNaN) {
      markdown += `${indent}- NaN\n`;
    } else if (schema instanceof z.ZodNever) {
      markdown += `${indent}- Never\n`;
    } else if (schema instanceof z.ZodUnknown) {
      markdown += `${indent}- Unknown\n`;
    } else if (schema instanceof z.ZodVoid) {
      markdown += `${indent}- Void\n`;
    } else {
      markdown += `${indent}- Type: ${schema.constructor.name}\n`;
    }
  
    return markdown;
  }