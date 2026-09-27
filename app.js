// --- STATE MANAGEMENT ---
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// --- DOM ELEMENTS ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const filterButtons = document.getElementById('filter-buttons');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');

// --- LOCAL STORAGE ---
function saveToLocalStorage() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// --- RENDER FUNCTION ---
function render() {
  todoList.innerHTML = '';

  // Filter tasks based on selected state
  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  // Dynamic DOM generation
  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <div class="todo-content">
        <input type="checkbox" class="toggle-checkbox" ${todo.completed ? 'checked' : ''}>
        <span class="todo-text">${escapeHTML(todo.text)}</span>
      </div>
      <button class="delete-btn">✕</button>
    `;

    todoList.appendChild(li);
  });

  // Update remaining task counter
  const activeCount = todos.filter(t => !t.completed).length;
  taskCount.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`;
}

// Utility to prevent XSS injection
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// --- CRUD OPERATIONS ---

// Create
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const newTodo = {
    id: Date.now().toString(),
    text: text,
    completed: false
  };

  todos.push(newTodo);
  saveToLocalStorage();
  render();
  todoInput.value = '';
});

// Delegated Event Handlers (Read / Update / Delete)
todoList.addEventListener('click', (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;

  // Toggle Completed Status (Update)
  if (e.target.classList.contains('toggle-checkbox')) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveToLocalStorage();
    render();
  }

  // Delete Task (Delete)
  if (e.target.classList.contains('delete-btn')) {
    todos = todos.filter(t => t.id !== id);
    saveToLocalStorage();
    render();
  }
});

// Inline Edit Task Text (Update via Double-Click)
todoList.addEventListener('dblclick', (e) => {
  if (!e.target.classList.contains('todo-text')) return;

  const item = e.target.closest('.todo-item');
  const id = item.dataset.id;
  const todo = todos.find(t => t.id === id);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = todo.text;

  e.target.replaceWith(input);
  input.focus();

  const handleEditSave = () => {
    const updatedText = input.value.trim();
    if (updatedText) {
      todos = todos.map(t => t.id === id ? { ...t, text: updatedText } : t);
      saveToLocalStorage();
    }
    render();
  };

  input.addEventListener('blur', handleEditSave);
  input.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') handleEditSave();
  });
});

// Filter Switching
filterButtons.addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;

  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  currentFilter = e.target.dataset.filter;
  render();
});

// Clear Completed
clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.completed);
  saveToLocalStorage();
  render();
});

// --- INITIAL LOAD ---
render();