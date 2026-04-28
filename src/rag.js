/**
 * SISTEMA RAG CON SUPABASE - versione corretta con limite chunk
 */

const pdfParse = require("pdf-parse");
const { supabase } = require("./supabase");

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const MAX_CHUNKS = 3;
// Limite massimo chunk per cliente per evitare query enormi
const MAX_CHUNKS_PER_CLIENT = 500;

function splitIntoChunks(text, source) {
  const chunks = [];
  const cleanText = text.replace(/\s+/g, " ").trim();
  let start = 0;
  let index = 0;

  while (start < cleanText.length) {
    const chunkText = cleanText.slice(start, start + CHUNK_SIZE);
    chunks.push({ text: chunkText, source, index });
    start += CHUNK_SIZE - CHUNK_OVERLAP;
    index++;
  }

  return chunks;
}

async function loadTextDocument(clientId, text, filename) {
  const chunks = splitIntoChunks(text, filename);

  const rows = chunks.map((chunk) => ({
    client_id: clientId,
    filename: filename,
    chunk_text: chunk.text,
    chunk_index: chunk.index,
  }));

  const { error } = await supabase.from("documents").insert(rows);
  if (error) throw new Error("Errore nel salvataggio del documento: " + error.message);

  return { filename, chunksCreated: chunks.length, characters: text.length };
}

async function loadPdfDocument(clientId, pdfBuffer, filename) {
  const pdfData = await pdfParse(pdfBuffer);
  return loadTextDocument(clientId, pdfData.text, filename);
}

async function searchRelevantChunks(clientId, query) {
  // Limita il numero di chunk recuperati per evitare query lente
  const { data: chunks, error } = await supabase
    .from("documents")
    .select("chunk_text, filename, chunk_index")
    .eq("client_id", clientId)
    .limit(MAX_CHUNKS_PER_CLIENT);

  if (error || !chunks || chunks.length === 0) return [];

  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((w) => w.length > 2);

  // Se non ci sono parole chiave valide restituisce i primi chunk
  if (keywords.length === 0) return chunks.slice(0, MAX_CHUNKS);

  const scored = chunks.map((chunk) => {
    const lower = chunk.chunk_text.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      const matches = (lower.match(new RegExp(kw, "g")) || []).length;
      score += matches;
    }
    return { ...chunk, score };
  });

  // Se nessun chunk ha score > 0 restituisce i primi MAX_CHUNKS come fallback
  const relevant = scored.filter((c) => c.score > 0);
  if (relevant.length === 0) return chunks.slice(0, MAX_CHUNKS);

  return relevant.sort((a, b) => b.score - a.score).slice(0, MAX_CHUNKS);
}

async function buildContext(clientId, query) {
  const chunks = await searchRelevantChunks(clientId, query);
  if (chunks.length === 0) return "";

  const contextText = chunks
    .map((c) => `[Fonte: ${c.filename}]\n${c.chunk_text}`)
    .join("\n\n---\n\n");

  return `\n\nRIFERIMENTO DAI DOCUMENTI AZIENDALI:\n${contextText}\n\nBasa la tua risposta principalmente su queste informazioni.`;
}

async function getDocumentStats(clientId) {
  const { data: chunks, error } = await supabase
    .from("documents")
    .select("filename")
    .eq("client_id", clientId);

  if (error || !chunks) return { totalChunks: 0, documents: [] };

  const sources = {};
  for (const chunk of chunks) {
    sources[chunk.filename] = (sources[chunk.filename] || 0) + 1;
  }

  return {
    totalChunks: chunks.length,
    documents: Object.entries(sources).map(([name, chunkCount]) => ({ name, chunkCount })),
  };
}

async function clearDocuments(clientId) {
  const { error } = await supabase.from("documents").delete().eq("client_id", clientId);
  if (error) throw new Error("Errore nell'eliminazione dei documenti: " + error.message);
}

module.exports = { loadTextDocument, loadPdfDocument, buildContext, getDocumentStats, clearDocuments };
