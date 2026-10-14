/*
 * HidroCalc para iOS: agrega el botón "Compartir resultado", que abre la hoja
 * para compartir nativa de iOS (Mensajes, WhatsApp, Notas, etc.).
 * Solo aparece cuando la página corre dentro de la app (existe el puente con Swift).
 */
(function () {
  'use strict';
  const puente = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.compartir;
  if (!puente) return;

  const resultado = document.getElementById('resultado');
  new MutationObserver(function () {
    const total = resultado.querySelector('.resultado__total');
    if (!total || resultado.querySelector('.boton-compartir')) return;
    const fila = Array.prototype.find.call(resultado.querySelectorAll('p'), function (p) { return p.textContent.indexOf('Por persona') === 0; });
    const persona = fila && fila.querySelector('strong');
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'boton boton-compartir';
    boton.textContent = 'Compartir resultado';
    boton.addEventListener('click', function () {
      let texto = 'Según HidroCalc, mi hogar usa aproximadamente ' + total.textContent.trim();
      if (persona) texto += ' (' + persona.textContent.trim() + ' por persona)';
      puente.postMessage(texto + '. Calcula el tuyo y descubre cómo ahorrar agua.');
    });
    resultado.appendChild(boton);
  }).observe(resultado, { childList: true });
})();
