const { Card, Transaction } = require('../models');
const { Op } = require('sequelize');

const cardController = {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { name, brand, limit, dueDate, fechamento } = req.body;

      const card = await Card.create({ name, brand, limit, dueDate, fechamento, userId });
      res.status(201).json(card);
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      res.status(500).json({ error: 'Erro ao criar cartão' });
    }
  },

  async list(req, res) {
    try {
      const userId = req.user.id;
      const cards = await Card.findAll({
        where: { userId },
        attributes: ['id', 'name', 'brand', 'limit', 'availableLimit', 'dueDate', 'fechamento']
      });
      res.json(cards);
    } catch (error) {
      console.error('Erro ao listar cartões:', error);
      res.status(500).json({ error: 'Erro ao listar cartões' });
    }
  },

  async update(req, res) {
    try {
      const userId = req.user.id;
      const cardId = req.params.id;
      const { name, brand, limit, dueDate, fechamento } = req.body;

      const card = await Card.findOne({ where: { id: cardId, userId } });
      if (!card) return res.status(404).json({ error: 'Cartão não encontrado' });

      await card.update({ name, brand, limit, dueDate, fechamento });
      res.json(card);
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      res.status(500).json({ error: 'Erro ao atualizar cartão' });
    }
  },

  async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const card = await Card.findOne({ where: { id, userId } });
      if (!card) return res.status(404).json({ error: 'Cartão não encontrado' });

      // 🧾 Exclui todas as faturas vinculadas ao cartão
      const { Invoice } = require('../models');
      await Invoice.destroy({ where: { cardId: id } });

      // 🔄 Agora sim, exclui o cartão
      await card.destroy();

      res.json({ message: 'Cartão e faturas associadas excluídos com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      res.status(500).json({ error: 'Erro ao excluir cartão' });
    }
  },

  async getCardsWithAvailableLimit(req, res) {
    try {
      const userId = req.user.id;

      // Busca todos os cartões do usuário
      const cards = await Card.findAll({
        where: { userId },
        attributes: ['id', 'name', 'brand', 'limit', 'availableLimit', 'dueDate', 'fechamento']
      });

      // Retorna diretamente os dados salvos no banco (inclusive availableLimit real)
      const result = cards.map((card) => ({
        id: card.id,
        name: card.name,
        brand: card.brand,
        limit: parseFloat(card.limit),
        availableLimit: parseFloat(card.availableLimit),
        dueDate: card.dueDate,
        fechamento: card.fechamento
      }));

      res.json(result);
    } catch (error) {
      console.error("Erro ao buscar cartões com limite disponível:", error);
      res.status(500).json({ error: "Erro ao buscar cartões" });
    }
  }
  ,

  async getSummary(req, res) {
    try {
      const userId = req.user.id;

      const cards = await Card.findAll({ where: { userId } });
      const cardIds = cards.map(c => c.id);

      const transactions = await Transaction.findAll({
        where: {
          userId,
          cardId: { [Op.in]: cardIds },
          type: "despesa_cartao"
        }
      });


      const gastos = {};
      transactions.forEach((t) => {
        gastos[t.cardId] = (gastos[t.cardId] || 0) + parseFloat(t.amount);
      });

      const resumo = cards.map((card) => {
        const gasto = gastos[card.id] || 0;
        return {
          id: card.id,
          name: card.name,
          limit: parseFloat(card.limit),
          used: gasto,
          dueDate: card.dueDate,
          color: 'bg-purple-500' // ou baseado na marca, se quiser
        };
      });

      res.json(resumo);
    } catch (error) {
      console.error("Erro ao gerar resumo dos cartões:", error);
      res.status(500).json({ error: "Erro ao gerar resumo dos cartões" });
    }
  },

  async getOneCardWithLimit(req, res) { // ✅ NOVO
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const card = await Card.findOne({ where: { id, userId } });
      if (!card) return res.status(404).json({ error: "Cartão não encontrado" });

      const transactions = await Transaction.findAll({
        where: {
          userId,
          cardId: { [Op.in]: cardIds },
          type: "despesa_cartao"
        }
      });



      const totalGasto = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const availableLimit = parseFloat(card.limit) - totalGasto;

      res.json({
        id: card.id,
        name: card.name,
        brand: card.brand,
        limit: parseFloat(card.limit),
        availableLimit: Number(availableLimit.toFixed(2)),
        fechamento: card.fechamento,
        dueDate: card.dueDate
      });
    } catch (error) {
      console.error("Erro ao buscar cartão com limite:", error);
      res.status(500).json({ error: "Erro ao buscar informações do cartão" });
    }
  }
};

module.exports = cardController;
