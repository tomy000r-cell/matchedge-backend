const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ TON TOKEN (comme tu l’as demandé)
const token = "8574126323:AAEuUPVHPRdRe3qwZe7eMOl2zAY4r22yNik";

// Création du bot
const bot = new TelegramBot(token, { polling: true });

// ===============================
// ROUTES EXPRESS
// ===============================

app.get("/", (req, res) => {
  res.send("🚀 MatchEdge Backend is running");
});

app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// ===============================
// COMMANDES TELEGRAM
// ===============================

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🔥 Bienvenue sur MatchEdge !\n\n" +
    "✅ Bot connecté\n" +
    "📊 Analyses en préparation\n" +
    "🚀 On construit du solide\n\n" +
    "Tape /help pour voir les commandes disponibles."
  );
});

// /help
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "📋 Commandes disponibles :\n\n" +
    "/start - Démarrer le bot\n" +
    "/help - Voir les commandes\n" +
    "/ping - Tester le bot"
  );
});

// /ping
bot.onText(/\/ping/, (msg) => {
  bot.sendMessage(msg.chat.id, "✅ Bot opérationnel.");
});

// Message normal
bot.on("message", (msg) => {
  if (msg.text && !msg.text.startsWith("/")) {
    bot.sendMessage(
      msg.chat.id,
      "📌 Merci pour ton message.\nLes analyses arrivent bientôt 🔥"
    );
  }
});

// ===============================
// LANCEMENT SERVEUR
// ===============================

app.listen(PORT, () => {
  console.log(✅ Server running on port ${PORT});
});