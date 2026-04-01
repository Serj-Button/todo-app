const API_URL = 'http://localhost:5000/api';

let currentTab = 'active';

// Загрузка задач при старте
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    document.getElementById('addBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTab = btn.dataset.tab;
            
            // Обновляем активную кнопку
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Показываем нужную секцию
            if (currentTab === 'active') {
                document.getElementById('activeTasks').classList.remove('hidden');
                document.getElementById('completedTasks').classList.add('hidden');
                loadActiveTasks();
            } else {
                document.getElementById('activeTasks').classList.add('hidden');
                document.getElementById('completedTasks').classList.remove('hidden');
                loadCompletedTasks();
            }
        });
    });
});

async function loadTasks() {
    await loadActiveTasks();
    await loadCompletedTasks();
}

async function loadActiveTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        const data = await response.json();
        renderActiveTasks(data.active);
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
    }
}

async function loadCompletedTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks/completed`);
        const tasks = await response.json();
        renderCompletedTasks(tasks);
    } catch (error) {
        console.error('Ошибка загрузки выполненных задач:', error);
    }
}

async function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    
    if (!text) {
        alert('Введите текст задачи!');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (response.ok) {
            input.value = '';
            await loadActiveTasks();
            // Если мы на вкладке активных, обновляем
            if (currentTab === 'active') {
                await loadActiveTasks();
            }
        }
    } catch (error) {
        console.error('Ошибка создания задачи:', error);
        alert('Не удалось создать задачу');
    }
}

async function completeTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
            method: 'POST'
        });
        
        if (response.ok) {
            await loadActiveTasks();
            await loadCompletedTasks();
            
            // Если мы на вкладке выполненных, обновляем
            if (currentTab === 'completed') {
                await loadCompletedTasks();
            }
        }
    } catch (error) {
        console.error('Ошибка завершения задачи:', error);
        alert('Не удалось завершить задачу');
    }
}

function renderActiveTasks(tasks) {
    const container = document.getElementById('activeTasks');
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">✨ Нет активных задач. Добавь новую! ✨</div>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-card">
            <div>
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-date">Создано: ${new Date(task.created_at).toLocaleString('ru-RU')}</div>
            </div>
            <button class="complete-btn" onclick="completeTask(${task.id})">✅ СДЕЛАНО</button>
        </div>
    `).join('');
}

function renderCompletedTasks(tasks) {
    const container = document.getElementById('completedTasks');
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 Пока нет выполненных задач</div>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-card completed-task">
            <div>
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-date">Выполнено: ${new Date(task.completed_at).toLocaleString('ru-RU')}</div>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}