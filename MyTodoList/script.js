// 1. 获取页面中需要用到的元素
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const totalCountSpan = document.getElementById('totalCount');
const remainingCountSpan = document.getElementById('remainingCount');

// 初始化任务数组（从本地存储读取，如果没有则为空数组）
let tasks = JSON.parse(localStorage.getItem('myTodoTasks')) || [];

// 2. 页面加载时，以及任务数组变化时，更新显示和统计
function renderTasks() {
    // 清空当前列表
    taskList.innerHTML = '';
    
    // 遍历所有任务，创建<li>元素并添加到列表中
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        // 如果任务已完成，添加 'done' 类
        if (task.completed) {
            li.classList.add('done');
        }
        
        // 任务文本部分，点击可以切换完成状态
        const span = document.createElement('span');
        span.textContent = task.text;
        span.onclick = () => toggleTask(index);
        
        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.className = 'delete';
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // 防止触发span的点击事件
            deleteTask(index);
        };
        
        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
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
    const text = taskInput.value.trim(); // 获取输入框内容并去掉首尾空格
    
    if (text === '') {
        alert('请输入任务内容！');
        return; // 如果内容为空，不添加
    }
    
    // 将新任务对象添加到数组开头
    tasks.unshift({
        text: text,
        completed: false
    });
    
    // 清空输入框
    taskInput.value = '';
    // 重新渲染任务列表
    renderTasks();
}

// 5. 切换任务的完成状态（点击任务文本时触发）
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed; // 取反：完成<->未完成
    renderTasks();
}

// 6. 删除任务
function deleteTask(index) {
    if (confirm('确定要删除这个任务吗？')) {
        tasks.splice(index, 1); // 从数组中删除指定位置的任务
        renderTasks();
    }
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