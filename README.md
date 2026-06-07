# SMS - 学生管理系统

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-blue" alt="Java 21"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen" alt="Spring Boot 3.2"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-orange" alt="MySQL 8.0"/>
  <img src="https://img.shields.io/badge/Electron-31-blueviolet" alt="Electron 31"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License MIT"/>
</p>

Spring Boot + Electron 学习项目，实现学生和班级的增删改查，带管理员登录和 Token 鉴权。

## 技术栈

| 层 | 技术 |
|----|------|
| 后端 | Spring Boot 3.x + JPA + MySQL |
| 前端 | Electron + React + TypeScript + Vite |
| 鉴权 | UUID Token + BCrypt 密码加密 |

## 快速开始

### 前置要求

- JDK 21+
- MySQL 8.0+
- Node.js 18+

### 1. 克隆项目

```bash
git clone https://github.com/Westbrook04/SMS.git
cd SMS
```

### 2. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE SMS;
```

### 3. 配置数据库连接

```bash
cp SMS-backend/main/resources/application-example.yml SMS-backend/main/resources/application.yml
```

打开 `application.yml`，把密码改成你自己的 MySQL 密码。

### 4. 启动后端

```bash
./mvnw spring-boot:run
```

启动后会自动建表，并创建默认管理员账号：`admin / admin123`

### 5. 启动前端

新开一个终端：

```bash
cd electron-ui
npm install
npm run dev
```

访问 `http://localhost:5173`，用 `admin / admin123` 登录。

## 项目结构

```
SMS/
├── SMS-backend/                         # Java 后端
│   └── main/java/com/example/sms/
│       ├── controller/                  # API 接口
│       ├── service/                     # 业务逻辑
│       ├── repository/                  # 数据访问
│       ├── entity/                      # 数据模型
│       ├── config/                      # 配置（CORS、鉴权拦截器）
│       └── dto/                         # 数据传输对象
├── electron-ui/                         # Electron 前端
│   └── src/
│       ├── pages/                       # 页面（登录、班级管理、学生管理）
│       └── api/                         # API 请求封装
└── pom.xml
```

## 功能

- 管理员登录（含验证码）
- Token 鉴权（24小时过期）
- 班级管理（新增、删除）
- 学生管理（新增、编辑、删除、按班级筛选）

## License

MIT
