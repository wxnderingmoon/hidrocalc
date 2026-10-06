# HidroCalc · Calculadora de consumo de agua

> **Versión 2.0.0:** API en Express.js con base de datos PostgreSQL, dominio local `hidrocalc.local` con HTTPS, encabezados de seguridad, Aviso de Privacidad y Términos y Condiciones. Ver [INSTALL.md](INSTALL.md) para reproducir el entorno.

Aplicación web estática que estima cuántos litros de agua usa un hogar al día a partir de cinco datos (personas, minutos de regadera, uso del inodoro, cargas de lavadora y riego), compara el resultado por persona contra una referencia de 100 L diarios y muestra consejos de ahorro.

Proyecto de los Retos 2 y 3 del módulo *Despliegue de aplicaciones web y móviles* (UVEG) — Paulina Gallardo Valadez.

## Estructura del proyecto

```
hidrocalc/
├── src/                      # código fuente (versión editable)
│   ├── index.html
│   ├── css/styles.css
│   ├── js/datos.js           # valores de referencia y consejos
│   ├── js/app.js             # lógica de la calculadora
│   └── img/                  # logo.svg, hero.jpg, hero.webp (originales)
├── scripts/
│   └── optimizar-imagenes.js # redimensiona y comprime imágenes con sharp
├── nginx/
│   └── hidrocalc.conf        # Server Block de Nginx
├── build.sh                  # empaquetado para producción
└── package.json
```

`dist/` y los paquetes `.tar.gz` / `.zip` no se versionan (están en `.gitignore`); se generan con el script de empaquetado.

## 1. Empaquetado

Requisitos: Node.js 18 o superior.

```bash
npm install          # instala las herramientas de minificación y sharp
npm run build        # ejecuta build.sh
```

`build.sh` realiza:

1. Limpia la carpeta `dist/`.
2. Minifica `index.html` (html-minifier-terser), `styles.css` (clean-css) y los archivos JS (terser).
3. Optimiza las imágenes: ancho máximo de 960 px, JPG calidad 75 y WebP calidad 70.
4. Genera `hidrocalc-v1.0.0.tar.gz` y `hidrocalc-v1.0.0.zip` con el contenido de `dist/`.

Resultado de la optimización:

| Archivo | Original | Optimizado |
|---|---|---|
| hero.jpg | 703.9 KB | 28.2 KB |
| hero.webp | 255.3 KB | 12.7 KB |
| styles.css | 4.0 KB | 2.8 KB |
| app.js + datos.js | 4.9 KB | 3.0 KB |

## 2. Versionamiento

- Repositorio Git con commits descriptivos por cada etapa (estructura, estilos, lógica, imágenes, empaquetado, servidor y documentación).
- La versión publicada se marca con la etiqueta `v1.0.0`.

```bash
git log --oneline
git tag
```

## 3. Despliegue con Nginx (Ubuntu)

```bash
sudo apt install nginx
sudo mkdir -p /var/www/hidrocalc
sudo tar -xzf hidrocalc-v1.0.0.tar.gz -C /var/www/hidrocalc
sudo cp nginx/hidrocalc.conf /etc/nginx/sites-available/hidrocalc
sudo ln -s /etc/nginx/sites-available/hidrocalc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

La aplicación queda disponible en **http://localhost:8080/hidrocalc/**.

Puntos clave del Server Block (`nginx/hidrocalc.conf`):

- `listen 8080;` — puerto de pruebas para no chocar con otros servicios en el puerto 80.
- `location /hidrocalc/ { alias /var/www/hidrocalc/; }` — mapea la ruta simulada a la carpeta del proyecto.
- `try_files` regresa `index.html` si se pide una ruta que no existe.
- Caché de 7 días y compresión gzip para CSS, JS e imágenes.

Verificación:

```bash
curl -I http://localhost:8080/hidrocalc/
```

## Licencia

MIT

## Versión 2.0.0 (Reto 3)

- **Base de datos:** PostgreSQL 14, script `db/init.sql` (tablas `municipios` y `calculos`, llave foránea, restricciones e índices).
- **Framework:** Express.js (`server/app.js`) con la API `/api/municipios`, `/api/calculos` y `/api/estadisticas`.
- **Plugin:** express-validator para validar los datos que se guardan.
- **Seguridad:** dominio `hidrocalc.local`, certificado TLS local, redirección de HTTP a HTTPS y encabezados HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy y Permissions-Policy.
- **Pruebas:** `tests/pruebas-navegadores.js` (Chrome y Firefox, 9 pruebas) y Lighthouse.
- **Legal:** `aviso-privacidad.html` y `terminos.html`, enlazados en el pie de página.

