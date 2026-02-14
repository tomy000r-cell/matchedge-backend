const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;
const url = process.env.RENDER_EXTERNAL_URL;

const bot = new TelegramBot(token);

app.get("/", (req, res) => {
  res.send("🚀 Bot is running");
});

// Webhook route
app.post(/bot${token}, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Command /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🔥 Bienvenue sur MatchEdgeBot !\n\nLe bot fonctionne correctement."
  );
});

// Lancement serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
  console.log(🚀 Server running on port ${PORT});

  if (url) {
    await bot.setWebHook(${url}/bot${token});
    console.log("✅ Webhook configuré");
  }
});
