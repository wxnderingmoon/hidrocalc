// HidroCalc v2 - servidor Express
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const pool = require('./db');
const api = require('./routes/api');

const app = express();
const PUERTO = Number(process.env.PORT || 3000);

// Detrás de Nginx: confiar en el proxy para saber si la petición original fue HTTPS
app.set('trust proxy', 'loopback');
app.disable('x-powered-by');

app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));

// API
app.use('/api', api);

// Verificación de salud: confirma que la base de datos responde
app.get('/salud', async (req, res) => {
  try {
    const r = await pool.query('SELECT current_database() AS base, version() AS version');
    res.json({ estado: 'ok', base: r.rows[0].base, postgres: r.rows[0].version.split(',')[0] });
  } catch (err) {
    res.status(503).json({ estado: 'error', detalle: err.message });
  }
});

// Archivos estáticos: en producción se sirve dist/, en desarrollo src/
const carpeta = fs.existsSync(path.join(__dirname, '..', 'dist')) && process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'dist')
  : path.join(__dirname, '..', 'src');
app.use(express.static(carpeta, { extensions: ['html'] }));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

app.listen(PUERTO, '127.0.0.1', () => {
  console.log(`HidroCalc escuchando en http://127.0.0.1:${PUERTO} (sirviendo ${path.basename(carpeta)}/)`);
});
