# SMS - 学生管理系统

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-blue" alt="Java 21"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen" alt="Spring Boot 3.2"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-orange" alt="MySQL 8.0"/>
  <img src="https://img.shields.io/badge/Electron-31-blueviolet" alt="Electron 31"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License MIT"/>
</p>

一个以经典学生管理系统为载体的 **全栈技术复习与实践项目**。

本科欠下的基本功，工作之后一点一点补回来。通过从零搭建一个带登录鉴权的完整 CRUD 应用，把 Java、Spring Boot、MySQL 到现代前端（React + Electron）的整条链路跑通、跑透。

> 系统本身不复杂，复杂的是把每一层都想明白。

## 技术栈

| 层 | 技术 | 目的 |
|----|------|------|
| 后端框架 | Spring Boot 3.x + JPA | 接口开发、ORM、分层架构 |
| 数据库 | MySQL 8.0 | 数据持久化 |
| 前端框架 | React + TypeScript + Ant Design | 组件化 UI 开发 |
| 桌面壳 | Electron 31 | 桌面应用打包与窗口管理 |
| 鉴权 | UUID Token + BCrypt | 登录态管理、密码加密 |
| 构建 | Maven + Vite | 后端/前端构建 |

## 功能

- 管理员登录（账号密码 / 手机验证码，含图形验证码）
- 全接口 Token 鉴权（24 小时过期）
- 班级管理（新增、删除、人数统计）
- 学生管理（新增、编辑、删除、按班级归类）
- 窗口自适应（登录页 900x580 / 主页 1200x800 自动切换）

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

- 管理员登录（账号密码 / 手机验证码）
- Token 鉴权（24小时过期）
- 班级管理（新增、删除）
- 学生管理（新增、编辑、删除、按班级筛选）

## License

MIT
