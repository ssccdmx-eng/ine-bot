const TelegramBot = require('node-telegram-bot-api');
const generarPDF = require('./generate');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });

let userData = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userData[chatId] = { step: 'nombre' };
  bot.sendMessage(chatId, "Nombre completo:");
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (!userData[chatId]) return;

  const data = userData[chatId];

  if (data.step === 'nombre') {
    const partes = msg.text.toUpperCase().split(" ");
    data.nombre = partes[0] || "";
    data.paterno = partes[1] || "";
    data.materno = partes[2] || "";
    data.step = 'curp';
    return bot.sendMessage(chatId, "CURP:");
  }

  if (data.step === 'curp') {
    data.curp = msg.text;
    data.step = 'clave';
    return bot.sendMessage(chatId, "Clave de elector:");
  }

  if (data.step === 'clave') {
    data.clave = msg.text;

    // datos fijos demo
    data.sexo = "H";
    data.estado = "CDMX";
    data.registro = "2020";
    data.seccion = "1234";
    data.vigencia = "2030";

    try {
      await generarPDF(chatId, data);
      await bot.sendDocument(chatId, "resultado.pdf");
    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, "Error generando PDF");
    }
  }
});
