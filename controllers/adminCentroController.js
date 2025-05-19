const pool = require('../config/db');
const { generateRandomPassword } = require('../utils/generatePassword');
const { sendEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');

const createCentroYUsuario = async (req, res) => {
  const {
    nombre,
    correo,
    telefono,
    emailUsrAdmin,
    nomUsrAdmin,
    logoCentro
  } = req.body;

  // Validación de campos requeridos
  if (!nombre || !correo || !telefono || !emailUsrAdmin || !nomUsrAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos'
    });
  }

  try {
    // 1. Verificar si el usuario ya existe
    const [existingUser] = await pool.query(
      'SELECT idusr FROM usuario WHERE email = ? OR nomusuari = ?', 
      [emailUsrAdmin, nomUsrAdmin]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo o nombre de usuario ya está en uso',
        errorType: 'userExists'
      });
    }

    // 2. Verificar si el centro ya existe
    const [existingCenter] = await pool.query(
      'SELECT idcentro FROM centro WHERE nombreCentro = ? OR email = ? OR telefono = ?', 
      [nombre, correo, telefono]
    );

    if (existingCenter.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un centro con ese nombre, correo o teléfono',
        errorType: 'centerExists'
      });
    }

    // 3. Verificar tamaño del logo (base64)
    if (logoCentro && logoCentro.length > 5 * 1024 * 1024 * 1.37) { // 5MB en base64
      return res.status(400).json({
        success: false,
        message: 'El logo no puede superar los 5MB',
        errorType: 'logoTooBig'
      });
    }

    // 4. Generar contraseña aleatoria y encriptarla
    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 5. Crear usuario admin del centro
    const [userResult] = await pool.query(
      'INSERT INTO usuario (email, nomusuari, password, nivell, actiu) VALUES (?, ?, ?, ?, ?)',
      [emailUsrAdmin, nomUsrAdmin, hashedPassword, 3, 1]
    );

    const idUsrAdmin = userResult.insertId;

    // 6. Crear centro con logo
    await pool.query(
      'INSERT INTO centro (nombreCentro, email, telefono, idUsrAdmin, logoCentro) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, telefono, idUsrAdmin, logoCentro || null]
    );

    // 7. Enviar correo con credenciales
    await sendEmail(
      emailUsrAdmin,
      'Bienvenido al CampusJob',
      `Tus credenciales son:\n\nUsuario: ${nomUsrAdmin}\nContraseña: ${rawPassword}`
    );

    res.json({
      success: true,
      message: 'Centro y usuario creados exitosamente'
    });

  } catch (error) {
    console.error('Error en el servidor:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

module.exports = { createCentroYUsuario };