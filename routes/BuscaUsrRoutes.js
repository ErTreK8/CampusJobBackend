// routes/BuscaUsrRoutes.js
const express = require("express");
const router = express.Router();
const { searchUsers } = require("../controllers/BuscaUsrController");

// ✅ Ruta completa: /api/buscausr/buscar-usuarios
router.get("/buscar-usuarios", searchUsers);

module.exports = router;