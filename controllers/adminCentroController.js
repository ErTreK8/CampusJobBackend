// controllers/adminCentroController.js
const { getConnection } = require("../config/db");
const { generateRandomPassword } = require("../utils/generatePassword");
const { sendEmail } = require("../services/emailService");
const bcrypt = require("bcryptjs");

const createCentroYUsuario = async (req, res) => {
  const { nombre, correo, telefono, emailUsrAdmin, nomUsrAdmin, logoCentro } = req.body;
  if (!nombre || !correo || !telefono || !emailUsrAdmin || !nomUsrAdmin) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  try {
    const conn = await getConnection();

    // 1) Verificar usuario existente
    const [existingUser] = await conn.query(
      "SELECT idusr FROM usuario WHERE email = ? OR nomusuari = ?",
      [emailUsrAdmin, nomUsrAdmin]
    );
    if (existingUser.length) {
      return res.status(400).json({ success: false, message: "Usuario ya existe", errorType: "userExists" });
    }

    // 2) Verificar centro existente
    const [existingCenter] = await conn.query(
      "SELECT idcentro FROM centro WHERE nombreCentro = ? OR email = ? OR telefono = ?",
      [nombre, correo, telefono]
    );
    if (existingCenter.length) {
      return res.status(400).json({ success: false, message: "Centro ya existe", errorType: "centerExists" });
    }

    // 3) Tamaño logo
    if (logoCentro && logoCentro.length > 5 * 1024 * 1024 * 1.37) {
      return res.status(400).json({ success: false, message: "Logo demasiado grande", errorType: "logoTooBig" });
    }

    // 4) Generar password e insertar usuario
    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const [userResult] = await conn.query(
      "INSERT INTO usuario (email, nomusuari, password, nivell, actiu) VALUES (?, ?, ?, ?, ?)",
      [emailUsrAdmin, nomUsrAdmin, hashedPassword, 3, 1]
    );
    const idUsrAdmin = userResult.insertId;

    // 5) Insertar centro
    await conn.query(
      "INSERT INTO centro (nombreCentro, email, telefono, idUsrAdmin, logoCentro) VALUES (?, ?, ?, ?, ?)",
      [nombre, correo, telefono, idUsrAdmin, logoCentro || null]
    );

    // 6) Enviar correo
    await sendEmail(
      emailUsrAdmin,
      "Bienvenido al CampusJob",
      `Usuario: ${nomUsrAdmin}\nContraseña: ${rawPassword}`
    );

    return res.json({ success: true, message: "Centro y usuario creados" });
  } catch (error) {
    console.error("Error en createCentroYUsuario:", error.message);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

module.exports = { createCentroYUsuario };
