| 字段 | 类型 | 描述 |
|------|------|------|
| id | String | 公司ID |
| name | String | 公司名称 |
| departments[].name | String | 部门名称 |
| departments[].employees[].id | String | 员工ID |
| departments[].employees[].name | String | 姓名 |
| departments[].employees[].title | String | 职位 |
| departments[].employees[].skills[] | Array<String> | 技能 |
| departments[].employees[].contact.email | String | 邮箱 |
| departments[].employees[].contact.phone | Optional<String> | 电话 |
| departments[].location.street | String | 街道 |
| departments[].location.city | String | 城市 |
| departments[].location.country | String | 国家 |
| departments[].location.coordinates.lat | Number | 纬度 |
| departments[].location.coordinates.lng | Number | 经度 |
| foundedYear | Number | 成立年份 |
| tags[] | Array<String> | 标签 |
