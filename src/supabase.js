/**
 * CONNESSIONE SUPABASE
 *
 * Crea e esporta il client Supabase usato da tutti i moduli.
 * Le credenziali vengono lette dal file .env
 */

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = { supabase };
