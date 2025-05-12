const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const categoryController = require("../controllers/categoryController");

router.use(authenticate); // ✅ Protege todas as rotas

router.get("/", categoryController.getAll);     // 🔄 Listar categorias
router.post("/", categoryController.create);    // ➕ Criar categoria
router.put("/:id", categoryController.update);  // ✏️ Editar categoria
router.get('/icons', categoryController.getUniqueIcons);
router.delete('/:id', categoryController.delete);



module.exports = router;
