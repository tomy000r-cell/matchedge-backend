require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const express = require("express");

const app = express();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// ===============================
// Vérification variables Render
// ===============================
if (!process.env.TELEGRAM_TOKEN || !process.env.API_FOOTBALL_KEY) {
  console.error("❌ Variables d'environnement manquantes !");
  process.exit(1);
}

// ===============================
// MENU PRINCIPAL
// ===============================
function sendMenu(ctx) {
  return ctx.reply(
    "🔥 MatchEdge Bot prêt !",
    Markup.keyboard([["🔥 Matchs Live"]])
      .resize()
      .oneTime(false)
  );
}

// Quand on clique sur DÉMARRER
bot.start((ctx) => {
  sendMenu(ctx);
});

// Si l'utilisateur écrit autre chose → on renvoie le menu
bot.on("message", (ctx) => {
  if (ctx.message.text === "🔥 Matchs Live") return;
  if (ctx.message.text === "/start") return;
  sendMenu(ctx);
});

// ===============================
// MATCHS LIVE
// ===============================
bot.hears("🔥 Matchs Live", async (ctx) => {
  try {
    await ctx.reply("⏳ Recherche des matchs...");

    let response;

    // Tentative LIVE
    try {
      response = await axios.get(
        "https://v3.football.api-sports.io/fixtures",
        {
          params: { live: "all" },
          headers: {
            "x-apisports-key": process.env.API_FOOTBALL_KEY,
          },
        }
      );
    } catch (err) {
      console.log("⚠️ Live bloqué, fallback date du jour...");
    }

    let matches = response?.data?.response || [];

    // Si aucun live → fallback date du jour
    if (!matches || matches.length === 0) {
      const today = new Date().toISOString().split("T")[0];

      const fallback = await axios.get(
        "https://v3.football.api-sports.io/fixtures",
        {
          params: { date: today },
          headers: {
            "x-apisports-key": process.env.API_FOOTBALL_KEY,
          },
        }
      );

      matches = fallback.data.response;
    }

    if (!matches || matches.length === 0) {
      return ctx.reply("⚽ Aucun match trouvé aujourd’hui.");
    }

    let message = "🔥 MATCHS 🔥\n\n";

    matches.slice(0, 10).forEach((match) => {
      const home = match.teams.home.name;
      const away = match.teams.away.name;
      const scoreHome = match.goals.home ?? 0;
      const scoreAway = match.goals.away ?? 0;
      const minute = match.fixture.status.elapsed ?? "NS";

      message += `🏟 ${home} ${scoreHome} - ${scoreAway} ${away} (${minute}')\n`;
    });

    ctx.reply(message);
  } catch (error) {
    console.error(error.response?.data || error.message);
    ctx.reply("❌ Erreur récupération des matchs.");
  }
});

// ===============================
// Serveur Express (Render obligatoire)
// ===============================
app.get("/", (req, res) => {
  res.send("MatchEdge Bot actif 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🌍 Serveur actif sur port " + PORT);
});

// ===============================
// Lancement bot
// ===============================
bot.launch();
console.log("✅ Bot Telegram lancé");

// Stop propre
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));