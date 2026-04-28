import { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:3000/api";

export default function Settings({ apiKey, onKeySaved }) {
  const [anthropicKey, setAnthropicKey] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSave = async () => {
    if (!anthropicKey.startsWith("sk-ant-")) {
      showAlert("❌ La chiave deve iniziare con sk-ant-", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api-key`,
        { anthropicKey },
        { headers: { "x-api-key": apiKey } }
      );
      showAlert("✅ Chiave API impostata. I costi saranno addebitati sul tuo account Anthropic.");
      setAnthropicKey("");
      // Notifica App.js che la chiave è stata salvata
      if (onKeySaved) onKeySaved();
    } catch (e) {
      showAlert("❌ Errore nel salvataggio della chiave.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">Impostazioni</div>
      <div className="page-sub">Configura la tua chiave API Anthropic personale.</div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="card">
        <div className="card-title">🔑 Chiave API Anthropic</div>
        <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16, lineHeight: 1.6 }}>
          Inserisci la tua chiave API personale ottenuta da <strong style={{ color: "var(--text)" }}>console.anthropic.com</strong>.
          I costi delle conversazioni verranno addebitati direttamente sul tuo account Anthropic.
        </p>
        <label>La tua chiave API</label>
        <input
          className="input"
          type="password"
          placeholder="sk-ant-xxxxxxxxxx"
          value={anthropicKey}
          onChange={e => setAnthropicKey(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading || !anthropicKey.trim()}
        >
          {loading ? "Salvataggio..." : "Salva chiave API"}
        </button>
      </div>

      <div className="card">
        <div className="card-title">ℹ️ Come ottenere la chiave API</div>
        <ol style={{ fontSize: 14, color: "var(--text2)", lineHeight: 2, paddingLeft: 20 }}>
          <li>Vai su <strong style={{ color: "var(--accent)" }}>console.anthropic.com</strong></li>
          <li>Accedi o crea un account gratuito</li>
          <li>Vai nella sezione <strong style={{ color: "var(--text)" }}>API Keys</strong></li>
          <li>Clicca su <strong style={{ color: "var(--text)" }}>Create Key</strong></li>
          <li>Copia la chiave e incollala qui sopra</li>
          <li>Ricarica almeno $5 nella sezione <strong style={{ color: "var(--text)" }}>Billing</strong></li>
        </ol>
      </div>
    </div>
  );
}
