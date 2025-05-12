const express = require('express');
const router = express.Router();
const objectiveController = require('../controllers/goalController'); // Ainda usa goalController.js
const authenticateToken = require('../middlewares/authMiddleware');

// Rotas principais
router.post('/', objectiveController.createObjective);
router.get('/', objectiveController.getObjectives);
router.get('/summary', objectiveController.getObjectivesSummary);
router.post('/:id/deposit', objectiveController.registerDeposit);
router.get('/:id', objectiveController.getObjectiveById);

// Rotas para edição e exclusão
router.put('/:id', objectiveController.updateObjective);
router.delete('/:id', objectiveController.deleteObjective);

module.exports = router;
