// routes/GestionOfertasRoutes.js
const express = require("express");
const router = express.Router();
const { getOfertasPropias } = require("../controllers/GestionOfertasController");

// ✅ Ruta para obtener todas las ofertas de la empresa (sin filtros)
router.get("/:idUsrEmpresa/ofertas", getOfertasPropias);

// ✅ Ruta para obtener información de una oferta específica

module.exports = router;