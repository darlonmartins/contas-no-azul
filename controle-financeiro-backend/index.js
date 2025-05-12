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
const { checkAccess } = require('./controllers/trialController');

// Rotas protegidas (com autenticação + verificação de acesso)
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

app.use('/api/transactions', authenticate, checkAccess, transactionRoutes);
app.use('/api/goals', authenticate, checkAccess, objectiveRoutes);
app.use('/api/notifications', authenticate, checkAccess, notificationRoutes);
app.use('/api/dashboard', authenticate, checkAccess, dashboardRoutes);
app.use('/api/settings', authenticate, checkAccess, settingsRoutes);
app.use('/api/cards', authenticate, checkAccess, cardRoutes);
app.use('/api/accounts', authenticate, checkAccess, accountRoutes);
app.use('/api/categories', authenticate, checkAccess, categoryRoutes);
app.use('/api', authenticate, checkAccess, pdfRoutes);
app.use('/api/records', authenticate, checkAccess, incomeRoutes);
app.use('/api/invoices', authenticate, checkAccess, invoiceRoutes);
app.use("/api/monthly-goals", monthlyGoalRoutes);

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
sequelize.query("CREATE TABLE IF NOT EXISTS teste_origem (id INT AUTO_INCREMENT PRIMARY KEY, info VARCHAR(255));")
  .then(() => console.log("🧪 Tabela 'teste_origem' criada para teste."))
  .catch((err) => console.error("Erro ao criar tabela teste:", err));
