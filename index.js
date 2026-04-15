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

    if (msg.photo) {
  try {
    const fileId = msg.photo.pop().file_id;
    const file = await bot.getFileLink(fileId);

    const imageUrl = file.href; // URL directa de Telegram

    const data = userData[chatId];

    // 👇 AQUÍ GUARDAS LAS IMÁGENES
    if (!data.foto) {
      data.foto = imageUrl;
      return bot.sendMessage(chatId, "Ahora envía la FOTO MINI:");
    }

    if (!data.fotoMini) {
      data.fotoMini = imageUrl;
      return bot.sendMessage(chatId, "Ahora envía la FIRMA:");
    }

    if (!data.firma) {
      data.firma = imageUrl;

      // 🔥 YA TIENES TODO → GENERAR PDF
      await generarPDF(chatId, data);
      return bot.sendDocument(chatId, "resultado.pdf");
    }

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "Error procesando imagen");
  }
}

    // datos fijos demo
    data.sexo = "H";
    data.estado = "CDMX";
    data.registro = "2020";
    data.seccion = "1234";
    data.vigencia = "2030";

const allData = {
  ...data,
  foto: data.foto || "",
  fotoMini: data.fotoMini || "",
  firma: data.firma || "",
  qr,
  barcode: barcodeBase64,
  mrz
};
    
    try {
      await generarPDF(chatId, data);
      await bot.sendDocument(chatId, "resultado.pdf");
    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, "Error generando PDF");
    }
  }
});
