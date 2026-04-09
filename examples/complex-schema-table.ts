import { z } from 'zod';
import { zodSchemaToTable } from '../src/index';
import * as fs from 'fs';

// 多层嵌套 Schema 示例

// 第一层：坐标
const coordinatesSchema = z.object({
  lat: z.number().describe('纬度'),
  lng: z.number().describe('经度'),
}).describe('地理坐标');

// 第二层：地址
const addressSchema = z.object({
  street: z.string().describe('街道'),
  city: z.string().describe('城市'),
  country: z.string().describe('国家'),
  coordinates: coordinatesSchema.describe('坐标'),
}).describe('地址');

// 爱好
const hobbySchema = z.object({
  name: z.string().describe('爱好名称'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).describe('等级'),
  equipment: z.array(z.object({
    name: z.string().describe('装备名称'),
    brand: z.string().optional().describe('品牌'),
  })).optional().describe('相关装备'),
}).describe('爱好');

// 主要 Schema
const companySchema = z.object({
  id: z.string().uuid().describe('公司ID'),
  name: z.string().describe('公司名称'),
  departments: z.array(z.object({
    name: z.string().describe('部门名称'),
    employees: z.array(z.object({
      id: z.string().describe('员工ID'),
      name: z.string().describe('姓名'),
      title: z.string().describe('职位'),
      skills: z.array(z.string()).describe('技能'),
      contact: z.object({
        email: z.string().describe('邮箱'),
        phone: z.string().optional().describe('电话'),
      }).describe('联系方式'),
    })).describe('员工列表'),
    location: addressSchema.describe('部门地址'),
  })).describe('部门列表'),
  foundedYear: z.number().describe('成立年份'),
  tags: z.array(z.string()).describe('标签'),
}).describe('公司');

const markdown = zodSchemaToTable(companySchema);

console.log('## Company Schema 文档 (多层级嵌套)\n');
console.log(markdown);

// 保存到文件
fs.writeFileSync('examples/company-schema-table.md', markdown);
console.log('\n已保存到 examples/company-schema-table.md');
