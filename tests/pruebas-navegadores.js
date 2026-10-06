/*
 * Pruebas funcionales de HidroCalc en distintos navegadores (Chrome y Firefox).
 *
 * Uso:
 *   NAVEGADOR=chrome  RUTA_NAVEGADOR=/usr/bin/google-chrome node tests/pruebas-navegadores.js
 *   NAVEGADOR=firefox RUTA_NAVEGADOR=/usr/bin/firefox        node tests/pruebas-navegadores.js
 *
 * Variables opcionales: URL_BASE (por defecto https://hidrocalc.local:8443/),
 * CAPTURAS (carpeta para guardar capturas), ARGS_EXTRA (JSON con argumentos del navegador).
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const NAVEGADOR = process.env.NAVEGADOR || 'chrome';
const URL_BASE = process.env.URL_BASE || 'https://hidrocalc.local:8443/';
const CAPTURAS = process.env.CAPTURAS || path.join(__dirname, 'capturas');
const ARGS_EXTRA = JSON.parse(process.env.ARGS_EXTRA || '[]');
fs.mkdirSync(CAPTURAS, { recursive: true });

const resultados = [];
async function prueba(nombre, fn) {
  try {
    await fn();
    resultados.push(['OK', nombre]);
  } catch (e) {
    resultados.push(['FALLA', nombre + ' -> ' + e.message]);
  }
}
function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}
const esperar = ms => new Promise(r => setTimeout(r, ms));
// Espera hasta que una condición sobre un elemento se cumpla (sin waitForFunction, compatible con CSP)
async function esperarHasta(page, selector, condicion, ms = 5000) {
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    try { if (await page.$eval(selector, condicion)) return; } catch (e) { /* aún no existe */ }
    await esperar(150);
  }
  throw new Error('tiempo de espera agotado en ' + selector);
}

(async () => {
  const opciones = {
    executablePath: process.env.RUTA_NAVEGADOR,
    headless: process.env.HEADLESS === 'shell' ? 'shell' : true,
    acceptInsecureCerts: true,
    defaultViewport: { width: 1280, height: 860 },
    args: ARGS_EXTRA
  };
  if (NAVEGADOR === 'firefox') {
    opciones.browser = 'firefox';
    opciones.extraPrefsFirefox = { 'network.dns.localDomains': 'hidrocalc.local', 'network.proxy.type': 0 };
  }
  const browser = await puppeteer.launch(opciones);
  const version = await browser.version();
  const page = await browser.newPage();

  await prueba('La página principal carga por HTTPS', async () => {
    const r = await page.goto(URL_BASE, { waitUntil: 'networkidle0' });
    afirmar(r.status() === 200, 'estado ' + r.status());
    afirmar((await page.title()).includes('HidroCalc'), 'título incorrecto');
    afirmar(page.url().startsWith('https://'), 'no usa HTTPS');
  });

  await prueba('El selector de municipios se llena desde la API', async () => {
    await esperarHasta(page, '#municipio', s => s.options.length > 1);
    const n = await page.$$eval('#municipio option', o => o.length);
    afirmar(n === 13, 'se esperaban 13 opciones y hay ' + n);
  });

  await prueba('El cálculo con los valores de ejemplo da 617 L', async () => {
    await page.click('#form-consumo button[type=submit]');
    await esperarHasta(page, '#resultado', e => !!e.querySelector('.resultado__total'));
    const total = await page.$eval('.resultado__total', e => e.textContent);
    afirmar(total.includes('617'), 'total obtenido: ' + total);
  });

  await prueba('No permite guardar sin aceptar el Aviso de Privacidad', async () => {
    await page.click('#form-guardar button[type=submit]');
    await esperar(300);
    const visible = await page.$eval('#error-guardar', e => !e.hidden);
    afirmar(visible, 'no se mostró el mensaje de error');
  });

  await prueba('Guarda el resultado en PostgreSQL y devuelve un folio', async () => {
    await page.select('#municipio', await page.$eval('#municipio option:nth-child(6)', o => o.value));
    await page.click('#acepta');
    await page.click('#form-guardar button[type=submit]');
    await esperarHasta(page, '#ok-guardar', e => !e.hidden);
    const texto = await page.$eval('#ok-guardar', e => e.textContent);
    afirmar(/folio #\d+/.test(texto), texto);
  });

  await page.$eval('#form-guardar', e => e.scrollIntoView({ block: 'center' })).catch(() => {});
  await esperar(400);
  await page.screenshot({ path: path.join(CAPTURAS, `${NAVEGADOR}_guardado.png`) });

  await prueba('Las estadísticas de la comunidad se actualizan', async () => {
    await esperarHasta(page, '#estadisticas', e => e.textContent.includes('cálculos'));
  });

  await prueba('La validación rechaza datos fuera de rango', async () => {
    await page.$eval('#personas', e => { e.value = 0; });
    await page.click('#form-consumo button[type=submit]');
    const visible = await page.$eval('#error', e => !e.hidden);
    afirmar(visible, 'no apareció el error');
  });

  await prueba('El pie de página enlaza al Aviso de Privacidad y a los Términos', async () => {
    const enlaces = await page.$$eval('.pie__legal a', as => as.map(a => a.getAttribute('href')));
    afirmar(enlaces.includes('aviso-privacidad.html') && enlaces.includes('terminos.html'), enlaces.join(','));
    const r = await page.goto(URL_BASE + 'aviso-privacidad.html', { waitUntil: 'networkidle0' });
    afirmar(r.status() === 200, 'estado ' + r.status());
  });
  await page.screenshot({ path: path.join(CAPTURAS, `${NAVEGADOR}_aviso.png`) });

  await prueba('El servidor envía los encabezados de seguridad', async () => {
    const r = await page.goto(URL_BASE, { waitUntil: 'networkidle0' });
    const h = r.headers();
    afirmar(h['strict-transport-security'], 'falta HSTS');
    afirmar(h['content-security-policy'], 'falta CSP');
  });
  await page.screenshot({ path: path.join(CAPTURAS, `${NAVEGADOR}_inicio.png`) });

  await browser.close();
  console.log(`Navegador: ${version}`);
  console.log(`URL: ${URL_BASE}`);
  resultados.forEach(([estado, nombre]) => console.log(`[${estado.padEnd(5)}] ${nombre}`));
  const fallas = resultados.filter(r => r[0] !== 'OK').length;
  console.log(`\n${resultados.length - fallas} de ${resultados.length} pruebas aprobadas`);
  process.exit(fallas ? 1 : 0);
})();
