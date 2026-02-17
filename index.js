const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const apiKey = process.env.API_FOOTBALL_KEY;

const bot = new TelegramBot(token, { polling: true });

let cachedPredictions = null;
let lastUpdate = 0;

// MENU
const menu = {
  reply_markup: {
    keyboard: [[{ text: "📊 Prédictions Live" }]],
    resize_keyboard: true
  }
};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Bienvenue 🚀", menu);
});

// Fonction pour mettre à jour cache
async function updatePredictions() {
  const now = Date.now();

  // 15 minutes
  if (now - lastUpdate < 15 * 60 * 1000 && cachedPredictions) {
    return cachedPredictions;
  }

  const today = new Date().toISOString().split('T')[0];

  const response = await axios.get(
    `https://v3.football.api-sports.io/predictions?date=${today}`,
    {
      headers: { 'x-apisports-key': apiKey }
    }
  );

  cachedPredictions = response.data.response;
  lastUpdate = now;

  return cachedPredictions;
}

bot.on('message', async (msg) => {
  if (msg.text === "📊 Prédictions Live") {
    try {
      const predictions = await updatePredictions();

      if (!predictions.length) {
        return bot.sendMessage(msg.chat.id, "Aucun match aujourd'hui ❌");
      }

      let message = "📊 Prédictions en cours :\n\n";

      predictions.slice(0, 5).forEach(p => {
        message += `⚽ ${p.teams.home.name} vs ${p.teams.away.name}\n`;
        message += `🔮 ${p.predictions.winner?.name || "Match serré"}\n`;
        message += `📈 ${p.predictions.percent.home} / ${p.predictions.percent.draw} / ${p.predictions.percent.away}\n\n`;
      });

      bot.sendMessage(msg.chat.id, message);

    } catch (err) {
      console.log(err);
      bot.sendMessage(msg.chat.id, "Erreur API ⚠️");
    }
  }
});

console.log("Bot démarré...");