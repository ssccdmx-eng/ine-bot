const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

module.exports = async function generarPDF(data) {

  console.log("DATA OK:", data); // ✅ ahora sí funciona

  let html = fs.readFileSync('./template_full.html', 'utf8');

  // ===== IMÁGENES BASE (INE) =====
  const frontBase64 = fs.readFileSync('./front.png', { encoding: 'base64' });
  const backBase64 = fs.readFileSync('./back.png', { encoding: 'base64' });

  html = html
    .replace('front.png', `data:image/png;base64,${frontBase64}`)
    .replace('back.png', `data:image/png;base64,${backBase64}`);

  // ===== DATOS =====
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
    .replace('{{vigencia}}', data.vigencia || '');

  // ===== IMÁGENES USUARIO =====
  html = html
    .replace('{{foto}}', data.foto || '')
    .replace('{{fotoMini}}', data.fotoMini || '')
    .replace('{{firma}}', data.firma || '');

  // ===== GENERAR PDF =====
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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
