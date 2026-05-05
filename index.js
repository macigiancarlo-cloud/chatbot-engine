/**
 * SERVER PRINCIPALE
 *
 * Punto di ingresso dell'engine del chatbot.
 * Per avviare: node index.js
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const ragRoutes = require("./src/rag-routes");
const stripeRoutes = require("./src/stripe-routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.static("public"));

// Webhook Stripe DEVE ricevere il body RAW prima di express.json()
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  stripeRoutes.webhook
);

// Da qui in poi il body viene parsato come JSON
app.use(express.json());

// Route chatbot
app.use("/api", routes);

// Route documenti RAG
app.use("/api", ragRoutes);

// Route Stripe (create-checkout)
app.use("/api", stripeRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "MG Launch Chatbot Engine",
    version: "1.2.0",
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error("Errore non gestito:", err.message);
  res.status(500).json({ error: "Errore interno del server." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ MG Launch Chatbot Engine avviato`);
  console.log(`📡 Server in ascolto su http://localhost:${PORT}`);
  console.log(`🔑 Modalità: ${process.env.NODE_ENV || "development"}\n`);
  console.log(`Endpoint disponibili:`);
  console.log(`  POST   /api/chat`);
  console.log(`  GET    /api/status`);
  console.log(`  DELETE /api/session`);
  console.log(`  POST   /api/documents/text`);
  console.log(`  POST   /api/documents/pdf`);
  console.log(`  GET    /api/documents/stats`);
  console.log(`  DELETE /api/documents`);
  console.log(`  POST   /api/create-checkout`);
  console.log(`  POST   /api/webhook\n`);
});
