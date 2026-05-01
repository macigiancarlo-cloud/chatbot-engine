/**
 * CLAUDE ENGINE
 *
 * Cuore del sistema. Gestisce:
 * 1. La comunicazione con l'API di Claude (Haiku 4.5, il più economico)
 * 2. Lo storico della conversazione per ogni sessione
 * 3. Il conteggio delle conversazioni per il sistema a crediti
 * 4. L'integrazione con il sistema RAG per le risposte basate su documenti
 *
 * IMPORTANTE: ogni cliente deve usare la propria chiave API Anthropic.
 * Il sistema non ricade mai sulla chiave del server per evitare costi imprevisti.
 */

const Anthropic = require("@anthropic-ai/sdk").default;
const { sessions } = require("./database");
const { buildContext } = require("./rag");

const MODEL = "claude-haiku-4-5-20251001";
const MAX_HISTORY = 20;
// Limite massimo caratteri per messaggio utente (protezione da input enormi)
const MAX_MESSAGE_LENGTH = 2000;

async function chat(sessionId, userMessage, client) {
  // Verifica che il cliente abbia configurato la sua chiave API personale.
  // Non usiamo mai la chiave del server come fallback: ogni cliente paga per sé.
  const apiKey = client.anthropicKey;

  if (!apiKey) {
    throw new Error(
      "Chiave API Anthropic non configurata. Accedi al pannello admin e inserisci la tua chiave API personale per poter usare il chatbot."
    );
  }

  // Crea il client Anthropic con la chiave del cliente specifico
  const anthropic = new Anthropic({ apiKey });

  // Tronca messaggi troppo lunghi per evitare sprechi di token
  const safeMessage = userMessage.slice(0, MAX_MESSAGE_LENGTH);

  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  const history = sessions.get(sessionId);

  history.push({ role: "user", content: safeMessage });

  // Mantieni solo gli ultimi MAX_HISTORY messaggi per evitare crescita infinita
  const trimmedHistory = history.slice(-MAX_HISTORY);

  // Aggiorna subito la sessione con la history trimmata
  sessions.set(sessionId, trimmedHistory);

  // Sistema RAG: recupera il contesto dai documenti aziendali su Supabase
  const ragContext = await buildContext(client.id, safeMessage);
  const systemWithContext = client.systemPrompt + ragContext;

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
