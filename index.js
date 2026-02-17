const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.TELEGRAM_TOKEN;
const apiKey = process.env.API_FOOTBALL_KEY;

const bot = new TelegramBot(token, { polling: true });

let apiRequestCount = 0;
let lastResetDate = new Date().toDateString();

function resetCounter() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    apiRequestCount = 0;
    lastResetDate = today;
  }
}

async function getLivePredictions() {
  resetCounter();

  if (apiRequestCount >= 95) {
    return [{ error: "⚠️ Limite API gratuite presque atteinte (100/jour)." }];
  }

  try {
    const liveRes = await axios.get(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        headers: { "x-apisports-key": apiKey }
      }
    );

    apiRequestCount++;

    const liveMatches = liveRes.data.response.filter(match => {
      const s = match.fixture.status.short;
      return ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(s);
    });

    if (!liveMatches.length) {
      return [];
    }

    let results = [];

    for (let match of liveMatches.slice(0, 5)) {
      if (apiRequestCount >= 100) break;

      const predRes = await axios.get(
        `https://v3.football.api-sports.io/predictions?fixture=${match.fixture.id}`,
        {
          headers: { "x-apisports-key": apiKey }
        }
      );

      apiRequestCount++;

      if (predRes.data.response.length > 0) {
        results.push({
          home: match.teams.home.name,
          away: match.teams.away.name,
          minute: match.fixture.status.elapsed,
          prediction: predRes.data.response[0].predictions.winner?.name || "Indécis"
        });
      }
    }

    return results;

  } catch (error) {
    console.log(error.response?.data || error.message);
    return [{ error: "Erreur API ❌" }];
  }
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🤖 Bot démarré ! Clique sur 🔥 Matchs Live", {
    reply_markup: {
      keyboard: [["🔥 Matchs Live"]],
      resize_keyboard: true
    }
  });
});

bot.on("message", async (msg) => {
  if (msg.text === "🔥 Matchs Live") {
    bot.sendMessage(msg.chat.id, "⏳ Recherche des matchs en cours...");

    const data = await getLivePredictions();

    if (!data.length) {
      return bot.sendMessage(msg.chat.id, "⚽ Aucun match en cours actuellement.");
    }

    if (data[0]?.error) {
      return bot.sendMessage(msg.chat.id, data[0].error);
    }

    for (let match of data) {
      bot.sendMessage(
        msg.chat.id,
        `🔥 ${match.home} vs ${match.away}\n⏱ ${match.minute}'\n🎯 Pronostic : ${match.prediction}`
      );
    }
  }
});