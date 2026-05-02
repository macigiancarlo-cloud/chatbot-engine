# MG Launch Chatbot — Complete Guide / Guida Completa

AI-powered business chatbot with admin panel, RAG document system, and embeddable widget for any website.

Chatbot aziendale con pannello admin, sistema RAG per documenti e widget embed per qualsiasi sito web.

---

## Project Structure / Struttura del progetto

```
chatbot-engine/          ← Node.js Server (backend)
  src/
    auth.js              ← API key authentication / Autenticazione chiavi API
    database.js          ← Supabase client database / Database clienti su Supabase
    engine.js            ← Claude API communication / Comunicazione con Claude API
    rag.js               ← Document system and search / Sistema documenti e ricerca
    rag-routes.js        ← Document upload endpoints / Endpoint caricamento documenti
    routes.js            ← Chatbot endpoints / Endpoint chatbot
    stripe-routes.js     ← Stripe payments and webhook / Pagamenti Stripe e webhook
    supabase.js          ← Supabase connection / Connessione Supabase
  public/
    register.html        ← Client registration page / Pagina registrazione clienti
    success.html         ← Payment success page / Pagina successo pagamento
    chatbot-widget.js    ← Embeddable widget / Widget embed
  index.js               ← Server entry point / Punto di ingresso server
  Dockerfile             ← Docker configuration for Fly.io
  fly.toml               ← Fly.io deployment configuration
  .env                   ← Environment variables (never share) / Variabili ambiente (non condividere mai)

  chatbot-admin/         ← React admin panel (frontend) / Pannello admin React
    src/
      pages/
        Dashboard.js     ← Statistics and monitoring / Statistiche e monitoraggio
        Documents.js     ← Document upload / Caricamento documenti
        Test.js          ← Chatbot testing / Test chatbot
        Settings.js      ← API key configuration / Configurazione chiave API
      services/
        api.js           ← Backend API calls / Chiamate al backend
      App.js             ← Main app with routing / App principale con routing
      App.css            ← Panel styles / Stili del pannello
```

---

## Production URLs / URL di produzione

| Service / Servizio | URL |
|---|---|
| Backend (Fly.io) | https://chatbot-engine-lilac-cloud-1014.fly.dev |
| Admin Panel (Railway) | https://heartfelt-strength-production-0b0b.up.railway.app |
| Registration Page | https://chatbot-engine-lilac-cloud-1014.fly.dev/register.html |
| Widget Script | https://chatbot-engine-lilac-cloud-1014.fly.dev/chatbot-widget.js |

---

## Requirements / Requisiti

- Node.js v18 or higher / v18 o superiore
- npm
- Anthropic account with API credits / Account Anthropic con crediti API (console.anthropic.com)
- Supabase account / Account Supabase (supabase.com) — free plan is enough / piano gratuito è sufficiente
- Stripe account / Account Stripe (stripe.com) — for payments / per i pagamenti
- Gmail account / Account Gmail — for sending welcome emails / per inviare email di benvenuto

---

## Environment Variables / Variabili d'ambiente

The `.env` file in `chatbot-engine` must contain / Il file `.env` in `chatbot-engine` deve contenere:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=sb_secret_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
STRIPE_PRICE_BASE=price_xxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxx
STRIPE_PRICE_BUSINESS=price_xxxxxxxxxx
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
BASE_URL=https://chatbot-engine-lilac-cloud-1014.fly.dev
ADMIN_URL=https://heartfelt-strength-production-0b0b.up.railway.app
```

> ⚠️ Never share the `.env` file or push it to GitHub / Non condividere mai il file `.env` né caricarlo su GitHub.

---

## Local Setup / Avvio in locale

### 1. Start the server / Avvia il server

Open a terminal in the `chatbot-engine` folder / Apri un terminale nella cartella `chatbot-engine`:

```bash
node index.js
```

Server runs on / Il server parte su `http://localhost:3000`

### 2. Start the admin panel / Avvia il pannello admin

Open a second terminal in `chatbot-engine/chatbot-admin` / Apri un secondo terminale nella cartella `chatbot-engine/chatbot-admin`:

```bash
npm start
```

Panel opens on / Il pannello si apre su `http://localhost:3001`

### 3. Keep both terminals open / Tieni entrambi i terminali aperti

The server and panel must run at the same time / Il server e il pannello devono girare contemporaneamente.

---

## Admin Panel Access / Accesso al pannello admin

1. Open browser at / Apri il browser su `http://localhost:3001`
2. Enter the client API key / Inserisci la chiave API del cliente
3. Click **Accedi**

### Demo API key (for testing) / Chiave API demo (per test)

```
chatbot-key-demo-001
```

---

## First Setup (Required) / Prima configurazione (obbligatoria)

After the first login, the system shows a red warning / Dopo il primo accesso il sistema mostra un avviso rosso:

> ⚠️ Chiave API Anthropic non configurata

The client must / Il cliente deve:

1. Click **Configura ora** or go to **Impostazioni** / Cliccare **Configura ora** oppure andare in **Impostazioni**
2. Create an account at / Creare un account su `console.anthropic.com`
3. Go to **API Keys** and click **Create Key**
4. Copy the key (starts with / inizia con `sk-ant-`)
5. Paste the key in the field / Incollare la chiave nel campo **La tua chiave API**
6. Click **Salva chiave API**
7. Add at least $5 in the **Billing** section / Ricaricare almeno $5 nella sezione **Billing**

> ✅ From this point, costs are charged to the client's account, not yours / Da questo momento i costi vengono addebitati sull'account del cliente, non sul tuo.

---

## Loading Documents / Caricamento documenti

1. Go to **Documenti** in the left menu / Vai nella sezione **Documenti** nel menu a sinistra
2. Choose between / Scegli tra:
   - **Carica testo**: paste text directly / incolla direttamente il testo
   - **Carica PDF**: select a PDF file (max 10MB)
3. Click **Carica testo** or select the file / Clicca **Carica testo** o seleziona il file

The chatbot will answer based on the loaded documents / Il chatbot risponderà basandosi sui documenti caricati.

> ✅ Documents are saved on Supabase and persist after server restarts / I documenti sono salvati su Supabase e persistono anche dopo il riavvio del server.

---

## Testing the Chatbot / Test del chatbot

1. Go to **Chatbot di prova** in the left menu / Vai nella sezione **Chatbot di prova**
2. Type a message in the input field / Scrivi un messaggio nel campo in basso
3. Press Enter or click **Invia**

---

## Embed Widget / Widget embed per il sito del cliente

The client pastes one line before the closing `</body>` tag / Il cliente incolla una riga prima della chiusura del tag `</body>`:

```html
<script
  src="https://chatbot-engine-lilac-cloud-1014.fly.dev/chatbot-widget.js"
  data-api-key="chatbot-key-client"
  data-server="https://chatbot-engine-lilac-cloud-1014.fly.dev"
  data-bot-name="Bot Name"
  data-color="#6c63ff">
</script>
```

### Configurable parameters / Parametri configurabili

| Parameter / Parametro | Description / Descrizione | Example / Esempio |
|---|---|---|
| `data-api-key` | Client API key / Chiave API del cliente | `chatbot-key-demo-001` |
| `data-server` | Backend server URL / URL del server | `https://chatbot-engine-lilac-cloud-1014.fly.dev` |
| `data-bot-name` | Bot display name / Nome visualizzato | `Assistente` |
| `data-color` | Widget primary color / Colore principale | `#6c63ff` |

---

## Available Plans / Piani disponibili

| Plan / Piano | Conversations / Conversazioni | Price / Prezzo |
|---|---|---|
| Trial | 5 | Free / Gratis |
| Base | 500 | 29€/mese |
| Pro | 1.500 | 49€/mese |
| Business | 5.000 | 149€/mese |

---

## Adding a New Client Manually / Aggiungere un nuovo cliente manualmente

Clients are created automatically after payment / I clienti vengono creati automaticamente dopo il pagamento. For manual creation / Per creazione manuale:

1. Go to your Supabase project / Vai nel tuo progetto Supabase
2. Open the **SQL Editor** / Apri l'**SQL Editor**
3. Run the following query / Esegui questa query:

```sql
INSERT INTO clients (id, name, api_key, bot_name, system_prompt, conversations_limit, plan)
VALUES (
  'client-company-xyz',
  'Company Name',
  'chatbot-key-company-xyz',
  'Bot Name',
  'You are a helpful assistant for Company Name. Always reply in English.',
  500,
  'base'
);
```

4. Deliver the `api_key` value to the client / Consegna il valore `api_key` al cliente
5. No server restart needed / Nessun riavvio del server necessario

---

## Supabase SQL Functions / Funzioni SQL Supabase

The following function must exist in your Supabase project / La seguente funzione deve esistere nel tuo progetto Supabase:

```sql
CREATE OR REPLACE FUNCTION increment_conversations(client_id TEXT)
RETURNS VOID AS $$
  UPDATE clients
  SET conversations_used = conversations_used + 1
  WHERE id = client_id
  AND conversations_used < conversations_limit;
$$ LANGUAGE SQL;
```

---

## Available API Endpoints / Endpoint API disponibili

| Method | Endpoint | Description / Descrizione |
|---|---|---|
| POST | `/api/chat` | Send message to bot / Invia messaggio al bot |
| GET | `/api/status` | Client status and credits / Stato del cliente e crediti |
| DELETE | `/api/session` | Delete active session / Cancella sessione attiva |
| POST | `/api/documents/text` | Upload text document / Carica documento testo |
| POST | `/api/documents/pdf` | Upload PDF file / Carica file PDF |
| GET | `/api/documents/stats` | Document statistics / Statistiche documenti |
| DELETE | `/api/documents` | Delete all documents / Elimina tutti i documenti |
| POST | `/api/api-key` | Set Anthropic API key / Imposta chiave API Anthropic |
| POST | `/api/create-checkout` | Create Stripe checkout session / Crea sessione pagamento Stripe |
| POST | `/api/webhook` | Stripe webhook endpoint |

All requests require the header / Tutte le richieste richiedono l'header:

```
x-api-key: chatbot-key-xxx
```

---

## Roadmap / Prossimi sviluppi

- [x] Supabase integration for document persistence / Integrazione Supabase per persistenza documenti ✅
- [x] Production deployment on Fly.io / Messa in produzione su Fly.io ✅
- [x] Automatic client registration after payment / Registrazione automatica clienti dopo pagamento ✅
- [x] Stripe payment integration (live) / Integrazione pagamenti Stripe (live) ✅
- [x] Admin panel deployed on Railway / Pannello admin su Railway ✅
- [ ] Vector search for more accurate RAG / Ricerca vettoriale per RAG più preciso
- [ ] Custom domain / Dominio personalizzato

---

## Security Notes / Note di sicurezza

- Never share the `.env` file / Non condividere mai il file `.env`
- Never push to GitHub without adding `.env` to `.gitignore` / Non pubblicare su GitHub senza aggiungere `.env` al `.gitignore`
- The key `chatbot-key-demo-001` is for local testing only / La chiave `chatbot-key-demo-001` è solo per test locali
- The `SUPABASE_KEY` is a secret key — never expose it in frontend code / La `SUPABASE_KEY` è una chiave segreta, non esporla mai nel codice frontend
- Each client uses their own Anthropic API key — costs are never charged to the server owner / Ogni cliente usa la propria chiave API Anthropic, i costi non vengono mai addebitati al proprietario del server
