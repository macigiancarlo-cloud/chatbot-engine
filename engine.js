/**
 * CLAUDE ENGINE
 *
 * Cuore del sistema. Gestisce:
 * 1. La comunicazione con l'API di Claude (Haiku 4.5, il più economico)
 * 2. Lo storico della conversazione per ogni sessione
 * 3. Il conteggio delle conversazioni per il sistema a crediti
 * 4. L'integrazione con il sistema RAG per le risposte basate su documenti
 */

const Anthropic = require("@anthropic-ai/sdk").default;
const { sessions } = require("./database");
const { buildContext } = require("./rag");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";
const MAX_HISTORY = 20;

async function chat(sessionId, userMessage, client) {
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  const history = sessions.get(sessionId);

  history.push({ role: "user", content: userMessage });
  const trimmedHistory = history.slice(-MAX_HISTORY);

  // Sistema RAG: aggiunge il contesto dei documenti al system prompt
  const ragContext = buildContext(client.id, userMessage);
  const systemWithContext = client.systemPrompt + ragContext;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: systemWithContext,
    messages: trimmedHistory,
  });

  const assistantMessage = response.content[0].text;
  history.push({ role: "assistant", content: assistantMessage });
  sessions.set(sessionId, history);

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
