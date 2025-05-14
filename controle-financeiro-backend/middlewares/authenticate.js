const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se o header está presente e no formato correto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido ou formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo');

    // Confere se tem o campo id no payload
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token inválido (payload incompleto)' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error.message);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

module.exports = authenticate;
