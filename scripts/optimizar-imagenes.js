// Optimiza las imágenes de src/img y las guarda en dist/img
// - Redimensiona a un ancho máximo de 960 px
// - JPG con calidad 75 (progresivo) y WebP con calidad 70
// - Los SVG se copian tal cual
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const origen = path.join(__dirname, '..', 'src', 'img');
const destino = path.join(__dirname, '..', 'dist', 'img');
fs.mkdirSync(destino, { recursive: true });

(async () => {
  for (const archivo of fs.readdirSync(origen)) {
    const entrada = path.join(origen, archivo);
    const salida = path.join(destino, archivo);
    const ext = path.extname(archivo).toLowerCase();
    const antes = fs.statSync(entrada).size;

    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(entrada).resize({ width: 960 }).jpeg({ quality: 75, progressive: true, mozjpeg: true }).toFile(salida);
    } else if (ext === '.webp') {
      await sharp(entrada).resize({ width: 960 }).webp({ quality: 70 }).toFile(salida);
    } else if (ext === '.png') {
      await sharp(entrada).resize({ width: 960 }).png({ compressionLevel: 9, palette: true }).toFile(salida);
    } else {
      fs.copyFileSync(entrada, salida);
    }

    const despues = fs.statSync(salida).size;
    const ahorro = (100 - (despues / antes) * 100).toFixed(1);
    console.log(`${archivo.padEnd(12)} ${(antes / 1024).toFixed(1).padStart(8)} KB -> ${(despues / 1024).toFixed(1).padStart(7)} KB  (-${ahorro}%)`);
  }
})();
