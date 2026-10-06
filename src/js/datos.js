/*
 * HidroCalc - datos de referencia
 * Litros aproximados por actividad (valores de referencia para uso doméstico).
 */
const CONSUMO = {
  regaderaPorMinuto: 10,     // regadera convencional, litros por minuto
  inodoroPorDescarga: 6,     // inodoro de bajo consumo, litros por descarga
  lavadoraPorCarga: 80,      // lavadora automática, litros por carga
  riegoPorMinuto: 12,        // manguera abierta, litros por minuto
  cocinaYLimpiezaPorPersona: 20 // cocinar, beber, lavar trastes y limpieza
};

// Referencia de consumo responsable por persona al día (litros)
const REFERENCIA_POR_PERSONA = 100;

const CONSEJOS = [
  { titulo: 'Regaderazos de 5 minutos', texto: 'Bajar de 8 a 5 minutos ahorra alrededor de 30 litros por persona cada día.' },
  { titulo: 'Cubeta en la regadera', texto: 'Junta el agua fría mientras sale la caliente y úsala para el inodoro o para trapear.' },
  { titulo: 'Lavadora a carga completa', texto: 'Juntar la ropa para hacer menos cargas reduce el consumo semanal sin esfuerzo.' },
  { titulo: 'Revisa fugas', texto: 'Una fuga en el inodoro puede desperdiciar más de 100 litros al día sin que se note.' },
  { titulo: 'Riega temprano o de noche', texto: 'Con menos sol se evapora menos agua; usar regadera en lugar de manguera también ayuda.' },
  { titulo: 'Cierra la llave', texto: 'Mientras te lavas los dientes o enjabonas los trastes, la llave cerrada ahorra varios litros.' }
];
