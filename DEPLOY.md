# 墨名堂 · 灵喵京 v0.1 部署指南

## 一、Supabase 数据库设置（5 分钟）

### 1. 注册 Supabase
打开 [supabase.com](https://supabase.com) → 用 GitHub 登录 → 创建新项目

### 2. 创建数据库表
进入 Supabase 项目 → SQL Editor → 粘贴 `supabase-schema.sql` 全部内容 → Run

### 3. 获取连接信息
Settings → API → 复制以下值：
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## 二、Vercel 部署（2 分钟）

### 1. 准备代码
把整个项目文件夹推送到一个 GitHub 仓库

### 2. 部署到 Vercel
打开 [vercel.com](https://vercel.com) → 用 GitHub 登录 → Import Git Repository → 选择你的仓库

### 3. 配置环境变量
Vercel 项目 → Settings → Environment Variables → 添加：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | 从 Supabase 复制 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 从 Supabase 复制 |
| `SUPABASE_SERVICE_ROLE_KEY` | 从 Supabase 复制 |
| `JWT_SECRET` | 随机字符串（如 `moming-tang-prod-2025-xxxx`） |

→ Save → 重新部署（Redeploy）

### 4. 初始化 Demo 数据
浏览器访问：`https://你的域名.vercel.app/api/seed`

看到 `✅ 初始化成功！` 即可。

### 5. 开始使用
- 前台：`https://你的域名.vercel.app/auth`
- 后台：`https://你的域名.vercel.app/admin`
- Demo 账号：`13800000001` / `Test1234!`
- 管理员：`admin` / `Admin123!`

## 三、本地开发

```bash
cp .env.example .env
# 编辑 .env 填入 Supabase 连接信息
pnpm install
pnpm dev
# 访问 http://localhost:3000/api/seed 初始化数据
```

## 免费额度

| 服务 | 免费额度 |
|------|----------|
| Vercel | 100GB 带宽/月，无限静态页面 |
| Supabase | 500MB 数据库，50,000 月活用户 |
