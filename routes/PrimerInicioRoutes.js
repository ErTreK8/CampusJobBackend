// routes/PrimerInicioRoutes.js
const express = require("express");
const router = express.Router();
const { completarPerfil } = require("../controllers/PrimerInicioController");

// ✅ Nivel en la URL, idUsuario en el cuerpo
router.post("/:nivelUsuarioAux/completar-perfil", completarPerfil);

module.exports = router;