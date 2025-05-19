const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Faltan credenciales' });
  }

  try {
    // 1. Selecciona también el campo `activo`
    const [rows] = await pool.query(
      'SELECT idusr, nivell, password, actiu FROM usuario WHERE nomusuari = ?', 
      [username]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Credenciales incorrectas' });
    }

    const user = rows[0];

    // 2. Verificar si el usuario está activo
    if (user.actiu !== 1) {
      return res.json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // 3. Comparar contraseña encriptada
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ success: false, message: 'Credenciales incorrectas' });
    }

    // 4. Si todo ok → devolver datos del usuario
    return res.json({
      success: true,
      message: 'Login exitoso',
      idUsuario: user.idusr,
      nivelUsuario: user.nivell
    });

  } catch (error) {
    console.error('[Backend] Error en login:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = { login };