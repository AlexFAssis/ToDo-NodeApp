const STORAGE_KEY = "todo-app-items";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const todoCount = document.getElementById("todo-count");
const clearCompletedButton = document.getElementById("clear-completed");

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateCount() {
  const remaining = todos.filter((item) => !item.completed).length;
  const total = todos.length;
  todoCount.textContent = `${remaining} of ${total} task${total === 1 ? "" : "s"} remaining`;
}

function renderTodos() {
  todoList.innerHTML = "";

  if (todos.length === 0) {
    todoList.innerHTML = `<li class="todo-item"><span class="task-label">No tasks yet. Add one above!</span></li>`;
    updateCount();
    return;
  }

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;

    const label = document.createElement("span");
    label.className = "task-label";
    label.textContent = todo.text;

    const controls = document.createElement("div");
    controls.className = "todo-controls";

    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-button";
    toggleButton.textContent = todo.completed ? "Undo" : "Done";
    toggleButton.addEventListener("click", () => {
      todo.completed = !todo.completed;
      saveTodos();
      renderTodos();
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      todos = todos.filter((item) => item.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    controls.append(toggleButton, deleteButton);
    item.append(label, controls);
    todoList.appendChild(item);
  });

  updateCount();
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();
  if (!text) {
    return;
  }

  todos.unshift({
    id: Date.now().toString(),
    text,
    completed: false,
  });

  todoInput.value = "";
  saveTodos();
  renderTodos();
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((item) => !item.completed);
  saveTodos();
  renderTodos();
});

renderTodos();
