/**
 * middlewares/authenticate.js
 *
 * Middleware único de autenticação.
 * Suporta tokens JWT locais (gerados pelo sistema) e tokens Google ID.
 *
 * USO: substitui tanto o antigo authMiddleware.js quanto o authenticate.js anterior.
 * Todos os arquivos de rotas devem importar apenas este:
 *   const authenticate = require('../middlewares/authenticate');
 */

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido ou formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  // 1️⃣ Tenta validar como JWT local
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.user = decoded;
    return next();
  } catch (jwtErr) {
    // JWT local inválido — tenta Google ID token
  }

  // 2️⃣ Tenta validar como Google ID token
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    req.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      isGoogleUser: true,
    };

    return next();
  } catch (googleErr) {
    // Nenhum dos dois formatos funcionou
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

module.exports = authenticate;
