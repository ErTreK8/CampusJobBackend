// controllers/GestionOfertasController.js
const { query } = require("../config/db");
const { sendEmailController } = require("../controllers/emailController");


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

  const getAplicacionesPorOferta = async (req, res) => {
    const { idOferta } = req.params;
  
    try {
      // ✅ Consulta para incluir email, nombre, cognoms y curriculum del usuario
      const sql = `
        SELECT 
          ou.id AS id,
          ou.idusr AS idusr,
          u.email,
          u.nombre,
          u.cognoms,
          u.curriculum,
          ou.Estado,
          u.fotoperfil AS fotoPerfil
        FROM ofertausr ou
        JOIN usuario u ON ou.idusr = u.idusr
        WHERE ou.idoferta = ?
      `;
      const aplicaciones = await query(sql, [idOferta]);
      return res.json({ success: true, data: aplicaciones });
    } catch (error) {
      console.error("Error al obtener aplicaciones:", error.message);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  };
  
  const actualizarEstadoAplicacion = async (req, res) => {
    const { idOferta, idUsr } = req.params;
    const { nuevoEstado } = req.body;
  
    try {
      // ✅ Validar que el nuevo estado sea 1 (Aprobado) o 2 (Rechazado)
      if ([1, 2].indexOf(nuevoEstado) === -1) {
        return res.status(400).json({ success: false, message: "Estado inválido" });
      }
  
      // ✅ Actualizar el estado en la base de datos
      await query(
        `UPDATE ofertausr SET Estado = ? WHERE idoferta = ? AND idusr = ?`,
        [nuevoEstado, idOferta, idUsr]
      );
  
      // ✅ Obtener email del candidato
      const [candidato] = await query(
        "SELECT email FROM usuario WHERE idusr = ?",
        [idUsr]
      );
  
      // ✅ Obtener título de la oferta
      const [oferta] = await query(
        "SELECT titoloferta AS titulo FROM ofertadetreball WHERE idoferta = ?",
        [idOferta]
      );
  
      // ✅ Enviar correo según el estado
      if (nuevoEstado === 1) {
        // Aprobado
        const mensaje = `Felicidades, te han aceptado en la oferta "${oferta.titulo}". La empresa contactará contigo pronto.`;
        await sendEmailController(candidato.email, "Aceptación de Oferta", mensaje);
      } else if (nuevoEstado === 2) {
        // Rechazado
        const mensaje = `Lo sentimos, no has sido aceptado en la oferta "${oferta.titulo}".`;
        await sendEmailController(candidato.email, "Rechazo de Oferta", mensaje);
      }
  
      return res.json({ success: true, message: "Estado actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar estado o enviar correo:", error.message);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  };
  
  module.exports = { getOfertasPropias, getAplicacionesPorOferta, actualizarEstadoAplicacion };