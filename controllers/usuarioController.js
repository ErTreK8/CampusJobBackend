const { query } = require("../config/db");
const { generateRandomPassword } = require("../utils/generatePassword");
const { sendEmail } = require("../services/emailService");
const bcrypt = require("bcryptjs");

const crearUsuario = async (req, res) => {
  const { email, nivell, cursos } = req.body;
  const { centroId } = req.params;

  // Validación de campos obligatorios
  if (!email || !centroId || nivell === undefined || !Array.isArray(cursos)) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos obligatorios o cursos no es un array válido",
    });
  }

  try {
    let error = false;

    // Validación: Email no existente
    const existing = await query("SELECT idusr FROM usuario WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El email ya está en uso",
      });
    }

    // Validación: Cursos pertenecen al centro
    const cursosValidos = [];
    for (const cid of cursos) {
      const rows = await query(
        "SELECT idcurso FROM curso WHERE idcurso = ? AND idcentro = ?",
        [cid, parseInt(centroId, 10)]
      );
      if (rows.length > 0) {
        cursosValidos.push(cid);
      }
    }

    if (cursos.length > 0 && cursosValidos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Ninguno de los cursos seleccionados pertenece al centro",
      });
    }

    // === Si llegamos aquí, todo ha sido validado ===

    // Crear usuario
    const rawPass = generateRandomPassword();
    const hash = await bcrypt.hash(rawPass, 10);
    const insertUserResult = await query(
      "INSERT INTO usuario (email, password, nivell, actiu) VALUES (?, ?, ?, 1)",
      [email, hash, parseInt(nivell, 10)]
    );
    const idusr = insertUserResult.insertId;

    // Asignar cursos válidos
    for (const cursoId of cursosValidos) {
      await query(
        "INSERT INTO cursousr (idusr, idcurso) VALUES (?, ?)",
        [idusr, cursoId]
      );
    }

    // Asignar centro
    await query(
      "INSERT INTO usrcentro (idusr, idcentro) VALUES (?, ?)",
      [idusr, parseInt(centroId, 10)]
    );

    // Enviar email
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
