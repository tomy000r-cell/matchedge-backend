const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");

const app = express();

const token = process.env.TELEGRAM_TOKEN;
const apiKey = process.env.API_FOOTBALL_KEY;

if (!token) {
  console.error("❌ TELEGRAM_TOKEN non défini !");
  process.exit(1);
}

if (!apiKey) {
  console.error("❌ API_FOOTBALL_KEY non définie !");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("✅ Bot Telegram lancé");

let apiRequestCount = 0;
let lastResetDate = new Date().toDateString();

function resetCounter() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    apiRequestCount = 0;
    lastResetDate = today;
  }
}

async function getLiveMatches() {
  resetCounter();

  if (apiRequestCount >= 95) {
    return [{ error: "⚠️ Limite API presque atteinte." }];
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
      const status = match.fixture.status.short;
      return ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(status);
    });

    if (!liveMatches.length) return [];

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
          minute: match.fixture.status.elapsed || 0,
          prediction:
            predRes.data.response[0].predictions.winner?.name ||
            "Indécis"
        });
      }
    }

    return results;

  } catch (err) {
    console.error("Erreur API:", err.response?.data || err.message);
    return [{ error: "❌ Erreur API." }];
  }
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 MatchEdge Bot prêt !", {
    reply_markup: {
      keyboard: [["🔥 Matchs Live"]],
      resize_keyboard: true
    }
  });
});

bot.on("message", async (msg) => {
  if (msg.text === "🔥 Matchs Live") {
    bot.sendMessage(msg.chat.id, "⏳ Recherche des matchs live...");

    const data = await getLiveMatches();

    if (!data.length) {
      return bot.sendMessage(
        msg.chat.id,
        "⚽ Aucun match en cours actuellement."
      );
    }

    if (data[0]?.error) {
      return bot.sendMessage(msg.chat.id, data[0].error);
    }

    for (let match of data) {
      bot.sendMessage(
        msg.chat.id,
        `🔥 ${match.home} vs ${match.away}
⏱ ${match.minute}'
🎯 Pronostic : ${match.prediction}`
      );
    }
  }
});

/* 🔵 Express obligatoire pour Render */
app.get("/", (req, res) => {
  res.send("MatchEdge Bot running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Serveur actif sur port ${PORT}`);
});