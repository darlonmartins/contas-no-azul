require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('➡️', req.method, req.originalUrl, 'Auth:', req.headers.authorization || '-');
  next();
});

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
const invoiceRoutes = require('./routes/invoiceRoutes');
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
app.use('/api/invoices', authenticate, invoiceRoutes);
app.use('/api/monthly-goals', authenticate, monthlyGoalRoutes);

// WhatsApp rotas (sem auth para facilitar webhook/teste)
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/whatsapp/test', whatsappTestRoutes);

// Healthcheck simples
app.get('/health', (_req, res) => res.json({ ok: true }));

// ⬇️ deixe o 404 SEMPRE por último
app.use((req, res) => {
  res.status(404).json({ error: 'endpoint desconhecido' });
});

// Conexão com o banco
const { sequelize } = require('./models');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // Se usa migrations, evitar alter aqui em prod; em dev pode manter
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
