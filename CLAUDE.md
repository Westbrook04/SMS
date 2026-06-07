# SMS - 学生管理系统 编码规范

## 项目结构
- **后端**: `SMS-backend/main/java/com/example/sms/`
  - `controller/` — API 接口
  - `service/` — 业务逻辑
  - `repository/` — 数据访问
  - `entity/` — 数据模型
  - `config/` — 配置（CORS、拦截器）
  - `dto/` — 数据传输对象
- **前端**: `electron-ui/src/`
  - `pages/` — 页面组件
  - `api/` — API 请求封装

## 语言规范
- **控制台/终端输出**: 必须用英文，不要用中文（Windows 终端编码问题导致中文乱码）
- **UI 界面文本**: 必须用中文（按钮、弹窗、提示、表格标题等），不要用 "OK"/"Cancel"/"Confirm" 等英文

## 后端规范
- Java 21 + Spring Boot + JPA + MySQL
- 构造器注入，不使用 `@Autowired` 字段注入
- API 路径统一以 `/api/` 开头
- 修改 `pom.xml` 时不要动 parent 版本号

## 前端规范
- React + TypeScript + Ant Design + Vite + Electron
- API 请求统一通过 `src/api/client.ts`（带 token 自动注入）
- Token 存 `localStorage`，key 为 `sms_token`
- 路由使用 `HashRouter`（`App.tsx` 已配置）
- 新增页面组件放到 `src/pages/`

## Git 规范
- 功能开发在 feature 分支，完成后合并到 master
- Commit 用 `feat:` / `fix:` / `docs:` / `chore:` 前缀
- 敏感配置（数据库密码等）不提交到 git

## 数据库
- MySQL 数据库名 `SMS`
- JPA `ddl-auto: update` 自动建表
- 默认管理员账号: `admin / admin123`
- 配置模板: `SMS-backend/main/resources/application-example.yml`
