import { z } from "zod";

/**
 * 使用 typeName 检查 Zod 类型，解决跨模块实例化导致的 instanceof 失败问题
 */
function isZodType(schema: z.ZodTypeAny, typeName: string): boolean {
  return (schema as any)._def?.typeName === typeName;
}

/**
 * 将 Zod schema 转换为表格形式的 Markdown
 * @param schema - 要转换的 Zod schema
 * @returns 表格形式的 Markdown 字符串
 */
export function zodSchemaToTable(schema: z.ZodTypeAny): string {
  if (!isZodType(schema, 'ZodObject')) {
    return zodSchemaToMarkdown(schema);
  }

  // 收集所有嵌套字段
  const fields: Array<{ path: string; type: string; description: string }> = [];
  collectFields(schema, '', fields);

  // 表头
  const rows: string[] = [];
  rows.push('| 字段 | 类型 | 描述 |');
  rows.push('|------|------|------|');

  fields.forEach(({ path, type, description }) => {
    rows.push(`| ${path} | ${type} | ${description} |`);
  });

  return rows.join('\n') + '\n';
}

/**
 * 递归收集所有嵌套字段
 * @param wrapperType - 当处于 Optional/Nullable 包装内部时，传入 'Optional' 或 'Nullable'
 */
function collectFields(
  schema: z.ZodTypeAny,
  prefix: string,
  fields: Array<{ path: string; type: string; description: string }>,
  wrapperType?: 'Optional' | 'Nullable'
): void {
  // 处理 Optional - 包装类型
  if (isZodType(schema, 'ZodOptional')) {
    const inner = (schema as z.ZodOptional<z.ZodTypeAny>).unwrap();
    // 对于简单类型直接包装
    if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodArray')) {
      collectFields(inner, prefix, fields, 'Optional');
    } else if (isZodType(inner, 'ZodUnion') || isZodType(inner, 'ZodDiscriminatedUnion') || isZodType(inner, 'ZodIntersection')) {
      // 嵌套的复杂类型也需要展开
      collectFields(inner, prefix, fields, 'Optional');
    } else {
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
    const inner = (schema as z.ZodNullable<z.ZodTypeAny>).unwrap();
    if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodArray')) {
      collectFields(inner, prefix, fields, 'Nullable');
    } else if (isZodType(inner, 'ZodUnion') || isZodType(inner, 'ZodDiscriminatedUnion') || isZodType(inner, 'ZodIntersection')) {
      // 嵌套的复杂类型也需要展开
      collectFields(inner, prefix, fields, 'Nullable');
    } else {
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
    collectFields((schema as z.ZodDefault<z.ZodTypeAny>).removeDefault(), prefix, fields);
    return;
  }

  // 处理 Array - 收集元素类型
  if (isZodType(schema, 'ZodArray')) {
    const element = (schema as z.ZodArray<z.ZodTypeAny>).element;

    // 如果是对象数组，展开其字段
    if (isZodType(element, 'ZodObject')) {
      const innerFields: Array<{ path: string; type: string; description: string }> = [];
      collectFields(element, '', innerFields);
      innerFields.forEach(field => {
        const fieldPath = field.path || 'value';
        fields.push({
          path: `${prefix}[].${fieldPath}`,
          type: field.type,
          description: field.description,
        });
      });
    } else if (isZodType(element, 'ZodUnion') || isZodType(element, 'ZodDiscriminatedUnion')) {
      // 数组元素是 Union 类型时，展开每个选项
      const unionSchema = element as z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>;
      unionSchema.options.forEach((opt: z.ZodTypeAny, index: number) => {
        // 对于 ZodOptional/ZodNullable，保留包装类型信息
        if (isZodType(opt, 'ZodOptional') || isZodType(opt, 'ZodNullable')) {
          const typeStr = getTypeString(opt);
          const innerWrapperType = isZodType(opt, 'ZodOptional') ? 'Optional' : 'Nullable';
          const inner = isZodType(opt, 'ZodOptional')
            ? (opt as z.ZodOptional<z.ZodTypeAny>).unwrap()
            : (opt as z.ZodNullable<z.ZodTypeAny>).unwrap();
          if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodIntersection')) {
            const innerFields: Array<{ path: string; type: string; description: string }> = [];
            collectFields(inner, '', innerFields, innerWrapperType);
            innerFields.forEach(field => {
              fields.push({
                path: `${prefix}[].${field.path} (option ${index + 1})`,
                type: field.type,
                description: field.description,
              });
            });
          } else {
            fields.push({
              path: `${prefix}[] (option ${index + 1})`,
              type: typeStr,
              description: opt.description || '-',
            });
          }
        } else if (isZodType(opt, 'ZodObject') || isZodType(opt, 'ZodIntersection')) {
          // 对象类型或交叉类型，递归展开
          const innerFields: Array<{ path: string; type: string; description: string }> = [];
          collectFields(opt, '', innerFields);
          innerFields.forEach(field => {
            fields.push({
              path: `${prefix}[].${field.path} (option ${index + 1})`,
              type: field.type,
              description: field.description,
            });
          });
        } else {
          // 其他简单类型
          fields.push({
            path: `${prefix}[] (option ${index + 1})`,
            type: getTypeString(opt),
            description: opt.description || '-',
          });
        }
      });
    } else if (isZodType(element, 'ZodOptional')) {
      // 数组元素是 Optional 类型时，展开内部类型
      const inner = (element as z.ZodOptional<z.ZodTypeAny>).unwrap();
      if (isZodType(inner, 'ZodObject')) {
        const innerFields: Array<{ path: string; type: string; description: string }> = [];
        collectFields(inner, '', innerFields);
        innerFields.forEach(field => {
          const fieldPath = field.path || 'value';
          fields.push({
            path: `${prefix}[].${fieldPath}`,
            type: `Optional<${field.type}>`,
            description: field.description,
          });
        });
      } else {
        fields.push({
          path: `${prefix}[]`,
          type: `Optional<${getTypeString(inner)}>`,
          description: element.description || '-',
        });
      }
    } else {
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
    const shape = (schema as z.ZodObject<any>).shape;
    Object.keys(shape).forEach(key => {
      const subSchema = shape[key];
      const newPath = prefix ? `${prefix}.${key}` : key;
      collectFields(subSchema, newPath, fields, wrapperType);
    });
    return;
  }

  // 处理 ZodUnion - 展开每个选项
  if (isZodType(schema, 'ZodUnion')) {
    const unionSchema = schema as z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>;
    unionSchema.options.forEach((opt: z.ZodTypeAny, index: number) => {
      // 对于 ZodOptional/ZodNullable，保留包装类型信息
      if (isZodType(opt, 'ZodOptional') || isZodType(opt, 'ZodNullable')) {
        const typeStr = getTypeString(opt);
        const innerWrapperType = isZodType(opt, 'ZodOptional') ? 'Optional' : 'Nullable';
        const inner = isZodType(opt, 'ZodOptional')
          ? (opt as z.ZodOptional<z.ZodTypeAny>).unwrap()
          : (opt as z.ZodNullable<z.ZodTypeAny>).unwrap();
        // 只有内部是对象或交叉类型才展开，否则直接使用类型字符串
        if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodIntersection')) {
          const innerFields: Array<{ path: string; type: string; description: string }> = [];
          collectFields(inner, '', innerFields, innerWrapperType);
          innerFields.forEach(field => {
            fields.push({
              path: field.path ? `${prefix} (option ${index + 1}): ${field.path}` : `${prefix} (option ${index + 1})`,
              type: field.type,
              description: field.description,
            });
          });
        } else {
          fields.push({
            path: `${prefix} (option ${index + 1})`,
            type: typeStr,
            description: opt.description || '-',
          });
        }
      } else if (isZodType(opt, 'ZodObject') || isZodType(opt, 'ZodIntersection')) {
        // 对象类型或交叉类型，递归展开
        const innerFields: Array<{ path: string; type: string; description: string }> = [];
        collectFields(opt, '', innerFields);
        innerFields.forEach(field => {
          fields.push({
            path: field.path ? `${prefix} (option ${index + 1}): ${field.path}` : `${prefix} (option ${index + 1})`,
            type: field.type,
            description: field.description,
          });
        });
      } else {
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
    const discUnionSchema = schema as z.ZodDiscriminatedUnion<string, [z.ZodObject<any>, ...z.ZodObject<any>[]]>;
    discUnionSchema.options.forEach((opt: z.ZodTypeAny, index: number) => {
      // 对于 ZodOptional/ZodNullable，保留包装类型信息
      if (isZodType(opt, 'ZodOptional') || isZodType(opt, 'ZodNullable')) {
        const typeStr = getTypeString(opt);
        const innerWrapperType = isZodType(opt, 'ZodOptional') ? 'Optional' : 'Nullable';
        const inner = isZodType(opt, 'ZodOptional')
          ? (opt as z.ZodOptional<z.ZodTypeAny>).unwrap()
          : (opt as z.ZodNullable<z.ZodTypeAny>).unwrap();
        if (isZodType(inner, 'ZodObject') || isZodType(inner, 'ZodIntersection')) {
          const innerFields: Array<{ path: string; type: string; description: string }> = [];
          collectFields(inner, '', innerFields, innerWrapperType);
          innerFields.forEach(field => {
            fields.push({
              path: field.path ? `${prefix} (option ${index + 1}): ${field.path}` : `${prefix} (option ${index + 1})`,
              type: field.type,
              description: field.description,
            });
          });
        } else {
          fields.push({
            path: `${prefix} (option ${index + 1})`,
            type: typeStr,
            description: opt.description || '-',
          });
        }
      } else if (isZodType(opt, 'ZodObject') || isZodType(opt, 'ZodIntersection')) {
        const innerFields: Array<{ path: string; type: string; description: string }> = [];
        collectFields(opt, '', innerFields);
        innerFields.forEach(field => {
          fields.push({
            path: field.path ? `${prefix} (option ${index + 1}): ${field.path}` : `${prefix} (option ${index + 1})`,
            type: field.type,
            description: field.description,
          });
        });
      } else {
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
    const intSchema = schema as z.ZodIntersection<z.ZodObject<any>, z.ZodObject<any>>;
    const leftFields: Array<{ path: string; type: string; description: string }> = [];
    const rightFields: Array<{ path: string; type: string; description: string }> = [];
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
    const recordSchema = schema as z.ZodRecord<z.ZodTypeAny, z.ZodTypeAny>;
    fields.push({
      path: prefix,
      type: `Record<${getTypeString(recordSchema.keySchema)}, ${getTypeString(recordSchema.valueSchema)}>`,
      description: schema.description || '-',
    });
    return;
  }

  // 处理 Tuple
  if (isZodType(schema, 'ZodTuple')) {
    const tupleSchema = schema as z.ZodTuple;
    const items = tupleSchema.items.map((item: z.ZodTypeAny) => getTypeString(item)).join(', ');
    fields.push({
      path: prefix,
      type: `Tuple(${items})`,
      description: schema.description || '-',
    });
    return;
  }

  // 处理 ZodEffects (transform)
  if (isZodType(schema, 'ZodEffects')) {
    const effectsSchema = schema as z.ZodEffects<z.ZodTypeAny>;
    const innerFields: Array<{ path: string; type: string; description: string }> = [];
    collectFields(effectsSchema.innerType(), prefix, innerFields);
    if (innerFields.length > 0) {
      innerFields.forEach(field => {
        fields.push({
          path: field.path,
          type: `Effects(${effectsSchema._def.effect.type})<${field.type}>`,
          description: field.description,
        });
      });
    } else {
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
  } else if (wrapperType === 'Nullable' && !typeStr.startsWith('Optional<') && !typeStr.startsWith('Nullable<')) {
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
function getTypeString(schema: z.ZodTypeAny): string {
  if (isZodType(schema, 'ZodOptional')) {
    return `Optional<${getTypeString((schema as z.ZodOptional<z.ZodTypeAny>).unwrap())}>`;
  }
  if (isZodType(schema, 'ZodNullable')) {
    return `Nullable<${getTypeString((schema as z.ZodNullable<z.ZodTypeAny>).unwrap())}>`;
  }
  if (isZodType(schema, 'ZodDefault')) {
    return `Default<${getTypeString((schema as z.ZodDefault<z.ZodTypeAny>).removeDefault())}>`;
  }
  if (isZodType(schema, 'ZodArray')) {
    return `Array<${getTypeString((schema as z.ZodArray<z.ZodTypeAny>).element)}>`;
  }
  if (isZodType(schema, 'ZodObject')) {
    // ZodObject 应该被 collectFields 展开，这里仅作为兜底
    const keys = Object.keys((schema as z.ZodObject<any>).shape);
    return `Object{${keys.join(', ')}}`;
  }
  if (isZodType(schema, 'ZodString')) {
    const strSchema = schema as z.ZodString;
    let result = 'String';
    if (strSchema.minLength !== null || strSchema.maxLength !== null) {
      const constraints: string[] = [];
      if (strSchema.minLength !== null) constraints.push(`min: ${strSchema.minLength}`);
      if (strSchema.maxLength !== null) constraints.push(`max: ${strSchema.maxLength}`);
      result += ` (${constraints.join(', ')})`;
    }
    return result;
  }
  if (isZodType(schema, 'ZodNumber')) {
    const numSchema = schema as z.ZodNumber;
    let result = 'Number';
    if (numSchema.minValue !== null || numSchema.maxValue !== null) {
      const constraints: string[] = [];
      if (numSchema.minValue !== null) constraints.push(`min: ${numSchema.minValue}`);
      if (numSchema.maxValue !== null) constraints.push(`max: ${numSchema.maxValue}`);
      result += ` (${constraints.join(', ')})`;
    }
    return result;
  }
  if (isZodType(schema, 'ZodEnum')) {
    return `Enum(${((schema as z.ZodEnum<[string, ...string[]]>).options).join(' | ')})`;
  }
  if (isZodType(schema, 'ZodLiteral')) {
    return `Literal(${JSON.stringify((schema as z.ZodLiteral<any>).value)})`;
  }
  if (isZodType(schema, 'ZodBoolean')) return 'Boolean';
  if (isZodType(schema, 'ZodBigInt')) return 'BigInt';
  if (isZodType(schema, 'ZodDate')) return 'Date';
  if (isZodType(schema, 'ZodNaN')) return 'NaN';
  if (isZodType(schema, 'ZodNever')) return 'Never';
  if (isZodType(schema, 'ZodUnknown')) return 'Unknown';
  if (isZodType(schema, 'ZodVoid')) return 'Void';
  if (isZodType(schema, 'ZodRecord')) {
    const recSchema = schema as z.ZodRecord<z.ZodTypeAny, z.ZodTypeAny>;
    return `Record<${getTypeString(recSchema.keySchema)}, ${getTypeString(recSchema.valueSchema)}>`;
  }
  if (isZodType(schema, 'ZodTuple')) {
    const tupSchema = schema as z.ZodTuple;
    const items = tupSchema.items.map((item: z.ZodTypeAny) => getTypeString(item)).join(', ');
    return `Tuple(${items})`;
  }
  if (isZodType(schema, 'ZodUnion')) {
    const unionSchema = schema as z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>;
    const options = unionSchema.options.map((opt: z.ZodTypeAny) => getTypeString(opt)).join(' | ');
    return `Union(${options})`;
  }
  if (isZodType(schema, 'ZodDiscriminatedUnion')) {
    return `DiscriminatedUnion(${(schema as z.ZodDiscriminatedUnion<any, any>).discriminator})`;
  }
  if (isZodType(schema, 'ZodIntersection')) {
    return 'Intersection';
  }
  if (isZodType(schema, 'ZodEffects')) {
    return `Effects(${((schema as z.ZodEffects<any>)._def.effect as any).type})`;
  }
  if (isZodType(schema, 'ZodMap')) {
    const mapSchema = schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>;
    return `Map<${getTypeString(mapSchema.keySchema)}, ${getTypeString(mapSchema.valueSchema)}>`;
  }
  if (isZodType(schema, 'ZodSet')) {
    return `Set<${getTypeString((schema as z.ZodSet<z.ZodTypeAny>)._def.valueType)}>`;
  }
  if (isZodType(schema, 'ZodAny')) return 'Any';
  if (isZodType(schema, 'ZodLazy')) {
    return `Lazy(${((schema as z.ZodLazy<any>)._def as any).getter().constructor.name || 'unknown'})`;
  }
  if (isZodType(schema, 'ZodFunction')) {
    const fnSchema = schema as z.ZodFunction<any, any>;
    const args = fnSchema._def.args ? getTypeString(fnSchema._def.args) : 'args';
    const returns = fnSchema._def.returns ? getTypeString(fnSchema._def.returns) : 'returns';
    return `Function(${args} => ${returns})`;
  }
  if (isZodType(schema, 'ZodPromise')) {
    return `Promise<${getTypeString((schema as z.ZodPromise<z.ZodTypeAny>)._def.type)}>`;
  }
  return (schema._def as any).typeName || schema.constructor.name;
}

export function zodSchemaToMarkdown(schema: z.ZodTypeAny, indentLevel: number = 0): string {
    let markdown = "";

    const indent = "  ".repeat(indentLevel);

    if (isZodType(schema, 'ZodObject')) {
      const shape = (schema as z.ZodObject<any>).shape;
      Object.keys(shape).forEach((key) => {
        const subSchema = shape[key];
        const description = subSchema.description ? `: ${subSchema.description}` : "";
        markdown += `${indent}- ${key}${description}\n`;
        markdown += zodSchemaToMarkdown(subSchema, indentLevel + 1);
      });
    } else if (isZodType(schema, 'ZodArray')) {
      markdown += `${indent}- Array\n`;
      markdown += zodSchemaToMarkdown((schema as z.ZodArray<z.ZodTypeAny>).element, indentLevel + 1);
    } else if (isZodType(schema, 'ZodString')) {
      markdown += `${indent}- String`;
      if ((schema as z.ZodString).minLength !== null) {
        markdown += ` (minLength: ${(schema as z.ZodString).minLength})`;
      }
      if ((schema as z.ZodString).maxLength !== null) {
        markdown += ` (maxLength: ${(schema as z.ZodString).maxLength})`;
      }
      markdown += "\n";
    } else if (isZodType(schema, 'ZodNumber')) {
      markdown += `${indent}- Number`;
      if ((schema as z.ZodNumber).minValue !== null) {
        markdown += ` (minValue: ${(schema as z.ZodNumber).minValue})`;
      }
      if ((schema as z.ZodNumber).maxValue !== null) {
        markdown += ` (maxValue: ${(schema as z.ZodNumber).maxValue})`;
      }
      markdown += "\n";
    } else if (isZodType(schema, 'ZodEnum')) {
      const values = (schema as z.ZodEnum<[string, ...string[]]>).options.join(", ");
      markdown += `${indent}- Enum: ${values}\n`;
    } else if (isZodType(schema, 'ZodUnion')) {
      const unionSchema = schema as z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>;
      markdown += `${indent}- Union\n`;
      unionSchema.options.forEach((option: z.ZodTypeAny, index: number) => {
        markdown += zodSchemaToMarkdown(option, indentLevel + 1);
        if (index < unionSchema.options.length - 1) {
          markdown += `${indent}  |\n`;
        }
      });
    } else if (isZodType(schema, 'ZodBoolean')) {
      markdown += `${indent}- Boolean\n`;
    } else if (isZodType(schema, 'ZodDefault')) {
      const defSchema = schema as z.ZodDefault<z.ZodTypeAny>;
      markdown += `${indent}- Default: ${JSON.stringify(defSchema._def.defaultValue())}\n`;
      markdown += zodSchemaToMarkdown(defSchema.removeDefault(), indentLevel);
    } else if (isZodType(schema, 'ZodOptional')) {
      markdown += `${indent}- Optional\n`;
      markdown += zodSchemaToMarkdown((schema as z.ZodOptional<z.ZodTypeAny>).unwrap(), indentLevel + 1);
    } else if (isZodType(schema, 'ZodNullable')) {
      markdown += `${indent}- Nullable\n`;
      markdown += zodSchemaToMarkdown((schema as z.ZodNullable<z.ZodTypeAny>).unwrap(), indentLevel + 1);
    } else if (isZodType(schema, 'ZodEffects')) {
      const effectType = ((schema as z.ZodEffects<any>)._def.effect as any).type;
      markdown += `${indent}- Effects (${effectType})\n`;
      markdown += zodSchemaToMarkdown((schema as z.ZodEffects<z.ZodTypeAny>).innerType(), indentLevel + 1);
    } else if (isZodType(schema, 'ZodDiscriminatedUnion')) {
      const discUnionSchema = schema as z.ZodDiscriminatedUnion<any, any>;
      const discriminator = discUnionSchema.discriminator;
      markdown += `${indent}- DiscriminatedUnion (key: ${discriminator})\n`;
      discUnionSchema.options.forEach((option: z.ZodTypeAny, index: number) => {
        markdown += zodSchemaToMarkdown(option, indentLevel + 1);
        if (index < discUnionSchema.options.length - 1) {
          markdown += `${indent}  |\n`;
        }
      });
    } else if (isZodType(schema, 'ZodIntersection')) {
      const intSchema = schema as z.ZodIntersection<any, any>;
      markdown += `${indent}- Intersection\n`;
      markdown += `${indent}  Left:\n`;
      markdown += zodSchemaToMarkdown(intSchema._def.left, indentLevel + 2);
      markdown += `${indent}  Right:\n`;
      markdown += zodSchemaToMarkdown(intSchema._def.right, indentLevel + 2);
    } else if (isZodType(schema, 'ZodRecord')) {
      const recSchema = schema as z.ZodRecord<z.ZodTypeAny, z.ZodTypeAny>;
      markdown += `${indent}- Record\n`;
      markdown += `${indent}  Key:\n`;
      markdown += zodSchemaToMarkdown(recSchema.keySchema, indentLevel + 2);
      markdown += `${indent}  Value:\n`;
      markdown += zodSchemaToMarkdown(recSchema.valueSchema, indentLevel + 2);
    } else if (isZodType(schema, 'ZodTuple')) {
      const tupSchema = schema as z.ZodTuple;
      markdown += `${indent}- Tuple\n`;
      tupSchema.items.forEach((item: z.ZodTypeAny, index: number) => {
        markdown += `${indent}  [${index}]:\n`;
        markdown += zodSchemaToMarkdown(item, indentLevel + 2);
      });
    } else if (isZodType(schema, 'ZodLiteral')) {
      markdown += `${indent}- Literal: ${JSON.stringify((schema as z.ZodLiteral<any>).value)}\n`;
    } else if (isZodType(schema, 'ZodBigInt')) {
      markdown += `${indent}- BigInt\n`;
    } else if (isZodType(schema, 'ZodDate')) {
      markdown += `${indent}- Date\n`;
    } else if (isZodType(schema, 'ZodNaN')) {
      markdown += `${indent}- NaN\n`;
    } else if (isZodType(schema, 'ZodNever')) {
      markdown += `${indent}- Never\n`;
    } else if (isZodType(schema, 'ZodUnknown')) {
      markdown += `${indent}- Unknown\n`;
    } else if (isZodType(schema, 'ZodVoid')) {
      markdown += `${indent}- Void\n`;
    } else if (isZodType(schema, 'ZodAny')) {
      markdown += `${indent}- Any\n`;
    } else if (isZodType(schema, 'ZodMap')) {
      const mapSchema = schema as z.ZodMap<z.ZodTypeAny, z.ZodTypeAny>;
      markdown += `${indent}- Map\n`;
      markdown += `${indent}  Key:\n`;
      markdown += zodSchemaToMarkdown(mapSchema.keySchema, indentLevel + 2);
      markdown += `${indent}  Value:\n`;
      markdown += zodSchemaToMarkdown(mapSchema.valueSchema, indentLevel + 2);
    } else if (isZodType(schema, 'ZodSet')) {
      markdown += `${indent}- Set\n`;
      markdown += zodSchemaToMarkdown((schema as z.ZodSet<z.ZodTypeAny>)._def.valueType, indentLevel + 1);
    } else if (isZodType(schema, 'ZodLazy')) {
      markdown += `${indent}- Lazy\n`;
    } else if (isZodType(schema, 'ZodFunction')) {
      const fnSchema = schema as z.ZodFunction<any, any>;
      markdown += `${indent}- Function\n`;
      if (fnSchema._def.args) {
        markdown += `${indent}  Args:\n`;
        markdown += zodSchemaToMarkdown(fnSchema._def.args, indentLevel + 2);
      }
      if (fnSchema._def.returns) {
        markdown += `${indent}  Returns:\n`;
        markdown += zodSchemaToMarkdown(fnSchema._def.returns, indentLevel + 2);
      }
    } else if (isZodType(schema, 'ZodPromise')) {
      markdown += `${indent}- Promise\n`;
      markdown += zodSchemaToMarkdown((schema as z.ZodPromise<z.ZodTypeAny>)._def.type, indentLevel + 1);
    } else {
      markdown += `${indent}- Type: ${(schema._def as any).typeName || schema.constructor.name}\n`;
    }

    return markdown;
  }