/**
 * ROUTE PER I DOCUMENTI (RAG) - aggiornato per Supabase
 *
 * Tutte le funzioni RAG sono ora asincrone perché leggono/scrivono su Supabase.
 *
 * POST   /documents/text    - Carica un testo semplice
 * POST   /documents/pdf     - Carica un file PDF
 * GET    /documents/stats   - Vedi i documenti caricati
 * DELETE /documents         - Elimina tutti i documenti
 */

const express = require("express");
const multer = require("multer");
const { authenticate } = require("./auth");
const { loadTextDocument, loadPdfDocument, getDocumentStats, clearDocuments } = require("./rag");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo file PDF sono accettati."));
    }
  },
});

// POST /documents/text
router.post("/documents/text", authenticate, async (req, res) => {
  try {
    const { text, filename } = req.body;
    const client = req.client;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Il campo 'text' è obbligatorio." });
    }

    const name = filename || "documento.txt";
    // await necessario perché loadTextDocument ora scrive su Supabase
    const result = await loadTextDocument(client.id, text.trim(), name);

    res.json({ message: "Documento caricato con successo.", ...result });
  } catch (error) {
    console.error("Errore caricamento testo:", error.message);
    res.status(500).json({ error: "Errore nel caricamento del documento." });
  }
});

// POST /documents/pdf
router.post("/documents/pdf", authenticate, upload.single("file"), async (req, res) => {
  try {
    const client = req.client;

    if (!req.file) {
      return res.status(400).json({ error: "Nessun file PDF ricevuto." });
    }

    const result = await loadPdfDocument(client.id, req.file.buffer, req.file.originalname);

    res.json({ message: "PDF caricato e processato con successo.", ...result });
  } catch (error) {
    console.error("Errore caricamento PDF:", error.message);
    res.status(500).json({ error: "Errore nel processare il PDF." });
  }
});

// GET /documents/stats
router.get("/documents/stats", authenticate, async (req, res) => {
  try {
    const client = req.client;
    // await necessario perché getDocumentStats ora legge da Supabase
    const stats = await getDocumentStats(client.id);
    res.json(stats);
  } catch (error) {
    console.error("Errore statistiche documenti:", error.message);
    res.status(500).json({ error: "Errore nel recupero delle statistiche." });
  }
});

// DELETE /documents
router.delete("/documents", authenticate, async (req, res) => {
  try {
    const client = req.client;
    // await necessario perché clearDocuments ora elimina da Supabase
    await clearDocuments(client.id);
    res.json({ message: "Tutti i documenti eliminati con successo." });
  } catch (error) {
    console.error("Errore eliminazione documenti:", error.message);
    res.status(500).json({ error: "Errore nell'eliminazione dei documenti." });
  }
});

module.exports = router;
