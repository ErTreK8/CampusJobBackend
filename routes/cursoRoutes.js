// routes/cursoRoutes.js

const express = require("express");
const router  = express.Router();
const { createCurso } = require("../controllers/cursoController");

// POST /api/centro/:centroId/curso
router.post("/:centroId/curso", createCurso);

module.exports = router;
