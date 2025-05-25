// server.js
const express = require("express");
const cors = require("cors");

const buscaUsrRoutes = require("./routes/BuscaUsrRoutes");

const authRoutes = require("./routes/authRoutes");
const emailRoutes = require("./routes/emailRoutes");
const ofertasRoutes = require("./routes/ofertasRoutes");
const adminCentroRoutes = require("./routes/adminCentroRoutes");
const centroRoutes = require("./routes/centroRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes"); 
const cursoRoutes = require("./routes/cursoRoutes");
const getsionOfertaRoutes = require("./routes/GestionOfertasRoutes");


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Montar rutas en sus puntos correctos
app.use("/api/auth", authRoutes);
app.use("/api/auth", emailRoutes);
app.use("/api/centro", ofertasRoutes);
app.use("/api/centro", centroRoutes);
app.use("/api/centro", usuarioRoutes); 
app.use("/api/centro", cursoRoutes); 
app.use("/api/buscausr", buscaUsrRoutes); 
app.use("/api/empresa", getsionOfertaRoutes);



app.use("/api/adminCentro", adminCentroRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});