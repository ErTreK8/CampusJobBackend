const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

// Configuración de la conexión a tu BBDD externa
const pool = mysql.createPool({
    host: 'bbdd.teachandlearn.cat',
    user: 'ddb252377',
    password: 'crRFC{bwh8JTQ(',
    database: 'ddb252377',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Faltan credenciales' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE username = ? AND password = ?', 
            [username, password]
        );

        if (rows.length > 0) {
            res.json({ success: true, message: 'Login exitoso' });
        } else {
            res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error al consultar la BD:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});