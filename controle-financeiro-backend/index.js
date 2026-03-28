require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');                 // ← ADICIONADO
const path = require('path');             // ← ADICIONADO

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('➡️', req.method, req.originalUrl, 'Auth:', req.headers.authorization || '-');
  next();
});

// ✅ Cria a pasta de uploads de faturas ANTES das rotas
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'invoices');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.set('UPLOAD_INVOICES_DIR', UPLOAD_DIR);
// (opcional) servir arquivos estáticos de uploads em dev:
app.use('/uploads/invoices', express.static(UPLOAD_DIR));

// Rotas públicas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const trialRoutes = require('./routes/trialRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes'); // ⬅️ traga para cima

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trial', trialRoutes);
app.use('/api/auth/google', googleAuthRoutes); // ⬅️ registre antes do 404

// Middlewares protegidos
const authenticate = require('./middlewares/authenticate');

// Rotas autenticadas
const transactionRoutes = require('./routes/transactionRoutes');
const objectiveRoutes = require('./routes/objectiveRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const cardRoutes = require('./routes/cardRoutes');
const accountRoutes = require('./routes/accountRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes'); // usa a pasta criada acima
const monthlyGoalRoutes = require('./routes/monthlyGoalRoutes');

// WhatsApp (Cloud API)
const whatsappRoutes = require('./routes/whatsappRoutes');         // webhook Cloud (público)
const whatsappTestRoutes = require('./routes/whatsappTestRoutes'); // endpoints de teste (públicos ou protegidos, como preferir)

// Rotas autenticadas
app.use('/api/transactions', authenticate, transactionRoutes);
app.use('/api/goals', authenticate, objectiveRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/settings', authenticate, settingsRoutes);
app.use('/api/cards', authenticate, cardRoutes);
app.use('/api/accounts', authenticate, accountRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/pdf', authenticate, pdfRoutes);
app.use('/api/records', authenticate, incomeRoutes);
app.use('/api/invoices', authenticate, invoiceRoutes); // ✅ já com dir criado
app.use('/api/monthly-goals', authenticate, monthlyGoalRoutes);

// WhatsApp rotas (sem auth para facilitar webhook/teste)
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/whatsapp/test', whatsappTestRoutes);

// Healthcheck simples
app.get('/health', (_req, res) => res.json({ ok: true }));

// Conexão com o banco
const { sequelize } = require('./models');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // Em produção, prefira migrations; em dev, sync ajuda:
    await sequelize.sync();
    console.log('🧠 Tabelas sincronizadas com o banco de dados');

    const PORT = process.env.PORT || 3001; // ajuste conforme seu .env
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err?.message || err);
    process.exit(1);
  }
};

startServer();
