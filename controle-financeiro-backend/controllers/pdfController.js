const pdfService = require('../services/pdfService');

module.exports = {
  monthlyReport: async (req, res) => {
    try {
      const user = req.user; // <- pega do middleware de auth
      const { month, categoryId } = req.query; // month = "YYYY-MM" opcional

      const fileName = `relatorio-${(month || 'atual')}.pdf`.replace(/[^a-z0-9\-\.]/gi,'_');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      await pdfService.generateMonthlyReport(
        { userId: user.id, month, categoryId },
        res,
        user // <- envia user p/ cabeçalho bonitinho
      );
    } catch (err) {
      console.error('PDF monthlyReport error', err);
      res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
  },
};
