const { ValidationError } = require('sequelize');

const handleValidationErrors = (error) => {
  if (error instanceof ValidationError) {
    return error.errors.map((err) => err.message);
  }

  return ['Erro interno do servidor'];
};

module.exports = handleValidationErrors;
