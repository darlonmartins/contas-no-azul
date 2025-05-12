const getUserProfile = (req, res) => {
    try {
      const user = req.user; // vindo do middleware auth
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err);
      res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
    }
  };
  
  module.exports = { getUserProfile };
  