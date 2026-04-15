const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const generarPDF = require('./generate');

const TOKEN = process.env.TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

let userData = {};

if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');

// ===== START =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  userData[chatId] = {
    step: 'paterno'
  };

  bot.sendMessage(chatId, "Apellido paterno:");
});

// ===== MENSAJES =====
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (!userData[chatId]) return;

  let data = userData[chatId];

  try {

    // ===== FOTO =====
    if (msg.photo) {
      if (data.step !== 'foto') return;

      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const fileUrl = await bot.getFileLink(fileId);

      const res = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const filePath = `./tmp/${chatId}.jpg`;

      fs.writeFileSync(filePath, res.data);

      // base64
      const base64 = fs.readFileSync(filePath, { encoding: 'base64' });
      const image = `data:image/jpeg;base64,${base64}`;

      data.foto = image;
      data.fotoMini = image;
      data.firma = image;

      bot.sendMessage(chatId, "Generando PDF...");

      const pdf = await generarPDF(data);

      await bot.sendDocument(chatId, pdf);

      return;
    }

    // ===== FORMULARIO =====
    if (data.step === 'paterno') {
      data.paterno = msg.text;
      data.step = 'materno';
      return bot.sendMessage(chatId, "Apellido materno:");
    }

    if (data.step === 'materno') {
      data.materno = msg.text;
      data.step = 'nombre';
      return bot.sendMessage(chatId, "Nombre:");
    }

    if (data.step === 'nombre') {
      data.nombre = msg.text;
      data.step = 'domicilio';
      return bot.sendMessage(chatId, "Domicilio:");
    }

    if (data.step === 'domicilio') {
      data.domicilio = msg.text;
      data.step = 'curp';
      return bot.sendMessage(chatId, "CURP:");
    }

    if (data.step === 'curp') {
      data.curp = msg.text;
      data.step = 'clave';
      return bot.sendMessage(chatId, "Clave:");
    }

    if (data.step === 'clave') {
      data.clave = msg.text;
      data.step = 'sexo';
      return bot.sendMessage(chatId, "Sexo:");
    }

    if (data.step === 'sexo') {
      data.sexo = msg.text;
      data.step = 'estado';
      return bot.sendMessage(chatId, "Estado:");
    }

    if (data.step === 'estado') {
      data.estado = msg.text;
      data.step = 'registro';
      return bot.sendMessage(chatId, "Año de registro:");
    }

    if (data.step === 'registro') {
      data.registro = msg.text;
      data.step = 'seccion';
      return bot.sendMessage(chatId, "Sección:");
    }

    if (data.step === 'seccion') {
      data.seccion = msg.text;
      data.step = 'vigencia';
      return bot.sendMessage(chatId, "Vigencia:");
    }

    if (data.step === 'vigencia') {
      data.vigencia = msg.text;
      data.step = 'foto';
      return bot.sendMessage(chatId, "Envía la foto:");
    }

  } catch (e) {
    console.log(e);
    bot.sendMessage(chatId, "Error procesando datos");
  }
});
