// routes/BuscaUsrRoutes.js
const express = require("express");
const router = express.Router();
const { searchUsers, getUserById, updateProfile } = require("../controllers/BuscaUsrController");

// ✅ Ruta para buscar usuarios
router.get("/buscar-usuarios", searchUsers);

// ✅ Ruta para obtener perfil
router.get("/perfil/:idUsr", getUserById); // GET /api/buscausr/perfil/1

// ✅ Ruta para actualizar perfil
router.post("/perfil/:idUsr/editar", updateProfile); // POST /api/buscausr/perfil/1/editar

module.exports = router;