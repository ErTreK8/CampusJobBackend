const express = require('express');
const router = express.Router();

const { crearOferta, obtenerOfertas } = require('../controllers/ofertaController');
const upload = require('../middleware/multer'); // Ajusta esta ruta según donde tengas multer.js


// Ruta para crear oferta, aceptando dos archivos diferentes
router.post('/crearOferta', upload.fields([
  { name: 'imgoferte', maxCount: 1 },
  { name: 'documentadjunto', maxCount: 1 }
]), crearOferta);
router.get('/ofertas', obtenerOfertas);

module.exports = router;