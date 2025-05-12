const goalService = require('../services/objectiveService');

const createObjective = async (req, res) => {
  try {
    const goal = await goalService.createObjective(req.body, req.user.id);
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const registerDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valor inválido.' });
    }

    const updatedGoal = await goalService.registerDeposit(id, req.user.id, parseFloat(amount));
    if (!updatedGoal) {
      return res.status(404).json({ message: 'Objetivo não encontrado.' });
    }

    res.json(updatedGoal);
  } catch (err) {
    console.error('Erro ao registrar depósito:', err);
    res.status(500).json({ message: 'Erro interno ao registrar depósito.' });
  }
};

const getObjectives = async (req, res) => {
  try {
    const goals = await goalService.getObjectives(req.user.id);
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getObjectivesSummary = async (req, res) => {
  try {
    res.status(200).json({ summary: 'Resumo de objetivos ainda não implementado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateObjective = async (req, res) => {
  try {
    const updated = await goalService.updateObjective(req.params.id, req.body, req.user.id);
    if (!updated) {
      return res.status(404).json({ message: 'Objetivo não encontrado' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getObjectiveById = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await goalService.getObjectiveById(id, req.user.id);
    if (!goal) {
      return res.status(404).json({ message: 'Objetivo não encontrado' });
    }
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar objetivo' });
  }
};

const deleteObjective = async (req, res) => {
  try {
    const removed = await goalService.deleteObjective(req.params.id, req.user.id);
    if (!removed) {
      return res.status(404).json({ message: 'Objetivo não encontrado' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createObjective,
  getObjectives,
  getObjectivesSummary,
  updateObjective,
  deleteObjective,
  registerDeposit,
  getObjectiveById
};
