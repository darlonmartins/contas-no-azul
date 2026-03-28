require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const app = express();

// ── Segurança: headers HTTP
app.use(helmet());

// ── CORS restrito às origens permitidas
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: mobile, Postman em dev)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ── Rate limit nas rotas de autenticação (anti força bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,                   // máx 20 tentativas por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
});

// ── Log de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('➡️', req.method, req.originalUrl);
    next();
  });
}

// ── Pasta de uploads de faturas
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'invoices');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.set('UPLOAD_INVOICES_DIR', UPLOAD_DIR);
app.use('/uploads/invoices', express.static(UPLOAD_DIR));

// ── Rotas públicas
const authRoutes        = require('./routes/authRoutes');
const userRoutes        = require('./routes/userRoutes');
const trialRoutes       = require('./routes/trialRoutes');
const googleAuthRoutes  = require('./routes/googleAuthRoutes');

app.use('/api/auth',        authLimiter, authRoutes);   // rate limit aplicado aqui
app.use('/api/users',       userRoutes);
app.use('/api/trial',       trialRoutes);
app.use('/api/auth/google', authLimiter, googleAuthRoutes);

// ── Middleware de autenticação
const authenticate = require('./middlewares/authenticate');

// ── Rotas autenticadas
const transactionRoutes  = require('./routes/transactionRoutes');
const objectiveRoutes    = require('./routes/objectiveRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes    = require('./routes/dashboardRoutes');
const settingsRoutes     = require('./routes/settingsRoutes');
const pdfRoutes          = require('./routes/pdfRoutes');
const cardRoutes         = require('./routes/cardRoutes');
const accountRoutes      = require('./routes/accountRoutes');
const categoryRoutes     = require('./routes/categoryRoutes');
const incomeRoutes       = require('./routes/incomeRoutes');
const invoiceRoutes      = require('./routes/invoiceRoutes');
const monthlyGoalRoutes  = require('./routes/monthlyGoalRoutes');

app.use('/api/transactions',  authenticate, transactionRoutes);
app.use('/api/goals',         authenticate, objectiveRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/dashboard',     authenticate, dashboardRoutes);
app.use('/api/settings',      authenticate, settingsRoutes);
app.use('/api/cards',         authenticate, cardRoutes);
app.use('/api/accounts',      authenticate, accountRoutes);
app.use('/api/categories',    authenticate, categoryRoutes);
app.use('/api/pdf',           authenticate, pdfRoutes);
app.use('/api/records',       authenticate, incomeRoutes);
app.use('/api/invoices',      authenticate, invoiceRoutes);
app.use('/api/monthly-goals', authenticate, monthlyGoalRoutes);

// ── WhatsApp (webhook público)
const whatsappRoutes     = require('./routes/whatsappRoutes');
const whatsappTestRoutes = require('./routes/whatsappTestRoutes');
app.use('/api/whatsapp',      whatsappRoutes);
app.use('/api/whatsapp/test', whatsappTestRoutes);

// ── Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── Error handler global (deve ser o ÚLTIMO middleware)
const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);

// ── Inicialização
const { sequelize } = require('./models');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    await sequelize.sync();
    console.log('🧠 Tabelas sincronizadas');

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err?.message || err);
    process.exit(1);
  }
};

startServer();
