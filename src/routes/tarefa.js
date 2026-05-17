const express = require("express");
const TarefaController = require("../controllers/TarefaController");

const router = express.Router();

router.get("/", TarefaController.listarTarefas);
router.post("/", TarefaController.criarTarefas);
router.put("/:id", TarefaController.atualizarTarefa);
router.delete("/:id", TarefaController.deletarTarefa);
router.patch("/:id/toggle", TarefaController.AlterarStatusTarefa);

module.exports = router;
