// 1. 获取页面中需要用到的元素
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const totalCountSpan = document.getElementById('totalCount');
const remainingCountSpan = document.getElementById('remainingCount');

// 初始化任务数组（从本地存储读取，如果没有则为空数组）
let tasks = JSON.parse(localStorage.getItem('myTodoTasks')) || [];
let selectedParentId = null; // 记录当前选中的父任务ID

// 辅助函数：将扁平数组转换为树形结构
function buildTree(flatTasks) {
    const taskMap = {};
    const rootTasks = [];
    
    // 首先为每个任务创建映射，并初始化children数组
    flatTasks.forEach(task => {
        taskMap[task.id] = { ...task, children: [] };
    });
    
    // 然后构建树形结构
    flatTasks.forEach(task => {
        const taskNode = taskMap[task.id];
        if (task.parentId === null) {
            // 根任务
            rootTasks.push(taskNode);
        } else if (taskMap[task.parentId]) {
            // 子任务，添加到父任务的children数组中
            taskMap[task.parentId].children.push(taskNode);
        }
    });
    
    return rootTasks;
}

// 辅助函数：从树形结构中查找任务
function findTaskById(taskId, taskList) {
    for (const task of taskList) {
        if (task.id === taskId) {
            return task;
        }
        if (task.children && task.children.length > 0) {
            const found = findTaskById(taskId, task.children);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

// 辅助函数：将树形结构转换回扁平数组
function flattenTree(treeTasks) {
    const flatTasks = [];
    
    function traverse(task) {
        const { children, ...taskWithoutChildren } = task;
        flatTasks.push(taskWithoutChildren);
        if (children && children.length > 0) {
            children.forEach(child => traverse(child));
        }
    }
    
    treeTasks.forEach(task => traverse(task));
    return flatTasks;
}

// 2. 页面加载时，以及任务数组变化时，更新显示和统计
function renderTasks() {
    // 清空当前列表
    taskList.innerHTML = '';
    
    // 构建树形结构
    const treeTasks = buildTree(tasks);
    
    // 递归渲染树形结构
    function renderTaskNode(task, parentElement, level = 0) {
        const li = document.createElement('li');
        // 如果任务已完成，添加 'done' 类
        if (task.completed) {
            li.classList.add('done');
        }
        // 根据层级添加缩进和连线
        li.style.marginLeft = `${level * 20}px`;
        li.style.position = 'relative';
        
        // 添加连接线（除了根任务）
        if (level > 0) {
            li.style.borderLeft = '2px solid #ddd';
            li.style.paddingLeft = '15px';
            li.style.position = 'relative';
            
            // 添加水平连接线
            const connector = document.createElement('div');
            connector.style.position = 'absolute';
            connector.style.left = '-15px';
            connector.style.top = '20px';
            connector.style.width = '15px';
            connector.style.height = '2px';
            connector.style.backgroundColor = '#ddd';
            li.appendChild(connector);
        }
        
        // 任务文本部分，点击可以切换完成状态
        const span = document.createElement('span');
        span.textContent = task.text;
        span.onclick = () => toggleTask(task.id);

        // 双击任务文本，将其选中/取消选中为父任务
        span.ondblclick = (e) => {
            e.stopPropagation();
            selectParentTask(task.id);
        };

        // --- 新增：创建任务信息（分类、优先级、日期）显示区域 ---
        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';
        taskInfo.innerHTML = `
            <small>📂 ${task.category}</small>
            <small>⚡ ${task.priority}</small>
            ${task.dueDate ? `<small>📅 ${task.dueDate}</small>` : ''}
        `;
        
        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.className = 'delete';
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // 防止触发span的点击事件
            deleteTask(task.id);
        };
        
        // 组装任务项：创建标题容器，放入文本和删除按钮，再放入信息
        const taskHeader = document.createElement('div');
        taskHeader.className = 'task-header';
        taskHeader.appendChild(span);
        taskHeader.appendChild(deleteBtn);
        
        li.appendChild(taskHeader);
        li.appendChild(taskInfo);

        parentElement.appendChild(li);
        
        // 递归渲染子任务
        if (task.children && task.children.length > 0) {
            const subTaskList = document.createElement('ul');
            subTaskList.className = 'subtask-list';
            subTaskList.style.listStyle = 'none';
            subTaskList.style.padding = '0';
            subTaskList.style.margin = '0';
            
            task.children.forEach(child => {
                renderTaskNode(child, subTaskList, level + 1);
            });
            
            li.appendChild(subTaskList);
        }
    }
    
    // 渲染所有根任务
    treeTasks.forEach(task => {
        renderTaskNode(task, taskList, 0);
    });
    
    // 更新底部的统计数字
    updateStats();
    // 保存到本地存储
    saveTasks();
}

// 3. 更新底部统计信息
function updateStats() {
    const total = tasks.length;
    const remaining = tasks.filter(task => !task.completed).length;
    
    totalCountSpan.textContent = total;
    remainingCountSpan.textContent = remaining;
}

// 4. 添加一个新任务
function addTask() {
    const text = taskInput.value.trim(); 
    const category = document.getElementById('categorySelect').value;
    const priority = document.getElementById('prioritySelect').value;
    const dueDate = document.getElementById('dueDateInput').value;
    if (text === '') {
        alert('请输入任务内容！');
        return; 
    }
    
    // 将新任务对象添加到数组开头
    tasks.unshift({
        id: Date.now(), // 给每个任务一个唯一ID，这对实现父子关系至关重要
        text: text,
        completed: false,
        category: category, 
        priority: priority, 
        dueDate: dueDate,  
        parentId: null
    });    
    
    // 清空输入框
    taskInput.value = '';
    // 重新渲染任务列表
    renderTasks();
}

// 5. 切换任务的完成状态（点击任务文本时触发）
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed; // 取反：完成<->未完成
        renderTasks();
    }
}

// 6. 删除任务
function deleteTask(taskId) {
    if (confirm('确定要删除这个任务及其所有子任务吗？')) {
        // 递归删除任务及其子任务
        function deleteTaskRecursive(id) {
            const taskIndex = tasks.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
                // 先删除子任务
                const childTasks = tasks.filter(t => t.parentId === id);
                childTasks.forEach(child => deleteTaskRecursive(child.id));
                // 再删除当前任务
                tasks.splice(taskIndex, 1);
            }
        }
        
        deleteTaskRecursive(taskId);
        renderTasks();
    }
}

// 选择或取消选择父任务
function selectParentTask(taskId) {
    if (selectedParentId === taskId) {
        // 如果再次双击已选中的任务，则取消选择
        selectedParentId = null;
        document.getElementById('parentTaskInfo').textContent = '当前未选择父任务';
    } else {
        // 选中新的父任务
        selectedParentId = taskId;
        const parentTask = tasks.find(t => t.id === taskId);
        document.getElementById('parentTaskInfo').textContent = `父任务：${parentTask.text}`;
    }
    // 更新“添加子任务”按钮状态
    document.getElementById('addSubBtn').disabled = selectedParentId === null;
}

// 添加子任务
function addSubTask() {
    if (selectedParentId === null) {
        alert('请先双击选择一个父任务！');
        return;
    }
    const text = taskInput.value.trim();
    const category = document.getElementById('categorySelect').value;
    const priority = document.getElementById('prioritySelect').value;
    const dueDate = document.getElementById('dueDateInput').value;

    if (text === '') {
        alert('请输入子任务内容！');
        return;
    }

    // 将新任务对象添加到数组开头，但这次要设置 parentId
    tasks.unshift({
        id: Date.now(),
        text: text,
        completed: false,
        category: category,
        priority: priority,
        dueDate: dueDate,
        parentId: selectedParentId // 关键：指向被选中的父任务
    });

    taskInput.value = '';
    renderTasks(); // 重新渲染列表
}

// 7. 将任务数组保存到浏览器的本地存储
function saveTasks() {
    localStorage.setItem('myTodoTasks', JSON.stringify(tasks));
}

// 8. 为“添加”按钮绑定点击事件
addBtn.addEventListener('click', addTask);

// 9. 为输入框绑定“按回车键添加”事件
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// 为“添加子任务”按钮绑定点击事件
document.getElementById('addSubBtn').addEventListener('click', addSubTask);

// 10. 获取备份相关的元素
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');

// 11. 导出备份（将任务数组转为JSON文件并下载）
exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(tasks, null, 2); // 格式化JSON
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // 创建一个临时下载链接并触发点击
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `todo_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    alert('备份文件已下载！');
});

// 12. 导入备份（读取上传的JSON文件并替换当前任务列表）
importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedTasks = JSON.parse(event.target.result);
            if (Array.isArray(importedTasks)) {
                if (confirm(`导入 ${importedTasks.length} 个任务，这将覆盖当前列表。确定吗？`)) {
                    tasks = importedTasks;
                    renderTasks();
                    alert('导入成功！');
                }
            } else {
                alert('文件格式无效：不是一个有效的任务数组。');
            }
        } catch (error) {
            alert('文件读取失败，请检查是否为有效的JSON文件。');
        }
        // 清空input，允许重复导入同一文件
        e.target.value = '';
    };
    reader.readAsText(file);
});

renderTasks();