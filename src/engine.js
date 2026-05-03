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
const MAX_MESSAGE_LENGTH = 2000;

// Codici di errore Anthropic con messaggi chiari per il cliente
function parseAnthropicError(error) {
  const status = error?.status || error?.statusCode;
  const message = error?.message || "";

  if (status === 401) {
    return {
      code: "INVALID_API_KEY",
      message: "La chiave API Anthropic non è valida. Accedi al pannello admin e verifica la tua chiave API.",
      status: 401,
    };
  }

  if (status === 429) {
    return {
      code: "RATE_LIMIT",
      message: "Quota API Anthropic esaurita o Rate Limit raggiunto. Attendi qualche minuto o verifica il tuo piano su console.anthropic.com.",
      status: 429,
    };
  }

  if (status === 402 || message.includes("credit") || message.includes("billing")) {
    return {
      code: "INSUFFICIENT_CREDITS",
      message: "Crediti API Anthropic esauriti. Ricarica il tuo account su console.anthropic.com nella sezione Billing.",
      status: 402,
    };
  }

  if (status === 529 || message.includes("overloaded")) {
    return {
      code: "API_OVERLOADED",
      message: "I server Anthropic sono temporaneamente sovraccarichi. Riprova tra qualche secondo.",
      status: 503,
    };
  }

  return {
    code: "API_ERROR",
    message: "Errore nella comunicazione con Anthropic. Riprova tra poco.",
    status: 500,
  };
}

async function chat(sessionId, userMessage, client) {
  // Verifica che il cliente abbia configurato la sua chiave API personale.
  const apiKey = client.anthropicKey;

  if (!apiKey) {
    const err = new Error("Chiave API Anthropic non configurata. Accedi al pannello admin e inserisci la tua chiave API personale.");
    err.code = "MISSING_API_KEY";
    err.status = 403;
    throw err;
  }

  const anthropic = new Anthropic({ apiKey });
  const safeMessage = userMessage.slice(0, MAX_MESSAGE_LENGTH);

  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  const history = sessions.get(sessionId);

  history.push({ role: "user", content: safeMessage });
  const trimmedHistory = history.slice(-MAX_HISTORY);
  sessions.set(sessionId, trimmedHistory);

  const ragContext = await buildContext(client.id, safeMessage);
  const systemWithContext = client.systemPrompt + ragContext;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: systemWithContext,
      messages: trimmedHistory,
    });

    const assistantMessage = response.content[0].text;
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
  } catch (error) {
    // Interpreta l'errore Anthropic e lo rilancia con informazioni chiare
    const parsed = parseAnthropicError(error);
    const err = new Error(parsed.message);
    err.code = parsed.code;
    err.status = parsed.status;
    throw err;
  }
}

module.exports = { chat };
