/*
 * HidroCalc - lógica de la calculadora y conexión con la API
 */
(function () {
  'use strict';

  const form = document.getElementById('form-consumo');
  const resultado = document.getElementById('resultado');
  const error = document.getElementById('error');
  const listaConsejos = document.getElementById('lista-consejos');
  const formGuardar = document.getElementById('form-guardar');
  const selMunicipio = document.getElementById('municipio');
  const errorGuardar = document.getElementById('error-guardar');
  const okGuardar = document.getElementById('ok-guardar');
  const panelEstadisticas = document.getElementById('estadisticas');

  let ultimoCalculo = null;

  // Lee un campo numérico y valida que esté dentro de su rango
  function leerCampo(id) {
    const input = document.getElementById(id);
    const valor = Number(input.value);
    const min = Number(input.min);
    const max = Number(input.max);
    if (input.value === '' || !Number.isInteger(valor) || valor < min || valor > max) {
      throw new Error('Revisa el campo "' + input.parentElement.firstChild.textContent.trim() +
        '": debe ser un número entero entre ' + min + ' y ' + max + '.');
    }
    return valor;
  }

  // Calcula el consumo diario en litros por actividad
  function calcularConsumo(d) {
    const regadera = d.personas * d.ducha * CONSUMO.regaderaPorMinuto;
    const inodoro = d.personas * d.inodoro * CONSUMO.inodoroPorDescarga;
    const lavadora = (d.lavadora * CONSUMO.lavadoraPorCarga) / 7;
    const riego = (d.riego * CONSUMO.riegoPorMinuto) / 7;
    const cocina = d.personas * CONSUMO.cocinaYLimpiezaPorPersona;
    const total = regadera + inodoro + lavadora + riego + cocina;
    return {
      total: total,
      porPersona: total / d.personas,
      desglose: [
        ['Regadera', regadera],
        ['Inodoro', inodoro],
        ['Cocina y limpieza', cocina],
        ['Lavadora', lavadora],
        ['Riego y patio', riego]
      ]
    };
  }

  function formato(litros) {
    return Math.round(litros).toLocaleString('es-MX') + ' L';
  }

  function mostrarResultado(r) {
    const alto = r.porPersona > REFERENCIA_POR_PERSONA;
    const porcentaje = Math.min(100, (r.porPersona / (REFERENCIA_POR_PERSONA * 2)) * 100);
    const filas = r.desglose
      .sort(function (a, b) { return b[1] - a[1]; })
      .map(function (x) { return '<li><span>' + x[0] + '</span><strong>' + formato(x[1]) + '</strong></li>'; })
      .join('');

    resultado.innerHTML =
      '<p>Tu hogar usa aproximadamente</p>' +
      '<p class="resultado__total">' + formato(r.total) + ' <small>al día</small></p>' +
      '<p>Por persona: <strong>' + formato(r.porPersona) + '</strong> ' +
      '<span class="etiqueta' + (alto ? ' alto' : '') + '">' +
      (alto ? 'Arriba de la referencia' : 'Dentro de la referencia') + '</span></p>' +
      '<div class="resultado__barra"><span class="' + (alto ? 'alto' : '') + '"></span></div>' +
      '<p class="resultado__vacio">Referencia: ' + REFERENCIA_POR_PERSONA + ' L por persona al día.</p>' +
      '<ul class="desglose">' + filas + '</ul>';
    // El ancho se asigna con JavaScript (no con un atributo style) para respetar la política CSP
    resultado.querySelector('.resultado__barra span').style.width = porcentaje + '%';
  }

  function pintarConsejos() {
    listaConsejos.innerHTML = CONSEJOS
      .map(function (c) { return '<li><strong>' + c.titulo + '</strong>' + c.texto + '</li>'; })
      .join('');
  }

  // ---------- Conexión con la API ----------
  async function cargarMunicipios() {
    try {
      const r = await fetch('api/municipios');
      const lista = await r.json();
      lista.forEach(function (m) {
        const op = document.createElement('option');
        op.value = m.id;
        op.textContent = m.nombre;
        selMunicipio.appendChild(op);
      });
    } catch (e) {
      selMunicipio.disabled = true;
    }
  }

  async function cargarEstadisticas() {
    try {
      const r = await fetch('api/estadisticas');
      const e = await r.json();
      const filas = e.municipios
        .map(function (m) { return '<li><span>' + m.nombre + ' (' + m.total + ')</span><strong>' + formato(m.promedio_persona) + '</strong></li>'; })
        .join('');
      panelEstadisticas.innerHTML =
        '<p>Se han guardado <strong>' + e.total.toLocaleString('es-MX') + '</strong> cálculos. ' +
        'Promedio por persona: <strong>' + formato(e.promedio_persona) + '</strong> al día.</p>' +
        (filas ? '<p class="resultado__vacio">Municipios con más registros (promedio por persona):</p><ul class="desglose">' + filas + '</ul>' : '');
    } catch (err) {
      panelEstadisticas.innerHTML = '<p class="resultado__vacio">Las estadísticas no están disponibles en este momento.</p>';
    }
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    try {
      const datos = {
        personas: leerCampo('personas'),
        ducha: leerCampo('ducha'),
        inodoro: leerCampo('inodoro'),
        lavadora: leerCampo('lavadora'),
        riego: leerCampo('riego')
      };
      error.hidden = true;
      const r = calcularConsumo(datos);
      mostrarResultado(r);
      ultimoCalculo = Object.assign({}, datos, { litrosDia: Math.round(r.total * 10) / 10 });
      formGuardar.hidden = false;
      okGuardar.hidden = true;
    } catch (e) {
      error.textContent = e.message;
      error.hidden = false;
    }
  });

  formGuardar.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    errorGuardar.hidden = true;
    okGuardar.hidden = true;
    if (!document.getElementById('acepta').checked) {
      errorGuardar.textContent = 'Para guardar tu resultado debes aceptar el Aviso de Privacidad.';
      errorGuardar.hidden = false;
      return;
    }
    const cuerpo = Object.assign({}, ultimoCalculo, {
      municipioId: selMunicipio.value || null,
      aceptaAviso: 'true'
    });
    try {
      const r = await fetch('api/calculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo)
      });
      const datos = await r.json();
      if (!r.ok) {
        throw new Error((datos.errores || ['No se pudo guardar']).join('. '));
      }
      okGuardar.textContent = '¡Gracias! Tu resultado se guardó con el folio #' + datos.id + '.';
      okGuardar.hidden = false;
      cargarEstadisticas();
    } catch (e) {
      errorGuardar.textContent = e.message;
      errorGuardar.hidden = false;
    }
  });

  pintarConsejos();
  cargarMunicipios();
  cargarEstadisticas();
})();
