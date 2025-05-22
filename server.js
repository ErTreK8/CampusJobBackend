// server.js

const express = require("express");
const cors    = require("cors");

const authRoutes         = require("./routes/authRoutes");
const emailRoutes        = require("./routes/emailRoutes");
const ofertasRoutes      = require("./routes/ofertasRoutes");
const adminCentroRoutes  = require("./routes/adminCentroRoutes");
const centroRoutes       = require("./routes/centroRoutes");
const usuarioRoutes      = require("./routes/usuarioRoutes");
const cursoRoutes        = require("./routes/cursoRoutes");
const primerInicioRoutes = require("./routes/PrimerInicioRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth",   authRoutes);
app.use("/api/auth",   emailRoutes);
app.use("/api/auth",   ofertasRoutes);

app.use("/api/centro", centroRoutes);
app.use("/api/centro", usuarioRoutes);
app.use("/api/centro", cursoRoutes);

app.use("/api/usuario", primerInicioRoutes);  // <— Asegúrate de este montaje

app.use("/api/adminCentro", adminCentroRoutes);

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
