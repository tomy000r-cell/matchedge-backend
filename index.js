const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const apiKey = process.env.API_FOOTBALL_KEY;

const bot = new TelegramBot(token, { polling: true });

// MENU AVEC 1 BOUTON
const menu = {
  reply_markup: {
    keyboard: [[{ text: "📊 Prédictions du jour" }]],
    resize_keyboard: true
  }
};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Bienvenue sur MatchEdge 🚀", menu);
});

// QUAND ON CLIQUE SUR LE BOUTON
bot.on('message', async (msg) => {
  if (msg.text === "📊 Prédictions du jour") {
    try {
      const today = new Date().toISOString().split('T')[0];

      const response = await axios.get(
        `https://v3.football.api-sports.io/predictions?date=${today}`,
        {
          headers: { 'x-apisports-key': apiKey }
        }
      );

      const predictions = response.data.response;

      if (!predictions.length) {
        return bot.sendMessage(msg.chat.id, "Aucune prédiction aujourd'hui ❌");
      }

      let message = "📊 Prédictions du jour :\n\n";

      predictions.slice(0, 5).forEach(p => {
        message += `⚽ ${p.teams.home.name} vs ${p.teams.away.name}\n`;
        message += `🔮 ${p.predictions.winner?.name || "Match serré"}\n`;
        message += `📈 Probabilité: ${p.predictions.percent.home} / ${p.predictions.percent.draw} / ${p.predictions.percent.away}\n\n`;
      });

      bot.sendMessage(msg.chat.id, message);

    } catch (error) {
      console.log(error);
      bot.sendMessage(msg.chat.id, "Erreur API ⚠️");
    }
  }
});

console.log("Bot démarré...");