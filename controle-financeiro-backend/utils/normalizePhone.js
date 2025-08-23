module.exports = function normalizePhone(msisdn) {
  if (!msisdn) return msisdn;
  return String(msisdn).replace(/[^\d]/g, ''); // remove +, espaços, hífens etc.
};
