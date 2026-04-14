const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// ===== CONFIG =====
const 8754289463:AAE5_F4YndS-FtdbuKFr4yPSTQnEex23Aug = process.env.TOKEN;

cloudinary.config({
  dxfen4592: process.env.CLOUD_NAME,
  792593878287826: process.env.API_KEY,
  mQ_BSa_8txx5tud5s5B1_3kXj3g: process.env.API_SECRET
});

const bot = new TelegramBot(8754289463:AAE5_F4YndS-FtdbuKFr4yPSTQnEex23Aug, { polling: true });

let userData = {};

// ===== INICIO =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userData[chatId] = { step: 'nombre' };
  bot.sendMessage(chatId, "Nombre:");
});

// ===== FLUJO =====
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (!userData[chatId]) return;

  let step = userData[chatId].step;

  if (msg.photo) {
    try {
      const fileId = msg.photo.pop().file_id;
      const file = await bot.getFileLink(fileId);

      const res = await axios.get(file.href, { responseType: 'arraybuffer' });
      fs.writeFileSync('foto.jpg', res.data);

      // subir imagen
      const upload = await cloudinary.uploader.upload('foto.jpg');
      const imageUrl = upload.secure_url;

      await generarPDF(chatId, imageUrl);

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "Error procesando imagen");
    }
    return;
  }

  if (step === 'nombre') {
    userData[chatId].nombre = msg.text;
    userData[chatId].step = 'sexo';
    bot.sendMessage(chatId, "Sexo:");
  } 
  else if (step === 'sexo') {
    userData[chatId].sexo = msg.text;
    userData[chatId].step = 'domicilio';
    bot.sendMessage(chatId, "Domicilio:");
  }
  else if (step === 'domicilio') {
    userData[chatId].domicilio = msg.text;
    userData[chatId].step = 'curp';
    bot.sendMessage(chatId, "CURP:");
  }
  else if (step === 'curp') {
    userData[chatId].curp = msg.text;
    userData[chatId].step = 'clave';
    bot.sendMessage(chatId, "Clave:");
  }
  else if (step === 'clave') {
    userData[chatId].clave = msg.text;
    userData[chatId].step = 'foto';
    bot.sendMessage(chatId, "Envía la foto:");
  }
});

// ===== PHOTOPEA =====
async function generarPDF(chatId, imageUrl) {

  const data = userData[chatId];

  const script = `
  app.open("https://www.dropbox.com/scl/fi/m4ov3xrhfn1drinta0pe7/INE-2020.psd?raw=1");
  var doc = app.activeDocument;

  function setText(n,v){
    try{ doc.layers.getByName(n).textItem.contents = v }catch(e){}
  }

  setText("NOMBRE","${data.nombre}");
  setText("SEXO","${data.sexo}");
  setText("DOMICILIO","${data.domicilio}");
  setText("CURP","${data.curp}");
  setText("CLAVE","${data.clave}");

  // ===== FOTO (REEMPLAZO MEJORADO) =====
  var img = app.open("${imageUrl}");

  var target = doc.layers.getByName("perfil");

  app.activeDocument = img;
  img.activeLayer.duplicate(doc);

  app.activeDocument = doc;
  var newLayer = doc.activeLayer;

  newLayer.name = "perfil";

  // opcional: eliminar anterior si existe duplicado
  try {
    doc.layers.getByName("perfil copia").remove();
  } catch(e){}

  img.close();

  // ===== EXPORT =====
  doc.saveToOE("pdf");
  `;

  const response = await axios.post("https://www.photopea.com/api/", {
    script: script
  }, { responseType: 'arraybuffer' });

  fs.writeFileSync("resultado.pdf", response.data);

  await bot.sendDocument(chatId, "resultado.pdf");
}