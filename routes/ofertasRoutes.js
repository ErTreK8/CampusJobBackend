const express = require('express');
const router = express.Router();

const { crearOferta, obtenerOfertas } = require('../controllers/ofertaController');

router.post('/crearOferta', crearOferta);
router.get('/ofertas', obtenerOfertas);

module.exports = router;