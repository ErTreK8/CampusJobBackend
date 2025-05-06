// Cargar variables de entorno
require('dotenv').config();

// Importar librerías
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true, // SSL/TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Crear servidor
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
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
            'SELECT * FROM usuario WHERE nomusuari = ? AND password = ?', 
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

// Ruta para enviar correos (opcional - puedes desactivarla si no la usas ahora)
app.post('/api/auth/send-email', async (req, res) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ success: false, message: 'Faltan campos para enviar el correo' });
    }

    try {
        await transporter.sendMail({
            from: '"CampusJob" <notificacion@teachandlearn.cat>',
            to,
            subject,
            text
        });

        res.json({ success: true, message: 'Correo enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});