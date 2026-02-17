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

// 🔹 MENU
const menu = {
  reply_markup: {
    keyboard: [[{ text: "📊 Prédictions du jour" }]],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

// 🔹 START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Bienvenue sur MatchEdge 🚀\nClique sur le bouton pour voir les prédictions.",
    menu
  );
});

// 🔹 Fonction mise à jour cache (15 min)
async function updatePredictions() {
  const now = Date.now();

  if (cachedPredictions && now - lastUpdate < 15 * 60 * 1000) {
    return cachedPredictions;
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

  cachedPredictions = response.data.response;
  lastUpdate = now;

  console.log("✅ Cache mis à jour");
  return cachedPredictions;
}

// 🔹 Gestion des messages
bot.on("message", async (msg) => {

  if (!msg.text || msg.text.startsWith("/")) return;

  if (msg.text === "📊 Prédictions du jour") {
    try {

      const predictions = await updatePredictions();

      if (!predictions || predictions.length === 0) {
        return bot.sendMessage(msg.chat.id, "Aucune prédiction disponible aujourd'hui ❌");
      }

      let message = "📊 PRÉDICTIONS DU JOUR\n\n";

      predictions.slice(0, 5).forEach(p => {
        message += `⚽ ${p.teams.home.name} vs ${p.teams.away.name}\n`;
        message += `🔮 Gagnant probable: ${p.predictions.winner?.name || "Match équilibré"}\n`;
        message += `📈 Probabilités: ${p.predictions.percent.home} | ${p.predictions.percent.draw} | ${p.predictions.percent.away}\n\n`;
      });

      bot.sendMessage(msg.chat.id, message);

    } catch (error) {
      console.log("❌ ERREUR API:", error.response?.data || error.message);
      bot.sendMessage(msg.chat.id, "Erreur API ⚠️ Vérifie ta clé API.");
    }
  }
});

console.log("🤖 Bot démarré...");