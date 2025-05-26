const { query } = require("../config/db");

const searchUsers = async (req, res) => {
  const { q, centroId } = req.query;
  const centroIdNum = parseInt(centroId, 10);

  if (!centroIdNum) {
    return res.status(400).json({ success: false, message: "Faltan parámetros" });
  }

  try {
    let sql = `
      SELECT 
        u.idusr AS id,
        u.nomusuari AS username,
        u.nombre AS nombre,
        u.cognoms AS apellido,
        u.nom_empresausr AS empresaNombre,
        u.nivell AS nivel,
        u.fotoperfil
      FROM usuario u
      INNER JOIN usrcentro uc ON u.idusr = uc.idusr
      WHERE u.actiu = 1
        AND uc.idcentro = ${centroIdNum}
    `;

    if (q && q.trim()) {
      sql += ` AND (
        u.nomusuari LIKE '%${q}%' OR 
        u.nombre LIKE '%${q}%' OR 
        u.cognoms LIKE '%${q}%' OR 
        u.nom_empresausr LIKE '%${q}%'
      )`;
    }

    const users = await query(sql);
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error al buscar usuarios:", error.message);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

const getUserById = async (req, res) => {
    const { idUsr } = req.params;
    const userId = parseInt(idUsr, 10);
  
    if (!userId) {
      return res.status(400).json({ success: false, message: "ID de usuario inválido" });
    }
  
    try {
      // ✅ Consulta básica para obtener todos los campos
      const sql = `
        SELECT * 
        FROM usuario 
        WHERE idusr = ?
      `;
  
      const [user] = await query(sql, [userId]);
      if (!user) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }
  
      return res.json({ success: true, data: user });
    } catch (error) {
      console.error("Error al obtener usuario:", error.message);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  };
  
  // ✅ Actualizar perfil según el nivel del usuario
  const updateProfile = async (req, res) => {
    const { idUsr } = req.params;
    const userId = parseInt(idUsr, 10);
  
    if (!userId) {
      return res.status(400).json({ success: false, message: "ID de usuario inválido" });
    }
  
    try {
      const { nivel, nombre, apellido, descripcion, empresaNombre, fotoPerfil, curriculum } = req.body;
  
      let sql = "UPDATE usuario SET ";
      let cambios = [];
  
      // ✅ Siempre incluir `descripcion` si se envía
      if (descripcion !== undefined && descripcion !== null) {
        cambios.push(`descripcio = '${descripcion.replace(/'/g, "''")}'`);
      }
  
      // ✅ Siempre incluir `curriculum` si se envía
      if (curriculum !== undefined && curriculum !== null) {
        cambios.push(`curriculum = '${curriculum.replace(/'/g, "''")}'`);
      }
  
      // ✅ Campos según el nivel del usuario
      if (nivel === "0" || nivel === "2") {
        if (nombre !== undefined) {
          cambios.push(`nombre = '${nombre.replace(/'/g, "''")}'`);
        }
        if (apellido !== undefined) {
          cambios.push(`cognoms = '${apellido.replace(/'/g, "''")}'`);
        }
      } else if (nivel === "1") {
        if (empresaNombre !== undefined) {
          cambios.push(`nom_empresausr = '${empresaNombre.replace(/'/g, "''")}'`);
        }
      }
  
      // ✅ Siempre incluir `fotoPerfil` si se envía
      if (fotoPerfil !== undefined && fotoPerfil !== null) {
        cambios.push(`fotoperfil = '${fotoPerfil.replace(/'/g, "''")}'`);
      }
  
      if (cambios.length === 0) {
        return res.status(400).json({ success: false, message: "No hay cambios que aplicar" });
      }
  
      sql += cambios.join(", ");
      sql += ` WHERE idusr = ${userId}`;
  
      await query(sql);
      return res.json({ success: true, message: "Perfil actualizado exitosamente" });
    } catch (error) {
      console.error("Error al actualizar perfil:", error.message);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  };
  
  
  
  module.exports = { searchUsers, getUserById, updateProfile };