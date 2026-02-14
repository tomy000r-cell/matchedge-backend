const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const url = process.env.RENDER_EXTERNAL_URL;
const PORT = process.env.PORT || 10000;

if (!token) {
  console.error("❌ BOT_TOKEN manquant");
  process.exit(1);
}

if (!url) {
  console.error("❌ RENDER_EXTERNAL_URL manquant");
  process.exit(1);
}

const app = express();
app.use(express.json());

const bot = new TelegramBot(token);

// Route webhook FIXE (pas de ${}, pas de regex)
app.post("/telegram", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Activation webhook
bot.setWebHook(url + "/telegram");

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 MatchEdge Bot actif !");
});

bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id, "📊 Menu principal bientôt disponible...");
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
