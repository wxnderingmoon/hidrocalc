#!/usr/bin/env bash
# Compila HidroCalc para Android sin Android Studio:
#   1) minifica la calculadora web y la copia a assets/www
#   2) compila recursos (aapt2), código Java (javac) y lo convierte a DEX (dx)
#   3) genera el APK de release firmado y el Android App Bundle (.aab) para Google Play
# Variables necesarias: BUILD_TOOLS (aapt2, zipalign, apksigner, dx.jar), ANDROID_JAR,
# KEYSTORE, KS_PASS (contraseña del almacén de llaves de carga).
set -euo pipefail
cd "$(dirname "$0")"

VERSION_NAME=1.0.0
VERSION_CODE=1
MIN_SDK=24
TARGET_SDK=35
NOMBRE="hidrocalc-android-v${VERSION_NAME}"
NM=../node_modules
MAIN=app/src/main
OUT=build

echo "==> Preparando la calculadora web (assets/www)"
rm -rf "$MAIN/assets/www" "$OUT" && mkdir -p "$MAIN/assets/www/css" "$MAIN/assets/www/js" "$MAIN/assets/www/img" "$OUT"
for pagina in index privacidad; do
  node $NM/html-minifier-terser/cli.js --collapse-whitespace --remove-comments \
    -o "$MAIN/assets/www/${pagina}.html" "web/${pagina}.html"
done
node $NM/clean-css-cli/bin/cleancss -O2 -o "$MAIN/assets/www/css/styles.css" web/css/styles.css
node $NM/terser/bin/terser web/js/datos.js -c -m -o "$MAIN/assets/www/js/datos.js"
node $NM/terser/bin/terser web/js/app.js -c -m -o "$MAIN/assets/www/js/app.js"
cp web/img/* "$MAIN/assets/www/img/"

echo "==> Compilando recursos"
"$BUILD_TOOLS/aapt2" compile --dir "$MAIN/res" -o "$OUT/res.zip"
LINK=(-I "$ANDROID_JAR" --manifest "$MAIN/AndroidManifest.xml" -R "$OUT/res.zip" -A "$MAIN/assets"
      --min-sdk-version $MIN_SDK --target-sdk-version $TARGET_SDK
      --version-code $VERSION_CODE --version-name $VERSION_NAME --auto-add-overlay)
"$BUILD_TOOLS/aapt2" link "${LINK[@]}" --java "$OUT/gen" -o "$OUT/base.apk"
"$BUILD_TOOLS/aapt2" link "${LINK[@]}" --proto-format -o "$OUT/base-proto.apk"

echo "==> Compilando Java y convirtiendo a DEX"
mkdir -p "$OUT/classes"
javac -source 8 -target 8 -bootclasspath "$ANDROID_JAR" -nowarn -d "$OUT/classes" \
  $(find "$MAIN/java" "$OUT/gen" -name '*.java') 2>&1 | grep -v "bootstrap\|^1 warning" || true
java -jar "$BUILD_TOOLS/lib/dx.jar" --dex --output="$OUT/classes.dex" "$OUT/classes"

echo "==> APK de release (alineado y firmado)"
cp "$OUT/base.apk" "$OUT/sin-firmar.apk"
(cd "$OUT" && zip -q sin-firmar.apk classes.dex)
"$BUILD_TOOLS/zipalign" -p -f 4 "$OUT/sin-firmar.apk" "$OUT/alineado.apk"
${APKSIGNER:-"$BUILD_TOOLS/apksigner"} sign --ks "$KEYSTORE" --ks-pass env:KS_PASS --ks-key-alias hidrocalc \
  --out "$OUT/${NOMBRE}.apk" "$OUT/alineado.apk"

echo "==> Android App Bundle (.aab)"
B="$OUT/bundle" && mkdir -p "$B/base/manifest" "$B/base/dex"
(cd "$B/base" && unzip -q ../../base-proto.apk)
mv "$B/base/AndroidManifest.xml" "$B/base/manifest/"
cp "$OUT/classes.dex" "$B/base/dex/"
printf '\x0a\x08\x12\x061.17.2' > "$B/BundleConfig.pb"   # BundleConfig { bundletool { version: "1.17.2" } }
(cd "$B" && zip -qr "../${NOMBRE}.aab" BundleConfig.pb base)
jarsigner -keystore "$KEYSTORE" -storepass:env KS_PASS -sigalg SHA256withRSA -digestalg SHA-256 \
  "$OUT/${NOMBRE}.aab" hidrocalc > /dev/null

echo "==> Listo:"
ls -lh "$OUT/${NOMBRE}.apk" "$OUT/${NOMBRE}.aab"
