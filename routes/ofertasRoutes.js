// routes/ofertasRoutes.js
const express = require("express");
const router = express.Router();
const { crearOferta, getOfertasByCurso, getOfertaById, enviarCV } = require("../controllers/ofertaController");
const upload = require("../middleware/multer");

// ✅ Nueva ruta: /api/centro/curso/5/oferta
router.post("/curso/:cursoId/crearOferta", upload.fields([
  { name: "imgoferte", maxCount: 1 },
  { name: "documentadjunto", maxCount: 1 }
]), crearOferta);

// Ruta para obtener ofertas por curso (ya existe)
router.get("/curso/:idCurso/ofertas", getOfertasByCurso);
router.get("/curso/:idOferta/verOferta", getOfertaById);
router.post("/curso/:idOferta/enviarCvOferta", enviarCV);

module.exports = router;