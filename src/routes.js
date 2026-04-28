/**
 * ROUTE DEL CHATBOT - versione corretta con rilettura contatore da Supabase
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { authenticate } = require("./auth");
const { chat } = require("./engine");
const { sessions, incrementConversations, updateAnthropicKey, getClientByApiKey } = require("./database");

const router = express.Router();

// POST /chat
router.post("/chat", authenticate, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const client = req.client;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Il campo 'message' è obbligatorio." });
    }

    const currentSessionId = sessionId || uuidv4();
    const isNewConversation = !sessionId || !sessions.has(sessionId);

    if (isNewConversation) {
      try {
        // Rilegge il contatore aggiornato da Supabase prima di incrementare
        // Questo evita problemi con richieste simultanee
        const freshClient = await getClientByApiKey(client.apiKey);
        if (freshClient.conversationsUsed >= freshClient.conversationsLimit) {
          return res.status(429).json({
            error: "Limite conversazioni raggiunto. Aggiorna il tuo piano per continuare.",
          });
        }
        await incrementConversations(client.id);
        client.conversationsUsed = freshClient.conversationsUsed + 1;
      } catch (err) {
        console.error("Errore incremento:", err.message);
        return res.status(500).json({ error: "Errore interno. Riprova tra poco." });
      }
    }

    const result = await chat(currentSessionId, message.trim(), client);

    res.json({
      reply: result.message,
      sessionId: result.sessionId,
      botName: client.botName,
      conversationsLeft: client.conversationsLimit - client.conversationsUsed,
    });

  } catch (error) {
    console.error("Errore nel chat:", error.message);
    res.status(500).json({ error: "Errore interno del server. Riprova tra poco." });
  }
});

// GET /status
router.get("/status", authenticate, (req, res) => {
  const client = req.client;
  res.json({
    clientId: client.id,
    name: client.name,
    botName: client.botName,
    plan: client.plan,
    conversationsUsed: client.conversationsUsed,
    conversationsLimit: client.conversationsLimit,
    conversationsLeft: client.conversationsLimit - client.conversationsUsed,
    percentageUsed: Math.round((client.conversationsUsed / client.conversationsLimit) * 100),
    hasCustomKey: !!client.anthropicKey,
  });
});

// DELETE /session
router.delete("/session", authenticate, (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "Il campo 'sessionId' è obbligatorio." });
  }
  sessions.delete(sessionId);
  res.json({ message: "Sessione cancellata con successo.", sessionId });
});

// POST /api-key
router.post("/api-key", authenticate, async (req, res) => {
  const { anthropicKey } = req.body;
  const client = req.client;

  if (!anthropicKey || !anthropicKey.startsWith("sk-ant-")) {
    return res.status(400).json({
      error: "Chiave API non valida. Deve iniziare con sk-ant-",
    });
  }

  const saved = await updateAnthropicKey(client.id, anthropicKey);
  if (!saved) {
    return res.status(500).json({ error: "Errore nel salvataggio della chiave." });
  }

  client.anthropicKey = anthropicKey;
  res.json({ message: "Chiave API Anthropic impostata con successo.", clientId: client.id, hasCustomKey: true });
});

module.exports = router;
