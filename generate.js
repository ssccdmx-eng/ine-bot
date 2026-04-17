const fs = require('fs');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const sharp = require('sharp');

module.exports = async function generarPDF(data) {

  let html = fs.readFileSync('./template_full.html', 'utf8');

  // ===== BASE INE =====
  const front = fs.readFileSync('./front.png', 'base64');
  const back = fs.readFileSync('./back.png', 'base64');

  html = html
    .replace('front.png', `data:image/png;base64,${front}`)
    .replace('back.png', `data:image/png;base64,${back}`);

  // ===== PROCESAR FOTO =====
  async function processImage(base64) {
    if (!base64) return '';

    const buffer = Buffer.from(base64.split(',')[1], 'base64');

    const processed = await sharp(buffer)
      .resize(300, 400, { fit: 'cover' })
      .jpeg()
      .toBuffer();

    return `data:image/jpeg;base64,${processed.toString('base64')}`;
  }

  const foto = await processImage(data.foto);
  const fotoMini = await processImage(data.fotoMini);
  const firma = await processImage(data.firma);

  // ===== QR =====
  const qr = await QRCode.toDataURL(data.curp || 'INE');

  // ===== BARCODE =====
  const barcodeBuffer = await bwipjs.toBuffer({
    bcid: 'code128',
    text: data.curp || 'INE123',
    scale: 3,
    height: 10
  });

  const barcode = `data:image/png;base64,${barcodeBuffer.toString('base64')}`;

  // ===== MRZ =====
  const mrz = `${data.nombre}<<${data.paterno}<<${data.materno}`;

  // ===== REEMPLAZOS =====
  html = html
    .replace('{{nombre}}', data.nombre || '')
    .replace('{{paterno}}', data.paterno || '')
    .replace('{{materno}}', data.materno || '')
    .replace('{{domicilio}}', data.domicilio || '')
    .replace('{{curp}}', data.curp || '')
    .replace('{{clave}}', data.clave || '')
    .replace('{{sexo}}', data.sexo || '')
    .replace('{{estado}}', data.estado || '')
    .replace('{{registro}}', data.registro || '')
    .replace('{{seccion}}', data.seccion || '')
    .replace('{{vigencia}}', data.vigencia || '')
    .replace('{{foto}}', foto)
    .replace('{{fotoMini}}', fotoMini)
    .replace('{{firma}}', firma)
    .replace('{{qr}}', qr)
    .replace('{{barcode}}', barcode)
    .replace('{{mrz}}', mrz);

  // ===== PDF =====
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    width: '1000px',
    height: '1260px',
    printBackground: true
  });

  await browser.close();

  return pdf;
};
