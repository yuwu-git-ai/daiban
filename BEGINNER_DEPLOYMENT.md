# 超简单部署指南（小白专用）

## 🎯 最简单的部署方法（推荐）

我们使用 Vercel，它是一个免费的平台，可以让您的网站在几秒钟内上线。

## 📝 准备工作

1. **注册 Vercel 账号**
   - 访问：https://vercel.com
   - 点击右上角的 "Sign Up"
   - 使用邮箱或 GitHub 账号注册（推荐用 GitHub，如果没有就选邮箱）

2. **准备您的 Supabase 信息**
   - 打开您的 Supabase 项目
   - 点击左侧菜单的 "Settings"（设置）
   - 点击 "API"
   - 您会看到两个信息：
     - **Project URL**（项目URL）：类似 `https://xxxxx.supabase.co`
     - **anon public key**（匿名密钥）：一长串字符

## 🚀 开始部署（5分钟搞定）

### 第一步：上传项目到 Vercel

1. 登录 Vercel 后，点击页面上的 **"Add New"** 按钮
2. 选择 **"Project"**
3. 您会看到几个选项：
   - **Import Git Repository** - 这个需要 GitHub（跳过）
   - **Upload a File or Folder** - 这个最简单（点这个！）
4. 点击 **"Upload"** 按钮
5. 选择您的项目文件夹：`C:\Users\LENOVO\Desktop\project`
6. 等待上传完成

### 第二步：配置项目

上传完成后，您会看到配置页面：

1. **Project Name**（项目名称）
   - 可以随便起，比如：`my-todo-app`
   - 这个名称会成为网址的一部分

2. **Framework Preset**（框架预设）
   - 选择：**Vite**
   - 如果没有自动选择，手动选择它

3. **Build Command**（构建命令）
   - 应该自动显示：`npm run build`
   - 如果没有，手动输入这个

4. **Output Directory**（输出目录）
   - 应该自动显示：`dist`
   - 如果没有，手动输入这个

### 第三步：添加环境变量（重要！）

在配置页面的下方，找到 **"Environment Variables"** 部分：

1. 点击 **"Add New"** 按钮
2. 添加第一个变量：
   - **Name**（名称）：输入 `VITE_SUPABASE_URL`
   - **Value**（值）：粘贴您的 Supabase Project URL
   - 例如：`https://qioigitdskmaxhielifh.supabase.co`
   - 点击 **"Save"**

3. 再次点击 **"Add New"** 按钮
4. 添加第二个变量：
   - **Name**（名称）：输入 `VITE_SUPABASE_ANON_KEY`
   - **Value**（值）：粘贴您的 Supabase anon public key
   - 例如：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很长的一串）
   - 点击 **"Save"**

### 第四步：开始部署

1. 滚动到页面底部
2. 点击 **"Deploy"** 按钮
3. 等待几分钟（通常 2-5 分钟）
4. 看到 "Congratulations!" 就表示成功了！

### 第五步：访问您的网站

部署成功后，您会看到一个网址，类似：
- `https://my-todo-app.vercel.app`

点击这个链接，您的网站就上线了！🎉

## 🔧 部署后必做：运行数据库迁移

为了让分类和子任务功能正常工作，您需要在 Supabase 中运行一次数据库迁移：

1. 打开您的 Supabase 项目
2. 点击左侧菜单的 **"SQL Editor"**（SQL编辑器）
3. 点击 **"New query"**（新建查询）
4. 打开这个文件：`supabase/migrations/20260205120000_add_categories_and_subtasks.sql`
5. 复制文件中的所有内容
6. 粘贴到 Supabase 的 SQL 编辑器中
7. 点击右下角的 **"Run"** 按钮
8. 看到绿色的 "Success" 就完成了！

## ❓ 什么是环境变量？

简单来说，环境变量就是**给程序的秘密信息**。

想象一下：
- 您的网站像一个房子
- 环境变量就像房子的钥匙
- 这些钥匙（Supabase 的 URL 和密钥）不能公开，只能给您的程序使用

在 Vercel 中配置环境变量，就是把这些"钥匙"安全地交给您的程序。

## 🔄 如何更新网站？

当您修改代码后，想要重新部署：

### 方法 1：通过 Vercel 网站
1. 登录 Vercel
2. 找到您的项目
3. 点击 **"Redeploy"** 按钮
4. 等待完成

### 方法 2：使用 Vercel CLI（高级）
如果您安装了 Vercel CLI，可以在项目文件夹中运行：
```bash
vercel --prod
```

## 💡 小提示

1. **网址是免费的**：Vercel 提供的免费网址永久有效
2. **自动更新**：如果您学会了使用 GitHub，每次推送代码会自动更新
3. **查看日志**：在 Vercel 项目中可以看到访问日志和错误信息
4. **自定义域名**：以后可以购买域名并绑定到 Vercel

## 🆘 遇到问题？

### 问题 1：部署失败
- 检查环境变量是否正确添加
- 确认 Supabase URL 和密钥没有复制错误

### 问题 2：网站打不开
- 等待几分钟，有时需要时间传播
- 检查网址是否正确

### 问题 3：功能不正常
- 确认数据库迁移已运行
- 检查环境变量是否正确

## 📞 需要帮助？

如果遇到任何问题，可以：
1. 查看 Vercel 的部署日志
2. 检查 Supabase 的设置
3. 重新部署项目

祝您部署成功！🎊
