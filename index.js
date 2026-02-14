const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("BOT_TOKEN manquant !");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("Bot actif ✅");
});

app.post(`/bot${token}`, async (req, res) => {
  try {
    const message = req.body.message;

    if (message && message.text === "/start") {
      await axios.post(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          chat_id: message.chat.id,
          text: "Bienvenue sur MatchEdge 🚀"
        }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Serveur lancé sur le port " + PORT);
});