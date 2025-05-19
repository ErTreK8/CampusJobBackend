const pool = require('../config/db');

const getAllCentros = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         c.idcentro,
         c.nombreCentro,
         c.logoCentro,
         c.email,
         c.telefono,
         c.idUsrAdmin,
         u.nomusuari AS adminNombre
       FROM centro c
       INNER JOIN usuario u ON c.idUsrAdmin = u.idusr`
    );
    
    return res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener centros:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los centros'
    });
  }
};

module.exports = { getAllCentros };