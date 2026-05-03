/**
 * ROUTE DEL CHATBOT
 * Gestione errori Anthropic con messaggi specifici per il cliente.
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { authenticate } = require("./auth");
const { chat } = require("./engine");
const { sessions, incrementConversations, updateAnthropicKey, getClientByApiKey } = require("./database");

const router = express.Router();

// Mappa codici errore Anthropic a codici HTTP appropriati
const ANTHROPIC_ERROR_CODES = new Set([
  "MISSING_API_KEY",
  "INVALID_API_KEY",
  "RATE_LIMIT",
  "INSUFFICIENT_CREDITS",
  "API_OVERLOADED",
  "API_ERROR",
]);

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

    // Se l'errore proviene da Anthropic, restituisce il messaggio specifico
    // così il widget può mostrare un messaggio utile al cliente finale
    if (error.code && ANTHROPIC_ERROR_CODES.has(error.code)) {
      return res.status(error.status || 500).json({
        error: error.message,
        code: error.code,
      });
    }

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
// Valida il formato della chiave prima di salvarla
router.post("/api-key", authenticate, async (req, res) => {
  const { anthropicKey } = req.body;
  const client = req.client;

  if (!anthropicKey || !anthropicKey.startsWith("sk-ant-")) {
    return res.status(400).json({
      error: "Chiave API non valida. Deve iniziare con sk-ant-",
    });
  }

  // Verifica la chiave con una chiamata reale ad Anthropic prima di salvarla
  // Questo evita che il cliente salvi una chiave errata o scaduta
  try {
    const Anthropic = require("@anthropic-ai/sdk").default;
    const testClient = new Anthropic({ apiKey: anthropicKey });
    await testClient.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1,
      messages: [{ role: "user", content: "test" }],
    });
  } catch (error) {
    const status = error?.status || error?.statusCode;
    if (status === 401) {
      return res.status(400).json({
        error: "Chiave API Anthropic non valida. Verifica la chiave su console.anthropic.com.",
        code: "INVALID_API_KEY",
      });
    }
    if (status === 402 || (error?.message || "").includes("credit")) {
      return res.status(400).json({
        error: "La chiave API è valida ma i crediti Anthropic sono esauriti. Ricarica il tuo account su console.anthropic.com.",
        code: "INSUFFICIENT_CREDITS",
      });
    }
    // Per altri errori (es. rate limit, timeout) salviamo la chiave comunque
    // perché potrebbe essere un problema temporaneo
    console.warn("Verifica chiave API: errore non bloccante:", error.message);
  }

  const saved = await updateAnthropicKey(client.id, anthropicKey);
  if (!saved) {
    return res.status(500).json({ error: "Errore nel salvataggio della chiave." });
  }

  client.anthropicKey = anthropicKey;
  res.json({ message: "Chiave API Anthropic impostata con successo.", clientId: client.id, hasCustomKey: true });
});

module.exports = router;
