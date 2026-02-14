const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const TOKEN = '8574126323:AAEuUPVHPRdRe3qwZe7eMOl2zAY4r22yNik';

const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Route test Render
app.get('/', (req, res) => {
  res.send('Bot is running');
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});

// Réponse Telegram
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Bot opérationnel ✅');
});
