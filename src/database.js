/**
 * DATABASE SUPABASE
 * Versione corretta con gestione errori su incrementConversations.
 */

const { supabase } = require("./supabase");

const sessions = new Map();

async function getClientByApiKey(apiKey) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("api_key", apiKey)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    apiKey: data.api_key,
    botName: data.bot_name,
    systemPrompt: data.system_prompt,
    conversationsUsed: data.conversations_used,
    conversationsLimit: data.conversations_limit,
    plan: data.plan,
    anthropicKey: data.anthropic_key,
    createdAt: data.created_at,
  };
}

/**
 * Incrementa il contatore e verifica che non superi il limite.
 * Usa una transazione atomica per evitare problemi con richieste simultanee.
 * @returns {boolean} true se l'incremento è avvenuto, false se il limite è stato raggiunto
 */
async function incrementConversations(clientId) {
  const { data, error } = await supabase.rpc("increment_conversations", {
    client_id: clientId,
  });

  if (error) {
    console.error("Errore incremento conversazioni:", error.message);
    throw new Error("Impossibile aggiornare il contatore conversazioni.");
  }

  return data;
}

async function updateAnthropicKey(clientId, anthropicKey) {
  const { error } = await supabase
    .from("clients")
    .update({ anthropic_key: anthropicKey })
    .eq("id", clientId);

  return !error;
}

module.exports = { sessions, getClientByApiKey, incrementConversations, updateAnthropicKey };
