const { query } = require("../config/db");
const { generateRandomPassword } = require("../utils/generatePassword");
const { sendEmail } = require("../services/emailService");
const bcrypt = require("bcryptjs");

const createCentroYUsuario = async (req, res) => {
  const { nombre, correo, telefono, emailUsrAdmin, nomUsrAdmin, logoCentro } = req.body;

  if (!nombre || !correo || !telefono || !emailUsrAdmin || !nomUsrAdmin) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  try {
    // 1) Verificar usuario existente
    const existingUser = await query(
      "SELECT idusr FROM usuario WHERE email = ? OR nomusuari = ?",
      [emailUsrAdmin, nomUsrAdmin]
    );

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "El correo o nombre de usuario ya está en uso", 
        errorType: "userExists" 
      });
    }

    // 2) Verificar centro existente
    const existingCenter = await query(
      "SELECT idcentro FROM centro WHERE nombrecentro = ? OR email = ? OR telefono = ?",
      [nombre, correo, telefono]
    );

    if (existingCenter && existingCenter.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Ya existe un centro con ese nombre, correo o teléfono", 
        errorType: "centerExists" 
      });
    }

    // 3) Validar tamaño del logo
    if (logoCentro && logoCentro.length > 5 * 1024 * 1024 * 1.37) {
      return res.status(400).json({ 
        success: false, 
        message: "El logo no puede superar los 5MB", 
        errorType: "logoTooBig" 
      });
    }

    // 4) Generar contraseña e insertar usuario
    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const userResult = await query(
      "INSERT INTO usuario (email, nomusuari, password, nivell, actiu) VALUES (?, ?, ?, ?, ?)",
      [emailUsrAdmin, nomUsrAdmin, hashedPassword, 3, 1]
    );

    const idUsrAdmin = userResult.insertId;

    // 5) Insertar centro
    await query(
      "INSERT INTO centro (nombrecentro, email, telefono, idusradmin, logoCentro) VALUES (?, ?, ?, ?, ?)",
      [nombre, correo, telefono, idUsrAdmin, logoCentro || null]
    );

    // 6) Enviar correo
    await sendEmail(
      emailUsrAdmin,
      "Bienvenido al CampusJob",
      `Usuario: ${nomUsrAdmin}\nContraseña: ${rawPassword}`
    );

    return res.json({ 
      success: true, 
      message: "Centro y usuario creados exitosamente" 
    });

  } catch (error) {
    console.error("Error en createCentroYUsuario:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Error en el servidor", 
      error: error.message 
    });
  }
};

module.exports = { createCentroYUsuario };