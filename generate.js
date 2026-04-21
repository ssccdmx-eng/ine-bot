const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = async function (data) {

  // procesar foto (tamaño correcto credencial)
  const foto = await sharp(data.fotoBuffer)
    .resize(260, 320)
    .jpeg({ quality: 90 })
    .toBuffer();

  const base64 = `data:image/jpeg;base64,${foto.toString('base64')}`;

  // fondo a base64 (CRÍTICO)
  const frontPath = path.join(__dirname, 'front.png');
  const frontBase64 = fs.readFileSync(frontPath, { encoding: 'base64' });

  let html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

  html = html
    .replace('{{nombre}}', data.nombre || '')
    .replace('{{paterno}}', data.paterno || '')
    .replace('{{materno}}', data.materno || '')
    .replace('{{curp}}', data.curp || '')
    .replace(/{{foto}}/g, base64)
    .replace('front.png', `data:image/png;base64,${frontBase64}`);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    width: '860px',
    height: '540px',
    printBackground: true
  });

  await browser.close();

  return pdf;
};
