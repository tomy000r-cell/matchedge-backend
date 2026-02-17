require('dotenv').config();
const { Telegraf } = require('telegraf');

if (!process.env.BOT_TOKEN) {
  console.error('BOT_TOKEN manquant');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('BOT OK ✅');
});

bot.launch()
  .then(() => console.log('Bot lancé'))
  .catch((err) => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));