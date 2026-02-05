-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 为todos表添加category_id字段
ALTER TABLE todos ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- 为todos表添加parent_id字段（用于子任务）
ALTER TABLE todos ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES todos(id) ON DELETE CASCADE;

-- 为todos表添加user_id字段（如果还没有的话）
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id uuid;

-- 为categories表启用RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 创建categories表的策略
CREATE POLICY "Users can view their own categories"
  ON categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- 更新todos表的策略以支持用户隔离
DROP POLICY IF EXISTS "Allow all operations on todos" ON todos;

CREATE POLICY "Users can view their own todos"
  ON todos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
  ON todos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos
  FOR DELETE
  USING (auth.uid() = user_id);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_category_id ON todos(category_id);
CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON todos(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
