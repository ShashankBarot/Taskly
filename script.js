class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateEmptyImages();
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Add todo buttons
        document.getElementById('addTodoBtn').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('fabBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal events
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('confirmBtn').addEventListener('click', () => {
            this.addTodo();
        });

        document.getElementById('modalInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.setFilter(tab.dataset.filter);
            });
        });

        // Load theme preference
        this.loadTheme();
    }

    loadTodos() {
        try {
            const saved = localStorage.getItem('taskly-todos');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading todos:', error);
            return [];
        }
    }

    saveTodos() {
        try {
            localStorage.setItem('taskly-todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Error saving todos:', error);
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('taskly-theme');
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            this.updateThemeIcon(true);
        }
    }

    saveTheme(isDark) {
        localStorage.setItem('taskly-theme', isDark ? 'dark' : 'light');
    }

    toggleTheme() {
        const body = document.body;
        const isDark = !body.hasAttribute('data-theme');

        if (isDark) {
            body.setAttribute('data-theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
        }

        this.updateThemeIcon(isDark);
        this.saveTheme(isDark);
        this.updateEmptyImages();
    }

    updateThemeIcon(isDark) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const lightLogo = document.querySelector('.logo-light');
    const darkLogo = document.querySelector('.logo-dark');

    if (isDark) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        if (lightLogo && darkLogo) {
            lightLogo.style.display = 'none';
            darkLogo.style.display = 'inline-block';
        }
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        if (lightLogo && darkLogo) {
            lightLogo.style.display = 'inline-block';
            darkLogo.style.display = 'none';
        }
    }
}

    updateEmptyImages() {
        const isDark = document.body.hasAttribute('data-theme');
        const lightDetective = document.querySelector('.light-detective');
        const darkDetective = document.querySelector('.dark-detective');

        if (isDark) {
            lightDetective.style.display = 'none';
            darkDetective.style.display = 'block';
        } else {
            lightDetective.style.display = 'block';
            darkDetective.style.display = 'none';
        }
    }

    openModal() {
        const modal = document.getElementById('modalOverlay');
        const input = document.getElementById('modalInput');

        modal.classList.add('active');
        input.value = '';

        setTimeout(() => {
            input.focus();
        }, 300);
    }

    closeModal() {
        const modal = document.getElementById('modalOverlay');
        modal.classList.remove('active');
    }

    addTodo() {
        const input = document.getElementById('modalInput');
        const text = input.value.trim();

        if (text) {
            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };

            this.todos.unshift(todo);
            this.saveTodos();
            this.render();
            this.closeModal();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const container = document.getElementById('todosContainer');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        container.innerHTML = filteredTodos.map(todo => `
        <div class="todo-card ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-content">
                <div class="todo-checkbox ${todo.completed ? 'completed' : ''}" 
                     onclick="app.toggleTodo(${todo.id})">
                    ${todo.completed ? `
                        <svg class="checkmark" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ` : ''}
                </div>
                <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                <div class="todo-actions">
                    <button class="todo-action-btn edit" onclick="app.editTodo(${todo.id})" title="Edit">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="todo-action-btn delete" onclick="app.deleteTodo(${todo.id})" title="Delete">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt("Edit your task:", todo.text);
        if (newText !== null) {
            const trimmed = newText.trim();
            if (trimmed) {
                todo.text = trimmed;
                this.saveTodos();
                this.render();
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Method to export todos (bonus feature)
    exportTodos() {
        const dataStr = JSON.stringify(this.todos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'taskly-todos.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    // Method to import todos (bonus feature)
    importTodos(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTodos = JSON.parse(e.target.result);
                if (Array.isArray(importedTodos)) {
                    this.todos = importedTodos;
                    this.saveTodos();
                    this.render();
                    alert('Todos imported successfully!');
                } else {
                    alert('Invalid file format');
                }
            } catch (error) {
                alert('Error importing todos: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Get statistics (bonus feature)
    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const active = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            active,
            completionRate
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

// Handle page visibility changes to save data
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.app) {
        window.app.saveTodos();
    }
});

// Handle beforeunload to save data
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.saveTodos();
    }
});