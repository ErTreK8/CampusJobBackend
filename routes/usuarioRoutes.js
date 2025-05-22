const express = require("express");
const router = express.Router();
const { crearUsuario } = require("../controllers/usuarioController");

// Crear usuario y asignar cursos
router.post("/:centroId/usuario", crearUsuario);

module.exports = router;