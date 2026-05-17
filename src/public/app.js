const listElement = document.getElementById("task-list");
const countElement = document.getElementById("task-count");
const addButton = document.getElementById("add-task");
const clearCompletedButton = document.getElementById("clear-completed");
const calendarDate = document.getElementById("calendar-date");
const viewType = document.getElementById("view-type");
const modal = document.getElementById("task-modal");
const modalTitle = document.getElementById("modal-title");
const closeModalButton = document.getElementById("close-modal");
const cancelButton = document.getElementById("cancel-button");
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const dueDateInput = document.getElementById("task-due-date");

let tasks = [];
let selectedDate = null;
let editingTaskId = null;

function formatarData(dateString) {
  const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  if (isoMatch) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function AtualizarViewType() {
  viewType.textContent = selectedDate
    ? `Tarefas da data: ${formatarData(selectedDate)}`
    : "Todas as datas";
}

function renderizarTarefas() {
  const filtered = selectedDate
    ? tasks.filter((task) => task.dueDate.startsWith(selectedDate))
    : tasks;

  listElement.innerHTML = "";

  if (filtered.length === 0) {
    listElement.innerHTML = `<li class="task-card"><p>Nenhuma tarefa encontrada para esta data.</p></li>`;
    AtualizarSumario();
    return;
  }

  filtered.forEach((task) => {
    const card = document.createElement("li");
    card.className = `task-card${task.completed ? " completed" : ""}`;

    card.innerHTML = `
      <div class="task-card-header">
        <div>
          <h3 class="task-title">${task.title}</h3>
          <div class="task-meta">${formatarData(task.dueDate)} • ${task.completed ? "Concluída" : "Pendente"}</div>
        </div>
        <div class="task-actions">
          <button data-action="toggle" data-id="${task.id}">${task.completed ? "Desmarcar" : "Marcar"}</button>
          <button data-action="edit" data-id="${task.id}">Editar</button>
          <button data-action="delete" data-id="${task.id}">Excluir</button>
        </div>
      </div>
      <p class="task-description">${task.description || "Sem descrição."}</p>
    `;

    listElement.appendChild(card);
  });

  AtualizarSumario();
}

function AtualizarSumario() {
  const pending = tasks.filter((task) => !task.completed).length;
  const total = tasks.length;
  countElement.textContent = `${pending} de ${total} tarefas pendentes`;
}

async function CarregarTarefas() {
  const response = await fetch("/api/tasks");
  const payload = await response.json();

  if (!Array.isArray(payload)) {
    console.error("Erro ao carregar tarefas:", payload);
    tasks = [];
    renderizarTarefas();
    return;
  }

  tasks = payload;
  renderizarTarefas();
}

function abrirModal(editTask = null) {
  modal.classList.remove("hidden");
  if (editTask) {
    modalTitle.textContent = "Editar tarefa";
    titleInput.value = editTask.title;
    descriptionInput.value = editTask.description;
    dueDateInput.value = editTask.dueDate.slice(0, 10);
    editingTaskId = editTask.id;
  } else {
    modalTitle.textContent = "Nova tarefa";
    taskForm.reset();
    editingTaskId = null;
    dueDateInput.value = selectedDate || new Date().toISOString().slice(0, 10);
  }
}

function fecharModal() {
  modal.classList.add("hidden");
  editingTaskId = null;
}

async function salvarTarefa(event) {
  event.preventDefault();

  const payload = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    dueDate: dueDateInput.value,
  };

  if (!payload.title) {
    alert("Preencha título da tarefa.");
    return;
  }

  /*   if (!payload.dueDate) {
    alert("Preencha a data de conclusão.");
    return;
  } */

  if (editingTaskId) {
    await fetch(`/api/tasks/${editingTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  fecharModal();
  await CarregarTarefas();
}

async function manipularAcoes(event) {
  const button = event.target.closest("button");
  if (!button || !button.dataset.action) {
    return;
  }

  const { action, id } = button.dataset;
  if (action === "toggle") {
    await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
  }

  if (action === "edit") {
    const task = tasks.find((item) => item.id === id);
    if (task) {
      abrirModal(task);
    }
    return;
  }

  if (action === "delete") {
    const confirmed = confirm("Deseja mesmo excluir esta tarefa?");
    if (!confirmed) {
      return;
    }
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  await CarregarTarefas();
}

async function LimparTarefasCompletadas() {
  const completedTasks = tasks.filter((task) => task.completed);
  await Promise.all(
    completedTasks.map((task) =>
      fetch(`/api/tasks/${task.id}`, { method: "DELETE" }),
    ),
  );
  await CarregarTarefas();
}

calendarDate.addEventListener("change", () => {
  selectedDate = calendarDate.value || null;
  AtualizarViewType();
  renderizarTarefas();
});

addButton.addEventListener("click", () => abrirModal());
closeModalButton.addEventListener("click", fecharModal);
cancelButton.addEventListener("click", fecharModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    fecharModal();
  }
});

taskForm.addEventListener("submit", salvarTarefa);
listElement.addEventListener("click", manipularAcoes);
clearCompletedButton.addEventListener("click", LimparTarefasCompletadas);

CarregarTarefas();
AtualizarViewType();
