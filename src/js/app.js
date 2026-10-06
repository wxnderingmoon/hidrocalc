/*
 * HidroCalc - lógica de la calculadora
 */
(function () {
  'use strict';

  const form = document.getElementById('form-consumo');
  const resultado = document.getElementById('resultado');
  const error = document.getElementById('error');
  const listaConsejos = document.getElementById('lista-consejos');

  // Lee un campo numérico y valida que esté dentro de su rango
  function leerCampo(id) {
    const input = document.getElementById(id);
    const valor = Number(input.value);
    const min = Number(input.min);
    const max = Number(input.max);
    if (input.value === '' || Number.isNaN(valor) || valor < min || valor > max) {
      throw new Error('Revisa el campo "' + input.parentElement.firstChild.textContent.trim() +
        '": debe estar entre ' + min + ' y ' + max + '.');
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
      '<div class="resultado__barra"><span class="' + (alto ? 'alto' : '') + '" style="width:' + porcentaje + '%"></span></div>' +
      '<p class="resultado__vacio">Referencia: ' + REFERENCIA_POR_PERSONA + ' L por persona al día.</p>' +
      '<ul class="desglose">' + filas + '</ul>';
  }

  function pintarConsejos() {
    listaConsejos.innerHTML = CONSEJOS
      .map(function (c) { return '<li><strong>' + c.titulo + '</strong>' + c.texto + '</li>'; })
      .join('');
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
      if (datos.personas < 1) {
        throw new Error('Debe haber al menos una persona en la casa.');
      }
      error.hidden = true;
      mostrarResultado(calcularConsumo(datos));
    } catch (e) {
      error.textContent = e.message;
      error.hidden = false;
    }
  });

  pintarConsejos();
})();
