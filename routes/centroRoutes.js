const express = require('express');
const router = express.Router();
const { getAllCentros } = require('../controllers/centroController');

// Obtener todos los centros
router.get('/all', getAllCentros);

module.exports = router;