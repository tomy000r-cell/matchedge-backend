const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("BOT_TOKEN manquant !");
  process.exit(1);
}

const bot = new TelegramBot(token);

// Route test
app.get("/", (req, res) => {
  res.send("Bot actif");
});

// ✅ Webhook Telegram (IMPORTANT : string avec backticks)
app.post(/bot${token}, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Commande /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Bot opérationnel 🚀");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
