require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas públicas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const trialRoutes = require('./routes/trialRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trial', trialRoutes);

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

app.use('/api/transactions', authenticate, transactionRoutes);
app.use('/api/goals', authenticate, objectiveRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/settings', authenticate, settingsRoutes);
app.use('/api/cards', authenticate, cardRoutes);
app.use('/api/accounts', authenticate, accountRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api', authenticate, pdfRoutes);
app.use('/api/records', authenticate, incomeRoutes);
app.use('/api/invoices', authenticate, invoiceRoutes);
app.use('/api/monthly-goals', authenticate, monthlyGoalRoutes);

// Conexão com o banco
const { sequelize } = require('./models');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    await sequelize.sync();
    console.log('🧠 Tabelas sincronizadas com o banco de dados');

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err.message);
  }
};

startServer();
