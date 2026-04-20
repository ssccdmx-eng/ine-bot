require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const generatePDF = require('./generate');
const axios = require('axios');

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error('BOT_TOKEN no definido');
}

const bot = new TelegramBot(token, { polling: true });

const userData = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  userData[chatId] = { step: 'nombre' };

  bot.sendMessage(chatId, 'Ingresa nombre:');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (!userData[chatId]) return;

  const state = userData[chatId];

  try {
    if (state.step === 'nombre') {
      state.nombre = msg.text;
      state.step = 'paterno';
      return bot.sendMessage(chatId, 'Apellido paterno:');
    }

    if (state.step === 'paterno') {
      state.paterno = msg.text;
      state.step = 'materno';
      return bot.sendMessage(chatId, 'Apellido materno:');
    }

    if (state.step === 'materno') {
      state.materno = msg.text;
      state.step = 'curp';
      return bot.sendMessage(chatId, 'CURP:');
    }

    if (state.step === 'curp') {
      if (!/^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}$/.test(msg.text)) {
        return bot.sendMessage(chatId, 'CURP inválida');
      }

      state.curp = msg.text;
      state.step = 'foto';
      return bot.sendMessage(chatId, 'Envía tu foto');
    }

    if (msg.photo && state.step === 'foto') {
      const fileId = msg.photo[msg.photo.length - 1].file_id;

      const file = await bot.getFile(fileId);
      const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

      const res = await axios.get(url, { responseType: 'arraybuffer' });

      state.fotoBuffer = Buffer.from(res.data);

      bot.sendMessage(chatId, 'Generando PDF...');

      const pdf = await generatePDF(state);

      await bot.sendDocument(chatId, pdf);

      delete userData[chatId];
    }

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Error procesando datos');
  }
});
