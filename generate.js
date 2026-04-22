const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');

module.exports = async function generatePDF(data) {

  const doc = new PDFDocument({ size: [860, 540], margin: 0 });

  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  doc.rect(0, 0, 860, 540).fill('#ffffff');

  doc.image(data.foto, 60, 120, { width: 200 });
  doc.image(data.firma, 60, 400, { width: 150 });

  doc.fontSize(18).text(
    `${data.nombre} ${data.paterno} ${data.materno}`,
    300, 120
  );

  doc.fontSize(12);
  doc.text(`CURP: ${data.curp}`, 300, 160);
  doc.text(`Sexo: ${data.sexo}`, 300, 180);
  doc.text(`Nacimiento: ${data.fechaNacimiento}`, 300, 200);
  doc.text(`Domicilio: ${data.domicilio}`, 300, 220);

  const qr = await QRCode.toBuffer(JSON.stringify(data));
  doc.image(qr, 650, 120, { width: 140 });

  const barcode = await bwipjs.toBuffer({
    bcid: 'code128',
    text: data.curp,
    scale: 3,
    height: 10
  });

  doc.image(barcode, 550, 420, { width: 250 });

  doc.end();

  return await new Promise(resolve => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
};
