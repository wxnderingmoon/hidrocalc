# Checklist previo al lanzamiento — HidroCalc 1.0.0

| # | Elemento | Cómo se verificó | Estado |
|---|---|---|---|
| 1 | Nombre, ícono y descripciones | Nombre de 26/30 caracteres, descripción breve de 70/80; ícono PNG 512×512 | ✅ |
| 2 | Gráfico de funciones | PNG 1024×500 sin transparencia | ✅ |
| 3 | Capturas de teléfono | 4 capturas 1080×2160 (proporción 2:1) | ✅ |
| 4 | Capturas de tableta de 7" y 10" | 2 de 1200×1920 y 2 de 1600×2560 | ✅ |
| 5 | Política de privacidad | Publicada en android/PRIVACIDAD.md (URL pública) y enlazada dentro de la app | ✅ |
| 6 | Permisos | `aapt dump permissions`: ninguno | ✅ |
| 7 | Anuncios y SDK de terceros | Ninguno; la app no usa bibliotecas externas | ✅ |
| 8 | Seguridad de los datos | Sin recopilación ni uso compartido de datos | ✅ |
| 9 | Clasificación de contenido | Cuestionario IARC → 3+ / Apto para todo público | ✅ |
| 10 | Público objetivo | 13 años o más | ✅ |
| 11 | Nivel de API objetivo | targetSdkVersion 35 (requisito vigente de Google Play) | ✅ |
| 12 | Paquete de distribución | `.aab` firmado con la llave de carga; APK de prueba alineado y verificado con apksigner | ✅ |
| 13 | Versión | versionCode 1 · versionName 1.0.0 | ✅ |
| 14 | Accesibilidad | Etiquetas en todos los campos, mensajes de error con `role="alert"`, resultado con `aria-live`, texto escalable | ✅ |
| 15 | Precios y países | Gratis · México | ✅ |
| 16 | Contacto | 24006044@es.uveg.edu.mx · github.com/wxnderingmoon/hidrocalc | ✅ |
