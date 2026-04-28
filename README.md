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
    supabase.js          ← Supabase connection / Connessione Supabase
  index.js               ← Server entry point / Punto di ingresso server
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

chatbot-widget/          ← Embed widget (separate folder) / Widget embed (cartella separata)
  chatbot-widget.js      ← Script to embed on client site / Script da incollare sul sito cliente
  test.html              ← Widget test page / Pagina di test del widget
```

---

## Requirements / Requisiti

- Node.js v18 or higher / v18 o superiore
- npm
- Anthropic account with API credits / Account Anthropic con crediti API (console.anthropic.com)
- Supabase account / Account Supabase (supabase.com) — free plan is enough / piano gratuito è sufficiente

---

## Environment Variables / Variabili d'ambiente

The `.env` file in `chatbot-engine` must contain / Il file `.env` in `chatbot-engine` deve contenere:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=sb_secret_xxxxxxxxxx
```

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

From this point, costs are charged to the client's account, not yours / Da questo momento i costi vengono addebitati sull'account del cliente, non sul tuo.

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

The `chatbot-widget.js` file must be hosted on the server. The client pastes one line before the closing `</body>` tag / Il file `chatbot-widget.js` va caricato sul server. Il cliente incolla una riga prima della chiusura del tag `</body>`:

```html
<script
  src="https://your-server.com/chatbot-widget.js"
  data-api-key="chatbot-key-client"
  data-server="https://your-server.com"
  data-bot-name="Bot Name"
  data-color="#6c63ff">
</script>
```

### Configurable parameters / Parametri configurabili

| Parameter / Parametro | Description / Descrizione | Example / Esempio |
|---|---|---|
| `data-api-key` | Client API key / Chiave API del cliente | `chatbot-key-demo-001` |
| `data-server` | Backend server URL / URL del server | `https://your-server.com` |
| `data-bot-name` | Bot display name / Nome visualizzato | `Assistente` |
| `data-color` | Widget primary color / Colore principale | `#6c63ff` |

### Local test / Test in locale

Open `chatbot-widget/test.html` in the browser (double click). The server must be running / Apri il file `chatbot-widget/test.html` con il browser (doppio clic). Il server deve essere avviato.

---

## Available Plans / Piani disponibili

| Plan / Piano | Conversations / Conversazioni | Recommended use / Uso consigliato |
|---|---|---|
| Trial | 5 | First access for new clients / Primo accesso per nuovi clienti |
| Base | 500 | Small businesses / Piccole aziende |
| Pro | 1.500 | Medium businesses / Aziende medie |
| Business | 5.000 | Large businesses / Grandi aziende |

---

## Adding a New Client / Aggiungere un nuovo cliente

Clients are managed directly on Supabase / I clienti sono gestiti direttamente su Supabase.

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

All requests require the header / Tutte le richieste richiedono l'header:

```
x-api-key: chatbot-key-xxx
```

---

## Roadmap / Prossimi sviluppi

- [x] Supabase integration for document persistence / Integrazione Supabase per persistenza documenti ✅
- [ ] Production deployment on Railway / Messa in produzione su Railway
- [ ] Automatic client registration / Registrazione automatica nuovi clienti
- [ ] Stripe payment integration / Integrazione pagamenti con Stripe
- [ ] Vector search for more accurate RAG / Ricerca vettoriale per RAG più preciso

---

## Security Notes / Note di sicurezza

- Never share the `.env` file / Non condividere mai il file `.env`
- Never push to GitHub without adding `.env` to `.gitignore` / Non pubblicare su GitHub senza aggiungere `.env` al `.gitignore`
- The key `chatbot-key-demo-001` is for local testing only / La chiave `chatbot-key-demo-001` è solo per test locali
- The `SUPABASE_KEY` is a secret key — never expose it in frontend code / La `SUPABASE_KEY` è una chiave segreta, non esporla mai nel codice frontend
