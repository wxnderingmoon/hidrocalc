# HidroCalc para iOS

Versión para iPhone y iPad de la calculadora de consumo de agua. La app es una vista de SwiftUI que muestra la calculadora web (HTML, CSS y JavaScript) en un `WKWebView`; los archivos viajan dentro de la app, así que funciona sin internet. Agrega una función nativa: el botón **Compartir resultado** abre la hoja para compartir de iOS mediante un puente entre JavaScript y Swift.

| Dato | Valor |
|---|---|
| Bundle ID | `io.github.wxnderingmoon.hidrocalc` |
| Versión | 1.0.0 (build 1) |
| iOS mínimo | 17.0 · iPhone y iPad |
| Permisos | Ninguno |
| Privacidad | [PRIVACIDAD.md](PRIVACIDAD.md) · manifiesto `HidroCalc/PrivacyInfo.xcprivacy` |

## Estructura
```
ios/
├── project.yml               # definición del proyecto (XcodeGen)
├── ExportOptions.plist       # opciones para exportar el .ipa de App Store
├── build-ios.sh              # optimiza la web, archive + export del .ipa
├── preparar-web.sh           # minifica web/ y copia solo WebP/SVG a Resources/www
├── web/                      # calculadora legible (fuente)
├── HidroCalc/
│   ├── Sources/              # HidroCalcApp.swift, ContentView.swift
│   ├── Resources/www/        # calculadora optimizada que viaja en la app (generada)
│   ├── Assets.xcassets/      # ícono 1024×1024 y color de acento
│   ├── Info.plist
│   └── PrivacyInfo.xcprivacy
└── app-store/                # ficha, checklist, capturas y vista previa
```

## Peso de la calculadora dentro de la app
`preparar-web.sh` minifica HTML, CSS y JavaScript y deja solo la imagen WebP (iOS 17 la soporta), así que los archivos locales pasan de 57.9 KB a 24.9 KB.

## Compilar y subir (en una Mac)
```bash
brew install xcodegen
TEAM_ID=XXXXXXXXXX ./build-ios.sh
```
Después se sube `build/ipa/HidroCalc.ipa` con Transporter o desde el Organizer de Xcode.
