/**
 * SERVIZIO API
 * Tutte le chiamate al backend passano da qui.
 * Cambia solo BACKEND_URL per puntare al server in produzione.
 */

import axios from "axios";

const BACKEND_URL = "https://chatbot-engine-production.up.railway.app/api";

// Crea un'istanza axios con la chiave API già configurata
const createApi = (apiKey) =>
  axios.create({
    baseURL: BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

// Recupera lo stato del cliente (crediti, piano, ecc.)
export const getStatus = async (apiKey) => {
  const api = createApi(apiKey);
  const res = await api.get("/status");
  return res.data;
};

// Carica un documento di testo
export const uploadText = async (apiKey, text, filename) => {
  const api = createApi(apiKey);
  const res = await api.post("/documents/text", { text, filename });
  return res.data;
};

// Carica un file PDF
export const uploadPdf = async (apiKey, file) => {
  const api = axios.create({
    baseURL: BACKEND_URL,
    headers: { "x-api-key": apiKey },
  });
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/documents/pdf", formData);
  return res.data;
};

// Recupera le statistiche sui documenti caricati
export const getDocumentStats = async (apiKey) => {
  const api = createApi(apiKey);
  const res = await api.get("/documents/stats");
  return res.data;
};

// Elimina tutti i documenti
export const clearDocuments = async (apiKey) => {
  const api = createApi(apiKey);
  const res = await api.delete("/documents");
  return res.data;
};

// Invia un messaggio al chatbot (usato per il test nel pannello)
export const sendMessage = async (apiKey, message, sessionId = null) => {
  const api = createApi(apiKey);
  const res = await api.post("/chat", { message, sessionId });
  return res.data;
};
