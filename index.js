require('dotenv').config();
const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

if (!process.env.BOT_TOKEN) {
  console.error('BOT_TOKEN manquant.');
  process.exit(1);
}

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

let requestCount = 0;

app.get('/', (req, res) => {
  res.send('Bot actif');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Serveur actif');
});

bot.start((ctx) => {
  ctx.reply(
    '🔮 Bot Prédictions 2025-2026 prêt !',
    Markup.keyboard([['🔮 Prédictions du jour']]).resize()
  );
});

bot.hears('🔮 Prédictions du jour', async (ctx) => {
  try {

    if (!process.env.FOOTBALL_API_KEY) {
      return ctx.reply('Clé API FOOTBALL_API_KEY manquante.');
    }

    const today = new Date().toISOString().split('T')[0];

    const fixturesRes = await axios.get(
      'https://v3.football.api-sports.io/fixtures?date=' + today,
      {
        headers: {
          'x-apisports-key': process.env.FOOTBALL_API_KEY
        }
      }
    );

    requestCount++;

    if (!fixturesRes.data || !fixturesRes.data.response) {
      return ctx.reply('Erreur récupération matchs.');
    }

    const matches = fixturesRes.data.response;

    if (matches.length === 0) {
      return ctx.reply('Aucun match aujourd\'hui.');
    }

    let message = '🔮 PRÉDICTIONS OFFICIELLES\n\n';

    const limitedMatches = matches.slice(0, 3);

    for (const match of limitedMatches) {
      try {

        const predictionRes = await axios.get(
          'https://v3.football.api-sports.io/predictions?fixture=' + match.fixture.id,
          {
            headers: {
              'x-apisports-key': process.env.FOOTBALL_API_KEY
            }
          }
        );

        requestCount++;

        if (
          !predictionRes.data ||
          !predictionRes.data.response ||
          predictionRes.data.response.length === 0
        ) {
          continue;
        }

        const prediction = predictionRes.data.response[0];

        if (!prediction.predictions || !prediction.predictions.percent) {
          continue;
        }

        const percent = prediction.predictions.percent;

        message += match.teams.home.name + ' vs ' + match.teams.away.name + '\n';
        message += '🏠 Victoire domicile : ' + percent.home + '\n';
        message += '🤝 Match nul : ' + percent.draw + '\n';
        message += '🚀 Victoire extérieur : ' + percent.away + '\n\n';

      } catch (err) {
        console.log('Erreur prediction:', err.message);
      }
    }

    message += 'Requêtes utilisées aujourd’hui : ' + requestCount + '/100';

    ctx.reply(message);

  } catch (error) {
    console.log('Erreur globale:', error.message);
    ctx.reply('Erreur API ou limite atteinte.');
  }
});

bot.launch()
  .then(() => console.log('Bot Telegram lancé'))
  .catch((err) => console.error('Erreur lancement bot:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));