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
    const { nivel, ...updates } = req.body;
  
    if (!userId || !nivel) {
      return res.status(400).json({ success: false, message: "Datos incompletos" });
    }
  
    try {
      let sql = "UPDATE usuario SET ";
      let values = [];
  
      // ✅ Campos comunes
      if (nivel === "0" || nivel === "1" || nivel === "2") {
        sql += "email = ?";
        values.push(updates.email || null);
      }
  
      // ✅ Campos específicos por nivel
      if (nivel === "1") {
        sql += ", nom_empresausr = ?, identificador = ?, telefono = ?";
        values.push(updates.empresaNombre || null);
        values.push(updates.nif || null);
        values.push(updates.telefono || null);
      } else if (nivel === "0") {
        sql += ", nombre = ?, cognoms = ?, curriculum = ?";
        values.push(updates.nombre || null);
        values.push(updates.apellido || null);
        values.push(updates.curriculum || null);
      } else if (nivel === "2") {
        sql += ", nombre = ?, cognoms = ?, especialidad = ?, experiencia = ?";
        values.push(updates.nombre || null);
        values.push(updates.apellido || null);
        values.push(updates.especialidad || null);
        values.push(updates.experiencia || null);
      }
  
      sql += " WHERE idusr = ?";
      values.push(userId);
  
      // ✅ Ejecutar actualización
      await query(sql, values);
      return res.json({ success: true, message: "Perfil actualizado" });
    } catch (error) {
      console.error("Error al actualizar perfil:", error.message);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  };
  
  module.exports = { searchUsers, getUserById, updateProfile };