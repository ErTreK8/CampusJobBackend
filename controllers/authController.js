// controllers/authController.js
const { query } = require("../config/db");
const bcrypt = require("bcryptjs");

async function login(req, res) {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ success: false, message: "Faltan credenciales" });
  }

  try {
    const rows = await query(
      "SELECT idusr, nomusuari, email, password, nivell, actiu, lastSingIn FROM usuario WHERE LOWER(nomusuari)=LOWER(?) OR LOWER(email)=LOWER(?)",
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

    const firstLogin = user.lastSingIn === null;
    let idCentro = null;

    // Para niveles 0,1,2
    if ([0, 1, 2].includes(user.nivell)) {
      const usrcentro = await query(
        "SELECT idcentro FROM usrcentro WHERE idusr = ?",
        [user.idusr]
      );
      //console.log("usrcentro rows:", usrcentro);
      if (usrcentro.length > 0) {
        idCentro = usrcentro[0].idcentro;
      }
    }
    // Para nivel 3
    else if (user.nivell === 3) {
      const centro = await query(
        "SELECT idcentro FROM centro WHERE idusradmin = ?",
        [user.idusr]
      );
      //console.log("centro rows:", centro);
      if (centro.length > 0) {
        idCentro = centro[0].idcentro;
      }
    }

    if(!isFinite(idCentro))
    {
      return res.json({ success: false, message: "Este usuario no esta asignado a ningun centro" });

    }
    if (!firstLogin && [0, 1, 2].includes(user.nivell)) {
      await query("UPDATE usuario SET lastSingIn = NOW() WHERE idusr = ?", [user.idusr]);
    }

    //console.log("Resolved idCentro:", idCentro);
    return res.json({
      success: true,
      message: "Login exitoso",
      idUsuario: user.idusr,
      nivelUsuario: user.nivell,
      firstLogin,
      idCentro
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
}

module.exports = { login };
