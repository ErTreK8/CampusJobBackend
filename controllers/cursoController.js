const { query } = require("../config/db");

const createCurso = async (req, res) => {
  const { nombre, descripcion, foto, idUsuario, nivelUsuario } = req.body;
  const { centroId } = req.params;

  if (!nombre || !descripcion || !centroId || !idUsuario || nivelUsuario === undefined) {
    return res.status(400).json({ success: false, message: 'Faltan campos' });
  }
  try {
    const centroIdNum = parseInt(centroId, 10);
    if (isNaN(centroIdNum)) {
      return res.status(400).json({ success: false, message: 'ID del centro inválido' });
    }
    console.log(`${centroId}`);

    const [centro] = await query('SELECT * FROM centro WHERE idcentro = ?', [centroIdNum]);
    if (!centro || centro.length === 0) {
      return res.status(404).json({ success: false, message: 'Centro no encontrado' });
    }
    const [user] = await query(
      'SELECT idusr, nivell FROM usuario WHERE idusr = ?', 
      [idUsuario]
    );
    if (!user || user.length === 0) {
      
      return res.status(404).json({ success: false, message: 'Centro no encontrado' });
    }

    if (parseInt(nivelUsuario) === 3 && user[0].idcentro !== centroIdNum) {
      return res.status(403).json({ success: false, message: 'No tienes acceso a este centro' });
    }

    if (![4, 3].includes(parseInt(nivelUsuario))) {
      return res.status(403).json({ success: false, message: 'Permiso insuficiente' });
    }

    const result = await query(
      'INSERT INTO curso (nomcurs, desccurs, fotoCurso, idcentro) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, foto || null, centroIdNum]
    );

    return res.json({
      success: true,
      message: 'Curso creado exitosamente',
      data: { idCurso: result.insertId, nombre, descripcion, centroId: centroIdNum }
    });

  } catch (error) {
    console.error('Error al crear curso:', error.message);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// ✅ Obtener cursos por centro (solo campos existentes)
// controllers/cursoController.js
const getCursosByCentro = async (req, res) => {
  const { centroId } = req.params;
  const { idUsuario, nivelUsuario } = req.query;

  if (!centroId) {
    return res.status(400).json({ success: false, message: "Falta el ID del centro" });
  }

  try {
    const nivel = parseInt(nivelUsuario, 10);

    let cursos;
    if ([3, 4].includes(nivel)) {
      // AdminCentro/Supremo → todos los cursos del centro
      cursos = await query(
        "SELECT * FROM curso WHERE idcentro = ?",
        [parseInt(centroId, 10)]
      );
    } else {
      // Alumno/Empresa/Profesor → sólo los suyos
      if (!idUsuario) {
        return res.json({ success: true, data: [] });
      }
      cursos = await query(
        `SELECT c.* 
           FROM curso c
           JOIN cursousr cu ON cu.idcurso = c.idcurso
          WHERE cu.idusr = ?
            AND c.idcentro = ?`,
        [parseInt(idUsuario, 10), parseInt(centroId, 10)]
      );
    }

    return res.json({ success: true, data: cursos });
  } catch (error) {
    console.error("Error al obtener cursos:", error.message);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

module.exports = { createCurso, getCursosByCentro };