// routes/cursoRoutes.js
const express = require("express");
const router = express.Router();
const { createCurso, getCursosByCentro } = require("../controllers/cursoController");

router.post("/:centroId/curso", createCurso);
router.get("/:centroId/cursos", getCursosByCentro); // 👈 Nueva ruta

module.exports = router;
