// controllers/centroController.js
const { query } = require("../config/db");

const getAllCentros = async (req, res) => {
  try {
    const rows = await query(
      `SELECT 
         c.idcentro,
         c.nombreCentro,
         c.logoCentro,
         c.email,
         c.telefono,
         c.idUsrAdmin,
         u.nomusuari AS adminNombre
       FROM centro c
       INNER JOIN usuario u ON c.idUsrAdmin = u.idusr
       ORDER BY c.nombreCentro ASC
       LIMIT 100`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error al obtener centros:", error.message);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

module.exports = { getAllCentros };
