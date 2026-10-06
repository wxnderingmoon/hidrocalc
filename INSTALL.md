# Instalación de HidroCalc v2.0.0

Guía para reproducir el entorno local: Express.js + PostgreSQL detrás de Nginx con HTTPS en el dominio `hidrocalc.local`.

## Versiones utilizadas

| Componente | Versión |
|---|---|
| Ubuntu | 22.04 LTS |
| Node.js / npm | 22.x / 10.x |
| PostgreSQL | 14.24 |
| Nginx | 1.18.0 |
| OpenSSL | 3.0.2 |
| express | 4.22.3 |
| pg (cliente de PostgreSQL) | 8.23.1 |
| express-validator (plugin de validación) | 7.3.2 |
| dotenv | 16.6.1 |
| morgan (registro de peticiones) | 1.12.1 |
| puppeteer-core (pruebas, desarrollo) | 23.11.1 |
| Navegadores de prueba | Google Chrome / Chromium 153, Mozilla Firefox 136 |

## 1. Base de datos

```bash
sudo apt install postgresql
sudo -u postgres psql -f db/init.sql
psql -U hidrocalc_app -h localhost -d hidrocalc -c '\dt'
```

`db/init.sql` crea el usuario `hidrocalc_app`, la base `hidrocalc`, las tablas `municipios` y `calculos` (llave foránea, restricciones CHECK e índices) y carga el catálogo de municipios.

## 2. Aplicación (Express.js)

```bash
npm install
cp .env.example .env      # ajustar DB_PASSWORD
npm run build             # genera dist/ (HTML, CSS y JS minificados)
npm start                 # http://127.0.0.1:3000
curl http://127.0.0.1:3000/salud
```

Endpoints:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/municipios` | Catálogo para el formulario |
| POST | `/api/calculos` | Guarda un cálculo anónimo (validado con express-validator) |
| GET | `/api/estadisticas` | Total de registros y promedio por persona y por municipio |
| GET | `/salud` | Verifica la conexión con PostgreSQL |

## 3. Dominio local

```bash
echo "127.0.0.1   hidrocalc.local" | sudo tee -a /etc/hosts
```

## 4. Certificado local (CA propia + certificado del sitio)

```bash
mkdir -p certs && cd certs
openssl req -x509 -new -nodes -newkey rsa:2048 -keyout hidrocalc-ca.key -out hidrocalc-ca.crt \
  -days 825 -subj "/CN=HidroCalc CA Local/O=Paulina Gallardo"
openssl req -new -nodes -newkey rsa:2048 -keyout hidrocalc.local.key -out hidrocalc.local.csr -subj "/CN=hidrocalc.local"
printf "subjectAltName=DNS:hidrocalc.local\nextendedKeyUsage=serverAuth\n" > ext.cnf
openssl x509 -req -in hidrocalc.local.csr -CA hidrocalc-ca.crt -CAkey hidrocalc-ca.key -CAcreateserial \
  -out hidrocalc.local.crt -days 825 -sha256 -extfile ext.cnf
sudo mkdir -p /etc/nginx/ssl && sudo cp hidrocalc.local.crt hidrocalc.local.key /etc/nginx/ssl/
# Opcional: confiar en la CA local para que el navegador no muestre advertencia
sudo cp hidrocalc-ca.crt /usr/local/share/ca-certificates/ && sudo update-ca-certificates
```

Las llaves privadas (`*.key`) no se suben al repositorio.

## 5. Nginx (HTTPS forzado y encabezados de seguridad)

```bash
sudo cp nginx/hidrocalc.conf /etc/nginx/sites-available/hidrocalc
sudo ln -s /etc/nginx/sites-available/hidrocalc /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
curl -I http://hidrocalc.local:8080/       # 301 -> https://hidrocalc.local:8443/
curl -I https://hidrocalc.local:8443/      # HSTS, CSP y demás encabezados
```

## 6. Pruebas

```bash
NAVEGADOR=chrome  RUTA_NAVEGADOR=/usr/bin/google-chrome node tests/pruebas-navegadores.js
NAVEGADOR=firefox RUTA_NAVEGADOR=/usr/bin/firefox       node tests/pruebas-navegadores.js
npx lighthouse https://hidrocalc.local:8443/ --preset=desktop --view
```
