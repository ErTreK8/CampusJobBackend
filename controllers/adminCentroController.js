const pool = require('../config/db');
const { generateRandomPassword } = require('../utils/generatePassword');
const { sendEmail } = require('../services/emailService');

const createCentroYUsuario = async (req, res) => {
  const {
    nombre,
    correo,
    telefono,
    emailUsrAdmin,
    nomUsrAdmin
  } = req.body;

  // Validación de campos requeridos
  if (!nombre || !correo || !telefono || !emailUsrAdmin || !nomUsrAdmin) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  try {
    // Generar contraseña aleatoria
    const password = generateRandomPassword();

    // Crear usuario admin del centro
    const [userResult] = await pool.query(
      'INSERT INTO usuario (email, nomusuari, password, nivell, actiu) VALUES (?, ?, ?, ?, ?)',
      [emailUsrAdmin, nomUsrAdmin, password, 3, 1] // Nivel 3 = AdminCentro
    );

    const idUsrAdmin = userResult.insertId;

    // Crear centro
    await pool.query(
      'INSERT INTO centro (nombreCentro, email, telefono, idUsrAdmin) VALUES (?, ?, ?, ?)',
      [nombre, correo, telefono, idUsrAdmin]
    );

    // Enviar correo con credenciales
    await sendEmail(
      emailUsrAdmin,
      'Bienvenido al CampusJob',
      `Tus credenciales son:\n\nUsuario: ${nomUsrAdmin}\nContraseña: ${password}`
    );

    res.json({
      success: true,
      message: 'Centro y usuario creados exitosamente'
    });

  } catch (error) {
    console.error('Error al crear centro:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = { createCentroYUsuario };