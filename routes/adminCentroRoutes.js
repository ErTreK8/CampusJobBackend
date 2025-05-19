const express = require('express');
const router = express.Router();
const { createCentroYUsuario } = require('../controllers/adminCentroController');

router.post('/crear', createCentroYUsuario);

module.exports = router;