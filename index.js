const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.BOT_TOKEN;
const url = process.env.RENDER_EXTERNAL_URL;

const app = express();
app.use(express.json());

const bot = new TelegramBot(token);

bot.setWebHook(${url}/bot${token});

app.post(/bot${token}, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, "Bot actif 🚀");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
