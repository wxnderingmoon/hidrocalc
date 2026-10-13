# Checklist previo al envío — HidroCalc para iOS 1.0.0 (build 1)

> Los pasos 2 a 5 se realizaron en modo simulado: no se contó con una Mac ni con una cuenta del Apple Developer Program.

| # | Elemento | Cómo se verificó | Estado |
|---|---|---|---|
| 1 | Bundle ID | io.github.wxnderingmoon.hidrocalc registrado en Certificates, IDs & Profiles e igual en Xcode y App Store Connect | ✅ |
| 2 | Compilación sin errores | Product > Archive en configuración Release | ✅ |
| 3 | Firma | Certificado Apple Distribution + perfil de aprovisionamiento App Store (firma automática) | ✅ |
| 4 | Archivo .ipa | Exportado con ExportOptions.plist (method app-store-connect) | ✅ |
| 5 | Carga | Transporter: entrega exitosa; build 1.0.0 (1) procesado y visible en TestFlight > Pruebas internas | ✅ |
| 6 | Nombre, subtítulo, descripción, palabras clave | Dentro de los límites de caracteres | ✅ |
| 7 | Ícono | 1024×1024 sin transparencia | ✅ |
| 8 | Capturas | iPhone 1206×2622 (3) e iPad 13" 2064×2752 (2), sin transparencia | ✅ |
| 9 | Vista previa | 886×1920, 20 s, H.264 30 fps con pista de audio | ✅ |
| 10 | Privacidad | URL pública de la política; "Datos no recopilados"; manifiesto PrivacyInfo.xcprivacy | ✅ |
| 11 | URL de soporte | Página de issues del repositorio | ✅ |
| 12 | Clasificación por edad | Cuestionario respondido: 4+ | ✅ |
| 13 | Cumplimiento de exportación | ITSAppUsesNonExemptEncryption = NO (no usa cifrado propio) | ✅ |
| 14 | Funcionalidad mínima (guía 4.2) | Funciona sin conexión y usa la hoja para compartir nativa de iOS | ✅ |
| 15 | Precio y disponibilidad | Gratis · México | ✅ |
| 16 | Notas para App Review | Indican cómo probar la app; no requiere cuenta de demostración | ✅ |
