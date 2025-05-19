const pool = require('../config/db');

// Crear oferta
const crearOferta = async (req, res) => {
  const {
    titoloferta,
    descripciooferta,
    tipusjornada,
    horessetmanals,
    numplacesvacants,
    presencial,
    salariesperat,
    fechafin,
    idusrpublica
  } = req.body;

  // Obtener nombres de los archivos subidos
  const imgoferte = req.files?.imgoferte ? req.files.imgoferte[0].filename : null;
  const documentadjunto = req.files?.documentadjunto ? req.files.documentadjunto[0].filename : null;

  // Validación básica
  if (!titoloferta || !descripciooferta || !tipusjornada || !fechafin || !idusrpublica) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios'
    });
  }

  try {
    await pool.query(
      `INSERT INTO ofertadetreball 
      (idusrpublica, imgoferte, titoloferta, descripciooferta, tipusjornada, 
      horessetmanals, numplacesvacants, presencial, salariesperat, documentadjunto, fechafin) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idusrpublica,
        imgoferte,
        titoloferta,
        descripciooferta,
        tipusjornada,
        horessetmanals || null,
        numplacesvacants || null,
        presencial ? 1 : 0,
        salariesperat || null,
        documentadjunto,
        fechafin
      ]
    );

    res.json({
      success: true,
      message: 'Oferta creada correctamente'
    });

  } catch (error) {
    console.error('Error al insertar oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al crear la oferta',
      error: error.message
    });
  }
};

// Obtener todas las ofertas
const obtenerOfertas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          idoferta as id,
          titoloferta as titulo,
          descripciooferta as descripcion,
          tipusjornada as jornada,
          horessetmanals as horasSemanales,
          numplacesvacants as vacantes,
          presencial,
          salariesperat as salario,
          fechapubli as fechaPublicacion,
          fechafin as fechaFin
      FROM ofertadetreball
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener las ofertas:', error);
    res.status(500).json({ error: 'Error al obtener las ofertas' });
  }
};

module.exports = { crearOferta, obtenerOfertas };