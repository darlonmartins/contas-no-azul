const PDFDocument = require('pdfkit');

const generateGoalsPDF = (goals, userName = 'Usuário') => {
  const doc = new PDFDocument();

  doc.fontSize(18).text(`Metas Financeiras de ${userName}`, { align: 'center' });
  doc.moveDown();

  goals.forEach((goal, index) => {
    doc
      .fontSize(12)
      .text(`Meta #${index + 1}`)
      .text(`Categoria: ${goal.Category?.name || 'N/A'}`)
      .text(`Valor: R$ ${parseFloat(goal.amount).toFixed(2)}`)
      .text(`Mês/Ano: ${goal.month}/${goal.year}`)
      .moveDown();
  });

  doc.end();
  return doc;
};

module.exports = { generateGoalsPDF };
