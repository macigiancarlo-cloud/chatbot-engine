/**
 * MIDDLEWARE DI AUTENTICAZIONE
 * Aggiornato per gestire correttamente gli errori asincroni.
 */

const { getClientByApiKey } = require("./database");

async function authenticate(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        error: "Chiave API mancante. Includi l'header x-api-key nella richiesta.",
      });
    }

    const client = await getClientByApiKey(apiKey);

    if (!client) {
      return res.status(403).json({
        error: "Chiave API non valida o cliente non trovato.",
      });
    }

    if (client.conversationsUsed >= client.conversationsLimit) {
      return res.status(429).json({
        error: "Limite conversazioni raggiunto. Aggiorna il tuo piano per continuare.",
        used: client.conversationsUsed,
        limit: client.conversationsLimit,
        plan: client.plan,
      });
    }

    req.client = client;
    next();
  } catch (error) {
    console.error("Errore autenticazione:", error.message);
    return res.status(500).json({ error: "Errore interno del server durante l'autenticazione." });
  }
}

module.exports = { authenticate };
