const taskService = require("../services/tarefaService");
const taskModel = require("../models/tarefaModel");

async function listarTarefas(req, res) {
  try {
    const tasks = await taskService.buscarTarefas();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro ao carregar tarefas." });
  }
}

async function criarTarefas(req, res) {
  try {
    const taskData = taskModel.normalizarTarefa(req.body);
    const validationError = taskModel.validarTarefa(taskData, {
      requireDueDate: true,
    });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const newTask = await taskService.criarTarefa(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro ao criar tarefa." });
  }
}

async function atualizarTarefa(req, res) {
  try {
    const taskData = taskModel.normalizarTarefa(req.body);
    const validationError = taskModel.validarTarefa(taskData, {
      requireDueDate: false,
    });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const updatedTask = await taskService.atualizarTarefa(
      req.params.id,
      taskData,
    );
    if (!updatedTask) {
      return res.status(404).json({ error: "Tarefa não encontrada." });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro ao atualizar tarefa." });
  }
}

async function deletarTarefa(req, res) {
  try {
    const deleted = await taskService.deletarTarefa(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Tarefa não encontrada." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro ao excluir tarefa." });
  }
}

async function AlterarStatusTarefa(req, res) {
  try {
    const toggledTask = await taskService.alterarStatusTarefa(req.params.id);
    if (!toggledTask) {
      return res.status(404).json({ error: "Tarefa não encontrada." });
    }
    res.json(toggledTask);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocorreu um erro ao alternar o status da tarefa." });
  }
}

module.exports = {
  listarTarefas,
  criarTarefas,
  atualizarTarefa,
  deletarTarefa,
  AlterarStatusTarefa,
};
