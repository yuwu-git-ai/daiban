# 环境变量配置

在部署到 Vercel 时，需要配置以下环境变量：

## 必需的环境变量

1. **VITE_SUPABASE_URL**
   - 您的 Supabase 项目 URL
   - 示例：https://qioigitdskmaxhielifh.supabase.co

2. **VITE_SUPABASE_ANON_KEY**
   - 您的 Supabase 匿名密钥
   - 示例：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

## 如何获取这些值

1. 登录您的 Supabase 项目
2. 进入 Settings > API
3. 复制 Project URL 和 anon public key

## 在 Vercel 中配置

1. 进入您的 Vercel 项目设置
2. 点击 "Environment Variables"
3. 添加上述两个环境变量
4. 保存后重新部署
