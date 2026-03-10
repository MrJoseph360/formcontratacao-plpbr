require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const candidatoRoutes = require('./routes/candidatos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - máximo 20 submissions por IP por hora
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 1 hora.' }
});
app.use('/api/', limiter);

// Rotas
app.use('/api/candidatos', candidatoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
