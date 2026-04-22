const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const axios = require('axios');

module.exports = async function generatePDF(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 20 });

  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // ===== QR SEGURO =====
  const qrData = `${data.curp}|${data.nombre}`;
  const qr = await QRCode.toBuffer(qrData, { width: 100 });

  // ===== FOTO =====
  const response = await axios.get(data.foto, { responseType: 'arraybuffer' });
  const fotoBuffer = Buffer.from(response.data);

  // ===== DISEÑO =====
  doc.rect(0, 0, 595, 842).fill('#f5f5f5');

  doc.fillColor('black')
     .fontSize(18)
     .text('CREDENCIAL GENERADA', 50, 40);

  // FOTO
  doc.image(fotoBuffer, 50, 100, {
    width: 150,
    height: 180
  });

  // DATOS
  doc.fontSize(12);
  doc.text(`Nombre: ${data.nombre}`, 250, 120);
  doc.text(`Apellido: ${data.apellido}`, 250, 140);
  doc.text(`CURP: ${data.curp}`, 250, 160);

  // QR
  doc.image(qr, 250, 200, { width: 100 });

  // MARCA
  doc.fillColor('gray')
     .fontSize(8)
     .text('Documento generado automáticamente', 50, 800);

  doc.end();

  return await new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
};
