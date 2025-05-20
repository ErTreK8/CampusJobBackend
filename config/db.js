// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Ajustamos el pool a 1 conexión y sin cola infinita
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1,  // ⚠️ Limitado a 1 conexión (según tu hosting)
  queueLimit: 5,       // Máximo 5 usuarios en cola (evita saturación)
  enableKeepAlive: true, // Mantiene la conexión activa
  keepAliveInitialDelay: 10000, // Reutiliza conexiones activas
});

// Verificar conexión al arrancar
pool.getConnection()
  .then((connection) => {
    console.log("[DB] Conexión inicial exitosa");
    connection.release(); // Libera la conexión después de validar
  })
  .catch((err) => {
    console.error("[DB] Error al conectar:", err.sqlMessage);
  });

module.exports = pool;