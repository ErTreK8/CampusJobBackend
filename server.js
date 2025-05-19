// server.js

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const ofertasRoutes = require('./routes/ofertasRoutes');
const adminCentroRoutes = require('./routes/adminCentroRoutes'); // 👈 Añade esta línea
const centroRoutes = require('./routes/centroRoutes');

// Añade la ruta
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Rutas
app.use('/api/centro', centroRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', emailRoutes);
app.use('/api/auth', ofertasRoutes);
app.use('/api/adminCentro', adminCentroRoutes); // 👈 Añade esta línea para que `/api/adminCentro/crear` funcione

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});