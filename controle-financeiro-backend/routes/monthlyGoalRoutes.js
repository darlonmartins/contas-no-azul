const express = require("express");
const router = express.Router();
const monthlyGoalController = require("../controllers/monthlyGoalController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

// Criar nova meta mensal
router.post("/", monthlyGoalController.create);

// Atualizar meta mensal existente
router.put("/:id", monthlyGoalController.update);

// Listar todas as metas do usuário (com filtro opcional por mês)
router.get("/", monthlyGoalController.getAll);

// Excluir uma meta mensal
router.delete("/:id", monthlyGoalController.delete);

module.exports = router;
