import { z } from 'zod';
import { zodSchemaToTable } from '../src/index';
import * as fs from 'fs';

// 纯对象嵌套示例
const coordinatesSchema = z.object({
  lat: z.number().describe('纬度'),
  lng: z.number().describe('经度'),
});

const addressSchema = z.object({
  street: z.string().describe('街道'),
  city: z.string().describe('城市'),
  country: z.string().describe('国家'),
  coordinates: coordinatesSchema.describe('坐标'),
});

const userSchema = z.object({
  id: z.string().uuid().describe('用户ID'),
  name: z.string().describe('姓名'),
  profile: z.object({
    bio: z.string().describe('个人简介'),
    avatar: z.string().describe('头像URL'),
    age: z.number().describe('年龄'),
  }).describe('用户资料'),
  settings: z.object({
    theme: z.enum(['light', 'dark']).describe('主题'),
    language: z.string().describe('语言'),
    notifications: z.object({
      email: z.boolean().describe('邮件通知'),
      push: z.boolean().describe('推送通知'),
    }).describe('通知设置'),
  }).describe('设置'),
});

const markdown = zodSchemaToTable(userSchema);

console.log('## User Schema (Object 嵌套)\n');
console.log(markdown);

fs.writeFileSync('examples/nested-object-example.md', markdown);
console.log('已保存到 examples/nested-object-example.md');
