const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_PATH = path.join(DATA_DIR, "tasks.db");

function verificarCriacaoBancodeDados() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT NOT NULL,
        dueTime TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      )`,
    );

    db.all(`PRAGMA table_info(tasks)`, (err, rows) => {
      if (!err && rows && !rows.some((column) => column.name === "dueTime")) {
        db.run(`ALTER TABLE tasks ADD COLUMN dueTime TEXT`);
      }
    });
  });
  db.close();
}

function abrirDatabase() {
  verificarCriacaoBancodeDados();
  return new sqlite3.Database(DB_PATH);
}

function executarQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = abrirDatabase();
    db.run(sql, params, function (err) {
      db.close();
      if (err) {
        return reject(err);
      }
      resolve(this);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = abrirDatabase();
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

async function buscarTarefas() {
  const rows = await allQuery(
    "SELECT * FROM tasks ORDER BY dueDate ASC, dueTime ASC, createdAt ASC",
  );
  return rows.map((task) => ({
    ...task,
    completed: task.completed === 1,
  }));
}

async function criarTarefa(taskData) {
  const sql = `INSERT INTO tasks (id, title, description, dueDate, dueTime, completed, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await executarQuery(sql, [
    taskData.id,
    taskData.title,
    taskData.description,
    taskData.dueDate,
    taskData.dueTime,
    taskData.completed ? 1 : 0,
    taskData.createdAt,
  ]);
  return taskData;
}

async function atualizarTarefa(id, taskData) {
  const existing = await buscarTarefaID(id);
  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    title: taskData.title || existing.title,
    description:
      taskData.description !== undefined
        ? taskData.description
        : existing.description,
    dueDate: taskData.dueDate || existing.dueDate,
    dueTime:
      taskData.dueTime !== undefined ? taskData.dueTime : existing.dueTime,
    completed:
      taskData.completed !== undefined
        ? taskData.completed
        : existing.completed,
  };

  const sql = `UPDATE tasks SET title = ?, description = ?, dueDate = ?, dueTime = ?, completed = ? WHERE id = ?`;
  await executarQuery(sql, [
    updated.title,
    updated.description,
    updated.dueDate,
    updated.dueTime,
    updated.completed ? 1 : 0,
    id,
  ]);

  return updated;
}

async function deletarTarefa(id) {
  const sql = `DELETE FROM tasks WHERE id = ?`;
  const result = await executarQuery(sql, [id]);
  return result.changes > 0;
}

async function alterarStatusTarefa(id) {
  const existing = await buscarTarefaID(id);
  if (!existing) {
    return null;
  }
  const completed = !existing.completed;
  const sql = `UPDATE tasks SET completed = ? WHERE id = ?`;
  await executarQuery(sql, [completed ? 1 : 0, id]);
  return { ...existing, completed };
}

async function buscarTarefaID(id) {
  const rows = await allQuery("SELECT * FROM tasks WHERE id = ?", [id]);
  if (rows.length === 0) {
    return null;
  }
  const task = rows[0];
  return {
    ...task,
    completed: task.completed === 1,
  };
}

module.exports = {
  buscarTarefas,
  criarTarefa,
  atualizarTarefa,
  deletarTarefa,
  alterarStatusTarefa,
};
