// controllers/usuarioController.js
const { query } = require("../config/db");
const { generateRandomPassword } = require("../utils/generatePassword");
const { sendEmail } = require("../services/emailService");
const bcrypt = require("bcryptjs");

const crearUsuario = async (req, res) => {
  const { email, nivell, cursos } = req.body;
  const { centroId } = req.params;

  // 1) Validaciones básicas
  if (!email || !centroId || nivell === undefined || !Array.isArray(cursos)) {
    return res
      .status(400)
      .json({ success: false, message: "Faltan campos o cursos no válidos" });
  }

  try {
    // 2) Comprueba que el email no exista
    const existing = await query("SELECT idusr FROM usuario WHERE email = ?", [
      email,
    ]);
    if (existing.length) {
      return res
        .status(400)
        .json({ success: false, message: "El email ya está en uso" });
    }

    // 3) Genera y guarda el usuario
    const rawPass = generateRandomPassword();
    const hash = await bcrypt.hash(rawPass, 10);
    const insertUserResult = await query(
      "INSERT INTO usuario (email, password, nivell, actiu) VALUES (?, ?, ?, 0)",
      [email, hash, parseInt(nivell, 10)]
    );
    const idusr = insertUserResult.insertId; // OkPacket provisto por query()

    // 4) Asigna cursos válidos (uno a uno)
    for (const cid of cursos) {
      // Verifica que el curso pertenezca a este centro
      const rows = await query(
        "SELECT idcurso FROM curso WHERE idcurso = ? AND idcentro = ?",
        [cid, parseInt(centroId, 10)]
      );
      if (rows.length) {
        await query(
          "INSERT INTO cursousr (idusr, idcurso) VALUES (?, ?)",
          [idusr, cid]
        );
      }
    }

    // 5) Asocia el usuario al centro
    await query(
      "INSERT INTO usrcentro (idusr, idcentro) VALUES (?, ?)",
      [idusr, parseInt(centroId, 10)]
    );

    // 6) Envía el correo con credenciales
    await sendEmail(
      email,
      "Bienvenido a CampusJob",
      `Usuario: ${email}\nContraseña: ${rawPass}`
    );

    return res.json({
      success: true,
      message: "Usuario creado exitosamente",
      idusr,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error en el servidor" });
  }
};

module.exports = { crearUsuario };
