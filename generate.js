const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs');

module.exports = async function (data) {

  // procesar imagen
  const foto = await sharp(data.fotoBuffer)
    .resize(300, 360)
    .jpeg()
    .toBuffer();

  const base64 = `data:image/jpeg;base64,${foto.toString('base64')}`;

  let html = fs.readFileSync('./template.html', 'utf8');

  html = html
    .replace('{{nombre}}', data.nombre)
    .replace('{{paterno}}', data.paterno)
    .replace('{{materno}}', data.materno)
    .replace('{{curp}}', data.curp)
    .replace(/{{foto}}/g, base64);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true
  });

  await browser.close();

  return pdf;
};
