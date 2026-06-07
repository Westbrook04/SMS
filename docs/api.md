# 接口文档

基础地址: `http://localhost:8080/api`

## 鉴权说明

除 `/api/auth/login` 外，所有接口需要在请求头中携带 Token：

```
Authorization: Bearer <token>
```

Token 有效期为 24 小时。

---

## 登录

### POST /api/auth/login

管理员登录。

**请求体：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "token": "b2f7c37582494f46875f872bfbc72f63",
    "username": "admin"
  },
  "error": null
}
```

**失败响应：**
```json
{
  "success": false,
  "data": null,
  "error": "用户名或密码错误"
}
```

---

## 学院

### GET /api/schools

获取所有学院列表。

**响应：**
```json
[
  { "schoolCode": "57", "schoolName": "能源与机械工程学院" }
]
```

### POST /api/schools

新增学院。

**请求体：**
```json
{
  "schoolCode": "57",
  "schoolName": "能源与机械工程学院"
}
```

### DELETE /api/schools/{schoolCode}

删除学院。

---

## 专业

### GET /api/majors

获取所有专业列表。

**响应：**
```json
[
  {
    "majorCode": "78",
    "majorName": "软件工程",
    "school": { "schoolCode": "57", "schoolName": "能源与机械工程学院" }
  }
]
```

### GET /api/majors/by-school/{schoolCode}

按学院筛选专业。

### POST /api/majors

新增专业。

**请求体：**
```json
{
  "majorCode": "78",
  "majorName": "软件工程",
  "school": { "schoolCode": "57" }
}
```

### DELETE /api/majors/{majorCode}

删除专业。

---

## 班级

### GET /api/classes

获取所有班级列表（含学生人数）。

**响应：**
```json
[
  {
    "classId": "CS2024",
    "className": "计算机科学2024班",
    "studentCount": 30
  }
]
```

### POST /api/classes

新增班级。

**请求体：**
```json
{
  "classId": "CS2024",
  "className": "计算机科学2024班"
}
```

### GET /api/classes/{classId}

获取单个班级。

### DELETE /api/classes/{classId}

删除班级。

---

## 学生

### GET /api/students

获取所有学生列表。

**响应：**
```json
[
  {
    "studentId": "5720227881",
    "studentName": "张三",
    "studentClass": {
      "classId": "CS2024",
      "className": "计算机科学2024班"
    }
  }
]
```

### POST /api/students

新增学生。

**请求体：**
```json
{
  "studentId": "5720227881",
  "studentName": "张三",
  "studentClass": { "classId": "CS2024" }
}
```

### PUT /api/students/{studentId}

修改学生姓名或班级。

**请求体：**
```json
{
  "studentName": "张三",
  "studentClass": { "classId": "CS2024" }
}
```

### DELETE /api/students/{studentId}

删除学生。
