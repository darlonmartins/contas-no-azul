const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const multer = require('multer');

const authenticate = require('../middlewares/authenticate');
const invoiceController = require('../controllers/invoiceController');

// ==============================
// Uploads: pasta e storage
// ==============================
const uploadDir = path.join(process.cwd(), 'uploads', 'invoices');
fs.mkdirSync(uploadDir, { recursive: true }); // garante a pasta

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${ts}__${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      path.extname(file.originalname).toLowerCase() === '.pdf';
    if (!isPdf) return cb(new Error('Somente PDFs são aceitos.'));
    cb(null, true);
  },
});

// Wrapper pra capturar erros do Multer e responder 400 com a mensagem
const uploadHandler = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ==============================
// Rotas de fatura
// ==============================

// 📋 Listar faturas de um cartão
router.get('/card/:cardId', authenticate, invoiceController.listByCard);

// 🔄 Criar fatura se não existir
router.post('/create', authenticate, invoiceController.createIfNotExists);

// ✅ Marcar fatura como paga
router.put('/:id/pay', authenticate, invoiceController.markAsPaid);

// ❌ Desmarcar pagamento
router.put('/:id/unpay', authenticate, invoiceController.unpayInvoice);

// 🧾 Info da fatura (card + mês)
router.get('/invoice-info', authenticate, invoiceController.getInvoiceInfo);

// 🔮 Previsão (mês atual/selecionado)
router.get('/:cardId/forecast', authenticate, invoiceController.forecast);

// === 📂 Upload/parse/import de PDF ===

// ⬆️ Upload do PDF (campo deve ser 'file')
router.post(
  '/upload',
  authenticate,
  uploadHandler, // 👈 em vez de upload.single('file') direto
  invoiceController.uploadInvoice
);

// 📑 Parse do PDF já enviado
router.post('/:id/parse', authenticate, invoiceController.parseInvoice);

// 👀 Preview das linhas parseadas
router.get('/:id/preview', authenticate, invoiceController.getPreview);

// 💾 Importar transações da fatura
router.post('/:id/import', authenticate, invoiceController.importInvoice);

module.exports = router;
