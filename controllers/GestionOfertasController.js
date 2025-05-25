// controllers/GestionOfertasController.js
const { query } = require("../config/db");

// ✅ Cargar todas las ofertas de la empresa sin filtrar por fecha o estado
const getOfertasPropias = async (req, res) => {
    const { idUsrEmpresa } = req.params;
  
    try {
      // ✅ Consulta básica para obtener todas las ofertas de la empresa
      const sql = `
        SELECT * 
        FROM ofertadetreball 
        WHERE idusrpublica = ?
      `;
  
      const ofertas = await query(sql, [idUsrEmpresa]);
      //console.log(ofertas);
      
      // ✅ Verificar si hay ofertas
      if (ofertas.length === 0) {
        return res.json({ success: true, data: [] });
      }
      return res.json({ success: true, data: ofertas });
    } catch (error) {
      console.error("Error al obtener ofertas:", error.message);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  };


module.exports = { getOfertasPropias };