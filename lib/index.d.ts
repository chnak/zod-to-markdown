import { z } from "zod";
/**
 * 将 Zod schema 转换为表格形式的 Markdown
 * @param schema - 要转换的 Zod schema
 * @returns 表格形式的 Markdown 字符串
 */
export declare function zodSchemaToTable(schema: z.ZodTypeAny): string;
export declare function zodSchemaToMarkdown(schema: z.ZodTypeAny, indentLevel?: number): string;
