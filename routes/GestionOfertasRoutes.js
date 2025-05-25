// routes/GestionOfertasRoutes.js
const express = require("express");
const router = express.Router();
const { getOfertasPropias, getAplicacionesPorOferta, actualizarEstadoAplicacion } = require("../controllers/GestionOfertasController");

// ✅ Ruta para obtener todas las ofertas de la empresa
router.get("/:idUsrEmpresa/ofertas", getOfertasPropias);

router.get("/:idOferta/aplicaciones", getAplicacionesPorOferta);

// ✅ Ruta para actualizar estado de aplicación
router.patch("/:idOferta/actualizar-estado/:idUsr", actualizarEstadoAplicacion);

module.exports = router;