const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Token Telegram depuis Render (Environment Variable)
const token = process.env.BOT_TOKEN;

if (!token) {
console.error("BOT_TOKEN manquant !");
process.exit(1);
}

// Route test (ouvre ton URL Render dans le navigateur)
app.get("/", (req, res) => {
res.send("Bot actif ✅");
});

// Webhook Telegram
app.post(`/bot${token}`, async (req, res) => {
const message = req.body.message;

if (message && message.text === "/start") {
try {
await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
chat_id: message.chat.id,
text: "Bot opérationnel 🚀",
});
} catch (error) {
console.error("Erreur envoi message:", error.response?.data || error.message);
}
}

res.sendStatus(200);
});

// Démarrage serveur
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
console.log(`Serveur lancé sur le port ${PORT}`);
});
