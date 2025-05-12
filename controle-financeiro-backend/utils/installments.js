function generateFutureInstallments(data, userId) {
    const {
      description,
      value,
      dueDate,
      category,
      installments,
      paymentMethod,
    } = data;
  
    const allInstallments = [];
    const originalDate = new Date(dueDate);
  
    for (let i = 0; i < installments; i++) {
      const date = new Date(
        originalDate.getFullYear(),
        originalDate.getMonth() + i,
        originalDate.getDate()
      );
  
      allInstallments.push({
        description: `${description} (${i + 1}/${installments})`,
        value,
        dueDate: date,
        category,
        paymentMethod,
        userId,
      });
    }
  
    return allInstallments;
  }
  
  module.exports = {
    generateFutureInstallments,
  };
  