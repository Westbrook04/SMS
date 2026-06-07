# 事故记录

## 2026-06-07: application.yml 被删除导致启动失败

### 现象

后端启动报错：

```
Failed to configure a DataSource: 'url' attribute is not specified
```

`application.yml` 文件从磁盘消失了。

### 原因

项目原本的 `application.yml` 是 git 跟踪的（tracked）。做了两件事：

1. 执行 `git rm --cached SMS-backend/main/resources/application.yml` 将其从 git 中移除
2. 将其加入 `.gitignore`

`git rm --cached` 的正确行为是"只从 git 移除，保留磁盘文件"。
但结合当时项目目录结构因为之前 Revert 操作导致的混乱（`SMS-backend/` 目录曾被恢复到了 `electron-ui/SMS-backend/`），文件最终从磁盘丢失了。

### 根因

不是 `git rm --cached` 本身的问题，而是**项目源码目录结构在之前的 git 操作中被打乱过**，`SMS-backend/` 下的文件状态不一致。

### 恢复步骤

```bash
# 从示例配置复制一份
cp SMS-backend/main/resources/application-example.yml SMS-backend/main/resources/application.yml

# 修改密码为实际 mysql 密码
# password: 123456
```

### 预防

- `application.yml` 已加入 `.gitignore`，不会再被 git 跟踪
- 每次新增配置项时，同步更新 `application-example.yml`
- 克隆项目后第一步：`cp application-example.yml application.yml` 并修改密码
