const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

module.exports = async function generarPDF(data) {

  console.log("DATA:", data);

  let html = fs.readFileSync('./template_full.html', 'utf8');

  const front = fs.readFileSync('./front.png', 'base64');
  const back = fs.readFileSync('./back.png', 'base64');

  html = html
    .replace('front.png', `data:image/png;base64,${front}`)
    .replace('back.png', `data:image/png;base64,${back}`);

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
    .replace('{{foto}}', data.foto || '')
    .replace('{{fotoMini}}', data.fotoMini || '')
    .replace('{{firma}}', data.firma || '')
    .replace(/{{qr}}/g, '')
    .replace('{{barcode}}', '')
    .replace('{{mrz}}', '');

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const filePath = path.join(__dirname, `output_${Date.now()}.pdf`);

  await page.pdf({
    path: filePath,
    width: '1000px',
    height: '1260px',
    printBackground: true
  });

  await browser.close();

  return filePath;
};
