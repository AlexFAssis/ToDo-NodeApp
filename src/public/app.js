const listElement = document.getElementById("task-list");
const countElement = document.getElementById("task-count");
const addButton = document.getElementById("add-task");
const hideCompletedButton = document.getElementById("hide-completed");
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
const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");
const calendarMonthYear = document.getElementById("calendar-month-year");
const calendarGrid = document.getElementById("calendar-grid");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const monthSelect = document.getElementById("calendar-month-select");
const yearSelect = document.getElementById("calendar-year-select");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchInput = document.getElementById("search-input");
const dueTimeInput = document.getElementById("task-due-time");
const sidebarToggleButton = document.getElementById("sidebar-toggle");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const sidebar = document.querySelector(".sidebar");

let tasks = [];
let selectedDate = null;
let currentFilter = "all";
let currentSearch = "";
let editingTaskId = null;
let currentCalendar = new Date();
currentCalendar.setDate(1);

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
  if (currentFilter === "today") {
    viewType.textContent = "Hoje";
    return;
  }

  if (currentFilter === "overdue") {
    viewType.textContent = "Atrasadas";
    return;
  }

  if (currentFilter === "completed") {
    viewType.textContent = "Concluídas";
    return;
  }

  if (selectedDate) {
    viewType.textContent = `Tarefas da data: ${formatarData(selectedDate)}`;
    return;
  }

  viewType.textContent = "Todas as Tarefas";
}

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatarMesAno(date) {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function matchesCurrentFilter(task) {
  const today = new Date().toISOString().slice(0, 10);

  if (currentFilter === "today") {
    return task.dueDate === today;
  }

  if (currentFilter === "overdue") {
    return !task.completed && task.dueDate < today;
  }

  if (currentFilter === "completed") {
    return task.completed;
  }

  return true;
}

function matchesSearch(task) {
  if (!currentSearch) {
    return true;
  }

  const query = currentSearch.toLowerCase();
  return (
    task.title.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query)
  );
}

function AtualizarViewType() {
  const displayDate = selectedDate ? formatarData(selectedDate) : "—";
  viewType.textContent = `Exibindo tarefas do dia: ${displayDate}`;
}

function setActiveFilter(mode) {
  currentFilter = mode;

  if (mode === "today") {
    selectedDate = new Date().toISOString().slice(0, 10);
    calendarDate.value = selectedDate;
    currentCalendar = new Date(selectedDate + "T00:00:00");
    currentCalendar.setDate(1);
    atualizarSeletoresDeCalendario();
    montarCalendario();
  }

  if (mode === "all") {
    selectedDate = null;
    calendarDate.value = "";
  }

  if (mode === "overdue" || mode === "completed") {
    selectedDate = null;
    calendarDate.value = "";
  }

  updateFilterButtons();
  AtualizarViewType();
  renderizarTarefas(false);
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

function getPendingCountsByDate() {
  return tasks.reduce((acc, task) => {
    if (!task.completed && typeof task.dueDate === "string") {
      acc[task.dueDate] = (acc[task.dueDate] || 0) + 1;
    }
    return acc;
  }, {});
}

function montarCalendario() {
  const year = currentCalendar.getFullYear();
  const month = currentCalendar.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pendingCounts = getPendingCountsByDate();

  calendarMonthYear.textContent = formatarMesAno(currentCalendar);
  calendarGrid.innerHTML = "";

  ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach((weekday) => {
    const headCell = document.createElement("div");
    headCell.className = "calendar-head-cell";
    headCell.textContent = weekday;
    calendarGrid.appendChild(headCell);
  });

  for (let i = 0; i < firstWeekday; i += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day-cell empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const count = pendingCounts[dateKey] || 0;
    const dayCell = document.createElement("button");
    dayCell.type = "button";
    dayCell.className = "calendar-day-cell";
    if (count > 0) {
      dayCell.classList.add("marked");
      dayCell.title = `${count} tarefa${count > 1 ? "s" : ""} pendente${count > 1 ? "s" : ""}`;
    }
    if (selectedDate === dateKey) {
      dayCell.classList.add("selected");
    }
    dayCell.dataset.date = dateKey;
    dayCell.innerHTML = `<span class="calendar-day-number">${day}</span>`;
    dayCell.addEventListener("click", () => {
      selectedDate = dateKey;
      calendarDate.value = dateKey;
      currentFilter = "all";
      currentSearch = "";
      searchInput.value = "";
      AtualizarViewType();
      updateFilterButtons();
      montarCalendario();
      renderizarTarefas(false);
    });
    calendarGrid.appendChild(dayCell);
  }
}

function popularSeletoresDeCalendario() {
  monthNames.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = name;
    monthSelect.appendChild(option);
  });

  const currentYear = new Date().getFullYear();
  for (let delta = -3; delta <= 3; delta += 1) {
    const year = currentYear + delta;
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
}

function atualizarSeletoresDeCalendario() {
  monthSelect.value = currentCalendar.getMonth();
  yearSelect.value = currentCalendar.getFullYear();
}

function atualizarMesSelecionado() {
  currentCalendar.setMonth(Number(monthSelect.value));
  currentCalendar.setFullYear(Number(yearSelect.value));
  montarCalendario();
}

function renderizarTarefas(OcultarTarefasConcluidas = false) {
  const filtered = tasks.filter((task) => {
    const matchesDate = selectedDate
      ? task.dueDate.startsWith(selectedDate)
      : true;
    const matchesCompletion = OcultarTarefasConcluidas ? !task.completed : true;
    const matchesFilter = matchesCurrentFilter(task);
    const matchesQuery = matchesSearch(task);
    return matchesDate && matchesCompletion && matchesFilter && matchesQuery;
  });

  listElement.innerHTML = "";

  if (filtered.length === 0) {
    listElement.innerHTML = `<li class="task-card"><p>Nada por aqui hoje! Que tal descansar?</p></li>`;
    AtualizarSumario(OcultarTarefasConcluidas);
    return;
  }

  filtered.forEach((task) => {
    const card = document.createElement("li");
    card.classList.add("task-card");

    if (task.completed) {
      card.classList.add("completed");
    } else if (task.dueDate < new Date().toISOString().slice(0, 10)) {
      card.classList.add("overdue");
    } else {
      card.classList.add("pending");
    }

    card.innerHTML = `
      <div class="task-card-header">
        <div class="task-left">
          <input type="checkbox" class="task-toggle" data-action="toggle" data-id="${task.id}" ${
            task.completed ? "checked" : ""
          } />
          <div>
            <h3 class="task-title ${task.completed ? "task-list-completed" : ""}">${task.title}</h3>
            <div class="task-meta">${formatarData(task.dueDate)}${task.dueTime ? ` • ${task.dueTime}` : ""} • ${task.completed ? "Concluída" : "Pendente"}</div>
          </div>
        </div>
        <div class="task-actions">
          <button data-action="edit" data-id="${task.id}" class="icon-button" aria-label="Editar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
          </button>
          <button data-action="delete" data-id="${task.id}" class="icon-button" aria-label="Excluir">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3h6l1 2h5v2H3V5h5l1-2z" fill="currentColor"/><path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7z" fill="currentColor"/></svg>
          </button>
        </div>
      </div>
      
      <p class="task-description ${task.completed ? "task-list-completed" : ""}">${task.description || "Sem descrição."}</p>
    `;

    listElement.appendChild(card);
  });

  AtualizarSumario(OcultarTarefasConcluidas);
}

function atualizarProgresso(total, completed) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  progressFill.style.width = `${percentage}%`;
  progressLabel.textContent = `${percentage}% concluído`;
}

function AtualizarSumario(OcultarTarefasConcluidas = false) {
  const tasksForDate = tasks.filter((task) =>
    selectedDate ? task.dueDate.startsWith(selectedDate) : true,
  );

  const completed = tasksForDate.filter((task) => task.completed).length;
  const pending = tasksForDate.filter((task) => !task.completed).length;
  const total = tasksForDate.length;

  countElement.textContent = `${pending} de ${total} tarefas pendentes`;
  atualizarProgresso(total, completed);
}

async function CarregarTarefas(OcultarTarefasConcluidas = false) {
  const response = await fetch("/api/tasks");
  const payload = await response.json();

  if (!Array.isArray(payload)) {
    console.error("Erro ao carregar tarefas:", payload);
    tasks = [];
    renderizarTarefas(OcultarTarefasConcluidas);
    return;
  }

  tasks = payload;

  atualizarSeletoresDeCalendario();
  montarCalendario();
  renderizarTarefas(OcultarTarefasConcluidas);
}

function abrirModal(editTask = null) {
  modal.classList.remove("hidden");
  if (editTask) {
    modalTitle.textContent = "Editar tarefa";
    titleInput.value = editTask.title;
    descriptionInput.value = editTask.description;
    dueDateInput.value = editTask.dueDate.slice(0, 10);
    dueTimeInput.value = editTask.dueTime || "";
    editingTaskId = editTask.id;
  } else {
    modalTitle.textContent = "Nova tarefa";
    taskForm.reset();
    editingTaskId = null;
    dueDateInput.value = selectedDate || new Date().toISOString().slice(0, 10);
    dueTimeInput.value = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    dueTime: dueTimeInput.value,
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
  await CarregarTarefas(false);
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

  await CarregarTarefas(false);
}

async function manipularChange(event) {
  const target = event.target;
  if (
    target &&
    target.matches &&
    target.matches('input[data-action="toggle"]')
  ) {
    const id = target.dataset.id;
    await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
    await CarregarTarefas(false);
  }
}

async function OcultarTarefasCompletadas() {
  const ocultar = hideCompletedButton.dataset.hidden !== "true";
  hideCompletedButton.dataset.hidden = ocultar ? "true" : "false";
  hideCompletedButton.title = ocultar
    ? "Mostrar concluídas"
    : "Oculta concluídas";
  hideCompletedButton.setAttribute(
    "aria-label",
    ocultar ? "Mostrar concluídas" : "Oculta concluídas",
  );

  await CarregarTarefas(ocultar);
}

calendarDate.addEventListener("change", () => {
  selectedDate = calendarDate.value || null;
  if (selectedDate) {
    const [year, month] = selectedDate.split("-");
    currentCalendar.setFullYear(Number(year));
    currentCalendar.setMonth(Number(month) - 1);
    atualizarSeletoresDeCalendario();
    montarCalendario();
  }
  AtualizarViewType();
  renderizarTarefas(false);
});

prevMonthButton.addEventListener("click", () => {
  currentCalendar.setMonth(currentCalendar.getMonth() - 1);
  atualizarSeletoresDeCalendario();
  montarCalendario();
});

nextMonthButton.addEventListener("click", () => {
  currentCalendar.setMonth(currentCalendar.getMonth() + 1);
  atualizarSeletoresDeCalendario();
  montarCalendario();
});

monthSelect.addEventListener("change", atualizarMesSelecionado);
yearSelect.addEventListener("change", atualizarMesSelecionado);

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
listElement.addEventListener("change", manipularChange);
hideCompletedButton.addEventListener("click", OcultarTarefasCompletadas);
searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.trim();
  renderizarTarefas(false);
});

sidebarToggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarBackdrop.classList.toggle("open");
  sidebarBackdrop.classList.toggle("hidden");
});

sidebarBackdrop.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarBackdrop.classList.remove("open");
  sidebarBackdrop.classList.add("hidden");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveFilter(button.dataset.filter);
  });
});

popularSeletoresDeCalendario();
atualizarSeletoresDeCalendario();
montarCalendario();
updateFilterButtons();
CarregarTarefas(false);
AtualizarViewType();
