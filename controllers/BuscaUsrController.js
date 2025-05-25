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

module.exports = { searchUsers };