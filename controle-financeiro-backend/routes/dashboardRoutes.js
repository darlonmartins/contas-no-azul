const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authenticate = require("../middlewares/authMiddleware");

router.use(authenticate);

// ✅ Rota correta para retornar dados do dashboard
router.get("/", dashboardController.getDashboardData);

module.exports = router;
