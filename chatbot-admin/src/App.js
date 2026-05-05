import { useState, useEffect } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Test from "./pages/Test";
import Settings from "./pages/Settings";
import axios from "axios";

const BACKEND_URL = "https://chatbot-engine-lilac-cloud-1014.fly.dev/api";

function Login({ onLogin }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handle = () => {
    if (!key.trim()) { setError("Inserisci la chiave API."); return; }
    onLogin(key.trim());
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-title">MG Launch</div>
        <div className="login-sub">Pannello di controllo chatbot. Inserisci la tua chiave API per accedere.</div>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Chiave API</label>
        <input
          className="input"
          placeholder="chatbot-key-..."
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handle()}
        />
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handle}>
          Accedi
        </button>
      </div>
    </div>
  );
}

// Banner di avviso mostrato quando il cliente non ha ancora inserito la sua chiave API
function ApiKeyBanner({ onGoToSettings }) {
  return (
    <div style={{
      background: "rgba(255,71,87,0.12)",
      border: "1px solid rgba(255,71,87,0.4)",
      borderRadius: 10,
      padding: "14px 20px",
      marginBottom: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    }}>
      <div>
        <div style={{ fontWeight: 700, color: "#ff4757", marginBottom: 4 }}>
          ⚠️ Chiave API Anthropic non configurata
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>
          Per usare il chatbot devi inserire la tua chiave API Anthropic personale.
          Senza di essa i costi vengono addebitati sull'account del fornitore.
        </div>
      </div>
      <button className="btn btn-danger" onClick={onGoToSettings} style={{ whiteSpace: "nowrap" }}>
        Configura ora
      </button>
    </div>
  );
}

const NAV = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "documents", icon: "📄", label: "Documenti" },
  { id: "test", icon: "💬", label: "Test Chatbot" },
  { id: "settings", icon: "⚙️", label: "Impostazioni" },
];

export default function App() {
  const [apiKey, setApiKey] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [hasAnthropicKey, setHasAnthropicKey] = useState(false);

  // Controlla se il cliente ha già configurato la sua chiave API Anthropic
  useEffect(() => {
    if (!apiKey) return;
    axios.get(`${BACKEND_URL}/status`, { headers: { "x-api-key": apiKey } })
      .then(res => setHasAnthropicKey(res.data.hasCustomKey || false))
      .catch(() => {});
  }, [apiKey, page]);

  if (!apiKey) return <Login onLogin={setApiKey} />;

  const pages = {
    dashboard: <Dashboard apiKey={apiKey} />,
    documents: <Documents apiKey={apiKey} />,
    test: <Test apiKey={apiKey} />,
    settings: <Settings apiKey={apiKey} onKeySaved={() => setHasAnthropicKey(true)} />,
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo">MG Launch</div>
        <div className="sidebar-sub">Chatbot Admin Panel</div>
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-item ${page === n.id ? "active" : ""}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span> {n.label}
            {/* Punto rosso su Impostazioni se manca la chiave */}
            {n.id === "settings" && !hasAnthropicKey && (
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#ff4757", marginLeft: "auto"
              }} />
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="nav-item" onClick={() => setApiKey(null)}>
          <span className="nav-icon">🚪</span> Esci
        </button>
      </div>
      <div className="main">
        {/* Banner di avviso se la chiave Anthropic non è configurata */}
        {!hasAnthropicKey && page !== "settings" && (
          <ApiKeyBanner onGoToSettings={() => setPage("settings")} />
        )}
        {pages[page]}
      </div>
    </div>
  );
}
