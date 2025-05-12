const Trial = require('../models/Trial');
const User = require('../models/User');

// Iniciar período de trial para um usuário
exports.startTrial = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingTrial = await Trial.findOne({ where: { userId } });
    if (existingTrial) {
      return res.status(400).json({ success: false, message: 'Usuário já possui um período de trial' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const trial = await Trial.create({ userId, startDate, endDate });

    return res.status(201).json({ success: true, data: trial });
  } catch (error) {
    console.error('Erro ao iniciar trial:', error);
    return res.status(500).json({ success: false, message: 'Erro ao iniciar período de trial' });
  }
};

// Verificar status do trial
exports.checkTrialStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const trial = await Trial.findOne({ where: { userId } });

    if (!trial) {
      return res.status(404).json({ success: false, message: 'Trial não encontrado para este usuário' });
    }

    const now = new Date();
    const endDate = new Date(trial.endDate);
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    const isActive = trial.isActive && now < endDate;

    return res.status(200).json({
      success: true,
      data: {
        ...trial.get(),
        daysLeft: Math.max(0, daysLeft),
        isActive: isActive || trial.hasPaid
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status do trial:', error);
    return res.status(500).json({ success: false, message: 'Erro ao verificar status do trial' });
  }
};

// Registrar pagamento
exports.registerPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, paymentReference } = req.body;

    const trial = await Trial.findOne({ where: { userId } });
    if (!trial) {
      return res.status(404).json({ success: false, message: 'Trial não encontrado para este usuário' });
    }

    trial.hasPaid = true;
    trial.paymentDate = new Date();
    trial.paymentMethod = paymentMethod;
    trial.paymentReference = paymentReference;

    await trial.save();

    return res.status(200).json({ success: true, data: trial });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    return res.status(500).json({ success: false, message: 'Erro ao registrar pagamento' });
  }
};

// Middleware para verificar acesso
exports.checkAccess = async (req, res, next) => {
  try {
    if (req.path.includes('/auth/') || req.path.includes('/trial/') || req.path === '/api/health') {
      return next();
    }

    const userId = req.user.id;
    let trial = await Trial.findOne({ where: { userId } });

    if (!trial) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      trial = await Trial.create({ userId, startDate, endDate });
    }

    const now = new Date();
    const endDate = new Date(trial.endDate);

    if ((now <= endDate && trial.isActive) || trial.hasPaid) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Período de trial expirado. Por favor, realize o pagamento para continuar.',
      trialStatus: {
        expired: true,
        hasPaid: false
      }
    });
  } catch (error) {
    console.error('Erro ao verificar acesso:', error);
    return res.status(500).json({ success: false, message: 'Erro ao verificar acesso' });
  }
};
