"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodSchemaToMarkdown = exports.zodSchemaToTable = void 0;
/**
 * 使用 typeName 检查 Zod 类型，解决跨模块实例化导致的 instanceof 失败问题
 */
function isZodType(schema, typeName) {
    var _a;
    return ((_a = schema._def) === null || _a === void 0 ? void 0 : _a.typeName) === typeName;
}
/**
 * 将 Zod schema 转换为表格形式的 Markdown
 * @param schema - 要转换的 Zod schema
 * @returns 表格形式的 Markdown 字符串
 */
function zodSchemaToTable(schema) {
    if (!isZodType(schema, 'ZodObject')) {
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
 * @param wrapperType - 当处于 Optional/Nullable 包装内部时，传入 'Optional' 或 'Nullable'
 */
function collectFields(schema, prefix, fields, wrapperType) {
    // 处理 Optional - 包装类型
    if (isZodType(schema, 'ZodOptional')) {
        const inner = schema.unwrap();
        // 对于简单类型直接包装
        if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodArray')) {
            collectFields(inner, prefix, fields, 'Optional');
        }
        else if (isZodType(inner, 'ZodUnion') || isZodType(inner, 'ZodDiscriminatedUnion') || isZodType(inner, 'ZodIntersection')) {
            // 嵌套的复杂类型也需要展开
            collectFields(inner, prefix, fields, 'Optional');
        }
        else {
            fields.push({
                path: prefix,
                type: `Optional<${getTypeString(inner)}>`,
                description: schema.description || '-',
            });
        }
        return;
    }
    // 处理 Nullable - 包装类型
    if (isZodType(schema, 'ZodNullable')) {
        const inner = schema.unwrap();
        if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodArray')) {
            collectFields(inner, prefix, fields, 'Nullable');
        }
        else if (isZodType(inner, 'ZodUnion') || isZodType(inner, 'ZodDiscriminatedUnion') || isZodType(inner, 'ZodIntersection')) {
            // 嵌套的复杂类型也需要展开
            collectFields(inner, prefix, fields, 'Nullable');
        }
        else {
            fields.push({
                path: prefix,
                type: `Nullable<${getTypeString(inner)}>`,
                description: schema.description || '-',
            });
        }
        return;
    }
    // 处理 Default
    if (isZodType(schema, 'ZodDefault')) {
        collectFields(schema.removeDefault(), prefix, fields);
        return;
    }
    // 处理 Array - 收集元素类型
    if (isZodType(schema, 'ZodArray')) {
        const element = schema.element;
        // 如果是对象数组，展开其字段
        if (isZodType(element, 'ZodObject')) {
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
        else if (isZodType(element, 'ZodUnion') || isZodType(element, 'ZodDiscriminatedUnion')) {
            // 数组元素是 Union 类型时，展开每个选项
            const unionSchema = element;
            unionSchema.options.forEach((opt, index) => {
                // 对于 ZodOptional/ZodNullable，保留包装类型信息
                if (isZodType(opt, 'ZodOptional') || isZodType(opt, 'ZodNullable')) {
                    const typeStr = getTypeString(opt);
                    const innerWrapperType = isZodType(opt, 'ZodOptional') ? 'Optional' : 'Nullable';
                    const inner = isZodType(opt, 'ZodOptional')
                        ? opt.unwrap()
                        : opt.unwrap();
                    if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodIntersection')) {
                        const innerFields = [];
                        collectFields(inner, '', innerFields, innerWrapperType);
                        innerFields.forEach(field => {
                            fields.push({
                                path: `${prefix}[].${field.path} (option ${index + 1})`,
                                type: field.type,
                                description: field.description,
                            });
                        });
                    }
                    else {
                        fields.push({
                            path: `${prefix}[] (option ${index + 1})`,
                            type: typeStr,
                            description: opt.description || '-',
                        });
                    }
                }
                else if (isZodType(opt, 'ZodObject') || isZodType(opt, 'ZodIntersection')) {
                    // 对象类型或交叉类型，递归展开
                    const innerFields = [];
                    collectFields(opt, '', innerFields);
                    innerFields.forEach(field => {
                        fields.push({
                            path: `${prefix}[].${field.path} (option ${index + 1})`,
                            type: field.type,
                            description: field.description,
                        });
                    });
                }
                else {
                    // 其他简单类型
                    fields.push({
                        path: `${prefix}[] (option ${index + 1})`,
                        type: getTypeString(opt),
                        description: opt.description || '-',
                    });
                }
            });
        }
        else if (isZodType(element, 'ZodOptional')) {
            // 数组元素是 Optional 类型时，展开内部类型
            const inner = element.unwrap();
            if (isZodType(inner, 'ZodObject')) {
                const innerFields = [];
                collectFields(inner, '', innerFields);
                innerFields.forEach(field => {
                    const fieldPath = field.path || 'value';
                    fields.push({
                        path: `${prefix}[].${fieldPath}`,
                        type: `Optional<${field.type}>`,
                        description: field.description,
                    });
                });
            }
            else {
                fields.push({
                    path: `${prefix}[]`,
                    type: `Optional<${getTypeString(inner)}>`,
                    description: element.description || '-',
                });
            }
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
    if (isZodType(schema, 'ZodObject')) {
        const shape = schema.shape;
        Object.keys(shape).forEach(key => {
            const subSchema = shape[key];
            const newPath = prefix ? `${prefix}.${key}` : key;
            collectFields(subSchema, newPath, fields, wrapperType);
        });
        return;
    }
    // 处理 ZodUnion - 展开每个选项
    if (isZodType(schema, 'ZodUnion')) {
        const unionSchema = schema;
        unionSchema.options.forEach((opt, index) => {
            // 对于 ZodOptional/ZodNullable，保留包装类型信息
            if (isZodType(opt, 'ZodOptional') || isZodType(opt, 'ZodNullable')) {
                const typeStr = getTypeString(opt);
                const innerWrapperType = isZodType(opt, 'ZodOptional') ? 'Optional' : 'Nullable';
                const inner = isZodType(opt, 'ZodOptional')
                    ? opt.unwrap()
                    : opt.unwrap();
                // 只有内部是对象或交叉类型才展开，否则直接使用类型字符串
                if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodIntersection')) {
                    const innerFields = [];
                    collectFields(inner, '', innerFields, innerWrapperType);
                    innerFields.forEach(field => {
                        fields.push({
                            path: field.path ? `${prefix} (option ${index + 1}): ${field.path}` : `${prefix} (option ${index + 1})`,
                            type: field.type,
                            description: field.description,
                        });
                    });
                }
                else {
                    fields.push({
                        path: `${prefix} (option ${index + 1})`,
                        type: typeStr,
                        description: opt.description || '-',
                    });
                }
            }
            else if (isZodType(opt, 'ZodObject') || isZodType(opt, 'ZodIntersection')) {
                // 对象类型或交叉类型，递归展开
                const innerFields = [];
                collectFields(opt, '', innerFields);
                innerFields.forEach(field => {
                    fields.push({
                        path: field.path ? `${prefix} (option ${index + 1}): ${field.path}` : `${prefix} (option ${index + 1})`,
                        type: field.type,
                        description: field.description,
                    });
                });
            }
            else {
                // 其他简单类型
                fields.push({
                    path: `${prefix} (option ${index + 1})`,
                    type: getTypeString(opt),
                    description: opt.description || '-',
                });
            }
        });
        return;
    }
    // 处理 ZodDiscriminatedUnion - 类似 Union 但有关联键
    if (isZodType(schema, 'ZodDiscriminatedUnion')) {
        const discUnionSchema = schema;
        discUnionSchema.options.forEach((opt, index) => {
            // 对于 ZodOptional/ZodNullable，保留包装类型信息
            if (isZodType(opt, 'ZodOptional') || isZodType(opt, 'ZodNullable')) {
                const typeStr = getTypeString(opt);
                const innerWrapperType = isZodType(opt, 'ZodOptional') ? 'Optional' : 'Nullable';
                const inner = isZodType(opt, 'ZodOptional')
                    ? opt.unwrap()
                    : opt.unwrap();
                if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodIntersection')) {
                    const innerFields = [];
                    collectFields(inner, '', innerFields, innerWrapperType);
                    innerFields.forEach(field => {
                        fields.push({
                            path: field.path ? `${prefix} (option ${index + 1}): ${field.path}` : `${prefix} (option ${index + 1})`,
                            type: field.type,
                            description: field.description,
                        });
                    });
                }
                else {
                    fields.push({
                        path: `${prefix} (option ${index + 1})`,
                        type: typeStr,
                        description: opt.description || '-',
                    });
                }
            }
            else if (isZodType(opt, 'ZodObject') || isZodType(opt, 'ZodIntersection')) {
                const innerFields = [];
                collectFields(opt, '', innerFields);
                innerFields.forEach(field => {
                    fields.push({
                        path: field.path ? `${prefix} (option ${index + 1}): ${field.path}` : `${prefix} (option ${index + 1})`,
                        type: field.type,
                        description: field.description,
                    });
                });
            }
            else {
                fields.push({
                    path: `${prefix} (option ${index + 1})`,
                    type: getTypeString(opt),
                    description: opt.description || '-',
                });
            }
        });
        return;
    }
    // 处理 ZodIntersection - 展开左右两部分
    if (isZodType(schema, 'ZodIntersection')) {
        const intSchema = schema;
        const leftFields = [];
        const rightFields = [];
        collectFields(intSchema._def.left, '', leftFields);
        collectFields(intSchema._def.right, '', rightFields);
        leftFields.forEach(field => {
            fields.push({
                path: `${prefix}: ${field.path} (Left)`,
                type: field.type,
                description: field.description,
            });
        });
        rightFields.forEach(field => {
            fields.push({
                path: `${prefix}: ${field.path} (Right)`,
                type: field.type,
                description: field.description,
            });
        });
        return;
    }
    // 处理 Record
    if (isZodType(schema, 'ZodRecord')) {
        const recordSchema = schema;
        fields.push({
            path: prefix,
            type: `Record<${getTypeString(recordSchema.keySchema)}, ${getTypeString(recordSchema.valueSchema)}>`,
            description: schema.description || '-',
        });
        return;
    }
    // 处理 Tuple
    if (isZodType(schema, 'ZodTuple')) {
        const tupleSchema = schema;
        const items = tupleSchema.items.map((item) => getTypeString(item)).join(', ');
        fields.push({
            path: prefix,
            type: `Tuple(${items})`,
            description: schema.description || '-',
        });
        return;
    }
    // 处理 ZodEffects (transform)
    if (isZodType(schema, 'ZodEffects')) {
        const effectsSchema = schema;
        const innerFields = [];
        collectFields(effectsSchema.innerType(), prefix, innerFields);
        if (innerFields.length > 0) {
            innerFields.forEach(field => {
                fields.push({
                    path: field.path,
                    type: `Effects(${effectsSchema._def.effect.type})<${field.type}>`,
                    description: field.description,
                });
            });
        }
        else {
            fields.push({
                path: prefix,
                type: `Effects(${effectsSchema._def.effect.type})<${getTypeString(effectsSchema.innerType())}>`,
                description: schema.description || '-',
            });
        }
        return;
    }
    // 其他类型直接添加
    let typeStr = getTypeString(schema);
    if (wrapperType === 'Optional' && !typeStr.startsWith('Optional<') && !typeStr.startsWith('Nullable<')) {
        typeStr = `Optional<${typeStr}>`;
    }
    else if (wrapperType === 'Nullable' && !typeStr.startsWith('Optional<') && !typeStr.startsWith('Nullable<')) {
        typeStr = `Nullable<${typeStr}>`;
    }
    fields.push({
        path: prefix,
        type: typeStr,
        description: schema.description || '-',
    });
}
/**
 * 获取类型的字符串描述
 */
function getTypeString(schema) {
    if (isZodType(schema, 'ZodOptional')) {
        return `Optional<${getTypeString(schema.unwrap())}>`;
    }
    if (isZodType(schema, 'ZodNullable')) {
        return `Nullable<${getTypeString(schema.unwrap())}>`;
    }
    if (isZodType(schema, 'ZodDefault')) {
        return `Default<${getTypeString(schema.removeDefault())}>`;
    }
    if (isZodType(schema, 'ZodArray')) {
        return `Array<${getTypeString(schema.element)}>`;
    }
    if (isZodType(schema, 'ZodObject')) {
        // ZodObject 应该被 collectFields 展开，这里仅作为兜底
        const keys = Object.keys(schema.shape);
        return `Object{${keys.join(', ')}}`;
    }
    if (isZodType(schema, 'ZodString')) {
        const strSchema = schema;
        let result = 'String';
        if (strSchema.minLength !== null || strSchema.maxLength !== null) {
            const constraints = [];
            if (strSchema.minLength !== null)
                constraints.push(`min: ${strSchema.minLength}`);
            if (strSchema.maxLength !== null)
                constraints.push(`max: ${strSchema.maxLength}`);
            result += ` (${constraints.join(', ')})`;
        }
        return result;
    }
    if (isZodType(schema, 'ZodNumber')) {
        const numSchema = schema;
        let result = 'Number';
        if (numSchema.minValue !== null || numSchema.maxValue !== null) {
            const constraints = [];
            if (numSchema.minValue !== null)
                constraints.push(`min: ${numSchema.minValue}`);
            if (numSchema.maxValue !== null)
                constraints.push(`max: ${numSchema.maxValue}`);
            result += ` (${constraints.join(', ')})`;
        }
        return result;
    }
    if (isZodType(schema, 'ZodEnum')) {
        return `Enum(${(schema.options).join(' | ')})`;
    }
    if (isZodType(schema, 'ZodLiteral')) {
        return `Literal(${JSON.stringify(schema.value)})`;
    }
    if (isZodType(schema, 'ZodBoolean'))
        return 'Boolean';
    if (isZodType(schema, 'ZodBigInt'))
        return 'BigInt';
    if (isZodType(schema, 'ZodDate'))
        return 'Date';
    if (isZodType(schema, 'ZodNaN'))
        return 'NaN';
    if (isZodType(schema, 'ZodNever'))
        return 'Never';
    if (isZodType(schema, 'ZodUnknown'))
        return 'Unknown';
    if (isZodType(schema, 'ZodVoid'))
        return 'Void';
    if (isZodType(schema, 'ZodRecord')) {
        const recSchema = schema;
        return `Record<${getTypeString(recSchema.keySchema)}, ${getTypeString(recSchema.valueSchema)}>`;
    }
    if (isZodType(schema, 'ZodTuple')) {
        const tupSchema = schema;
        const items = tupSchema.items.map((item) => getTypeString(item)).join(', ');
        return `Tuple(${items})`;
    }
    if (isZodType(schema, 'ZodUnion')) {
        const unionSchema = schema;
        const options = unionSchema.options.map((opt) => getTypeString(opt)).join(' | ');
        return `Union(${options})`;
    }
    if (isZodType(schema, 'ZodDiscriminatedUnion')) {
        return `DiscriminatedUnion(${schema.discriminator})`;
    }
    if (isZodType(schema, 'ZodIntersection')) {
        return 'Intersection';
    }
    if (isZodType(schema, 'ZodEffects')) {
        return `Effects(${schema._def.effect.type})`;
    }
    if (isZodType(schema, 'ZodMap')) {
        const mapSchema = schema;
        return `Map<${getTypeString(mapSchema.keySchema)}, ${getTypeString(mapSchema.valueSchema)}>`;
    }
    if (isZodType(schema, 'ZodSet')) {
        return `Set<${getTypeString(schema._def.valueType)}>`;
    }
    if (isZodType(schema, 'ZodAny'))
        return 'Any';
    if (isZodType(schema, 'ZodLazy')) {
        return `Lazy(${schema._def.getter().constructor.name || 'unknown'})`;
    }
    if (isZodType(schema, 'ZodFunction')) {
        const fnSchema = schema;
        const args = fnSchema._def.args ? getTypeString(fnSchema._def.args) : 'args';
        const returns = fnSchema._def.returns ? getTypeString(fnSchema._def.returns) : 'returns';
        return `Function(${args} => ${returns})`;
    }
    if (isZodType(schema, 'ZodPromise')) {
        return `Promise<${getTypeString(schema._def.type)}>`;
    }
    return schema._def.typeName || schema.constructor.name;
}
function zodSchemaToMarkdown(schema, indentLevel = 0) {
    let markdown = "";
    const indent = "  ".repeat(indentLevel);
    if (isZodType(schema, 'ZodObject')) {
        const shape = schema.shape;
        Object.keys(shape).forEach((key) => {
            const subSchema = shape[key];
            const description = subSchema.description ? `: ${subSchema.description}` : "";
            markdown += `${indent}- ${key}${description}\n`;
            markdown += zodSchemaToMarkdown(subSchema, indentLevel + 1);
        });
    }
    else if (isZodType(schema, 'ZodArray')) {
        markdown += `${indent}- Array\n`;
        markdown += zodSchemaToMarkdown(schema.element, indentLevel + 1);
    }
    else if (isZodType(schema, 'ZodString')) {
        markdown += `${indent}- String`;
        if (schema.minLength !== null) {
            markdown += ` (minLength: ${schema.minLength})`;
        }
        if (schema.maxLength !== null) {
            markdown += ` (maxLength: ${schema.maxLength})`;
        }
        markdown += "\n";
    }
    else if (isZodType(schema, 'ZodNumber')) {
        markdown += `${indent}- Number`;
        if (schema.minValue !== null) {
            markdown += ` (minValue: ${schema.minValue})`;
        }
        if (schema.maxValue !== null) {
            markdown += ` (maxValue: ${schema.maxValue})`;
        }
        markdown += "\n";
    }
    else if (isZodType(schema, 'ZodEnum')) {
        const values = schema.options.join(", ");
        markdown += `${indent}- Enum: ${values}\n`;
    }
    else if (isZodType(schema, 'ZodUnion')) {
        const unionSchema = schema;
        markdown += `${indent}- Union\n`;
        unionSchema.options.forEach((option, index) => {
            markdown += zodSchemaToMarkdown(option, indentLevel + 1);
            if (index < unionSchema.options.length - 1) {
                markdown += `${indent}  |\n`;
            }
        });
    }
    else if (isZodType(schema, 'ZodBoolean')) {
        markdown += `${indent}- Boolean\n`;
    }
    else if (isZodType(schema, 'ZodDefault')) {
        const defSchema = schema;
        markdown += `${indent}- Default: ${JSON.stringify(defSchema._def.defaultValue())}\n`;
        markdown += zodSchemaToMarkdown(defSchema.removeDefault(), indentLevel);
    }
    else if (isZodType(schema, 'ZodOptional')) {
        markdown += `${indent}- Optional\n`;
        markdown += zodSchemaToMarkdown(schema.unwrap(), indentLevel + 1);
    }
    else if (isZodType(schema, 'ZodNullable')) {
        markdown += `${indent}- Nullable\n`;
        markdown += zodSchemaToMarkdown(schema.unwrap(), indentLevel + 1);
    }
    else if (isZodType(schema, 'ZodEffects')) {
        const effectType = schema._def.effect.type;
        markdown += `${indent}- Effects (${effectType})\n`;
        markdown += zodSchemaToMarkdown(schema.innerType(), indentLevel + 1);
    }
    else if (isZodType(schema, 'ZodDiscriminatedUnion')) {
        const discUnionSchema = schema;
        const discriminator = discUnionSchema.discriminator;
        markdown += `${indent}- DiscriminatedUnion (key: ${discriminator})\n`;
        discUnionSchema.options.forEach((option, index) => {
            markdown += zodSchemaToMarkdown(option, indentLevel + 1);
            if (index < discUnionSchema.options.length - 1) {
                markdown += `${indent}  |\n`;
            }
        });
    }
    else if (isZodType(schema, 'ZodIntersection')) {
        const intSchema = schema;
        markdown += `${indent}- Intersection\n`;
        markdown += `${indent}  Left:\n`;
        markdown += zodSchemaToMarkdown(intSchema._def.left, indentLevel + 2);
        markdown += `${indent}  Right:\n`;
        markdown += zodSchemaToMarkdown(intSchema._def.right, indentLevel + 2);
    }
    else if (isZodType(schema, 'ZodRecord')) {
        const recSchema = schema;
        markdown += `${indent}- Record\n`;
        markdown += `${indent}  Key:\n`;
        markdown += zodSchemaToMarkdown(recSchema.keySchema, indentLevel + 2);
        markdown += `${indent}  Value:\n`;
        markdown += zodSchemaToMarkdown(recSchema.valueSchema, indentLevel + 2);
    }
    else if (isZodType(schema, 'ZodTuple')) {
        const tupSchema = schema;
        markdown += `${indent}- Tuple\n`;
        tupSchema.items.forEach((item, index) => {
            markdown += `${indent}  [${index}]:\n`;
            markdown += zodSchemaToMarkdown(item, indentLevel + 2);
        });
    }
    else if (isZodType(schema, 'ZodLiteral')) {
        markdown += `${indent}- Literal: ${JSON.stringify(schema.value)}\n`;
    }
    else if (isZodType(schema, 'ZodBigInt')) {
        markdown += `${indent}- BigInt\n`;
    }
    else if (isZodType(schema, 'ZodDate')) {
        markdown += `${indent}- Date\n`;
    }
    else if (isZodType(schema, 'ZodNaN')) {
        markdown += `${indent}- NaN\n`;
    }
    else if (isZodType(schema, 'ZodNever')) {
        markdown += `${indent}- Never\n`;
    }
    else if (isZodType(schema, 'ZodUnknown')) {
        markdown += `${indent}- Unknown\n`;
    }
    else if (isZodType(schema, 'ZodVoid')) {
        markdown += `${indent}- Void\n`;
    }
    else {
        markdown += `${indent}- Type: ${schema._def.typeName || schema.constructor.name}\n`;
    }
    return markdown;
}
exports.zodSchemaToMarkdown = zodSchemaToMarkdown;
