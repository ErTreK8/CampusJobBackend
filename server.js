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

app.use(cors({
    origin: '*', // Permite todas las solicitudes durante el desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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


app.post('/api/crearOferta', async (req, res) => {
    const {
        titoloferta,
        descripciooferta,
        tipusjornada,
        horessetmanals,
        numplacesvacants,
        presencial,
        salariesperat,
        fechafin,
        imgoferte,
        documentadjunto,
        idusrpublica
    } = req.body;

    // Validación básica
    if (!titoloferta || !descripciooferta || !tipusjornada || !fechafin || !idusrpublica) {
        return res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios'
        });
    }

    try {
        await pool.query(
            `INSERT INTO ofertadetreball 
            (idusrpublica, imgoferte, titoloferta, descripciooferta, tipusjornada, 
            horessetmanals, numplacesvacants, presencial, salariesperat, documentadjunto, fechafin) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idusrpublica,
                imgoferte || null,
                titoloferta,
                descripciooferta,
                tipusjornada,
                horessetmanals || null,
                numplacesvacants || null,
                presencial ? 1 : 0,
                salariesperat || null,
                documentadjunto || null,
                fechafin
            ]
        );

        res.json({
            success: true,
            message: 'Oferta creada correctamente'
        });

    } catch (error) {
        console.error('Error al insertar oferta:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al crear la oferta',
            error: error.message
        });
    }
});


// Ruta para obtener todas las ofertas
app.get('/api/auth/ofertas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                idoferta as id,
                titoloferta as titulo,
                descripciooferta as descripcion,
                tipusjornada as jornada,
                horessetmanals as horasSemanales,
                numplacesvacants as vacantes,
                presencial,
                salariesperat as salario,
                fechapubli as fechaPublicacion,
                fechafin as fechaFin
            FROM ofertadetreball
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener las ofertas:', error);
        res.status(500).json({ error: 'Error al obtener las ofertas' });
    }
});



app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});