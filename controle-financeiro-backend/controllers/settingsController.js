const { User } = require('../models');

const settingsController = {
  async getSettings(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);

      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

      res.json({ notificationFrequency: user.notificationFrequency || 'mensal' });
    } catch (err) {
      console.error('Erro ao obter configurações:', err);
      res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  },

  async updateSettings(req, res) {
    try {
      const userId = req.user.id;
      const { notificationFrequency } = req.body;

      await User.update({ notificationFrequency }, { where: { id: userId } });

      res.json({ message: 'Configurações atualizadas com sucesso!' });
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
  },
};

module.exports = settingsController;
