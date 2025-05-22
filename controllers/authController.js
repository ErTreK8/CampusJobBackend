// controllers/authController.js
const { query } = require("../config/db");
const bcrypt = require("bcryptjs");

// ✅ Asegúrate de que esta función se exporta correctamente
async function login(req, res) {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ success: false, message: "Faltan credenciales" });
  }

  try {
    // Buscar usuario por nombre o email
    const rows = await query(
      "SELECT idusr, nomusuari, email, password, nivell, actiu, lastSingIn FROM usuario WHERE LOWER(nomusuari) = LOWER(?) OR LOWER(email) = LOWER(?)",
      [usernameOrEmail, usernameOrEmail]
    );

    if (!rows.length) {
      return res.json({ success: false, message: "Credenciales incorrectas" });
    }

    const user = rows[0];

    if (user.actiu !== 1) {
      return res.json({ success: false, message: "Usuario inactivo" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Contraseña incorrecta" });
    }

    // Determinar si es el primer inicio
    const firstLogin = user.lastSingIn === null;

    // Actualizar `lastSingIn` solo si no es el primer inicio y es nivel 0, 1 o 2
    if (!firstLogin && [0, 1, 2].includes(user.nivell)) {
      await query("UPDATE usuario SET lastSingIn = NOW() WHERE idusr = ?", [user.idusr]);
    }

    return res.json({
      success: true,
      message: "Login exitoso",
      idUsuario: user.idusr,
      nivelUsuario: user.nivell,
      firstLogin: firstLogin
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
}

module.exports = { login };