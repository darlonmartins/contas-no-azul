const { Goal, Category, User } = require('../models');
const { generateGoalsPDF } = require('../services/pdfService');

const pdfController = {
  async exportGoalsPDF(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      const goals = await Goal.findAll({
        where: { userId },
        include: [{ model: Category, attributes: ['name'] }],
        order: [['year', 'DESC'], ['month', 'DESC']],
      });

      const pdfStream = generateGoalsPDF(goals, user.name || 'Usuário');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=metas.pdf');

      pdfStream.pipe(res);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
  },
};

module.exports = pdfController;
