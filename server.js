const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const ofertasRoutes = require('./routes/ofertasRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/auth', emailRoutes);
app.use('/api/auth', ofertasRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});