const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const apiKey = process.env.API_FOOTBALL_KEY;

if (!token || !apiKey) {
  console.log("❌ Variables manquantes");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

let apiRequestCount = 0;
let currentDate = new Date().toLocaleDateString('en-CA');

function resetCounter() {
  const today = new Date().toLocaleDateString('en-CA');
  if (today !== currentDate) {
    currentDate = today;
    apiRequestCount = 0;
  }
}

async function getLivePredictions() {

  resetCounter();

  // 1️⃣ Matchs live
  const liveRes = await axios.get(
    `https://v3.football.api-sports.io/fixtures?live=all`,
    {
      headers: { "x-apisports-key": apiKey }
    }
  );

  apiRequestCount++;

  const liveMatches = liveRes.data.response;

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
      results.push(predRes.data.response[0]);
    }
  }

  return results;
}

const menu = {
  reply_markup: {
    keyboard: [[{ text: "🔥 Matchs Live" }]],
    resize_keyboard: true
  }
};

async function sendLive(chatId) {

  try {

    const predictions = await getLivePredictions();

    if (!predictions.length) {
      return bot.sendMessage(chatId, "⚽ Aucun match en cours actuellement.", menu);
    }

    let message = "🔥 MATCHS LIVE AVEC PRÉDICTIONS\n\n";

    predictions.forEach(p => {
      message += `⚽ ${p.teams.home.name} vs ${p.teams.away.name}\n`;
      message += `🔮 ${p.predictions.winner?.name || "Match équilibré"}\n`;
      message += `📈 ${p.predictions.percent.home} | ${p.predictions.percent.draw} | ${p.predictions.percent.away}\n\n`;
    });

    message += `\n📡 Requêtes utilisées : ${apiRequestCount}/100`;

    bot.sendMessage(chatId, message, menu);

  } catch (err) {
    console.log(err.response?.data || err.message);
    bot.sendMessage(chatId, "❌ Erreur API", menu);
  }
}

// 🔹 Dès que l'utilisateur clique START
bot.onText(/\/start/, async (msg) => {
  await sendLive(msg.chat.id);
});

// 🔹 Bouton live
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  if (msg.text === "🔥 Matchs Live") {
    await sendLive(msg.chat.id);
  }
});

console.log("🤖 Bot LIVE lancé");