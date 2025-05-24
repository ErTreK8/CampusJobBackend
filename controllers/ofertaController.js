// controllers/ofertaController.js
const { query } = require("../config/db"); // ✅ Solo una vez
const { upload } = require("../middleware/multer");

const crearOferta = async (req, res) => {
  const {
    titoloferta,
    descripciooferta,
    tipusjornada,
    fechafin,
    idusrpublica,
    requisitos,
    imgoferte,
    documentadjunto,
    horessetmanals,
    numplacesvacants,
    salariesperat
  } = req.body;
  const { cursoId } = req.params;

  // ✅ Validar campos obligatorios
  if (!titoloferta || !descripciooferta || !tipusjornada || !fechafin || !idusrpublica) {
    return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
  }

  // ✅ Validar campos numéricos y convertir a `NULL` si no son válidos
  const validarNumero = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "NULL" : num;
  };

  const horesSetmanalsValidado = validarNumero(horessetmanals);
  const placesVacantsValidado = validarNumero(numplacesvacants);
  const salarioValidado = validarNumero(salariesperat);

  try {
    // ✅ Validar que el curso exista
    const [curso] = await query("SELECT * FROM curso WHERE idcurso = ?", [
      parseInt(cursoId, 10)
    ]);
    if (!curso || curso.length === 0) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    // ✅ Construir consulta SQL con `"NULL"` para campos vacíos
    const sql = `
      INSERT INTO ofertadetreball (
        idusrpublica, 
        imgoferte, 
        titoloferta, 
        descripciooferta, 
        tipusjornada,
        horessetmanals,
        numplacesvacants,
        presencial,
        salariesperat,
        documentadjunto,
        fechafin,
        idCurso,
        activo
      ) VALUES (
        ${parseInt(idusrpublica, 10)},
        ${imgoferte ? `'${imgoferte}'` : "NULL"},
        '${titoloferta}',
        '${descripciooferta}',
        '${tipusjornada}',
        ${horesSetmanalsValidado},
        ${placesVacantsValidado},
        ${req.body.presencial ? 1 : 0},
        ${salarioValidado},
        ${documentadjunto ? `'${documentadjunto}'` : "NULL"},
        '${fechafin}',
        ${parseInt(cursoId, 10)},
        1
      )
    `;

    // ✅ Ejecutar consulta y capturar resultado
    const result = await query(sql);

    // ✅ Verificar que `result` tenga `insertId`
    if (!result || !result.insertId) {
      throw new Error("No se pudo obtener el ID de la oferta creada");
    }

    // ✅ Insertar requisitos usando el `insertId` del primer insert
    if (Array.isArray(requisitos) && requisitos.length > 0) {
      const values = requisitos.map((req) => `(${result.insertId}, '${req}')`).join(",");
      await query(`INSERT INTO requisitsoferta (idoferta, requisito) VALUES ${values}`);
    }

    return res.json({ success: true, message: "Oferta y requisitos creados correctamente" });
  } catch (error) {
    console.error("Error al crear oferta:", error.message);
    return res.status(500).json({ success: false, message: "Error en el servidor", error: error.message });
  }
};


const getOfertasByCurso = async (req, res) => {
  const idCurso = parseInt(req.params.idCurso, 10);
  if (isNaN(idCurso)) {
    return res.status(400).json({ success: false, message: "ID de curso inválido" });
  }
  try {
    // Validar existencia de curso
    const cursoRows = await query(
      "SELECT * FROM curso WHERE idcurso = ?",
      [idCurso]
    );
    if (!Array.isArray(cursoRows) || cursoRows.length === 0) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    // Traer ofertas activas
    const ofertas = await query(
      "SELECT * FROM ofertadetreball WHERE idCurso = ? AND activo = 1",
      [idCurso]
    );
    return res.json({ success: true, data: ofertas });
  } catch (error) {
    console.error("Error al obtener ofertas por curso:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};


// Obtener todas las ofertas
const obtenerOfertas = async (req, res) => {
  try {
    const rows = await query(
      `SELECT
         idoferta AS id,
         titoloferta AS titulo,
         descripciooferta AS descripcion,
         tipusjornada AS jornada,
         horessetmanals AS horasSemanales,
         numplacesvacants AS vacantes,
         presencial,
         salariesperat AS salario,
         fechapubli AS fechaPublicacion,
         fechafin AS fechaFin
       FROM ofertadetreball`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener las ofertas:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener las ofertas' });
  }
};

module.exports = { crearOferta, getOfertasByCurso, obtenerOfertas };
