const express = require('express');
const cors = require('cors');
require('dotenv').config(); // ⚠️ Carrega variáveis do .env

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas públicas (sem autenticação)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const trialRoutes = require('./routes/trialRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trial', trialRoutes); // ⬅️ Deve vir antes dos middlewares protegidos

// Middlewares protegidos
const authenticate = require('./middlewares/authenticate');
// const { checkAccess } = require('./controllers/trialController'); // ⏸️ Desabilitado temporariamente

// Rotas protegidas (com autenticação apenas — trial desativado por enquanto)
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
const monthlyGoalRoutes = require("./routes/monthlyGoalRoutes");

// 🔓 Apenas autenticação, trial verificação desativada
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
app.use("/api/monthly-goals", authenticate, monthlyGoalRoutes); // ✅ adicionar autenticação aqui também

// Subir servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});

// Banco de dados
const { sequelize } = require('./models');

sequelize.sync().then(() => {
  console.log('🧠 Tabelas sincronizadas com o banco de dados');
});

// Teste de conexão com banco
sequelize.query(`
  CREATE TABLE IF NOT EXISTS teste_origem (
    id SERIAL PRIMARY KEY,
    info VARCHAR(255)
  );
`)
  .then(() => console.log("🧪 Tabela 'teste_origem' criada para teste."))
  .catch((err) => console.error("Erro ao criar tabela teste:", err));
