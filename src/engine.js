/**
 * CLAUDE ENGINE - versione corretta con protezione sessioni
 */

const Anthropic = require("@anthropic-ai/sdk").default;
const { sessions } = require("./database");
const { buildContext } = require("./rag");

const MODEL = "claude-haiku-4-5-20251001";
const MAX_HISTORY = 20;
// Limite massimo caratteri per messaggio utente (protezione da input enormi)
const MAX_MESSAGE_LENGTH = 2000;

async function chat(sessionId, userMessage, client) {
  // Tronca messaggi troppo lunghi per evitare sprechi di token
  const safeMessage = userMessage.slice(0, MAX_MESSAGE_LENGTH);

  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  const history = sessions.get(sessionId);

  history.push({ role: "user", content: safeMessage });

  // Mantieni solo gli ultimi MAX_HISTORY messaggi
  const trimmedHistory = history.slice(-MAX_HISTORY);

  // Aggiorna la history con la versione trimmed per evitare crescita infinita
  sessions.set(sessionId, trimmedHistory);

  const ragContext = await buildContext(client.id, safeMessage);
  const systemWithContext = client.systemPrompt + ragContext;

  const apiKey = client.anthropicKey || process.env.ANTHROPIC_API_KEY;
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: systemWithContext,
    messages: trimmedHistory,
  });

  const assistantMessage = response.content[0].text;

  // Aggiunge la risposta alla history già aggiornata
  trimmedHistory.push({ role: "assistant", content: assistantMessage });
  sessions.set(sessionId, trimmedHistory);

  return {
    message: assistantMessage,
    sessionId,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

module.exports = { chat };
