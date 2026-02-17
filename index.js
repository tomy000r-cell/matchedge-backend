const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const apiKey = process.env.API_FOOTBALL_KEY;

if (!token || !apiKey) {
  console.log("❌ Variables manquantes !");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

let apiRequestCount = 0;
let currentDate = new Date().toLocaleDateString('en-CA');

// 🔹 Reset compteur chaque jour
function resetCounter() {
  const today = new Date().toLocaleDateString('en-CA');
  if (today !== currentDate) {
    currentDate = today;
    apiRequestCount = 0;
  }
}

// 🔹 Fonction principale
async function getPredictions() {

  resetCounter();

  const today = new Date().toLocaleDateString('en-CA');

  // 1️⃣ On récupère les matchs du jour
  const fixturesRes = await axios.get(
    `https://v3.football.api-sports.io/fixtures?date=${today}`,
    {
      headers: { "x-apisports-key": apiKey }
    }
  );

  apiRequestCount++;

  const fixtures = fixturesRes.data.response;

  if (!fixtures.length) return [];

  const topFixtures = fixtures.slice(0, 5);

  let results = [];

  // 2️⃣ On récupère prédictions pour chaque match
  for (let match of topFixtures) {

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

// 🔹 MENU
const menu = {
  reply_markup: {
    keyboard: [[{ text: "📊 Prédictions du jour" }]],
    resize_keyboard: true
  }
};

// 🔹 START = envoie direct les prédictions
bot.onText(/\/start/, async (msg) => {

  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Bienvenue sur MatchEdge 🚀", menu);

  try {

    const predictions = await getPredictions();

    if (!predictions.length) {
      return bot.sendMessage(chatId, "Aucune prédiction disponible aujourd'hui ❌");
    }

    let message = "📊 PRÉDICTIONS DU JOUR\n\n";

    predictions.forEach(p => {
      message += `⚽ ${p.teams.home.name} vs ${p.teams.away.name}\n`;
      message += `🔮 ${p.predictions.winner?.name || "Match équilibré"}\n`;
      message += `📈 ${p.predictions.percent.home} | ${p.predictions.percent.draw} | ${p.predictions.percent.away}\n\n`;
    });

    message += `\n📡 Requêtes utilisées : ${apiRequestCount}/100`;

    bot.sendMessage(chatId, message);

  } catch (err) {
    console.log(err.response?.data || err.message);
    bot.sendMessage(chatId, "Erreur API ⚠️");
  }
});

// 🔹 Bouton
bot.on("message", async (msg) => {

  if (!msg.text || msg.text.startsWith("/")) return;

  if (msg.text === "📊 Prédictions du jour") {

    try {

      const predictions = await getPredictions();

      if (!predictions.length) {
        return bot.sendMessage(msg.chat.id, "Aucune prédiction disponible aujourd'hui ❌");
      }

      let message = "📊 PRÉDICTIONS DU JOUR\n\n";

      predictions.forEach(p => {
        message += `⚽ ${p.teams.home.name} vs ${p.teams.away.name}\n`;
        message += `🔮 ${p.predictions.winner?.name || "Match équilibré"}\n`;
        message += `📈 ${p.predictions.percent.home} | ${p.predictions.percent.draw} | ${p.predictions.percent.away}\n\n`;
      });

      message += `\n📡 Requêtes utilisées : ${apiRequestCount}/100`;

      bot.sendMessage(msg.chat.id, message);

    } catch (err) {
      console.log(err.response?.data || err.message);
      bot.sendMessage(msg.chat.id, "Erreur API ⚠️");
    }
  }
});

console.log("🤖 Bot lancé proprement.");