const { Income } = require('../models');

const createIncome = async (req, res) => {
  try {
    const { valor, data, categoria, conta, descricao } = req.body;
    const userId = req.user.id;

    const income = await Income.create({
      valor,
      data,
      categoria,
      conta,
      descricao,
      userId,
    });

    return res.status(201).json(income);
  } catch (error) {
    console.error("Erro ao criar ganho:", error);
    return res.status(500).json({ error: "Erro ao registrar ganho" });
  }
};

module.exports = { createIncome };
