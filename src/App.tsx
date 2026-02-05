import { useEffect, useState } from 'react';
import { supabase, type Todo, type Category } from './lib/supabase';
import { Plus, Trash2, Edit2, Check, X, CheckCircle2, Circle, LogOut, FolderPlus, Folder, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [subtaskParentId, setSubtaskParentId] = useState<string | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchCategories(session.user.id);
        fetchTodos(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchCategories(session.user.id);
        fetchTodos(session.user.id);
      } else {
        setTodos([]);
        setCategories([]);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchCategories = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTodos = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setAuthError(error.message || '注册失败');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setAuthError(error.message || '登录失败');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setTodos([]);
      setCategories([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !session?.user.id) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim(), color: newCategoryColor, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCategories([...categories, data]);
        setNewCategoryName('');
        setNewCategoryColor('#3B82F6');
        setShowAddCategoryDialog(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      setCategories(categories.filter(c => c.id !== categoryId));
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !session?.user.id) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          title: newTodo.trim(),
          user_id: session.user.id,
          category_id: selectedCategoryId
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTodos([data, ...todos]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const addSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim() || !subtaskParentId || !session?.user.id) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          title: newSubtaskText.trim(),
          user_id: session.user.id,
          parent_id: subtaskParentId,
          category_id: selectedCategoryId
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTodos([data, ...todos]);
        setNewSubtaskText('');
        setIsAddingSubtask(false);
        setSubtaskParentId(null);
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const toggleExpand = (todoId: string) => {
    const newExpanded = new Set(expandedTodos);
    if (newExpanded.has(todoId)) {
      newExpanded.delete(todoId);
    } else {
      newExpanded.add(todoId);
    }
    setExpandedTodos(newExpanded);
  };

  const getSubtasks = (parentId: string) => {
    return todos.filter(t => t.parent_id === parentId);
  };

  const toggleComplete = async (todo: Todo) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed, updated_at: new Date().toISOString() })
        .eq('id', todo.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTodos(todos.map(t => t.id === todo.id ? data : t));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = async (id: string) => {
    if (!editingText.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ title: editingText.trim(), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTodos(todos.map(t => t.id === id ? data : t));
        setEditingId(null);
        setEditingText('');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteCompleted = async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id);
    if (completedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .in('id', completedIds);

      if (error) throw error;
      setTodos(todos.filter(t => !t.completed));
    } catch (error) {
      console.error('Error deleting completed todos:', error);
    }
  };

  const activeTodos = todos.filter(t => !t.completed && !t.parent_id);
  const completedTodos = todos.filter(t => t.completed && !t.parent_id);
  const filteredTodos = selectedCategoryId 
    ? activeTodos.filter(t => t.category_id === selectedCategoryId)
    : activeTodos;
  const filteredCompletedTodos = selectedCategoryId
    ? completedTodos.filter(t => t.category_id === selectedCategoryId)
    : completedTodos;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">待办清单</h1>
            <p className="text-gray-600">管理您的日常任务</p>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-medium transition-colors"
            >
              {authLoading ? '处理中...' : isSignUp ? '注册' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isSignUp ? '已有账户？' : '没有账户？'}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium ml-2"
              >
                {isSignUp ? '登录' : '注册'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">待办清单</h1>
                <p className="text-blue-100">管理您的日常任务</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-sm text-blue-100">{session.user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
                >
                  <LogOut size={16} />
                  退出
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedCategoryId === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Folder size={18} />
                全部
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    selectedCategoryId === category.id
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedCategoryId === category.id ? category.color : undefined
                  }}
                >
                  <Tag size={18} />
                  {category.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(category.id);
                    }}
                    className="ml-1 hover:opacity-70 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </button>
              ))}
              <button
                onClick={() => setShowAddCategoryDialog(true)}
                className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <FolderPlus size={18} />
                添加分类
              </button>
            </div>
            <form onSubmit={addTodo} className="mb-8">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="添加新的待办事项..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  添加
                </button>
              </div>
            </form>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-6 text-sm">
                <span className="text-gray-600">
                  待办: <span className="font-semibold text-blue-600">{filteredTodos.length}</span>
                </span>
                <span className="text-gray-600">
                  已完成: <span className="font-semibold text-green-600">{filteredCompletedTodos.length}</span>
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {showCompleted ? '隐藏已完成' : '显示已完成'}
                </button>
                {filteredCompletedTodos.length > 0 && (
                  <button
                    onClick={deleteCompleted}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
                  >
                    清除已完成
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredTodos.map((todo) => {
                const subtasks = getSubtasks(todo.id);
                const hasSubtasks = subtasks.length > 0;
                const isExpanded = expandedTodos.has(todo.id);
                const category = categories.find(c => c.id === todo.category_id);

                return (
                  <div key={todo.id} className="rounded-xl transition-all">
                    <div
                      className="group flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <button
                        onClick={() => toggleComplete(todo)}
                        className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Circle size={24} />
                      </button>

                      {hasSubtasks && (
                        <button
                          onClick={() => toggleExpand(todo.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                      )}

                      {editingId === todo.id ? (
                        <>
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(todo.id)}
                            className="text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-gray-800 text-lg">{todo.title}</span>
                          {category && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
                            </span>
                          )}
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setIsAddingSubtask(true);
                                setSubtaskParentId(todo.id);
                              }}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              title="添加子任务"
                            >
                              <Plus size={18} />
                            </button>
                            <button
                              onClick={() => startEditing(todo)}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {isAddingSubtask && subtaskParentId === todo.id && (
                      <div className="ml-12 mt-2">
                        <form onSubmit={addSubtask} className="flex gap-2">
                          <input
                            type="text"
                            value={newSubtaskText}
                            onChange={(e) => setNewSubtaskText(e.target.value)}
                            placeholder="添加子任务..."
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                          >
                            添加
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingSubtask(false);
                              setSubtaskParentId(null);
                              setNewSubtaskText('');
                            }}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </form>
                      </div>
                    )}

                    {isExpanded && hasSubtasks && (
                      <div className="ml-12 mt-2 space-y-2">
                        {subtasks.map((subtask) => {
                          const subtaskCategory = categories.find(c => c.id === subtask.category_id);
                          return (
                            <div
                              key={subtask.id}
                              className="group flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                            >
                              <button
                                onClick={() => toggleComplete(subtask)}
                                className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Circle size={20} />
                              </button>

                              {editingId === subtask.id ? (
                                <>
                                  <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveEdit(subtask.id)}
                                    className="text-green-600 hover:text-green-700 transition-colors"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="text-red-600 hover:text-red-700 transition-colors"
                                  >
                                    <X size={18} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1 text-gray-700">{subtask.title}</span>
                                  {subtaskCategory && (
                                    <span
                                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                      style={{ backgroundColor: subtaskCategory.color }}
                                    >
                                      {subtaskCategory.name}
                                    </span>
                                  )}
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => startEditing(subtask)}
                                      className="text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => deleteTodo(subtask.id)}
                                      className="text-red-600 hover:text-red-700 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {showCompleted && filteredCompletedTodos.length > 0 && (
                <>
                  <div className="pt-6 pb-3">
                    <h2 className="text-lg font-semibold text-gray-700">已完成</h2>
                  </div>
                  {filteredCompletedTodos.map((todo) => {
                    const category = categories.find(c => c.id === todo.category_id);
                    return (
                      <div
                        key={todo.id}
                        className="group flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all"
                      >
                        <button
                          onClick={() => toggleComplete(todo)}
                          className="flex-shrink-0 text-green-600 hover:text-green-700 transition-colors"
                        >
                          <CheckCircle2 size={24} />
                        </button>

                        {editingId === todo.id ? (
                          <>
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(todo.id)}
                              className="text-green-600 hover:text-green-700 transition-colors"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <X size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-gray-600 line-through text-lg">
                              {todo.title}
                            </span>
                            {category && (
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.name}
                              </span>
                            )}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditing(todo)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => deleteTodo(todo.id)}
                                className="text-red-600 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {todos.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg">暂无待办事项</p>
                  <p className="text-sm mt-2">添加一个新的任务开始吧！</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showAddCategoryDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">添加分类</h2>
              <form onSubmit={addCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类名称
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="例如：工作、学习、生活"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类颜色
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-10 h-10 rounded-full transition-all ${
                          newCategoryColor === color ? 'ring-4 ring-offset-2 ring-gray-300 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategoryDialog(false);
                      setNewCategoryName('');
                      setNewCategoryColor('#3B82F6');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

export default App;
