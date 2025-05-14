const pool = require('../config/db');

const login = async (req, res) => {
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
            const user = rows[0];
            res.json({ 
                success: true, 
                message: 'Login exitoso', 
                idUsuario: user.idusr, 
                nivelUsuario: user.nivell 
            });
        }
        else
        {
            res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error al consultar la BD:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

module.exports = { login };