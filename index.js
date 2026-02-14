const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const url = process.env.RENDER_EXTERNAL_URL;

const app = express();
app.use(express.json());

const bot = new TelegramBot(token);

// Webhook route
app.post(/bot${token}, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Set webhook
bot.setWebHook(${url}/bot${token});

// Commandes
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 MatchEdge Bot actif !");
});

bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id, "📊 Menu principal bientôt disponible...");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
