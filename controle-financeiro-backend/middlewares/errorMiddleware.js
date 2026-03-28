/**
 * middlewares/errorMiddleware.js
 *
 * Handler global de erros do Express.
 * Deve ser registrado como o ÚLTIMO app.use() em index.js.
 */

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Só imprime stack em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }

  const status = err.status || err.statusCode || 500;

  // Em produção não expõe detalhes internos
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Erro interno do servidor'
      : err.message || 'Erro interno do servidor';

  res.status(status).json({ message });
}

module.exports = errorHandler;
