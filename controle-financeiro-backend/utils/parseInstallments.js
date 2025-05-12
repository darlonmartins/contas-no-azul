const dayjs = require("dayjs");
const { v4: uuidv4 } = require("uuid");

const parseInstallments = (expense, totalInstallments) => {
  const installments = [];
  const installmentGroupId = uuidv4(); // 🔑 Grupo único para todas as parcelas

  const totalAmount = parseFloat(expense.amount);
  const rawInstallment = totalAmount / totalInstallments;

  let accumulated = 0;

  for (let i = 0; i < totalInstallments; i++) {
    let amount = Math.round(rawInstallment * 100) / 100;

    if (i === totalInstallments - 1) {
      amount = Number((totalAmount - accumulated).toFixed(2));
    }

    accumulated += amount;

    const date = dayjs(expense.date).add(i, "month").startOf("day").toDate();

    const baseData = {
      title: expense.title,
      amount,
      type: expense.type,
      date,
      isInstallment: true,
      installmentNumber: i + 1,
      totalInstallments,
      installmentGroupId, // 🔑 grupo comum
      userId: expense.userId,
      categoryId: expense.categoryId || null,
      fromAccountId: expense.fromAccountId || null,
      toAccountId: expense.toAccountId || null,
      cardId: expense.cardId || null,
    };

    if (i === 0) {
      baseData.originalTotalAmount = totalAmount; // 🔢 armazenado só na 1ª
    }

    installments.push(baseData);
  }

  const preview = installments.map(p => p.amount).join(" + ");
  const finalSum = installments.reduce((sum, i) => sum + i.amount, 0);

  console.log(`📦 Parcelas geradas: ${installments.length} → ${preview} = ${finalSum.toFixed(2)}`);

  if (Math.abs(finalSum - totalAmount) > 0.01) {
    console.warn(`⚠️ Inconsistência detectada! Total das parcelas = ${finalSum}, esperado = ${totalAmount}`);
  }

  return installments;
};

module.exports = parseInstallments;
