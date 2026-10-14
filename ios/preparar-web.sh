#!/usr/bin/env bash
# Optimiza la calculadora web antes de incluirla en la app:
# minifica HTML, CSS y JavaScript de web/ y copia solo las imágenes que se usan
# (WebP, compatible con iOS 14 o superior) a HidroCalc/Resources/www.
set -euo pipefail
cd "$(dirname "$0")"
NM=../node_modules
OUT=HidroCalc/Resources/www

rm -rf "$OUT" && mkdir -p "$OUT/css" "$OUT/js" "$OUT/img"
for pagina in index privacidad; do
  node $NM/html-minifier-terser/cli.js --collapse-whitespace --remove-comments \
    -o "$OUT/${pagina}.html" "web/${pagina}.html"
done
node $NM/clean-css-cli/bin/cleancss -O2 -o "$OUT/css/styles.css" web/css/styles.css
for js in datos app ios-puente; do
  node $NM/terser/bin/terser "web/js/${js}.js" -c -m -o "$OUT/js/${js}.js"
done
cp web/img/hero.webp web/img/logo.svg "$OUT/img/"

kb() { find "$1" -type f -printf "%s\n" | awk '{s+=$1} END {printf "%.1f KB", s/1024}'; }
echo "Peso de la calculadora: $(kb web) (fuente) -> $(kb "$OUT") (dentro de la app)"
