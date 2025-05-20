const { query } = require("../config/db"); // ✅ Usamos el helper `query`
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Faltan credenciales" });
  }

  try {
    // ✅ Usamos `query()` directamente sin necesidad de getConnection()
    const [rows] = await query(
      "SELECT idusr, nivell, password, actiu FROM usuario WHERE nomusuari = ?",
      [username]
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
      return res.json({ success: false, message: "Credenciales incorrectas" });
    }

    return res.json({
      success: true,
      message: "Login exitoso",
      idUsuario: user.idusr,
      nivelUsuario: user.nivell,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

module.exports = { login };