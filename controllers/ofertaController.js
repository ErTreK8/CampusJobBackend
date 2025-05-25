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

  if (!titoloferta || !descripciooferta || !tipusjornada || !fechafin || !idusrpublica) {
    return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
  }

  const validarNumero = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "NULL" : num;
  };

  const horesSetmanalsValidado = validarNumero(horessetmanals);
  const placesVacantsValidado = validarNumero(numplacesvacants);
  const salarioValidado = validarNumero(salariesperat);

  try {
    const [curso] = await query("SELECT * FROM curso WHERE idcurso = ?", [
      parseInt(cursoId, 10)
    ]);
    if (!curso || curso.length === 0) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

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
        activo,
        fechapubli
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
        1,
        NOW()
      )
    `;

    const result = await query(sql);

    if (!result || !result.insertId) {
      throw new Error("No se pudo obtener el ID de la oferta creada");
    }

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

    // Obtener las ofertas con la misma estructura que `obtenerOfertas`
    const ofertas = await query(
      `SELECT
         o.idoferta AS id,
         o.titoloferta AS titulo,
         o.descripciooferta AS descripcion,
         o.tipusjornada AS jornada,
         o.horessetmanals AS horasSemanales,
         o.numplacesvacants AS vacantes,
         o.presencial,
         o.salariesperat AS salario,
         o.fechapubli AS fechaPublicacion,
         o.fechafin AS fechaFin,
         o.imgoferte AS imgoferte,
         c.nombrecentro AS empresa,
         c.email AS ubicacion,
         u.nomusuari AS contacto
       FROM ofertadetreball o
       JOIN curso cu ON o.idCurso = cu.idcurso
       JOIN centro c ON cu.idcentro = c.idcentro
       JOIN usuario u ON o.idusrpublica = u.idusr
       WHERE o.idCurso = ? AND o.activo = 1`,
      [idCurso]
    );

    return res.json({ success: true, data: ofertas });
  } catch (error) {
    console.error("Error al obtener ofertas por curso:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};



const getOfertaById = async (req, res) => {
  const idOferta = parseInt(req.params.idOferta, 10);
  if (isNaN(idOferta)) {
    return res.status(400).json({ success: false, message: "ID de oferta inválido" });
  }
  try {
    const oferta = await query(`
      SELECT * FROM ofertadetreball WHERE idoferta = ?
    `, [idOferta]);

    const requisitos = await query(`
      SELECT requisito FROM requisitsoferta WHERE idoferta = ?
    `, [idOferta]);

    return res.json({ success: true, oferta: oferta[0], requisitos });
  } catch (error) {
    console.error("Error al obtener oferta:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

const enviarCV = async (req, res) => {
  const idOferta = parseInt(req.params.idOferta, 10);
  const idUsr = parseInt(req.body.idUsr, 10); // ✅ Ahora se recibe desde el cuerpo

  if (!idOferta || !idUsr) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
  }

  try {
    // ✅ Verificar que el usuario tenga un CV subido
    const [user] = await query("SELECT curriculum FROM usuario WHERE idusr = ?", [idUsr]);
    if (!user || !user.curriculum) {
      return res.status(400).json({ success: false, message: "El usuario no tiene CV subido" });
    }

    // ✅ Insertar en ofertausr con estado 0
    await query(
      "INSERT INTO ofertausr (idoferta, idusr, Estado) VALUES (?, ?, 0)",
      [idOferta, idUsr]
    );

    return res.json({ success: true, message: "CV enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar CV:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

module.exports = { crearOferta, getOfertasByCurso, getOfertaById, enviarCV };

