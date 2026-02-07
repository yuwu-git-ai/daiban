/*
  # 创建待办事项表

  1. 新建表
    - `todos`
      - `id` (uuid, 主键) - 待办事项唯一标识
      - `title` (text) - 待办事项标题
      - `completed` (boolean) - 完成状态，默认为 false
      - `created_at` (timestamptz) - 创建时间
      - `updated_at` (timestamptz) - 更新时间
  
  2. 安全性
    - 启用 RLS（行级安全）
    - 添加公开访问策略，允许所有操作（适用于演示应用）
  
  3. 注意事项
    - 这是一个演示应用，未实现用户认证
    - 所有用户可以查看、创建、更新和删除任何待办事项
*/

CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on todos"
  ON todos
  FOR ALL
  USING (true)
  WITH CHECK (true);