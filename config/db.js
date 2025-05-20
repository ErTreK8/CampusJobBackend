// config/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

/**
 * Abre una conexión, ejecuta la consulta y la cierra.
 * Devuelve el resultado de la misma.
 */
async function query(sql, params = []) {
  const conn = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } finally {
    await conn.end();  // CIERRA la conexión tras cada consulta
  }
}

module.exports = { query };
