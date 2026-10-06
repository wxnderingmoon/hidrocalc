# HidroCalc para Android

Versión nativa de la calculadora de consumo de agua. La app muestra la calculadora web (HTML, CSS y JavaScript) dentro de un `WebView`; los archivos viajan dentro del paquete (`assets/www`), así que funciona sin internet y **no solicita ningún permiso**.

| Dato | Valor |
|---|---|
| Paquete | `io.github.wxnderingmoon.hidrocalc` |
| Versión | 1.0.0 (versionCode 1) |
| SDK mínimo / objetivo | 24 (Android 7.0) / 35 (Android 15) |
| Permisos | Ninguno |
| Política de privacidad | [PRIVACIDAD.md](PRIVACIDAD.md) |

## Estructura
```
android/
├── app/src/main/
│   ├── AndroidManifest.xml
│   ├── java/io/github/wxnderingmoon/hidrocalc/MainActivity.java
│   └── res/ (strings, tema e íconos por densidad)
├── web/              # calculadora (se minifica a assets/www al compilar)
├── play-store/       # ficha, ícono, gráfico de funciones y capturas
├── build-android.sh  # genera el APK firmado y el .aab
└── PRIVACIDAD.md
```

## Compilar
Requiere JDK 11, las build-tools de Android (aapt2, zipalign, apksigner, dx), `android.jar` y la llave de carga (no se sube al repositorio):
```bash
export BUILD_TOOLS=/ruta/build-tools ANDROID_JAR=/ruta/android.jar
export KEYSTORE=~/llaves/upload-hidrocalc.jks KS_PASS=********
./build-android.sh
```
Resultado: `build/hidrocalc-android-v1.0.0.apk` (instalable para pruebas) y `build/hidrocalc-android-v1.0.0.aab` (el que se sube a Google Play).
