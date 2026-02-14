const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = 3000;

/* ================================
   🔐 REMPLACE UNIQUEMENT TON TOKEN
================================ */
const token = '8574126323:AAEuUPVHPRdRe3qwZe7eMOl2zAY4r22yNik';

/* ================================
   📢 METS LE @ EXACT DE TON CANAL
   (ex: @MatchEdgeOfficial)
================================ */
const CHANNEL_USERNAME = '@MatchEdgeOfficial';

const bot = new TelegramBot(token, { polling: true });

/* ================================
   🚀 SERVEUR EXPRESS
================================ */

app.get('/', (req, res) => {
  res.send('MatchEdge Backend is running 🚀');
});

app.get('/ping', (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000");
});

/* ================================
   🤖 COMMANDES TELEGRAM
================================ */

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
    "/ping - Tester le bot\n" +
    "/post - Publier dans le canal"
  );
});

// /ping
bot.onText(/\/ping/, (msg) => {
  bot.sendMessage(msg.chat.id, "✅ Bot opérationnel.");
});

// /post
bot.onText(/\/post (.+)/, (msg, match) => {
  const textToPost = match[1];

  bot.sendMessage(CHANNEL_USERNAME, textToPost)
    .then(() => {
      bot.sendMessage(msg.chat.id, "✅ Message publié dans le canal.");
    })
    .catch((error) => {
      bot.sendMessage(msg.chat.id, "❌ Erreur de publication.");
      console.log(error);
    });
});

// Message normal
bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(
      msg.chat.id,
      "📌 Merci pour ton message.\nLes analyses arrivent bientôt 🔥"
    );
  }
});