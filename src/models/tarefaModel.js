const { randomUUID } = require("crypto");

function normalizarTarefa(payload) {
  return {
    id: payload.id || randomUUID(),
    title: typeof payload.title === "string" ? payload.title.trim() : "",
    description:
      typeof payload.description === "string" ? payload.description.trim() : "",
    dueDate: typeof payload.dueDate === "string" ? payload.dueDate.trim() : "",
    dueTime: typeof payload.dueTime === "string" ? payload.dueTime.trim() : "",
    completed: Boolean(payload.completed),
    createdAt: payload.createdAt || new Date().toISOString(),
  };
}

function validarTarefa(task, options = {}) {
  if (!task.title) {
    return "O título da tarefa é obrigatório.";
  }

  /*  Inicialmente a data de conclusão não é obrigatória (usuário pode não saber a principio)
  if (options.requireDueDate && !task.dueDate) {
    return "A data de conclusão é obrigatória.";
  } 
*/

  if (task.dueDate && Number.isNaN(Date.parse(task.dueDate))) {
    return "A data de conclusão deve ser válida.";
  }

  if (task.dueTime && !/^\d{2}:\d{2}$/.test(task.dueTime)) {
    return "A hora deve estar no formato HH:MM.";
  }

  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(":").map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return "A hora deve ser válida.";
    }
  }

  return null;
}

module.exports = {
  normalizarTarefa,
  validarTarefa,
};
