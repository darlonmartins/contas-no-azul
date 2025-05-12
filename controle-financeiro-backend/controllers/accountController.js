const accountService = require('../services/accountService');

const accountController = {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const data = await accountService.createAccount({ ...req.body, userId });
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const userId = req.user.id;
      const accounts = await accountService.getAccounts(userId);
      res.json(accounts);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
      res.status(500).json({ error: 'Erro ao buscar contas' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updated = await accountService.updateAccount(id, req.body, userId);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await accountService.deleteAccount(id, userId);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

module.exports = accountController;
