// authController.js
const pool = require('../config/db');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Faltan credenciales' });
  }

  try {
    // Seleccionamos idusr y nivell, los renombramos a idUsuario / nivelUsuario
    const [rows] = await pool.query(
      `SELECT 
         idusr    AS idUsuario,
         nivell   AS nivelUsuario
       FROM usuario
       WHERE nomusuari = ? AND password = ?`,
      [username, password]
    );


    if (rows.length === 0) {
      return res.json({ success: false, message: 'Credenciales incorrectas' });
    }

    const user = rows[0];

    // Enviamos el user completo (tiene idUsuario y nivelUsuario)
    return res.json({
      success: true,
      message: 'Login exitoso',
      idUsuario: user.idUsuario,
      nivelUsuario: user.nivelUsuario
    });
  } catch (error) {
    console.error('[Backend] Error en login:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = { login };
