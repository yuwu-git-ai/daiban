/*
  # 修复RLS策略 - 基于用户认证

  1. 变更内容
    - 添加user_id列到todos表
    - 移除开放的RLS策略
    - 添加用户认证的RLS策略
  
  2. 安全性改进
    - 现在需要有效的Supabase认证session
    - 每个待办事项与创建者关联
    - 用户只能访问属于自己的数据
  
  3. 迁移策略
    - 添加user_id列为可空
    - 创建允许过渡期匿名访问的策略
*/

-- 添加user_id列到todos表
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE todos ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 移除旧的不安全策略
DROP POLICY IF EXISTS "Allow all operations on todos" ON todos;

-- 创建安全的RLS策略
DROP POLICY IF EXISTS "Users can view own todos" ON todos;
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own todos" ON todos;
CREATE POLICY "Users can create own todos"
  ON todos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own todos" ON todos;
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 允许匿名用户访问没有user_id的待办事项(过渡期)
DROP POLICY IF EXISTS "Anonymous access for null user_id todos" ON todos;
CREATE POLICY "Anonymous access for null user_id todos"
  ON todos FOR ALL
  TO anon
  USING (user_id IS NULL);