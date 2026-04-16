const TelegramBot = require('node-telegram-bot-api');
const generatePDF = require('./generate');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ====== DATA TEMPORAL POR USUARIO ======
const userData = {};

// ====== INICIO ======
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  userData[chatId] = {};

  bot.sendMessage(chatId, 'Ingresa tu NOMBRE:');
});

// ====== MENSAJES ======
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (!userData[chatId]) return;

  const text = msg.text;

  // flujo básico
  if (!userData[chatId].nombre) {
    userData[chatId].nombre = text;
    return bot.sendMessage(chatId, 'Apellido paterno:');
  }

  if (!userData[chatId].paterno) {
    userData[chatId].paterno = text;
    return bot.sendMessage(chatId, 'Apellido materno:');
  }

  if (!userData[chatId].materno) {
    userData[chatId].materno = text;
    return bot.sendMessage(chatId, 'CURP:');
  }

  if (!userData[chatId].curp) {
    userData[chatId].curp = text;
    return bot.sendMessage(chatId, 'Domicilio:');
  }

  if (!userData[chatId].domicilio) {
    userData[chatId].domicilio = text;

    // valores fijos por ahora
    userData[chatId].sexo = 'H';
    userData[chatId].estado = 'CDMX';
    userData[chatId].registro = '2020';
    userData[chatId].seccion = '1234';
    userData[chatId].vigencia = '2030';
    userData[chatId].clave = 'ABC123456';

    return bot.sendMessage(chatId, 'Ahora envía tu FOTO');
  }
});

// ====== FOTO ======
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;

  if (!userData[chatId]) return;

  try {
    const photo = msg.photo[msg.photo.length - 1];
    const file = await bot.getFile(photo.file_id);

    const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    // guardar imagen como base64
    userData[chatId].foto = url;
    userData[chatId].fotoMini = url;
    userData[chatId].firma = url;

    bot.sendMessage(chatId, 'Generando PDF...');

    // 👇 AQUÍ SE USA DATA CORRECTAMENTE
    const pdf = await generatePDF(userData[chatId]);

    await bot.sendDocument(chatId, pdf);

    delete userData[chatId];

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Error generando PDF');
  }
});
