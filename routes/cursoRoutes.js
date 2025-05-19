const express = require('express');
const router = express.Router();
const { getCursosByCentro } = require('../controllers/cursoController');

// Ruta protegida con validación de rol y centro
router.get('/:id/curso', getCursosByCentro);

module.exports = router;