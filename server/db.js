// Conexión a PostgreSQL con un pool de conexiones (paquete pg)
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'hidrocalc',
  user: process.env.DB_USER || 'hidrocalc_app',
  password: process.env.DB_PASSWORD,
  max: 10
});

module.exports = pool;
