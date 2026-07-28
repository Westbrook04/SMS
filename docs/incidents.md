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


## 2026-07-28: classApi.ts 为 GBK 编码导致前端构建失败

### 现象

`electron-vite build` 报错：

```
[UNLOADABLE_DEPENDENCY] Could not load src/api/classApi.ts
stream did not contain valid UTF-8
```

### 原因

`src/api/classApi.ts` 被保存成了 GBK 编码（Windows 上部分编辑器默认 ANSI/GBK），而 rolldown（electron-vite 的打包器）只接受 UTF-8。

### 恢复

```bash
iconv -f GBK -t UTF-8 classApi.ts > classApi.ts.tmp && mv classApi.ts.tmp classApi.ts
```

内容不变，只转编码。

### 预防

- 编辑器（IDEA / VSCode）统一设置文件编码为 UTF-8
- 构建报 "not valid UTF-8" 时，用 `file <文件>` 检查编码即可确认

## 2026-07-28: Electron 无边框窗口 drag 区域收不到鼠标事件

### 现象

登录页吉祥物设计了"眼睛跟随鼠标"效果（监听 `window` 的 `mousemove`），但实际运行时眼睛完全不动。

### 根因

页面容器整体设置了 `WebkitAppRegion: 'drag'`。**Windows 上 Electron 把 drag 区域当原生标题栏处理**（系统命中测试直接返回 HTCAPTION），`mousemove` 等鼠标事件根本不会派发到渲染进程，页面监听自然失效。

### 修复

去掉容器的整体 drag，改为窗口顶部一条 30px 高的拖拽条（`position: absolute` 铺满顶部 + `WebkitAppRegion: 'drag'`），其余区域正常接收鼠标事件。关闭按钮保持 `no-drag` 且 `zIndex` 高于拖拽条。

### 预防

- 无边框窗口中，drag 区域只放在"标题栏"类纯装饰区域
- 任何需要鼠标交互（hover、点击、移动监听）的区域，绝不能落在 drag 区域内
