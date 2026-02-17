require(‘dotenv’).config();
const express = require(“express”);
const { Telegraf, Markup } = require(“telegraf”);
const axios = require(“axios”);

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

let requestCount = 0;

app.get(”/”, (req, res) => {
res.send(“Bot actif 🚀”);
});

app.listen(process.env.PORT || 3000, () => {
console.log(“Serveur actif”);
});

bot.start((ctx) => {
ctx.reply(
“🔮 Bot Prédictions 2025-2026\n\nClique pour voir les prédictions officielles.”,
Markup.keyboard([[“🔮 Prédictions du jour”]]).resize()
);
});

bot.hears(“🔮 Prédictions du jour”, async (ctx) => {
try {
if (!process.env.FOOTBALL_API_KEY) {
  return ctx.reply("❌ Clé API manquante.");
}

const today = new Date().toISOString().split("T")[0];

// 1️⃣ Récupérer matchs du jour
const fixtures = await axios.get(
  `https://v3.football.api-sports.io/fixtures?date=${today}`,
  {
    headers: {
      "x-apisports-key": process.env.FOOTBALL_API_KEY
    }
  }
);

requestCount++;

const matches = fixtures.data.response.slice(0, 5);

if (matches.length === 0) {
  return ctx.reply("⚠️ Aucun match aujourd'hui.");
}

let message = "🔮 PRÉDICTIONS OFFICIELLES\n\n";

for (const match of matches) {

  const prediction = await axios.get(
    `https://v3.football.api-sports.io/predictions?fixture=${match.fixture.id}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY
      }
    }
  );

  requestCount++;

  const data = prediction.data.response[0];

  if (!data) continue;

  message += `${match.teams.home.name} vs ${match.teams.away.name}\n`;
  message += `🏠 ${data.predictions.percent.home}%\n`;
  message += `🤝 ${data.predictions.percent.draw}%\n`;
  message += `🚀 ${data.predictions.percent.away}%\n\n`;
}

message += `📊 Requêtes utilisées : ${requestCount}/100`;

ctx.reply(message);
} catch (error) {
console.log(error.response?.data || error.message);
ctx.reply(“❌ Erreur API ou limite atteinte.”);
}
});

bot.launch();
