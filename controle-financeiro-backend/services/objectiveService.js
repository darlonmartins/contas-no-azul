const { Objective } = require('../models');

// ✅ Cria um novo objetivo financeiro
const createObjective = async (data, userId) => {
  return await Objective.create({
    name: data.name,
    targetAmount: data.targetValue,
    dueDate: data.goalDate,
    categoryId: data.categoryId,
    userId,
  });
};

// ✅ Lista todos os objetivos do usuário
const getObjectives = async (userId) => {
  return await Objective.findAll({ where: { userId } });
};

// ✅ Registra um depósito em um objetivo
const registerDeposit = async (id, userId, amount) => {
  const objective = await getObjectiveById(id, userId);
  if (!objective) return null;

  objective.currentAmount += amount;
  await objective.save();
  return objective;
};

// ✅ Busca um objetivo específico
const getObjectiveById = async (id, userId) => {
  return await Objective.findOne({ where: { id, userId } });
};

// ✅ Atualiza os dados de um objetivo
const updateObjective = async (id, data, userId) => {
  const objective = await getObjectiveById(id, userId);
  if (!objective) return null;

  const updatedData = {
    name: data.name,
    targetAmount: data.targetValue,
    dueDate: data.goalDate,
    categoryId: data.categoryId,
  };

  await objective.update(updatedData);
  return objective;
};

// ✅ Exclui um objetivo
const deleteObjective = async (id, userId) => {
  const objective = await getObjectiveById(id, userId);
  if (!objective) return null;

  await objective.destroy();
  return true;
};

module.exports = {
  createObjective,
  getObjectives,
  getObjectiveById,
  updateObjective,
  deleteObjective,
  registerDeposit,
};
