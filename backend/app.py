from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Файл для хранения данных
DATA_FILE = '/data/tasks.json'

def load_tasks():
    """Загружает задачи из файла"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {'active': [], 'completed': []}

def save_tasks(tasks):
    """Сохраняет задачи в файл"""
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Получить все задачи"""
    tasks = load_tasks()
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Создать новую задачу"""
    data = request.json
    task = {
        'id': datetime.now().timestamp(),
        'text': data['text'],
        'created_at': datetime.now().isoformat()
    }
    
    tasks = load_tasks()
    tasks['active'].append(task)
    save_tasks(tasks)
    
    return jsonify(task), 201

@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
def complete_task(task_id):
    """Переместить задачу в выполненные"""
    tasks = load_tasks()
    
    # Ищем задачу в активных
    task_to_move = None
    for task in tasks['active']:
        if task['id'] == task_id:
            task_to_move = task
            tasks['active'].remove(task)
            break
    
    if task_to_move:
        task_to_move['completed_at'] = datetime.now().isoformat()
        tasks['completed'].append(task_to_move)
        save_tasks(tasks)
        return jsonify({'status': 'completed'})
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/completed', methods=['GET'])
def get_completed():
    """Получить список выполненных задач"""
    tasks = load_tasks()
    return jsonify(tasks['completed'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)