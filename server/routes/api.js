// Rutas de la API de HidroCalc
const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');

const router = express.Router();

// Lista de municipios para el selector del formulario
router.get('/municipios', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, nombre FROM municipios ORDER BY nombre');
    res.json(rows);
  } catch (err) { next(err); }
});

// Reglas de validación con express-validator
const reglas = [
  body('personas').isInt({ min: 1, max: 20 }).withMessage('personas debe estar entre 1 y 20').toInt(),
  body('ducha').isInt({ min: 0, max: 60 }).withMessage('ducha debe estar entre 0 y 60').toInt(),
  body('inodoro').isInt({ min: 0, max: 20 }).withMessage('inodoro debe estar entre 0 y 20').toInt(),
  body('lavadora').isInt({ min: 0, max: 30 }).withMessage('lavadora debe estar entre 0 y 30').toInt(),
  body('riego').isInt({ min: 0, max: 600 }).withMessage('riego debe estar entre 0 y 600').toInt(),
  body('litrosDia').isFloat({ min: 0, max: 100000 }).withMessage('litrosDia no es válido').toFloat(),
  body('municipioId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('municipio no válido').toInt(),
  body('aceptaAviso').equals('true').withMessage('Debes aceptar el Aviso de Privacidad')
];

// Guarda un cálculo de forma anónima
router.post('/calculos', reglas, async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array().map(e => e.msg) });
  }
  const d = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO calculos (municipio_id, personas, ducha_min, inodoro_veces, lavadora_cargas,
                             riego_min, litros_dia, litros_persona)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, creado_en`,
      [d.municipioId || null, d.personas, d.ducha, d.inodoro, d.lavadora, d.riego,
        d.litrosDia, d.litrosDia / d.personas]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// Estadísticas generales y por municipio
router.get('/estadisticas', async (req, res, next) => {
  try {
    const general = await pool.query(
      `SELECT COUNT(*)::int AS total,
              COALESCE(ROUND(AVG(litros_persona), 1), 0)::float AS promedio_persona
         FROM calculos`);
    const porMunicipio = await pool.query(
      `SELECT m.nombre, COUNT(c.id)::int AS total,
              ROUND(AVG(c.litros_persona), 1)::float AS promedio_persona
         FROM calculos c JOIN municipios m ON m.id = c.municipio_id
        GROUP BY m.nombre
        ORDER BY total DESC, m.nombre
        LIMIT 5`);
    res.json({ ...general.rows[0], municipios: porMunicipio.rows });
  } catch (err) { next(err); }
});

module.exports = router;
