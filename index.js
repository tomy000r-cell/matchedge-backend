require('dotenv').config();
const { Telegraf } = require('telegraf');

console.log("=== DEMARRAGE SCRIPT ===");

if (!process.env.BOT_TOKEN) {
  console.log("BOT_TOKEN MANQUANT");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  console.log("MESSAGE /start RECU");
  ctx.reply("BOT OK ✅");
});

bot.launch().then(() => {
  console.log("=== BOT LANCE AVEC SUCCES ===");
}).catch(err => {
  console.log("ERREUR LANCEMENT:", err);
});