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
“🔮 Bot Prédictions 2025-2026 prêt !”,
Markup.keyboard([[“🔮 Prédictions du jour”]]).resize()
);
});

bot.hears(“🔮 Prédictions du jour”, async (ctx) => {
try {
if (!process.env.FOOTBALL_API_KEY) {
  return ctx.reply("❌ Clé API manquante.");
}

const today = new Date().toISOString().split("T")[0];

const fixturesRes = await axios.get(
  `https://v3.football.api-sports.io/fixtures?date=${today}`,
  {
    headers: {
      "x-apisports-key": process.env.FOOTBALL_API_KEY
    }
  }
);

requestCount++;

const matches = fixturesRes?.data?.response;

if (!matches || matches.length === 0) {
  return ctx.reply("⚠️ Aucun match aujourd'hui.");
}

let message = "🔮 PRÉDICTIONS OFFICIELLES\n\n";

const limitedMatches = matches.slice(0, 3);

for (const match of limitedMatches) {

  try {

    const predictionRes = await axios.get(
      `https://v3.football.api-sports.io/predictions?fixture=${match.fixture.id}`,
      {
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API_KEY
        }
      }
    );

    requestCount++;

    const predictionData = predictionRes?.data?.response;

    if (!predictionData || predictionData.length === 0) {
      continue;
    }

    const percent = predictionData[0]?.predictions?.percent;

    if (!percent) continue;

    message += `${match.teams.home.name} vs ${match.teams.away.name}\n`;
    message += `🏠 ${percent.home}\n`;
    message += `🤝 ${percent.draw}\n`;
    message += `🚀 ${percent.away}\n\n`;

  } catch (err) {
    console.log("Erreur prediction:", err.message);
  }
}

message += `📊 Requêtes utilisées : ${requestCount}/100`;

ctx.reply(message);
} catch (error) {
console.log(“Erreur globale:”, error.message);
ctx.reply(“❌ Erreur API ou limite atteinte.”);
}
});

bot.launch();

process.on(“unhandledRejection”, (err) => {
console.error(“Unhandled:”, err);
});
