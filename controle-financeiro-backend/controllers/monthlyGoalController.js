const { MonthlyGoal, Category, Transaction } = require("../models");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

const monthlyGoalController = {
  async create(req, res) {
    try {
      const { month, amount, categoryId } = req.body;
      const userId = req.user.id;

      const newGoal = await MonthlyGoal.create({
        month,
        amount,
        categoryId,
        userId,
      });

      res.status(201).json(newGoal);
    } catch (err) {
      console.error("Erro ao criar meta mensal:", err);
      res.status(500).json({ error: "Erro ao criar meta mensal" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { month, amount, categoryId } = req.body;
      const userId = req.user.id;

      const goal = await MonthlyGoal.findOne({ where: { id, userId } });
      if (!goal) return res.status(404).json({ error: "Meta não encontrada" });

      goal.month = month;
      goal.amount = amount;
      goal.categoryId = categoryId;
      await goal.save();

      res.json(goal);
    } catch (err) {
      console.error("Erro ao atualizar meta mensal:", err);
      res.status(500).json({ error: "Erro ao atualizar meta mensal" });
    }
  },

async getAll(req, res) {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    const where = { userId };
    if (month) where.month = month;

    const metas = await MonthlyGoal.findAll({
      where,
      include: {
        model: Category,
        attributes: ["id", "name", "icon"],
      },
      order: [["month", "DESC"]],
    });

    for (const meta of metas) {
      const startDate = dayjs(meta.month + "-01").startOf("month").format("YYYY-MM-DD");
      const endDate = dayjs(meta.month + "-01").endOf("month").format("YYYY-MM-DD");

      // 🔍 Buscar subcategorias e categoria principal
      const subcategories = await Category.findAll({
        where: {
          [Op.or]: [
            { id: meta.categoryId },
            { parentId: meta.categoryId }
          ]
        },
        attributes: ["id"]
      });

      const categoryIds = subcategories.map(c => c.id);
      console.log("📂 IDs considerados para a meta:", categoryIds);

      const totalUsed = await Transaction.sum("amount", {
        where: {
          userId,
          type: {
            [Op.in]: ["expense", "despesa_cartao"],
          },
          categoryId: {
            [Op.in]: categoryIds,
          },
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      meta.setDataValue("categoryName", meta.Category?.name || "Categoria não encontrada");
      console.log("📆 Período:", startDate, "até", endDate);
      console.log("💰 Total usado encontrado:", totalUsed);

      meta.setDataValue("usedAmount", totalUsed || 0);
      meta.setDataValue(
        "percentageUsed",
        meta.amount > 0 ? ((totalUsed || 0) / meta.amount) * 100 : 0
      );
    }

    res.json(metas);
  } catch (err) {
    console.error("Erro ao buscar metas mensais:", err);
    res.status(500).json({ error: "Erro ao buscar metas mensais" });
  }
}
,

  async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const goal = await MonthlyGoal.findOne({ where: { id, userId } });
      if (!goal) return res.status(404).json({ error: "Meta não encontrada" });

      await goal.destroy();
      res.json({ message: "Meta mensal excluída com sucesso." });
    } catch (err) {
      console.error("Erro ao excluir meta mensal:", err);
      res.status(500).json({ error: "Erro ao excluir meta mensal" });
    }
  },
};

module.exports = monthlyGoalController;
