require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const dentistasRoutes = require('./routes/dentistas.routes');
const agendamentosRoutes = require('./routes/agendamentos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/dentistas', dentistasRoutes);
app.use('/api/agendamentos', agendamentosRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'API Sorriso Pleno funcionando.' });
});

app.listen(PORT, () => {
  console.log(`API Sorriso Pleno disponível em http://localhost:${PORT}`);
});
