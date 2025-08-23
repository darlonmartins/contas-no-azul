const { WhatsappPairing } = require('../models');

async function findByPhone(phone) {
  return WhatsappPairing.findOne({ where: { phone } });
}

async function upsertPairing(phone, userId) {
  const existing = await findByPhone(phone);
  if (existing) {
    if (existing.userId !== userId) {
      existing.userId = userId;
      await existing.save();
    }
    return existing;
  }
  return WhatsappPairing.create({ phone, userId });
}

module.exports = { findByPhone, upsertPairing };
