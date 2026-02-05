# 部署指南

## 方法一：通过 Vercel CLI 部署（推荐）

### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 部署项目
```bash
vercel
```

按照提示操作：
- 选择 "Set up and deploy"
- 确认项目设置
- 添加环境变量（见下方）
- 确认部署

### 4. 配置环境变量
在部署过程中或部署后，添加以下环境变量：

- `VITE_SUPABASE_URL`: https://qioigitdskmaxhielifh.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpb2lnaXRkc2ttYXhoaWVsaWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDA0OTksImV4cCI6MjA4NTc3NjQ5OX0.BzL2U7xKpuRae3zEG-zCWH5X5_wBo7-QhoknTRIse2U

## 方法二：通过 Vercel 网站部署

### 1. 准备工作
- 将代码推送到 GitHub
- 或使用 Vercel 的 Git 集成

### 2. 在 Vercel 创建项目
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 导入您的 GitHub 仓库
4. 或上传项目文件

### 3. 配置项目
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### 4. 添加环境变量
在 Environment Variables 部分添加：
- `VITE_SUPABASE_URL`: https://qioigitdskmaxhielifh.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpb2lnaXRkc2ttYXhoaWVsaWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDA0OTksImV4cCI6MjA4NTc3NjQ5OX0.BzL2U7xKpuRae3zEG-zCWH5X5_wBo7-QhoknTRIse2U

### 5. 部署
点击 "Deploy" 按钮开始部署

## 部署后操作

### 1. 运行数据库迁移
在部署成功后，您需要在 Supabase 中运行数据库迁移：

1. 登录您的 Supabase 项目
2. 进入 SQL Editor
3. 打开文件：`supabase/migrations/20260205120000_add_categories_and_subtasks.sql`
4. 复制内容并运行

### 2. 测试应用
访问 Vercel 提供的 URL，测试：
- 用户注册/登录
- 创建分类
- 添加任务
- 添加子任务
- 所有功能是否正常

## 更新部署

当您修改代码后：

### 使用 CLI
```bash
vercel --prod
```

### 使用 Git
```bash
git add .
git commit -m "Update"
git push
```
Vercel 会自动检测并重新部署

## 常见问题

### 环境变量未生效
- 确保环境变量名称以 `VITE_` 开头
- 重新部署项目

### 路由问题
- 确保 `vercel.json` 配置正确
- 检查 `rewrites` 配置

### 数据库连接失败
- 检查 Supabase URL 和密钥是否正确
- 确保数据库迁移已运行

## 其他部署平台

### Netlify
1. 将项目推送到 GitHub
2. 在 Netlify 中导入项目
3. 配置构建设置
4. 添加环境变量

### GitHub Pages
1. 修改 `vite.config.ts` 中的 base 路径
2. 构建项目
3. 将 `dist` 目录推送到 gh-pages 分支
