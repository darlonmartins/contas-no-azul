const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido ou formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    let decoded;

    // Tenta verificar como JWT local
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo');

      if (!decoded || !decoded.id) {
        throw new Error('Token JWT local inválido (payload incompleto)');
      }

      req.user = decoded;
      return next();
    } catch (err) {
      // Se falhar, tenta validar como token do Google
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      req.user = {
        id: payload.sub, // ID do Google
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        isGoogleUser: true,
      };

      return next();
    }
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error.message);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

module.exports = authenticate;
