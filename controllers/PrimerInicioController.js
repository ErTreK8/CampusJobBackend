const { query } = require("../config/db");
const bcrypt = require("bcryptjs");

const completarPerfil = async (req, res) => {
  const { nivelUsuarioAux } = req.params;
  const {
    idUsuario,
    nif,
    nombre,
    nombreUsuario,
    contrasena,
    confirmarContrasena,
    descripcion,
    nomEmpresa,
    cognoms
  } = req.body;

  // Validaciones básicas
  if (!idUsuario || !nivelUsuarioAux) {
    return res.status(400).json({ success: false, message: "Faltan datos en la solicitud" });
  }

  try {
    // 1. Verificar que el usuario exista
    const userRows = await query("SELECT * FROM usuario WHERE idusr = ?", [parseInt(idUsuario, 10)]);
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const nivel = userRows[0].nivell;
    const nivelValido = parseInt(nivelUsuarioAux);
    if (nivel !== nivelValido) {
      return res.status(403).json({ success: false, message: "Nivel de usuario inválido" });
    }

    // 2. Validaciones comunes
    if (!nombreUsuario || !contrasena || !confirmarContrasena) {
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }

    if (contrasena !== confirmarContrasena) {
      return res.status(400).json({ success: false, message: "Contraseñas no coinciden" });
    }

    // 3. Validaciones específicas por nivel
    if (nivelValido === 1 && !nomEmpresa) {
      return res.status(400).json({ success: false, message: "Nombre de empresa obligatorio" });
    }

    if (nivelValido === 0 && (!nombre || !cognoms)) {
      return res.status(400).json({ success: false, message: "Nombre y apellidos obligatorios" });
    }

    if (nivelValido === 2 && !nif) {
      return res.status(400).json({ success: false, message: "DNI obligatorio para Profesor" });
    }

    // 4. Verificar unicidad de nombre de usuario
    const [existingUsername] = await query(
      "SELECT idusr FROM usuario WHERE nomusuari = ? AND idusr != ?",
      [nombreUsuario, idUsuario]
    );
    if (existingUsername?.length > 0) {
      return res.status(400).json({ success: false, message: "Nombre de usuario ya en uso" });
    }

    // 5. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // 6. Construir consulta SQL con valores interpolados
    let sql = "";

    if (nivelValido === 1) {
      // Empresa
      sql = `
        UPDATE usuario SET 
          nomusuari = '${nombreUsuario}',
          password = '${hashedPassword}',
          actiu = 1,
          identificador = '${nif}',
          nom_empresausr = '${nomEmpresa}',
          descripcio = '${descripcion}',
          lastSingIn = NOW()
        WHERE idusr = ${parseInt(idUsuario, 10)}
      `;
    } else if (nivelValido === 0) {
      // Alumno
      sql = `
        UPDATE usuario SET 
          nomusuari = '${nombreUsuario}',
          password = '${hashedPassword}',
          actiu = 1,
          identificador = '${nif}',
          nombre = '${nombre}',
          cognoms = '${cognoms}',
          lastSingIn = NOW()
        WHERE idusr = ${parseInt(idUsuario, 10)}
      `;
    } else if (nivelValido === 2) {
      // Profesor
      sql = `
        UPDATE usuario SET 
          nomusuari = '${nombreUsuario}',
          password = '${hashedPassword}',
          actiu = 1,
          identificador = '${nif}',
          nombre = '${nombre}',
          descripcio = '${descripcion}',
          lastSingIn = NOW()
        WHERE idusr = ${parseInt(idUsuario, 10)}
      `;
    }

    // 7. Ejecutar consulta SQL construida
    console.log("Ejecutando consulta:", sql);
    //await query(sql); // ✅ Ahora no pasamos un array de valores

    // 8. Actualizar foto si existe
    if (req.body.fotoPerfil) {
      const fotoPerfil = req.body.fotoPerfil;
      await query(
        `UPDATE usuario SET fotoperfil = '${fotoPerfil}' WHERE idusr = ${parseInt(idUsuario, 10)}`,
        []
      );
    }

    return res.json({ success: true, message: "Perfil actualizado exitosamente" });

  } catch (error) {
    console.error("Error al completar perfil:", error.message);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

module.exports = { completarPerfil };