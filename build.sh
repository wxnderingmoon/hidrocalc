#!/usr/bin/env bash
# Empaqueta HidroCalc para producción:
# 1) limpia dist/  2) minifica HTML, CSS y JS  3) optimiza imágenes  4) genera .tar.gz y .zip
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
NOMBRE="hidrocalc-v${VERSION}"

echo "==> Limpiando dist/"
rm -rf dist "${NOMBRE}.tar.gz" "${NOMBRE}.zip"
mkdir -p dist/css dist/js dist/img

echo "==> Minificando HTML"
npx html-minifier-terser --collapse-whitespace --remove-comments --minify-css true --minify-js true \
  -o dist/index.html src/index.html

echo "==> Minificando CSS"
npx cleancss -O2 -o dist/css/styles.css src/css/styles.css

echo "==> Minificando JavaScript"
npx terser src/js/datos.js -c -m -o dist/js/datos.js
npx terser src/js/app.js -c -m -o dist/js/app.js

echo "==> Optimizando imágenes"
node scripts/optimizar-imagenes.js

echo "==> Generando paquetes"
tar -czf "${NOMBRE}.tar.gz" -C dist .
(cd dist && zip -qr "../${NOMBRE}.zip" .)

echo "==> Listo:"
ls -lh "${NOMBRE}.tar.gz" "${NOMBRE}.zip"
