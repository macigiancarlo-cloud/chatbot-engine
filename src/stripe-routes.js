/**
 * STRIPE ROUTES
 * Gestisce la registrazione clienti e i pagamenti.
 */

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Configurazione email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Mappa piano -> conversazioni
const PLAN_LIMITS = {
  [process.env.STRIPE_PRICE_BASE]: { plan: "base", limit: 500 },
  [process.env.STRIPE_PRICE_PRO]: { plan: "pro", limit: 1500 },
  [process.env.STRIPE_PRICE_BUSINESS]: { plan: "business", limit: 5000 },
};

// ─── CREA SESSIONE CHECKOUT STRIPE ─────────────────────────────────────────
router.post("/create-checkout", async (req, res) => {
  const { priceId, customerName, customerEmail } = req.body;

  if (!priceId || !customerName || !customerEmail) {
    return res.status(400).json({ error: "Dati mancanti." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      metadata: { customerName, customerEmail, priceId },
      success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/register.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Errore Stripe checkout:", err.message);
    res.status(500).json({ error: "Errore nella creazione del pagamento." });
  }
});

// ─── WEBHOOK STRIPE ─────────────────────────────────────────────────────────
// Questa funzione viene chiamata direttamente da index.js con body RAW
const webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { customerName, customerEmail, priceId } = session.metadata;

    const planInfo = PLAN_LIMITS[priceId];
    if (!planInfo) return res.json({ received: true });

    // Genera chiave API univoca
    const apiKey = "chatbot-key-" + crypto.randomBytes(16).toString("hex");
    const clientId = "client-" + crypto.randomBytes(8).toString("hex");

    // Crea cliente su Supabase
    const { error } = await supabase.from("clients").insert({
      id: clientId,
      name: customerName,
      api_key: apiKey,
      bot_name: "Assistente",
      system_prompt: `Sei un assistente virtuale per ${customerName}. Rispondi sempre in italiano.`,
      conversations_limit: planInfo.limit,
      conversations_used: 0,
      plan: planInfo.plan,
    });

    if (error) {
      console.error("Errore Supabase:", error.message);
      return res.status(500).json({ error: "Errore creazione cliente." });
    }

    // Invia email con chiave API
    await transporter.sendMail({
      from: `"MG Launch Chatbot" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Benvenuto in MG Launch Chatbot — Le tue credenziali",
      html: `
        <h2>Benvenuto, ${customerName}!</h2>
        <p>Il tuo account è stato creato con successo.</p>
        <h3>Le tue credenziali:</h3>
        <p><strong>Chiave API:</strong> <code>${apiKey}</code></p>
        <p><strong>Piano:</strong> ${planInfo.plan} (${planInfo.limit} conversazioni/mese)</p>
        <h3>Come iniziare:</h3>
        <ol>
          <li>Accedi al pannello admin: <a href="${process.env.ADMIN_URL}">${process.env.ADMIN_URL}</a></li>
          <li>Inserisci la tua chiave API per accedere</li>
          <li>Carica i tuoi documenti aziendali</li>
          <li>Copia il widget sul tuo sito</li>
        </ol>
        <p>Per qualsiasi problema contattaci rispondendo a questa email.</p>
        <p>Il team MG Launch</p>
      `,
    });

    console.log(`✅ Nuovo cliente creato: ${customerName} (${planInfo.plan})`);
  }

  res.json({ received: true });
};

module.exports = router;
module.exports.webhook = webhook;