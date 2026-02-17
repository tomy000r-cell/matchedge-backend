const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const apiKey = process.env.API_FOOTBALL_KEY;

if (!token || !apiKey) {
  console.log("❌ BOT_TOKEN ou API_FOOTBALL_KEY manquant !");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

let cachedPredictions = null;
let lastUpdate = 0;

let apiRequestCount = 0;
let currentDate = new Date().toISOString().split("T")[0];

// 🔹 MENU
const menu = {
  reply_markup: {
    keyboard: [[{ text: "📊 Prédictions du jour" }]],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

// 🔹 RESET compteur chaque jour
function resetCounterIfNewDay() {
  const today = new Date().toISOString().split("T")[0];
  if (today !== currentDate) {
    currentDate = today;
    apiRequestCount = 0;
    console.log("🔄 Compteur réinitialisé pour le nouveau jour");
  }
}

// 🔹 START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Bienvenue sur MatchEdge 🚀\nClique sur le bouton pour voir les prédictions.",
    menu
  );
});

// 🔹 Fonction API avec compteur
async function updatePredictions() {

  resetCounterIfNewDay();

  const now = Date.now();

  if (cachedPredictions && now - lastUpdate < 15 * 60 * 1000) {
    return cachedPredictions;
  }

  if (apiRequestCount >= 100) {
    throw new Error("Limite API atteinte");
  }

  const today = new Date().toISOString().split("T")[0];

  const response = await axios.get(
    `https://v3.football.api-sports.io/predictions?date=${today}`,
    {
      headers: {
        "x-apisports-key": apiKey
      }
    }
  );

  apiRequestCount++;
  console.log(`📡 Requête API utilisée : ${apiRequestCount}/100`);

  cachedPredictions = response.data.response;
  lastUpdate = now;

  return cachedPredictions;
}

// 🔹 Gestion messages
bot.on("message", async (msg) => {

  if (!msg.text || msg.text.startsWith("/")) return;

  if (msg.text === "📊 Prédictions du jour") {
    try {

      const predictions = await updatePredictions();

      if (!predictions || predictions.length === 0) {
        return bot.sendMessage(msg.chat.id, "Aucune prédiction aujourd'hui ❌");
      }

      let message = "📊 PRÉDICTIONS DU JOUR\n\n";

      predictions.slice(0, 5).forEach(p => {
        message += `⚽ ${p.teams.home.name} vs ${p.teams.away.name}\n`;
        message += `🔮 ${p.predictions.winner?.name || "Match équilibré"}\n`;
        message += `📈 ${p.predictions.percent.home} | ${p.predictions.percent.draw} | ${p.predictions.percent.away}\n\n`;
      });

      message += `\n📡 Requêtes API utilisées aujourd'hui : ${apiRequestCount}/100`;

      bot.sendMessage(msg.chat.id, message);

    } catch (error) {

      if (error.message === "Limite API atteinte") {
        return bot.sendMessage(
          msg.chat.id,
          "⚠️ Limite de 100 requêtes API atteinte pour aujourd'hui."
        );
      }

      console.log("❌ ERREUR API:", error.response?.data || error.message);
      bot.sendMessage(msg.chat.id, "Erreur API ⚠️ Vérifie ta clé.");
    }
  }
});

console.log("🤖 Bot démarré avec compteur API...");