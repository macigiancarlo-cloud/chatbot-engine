import { useState } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Test from "./pages/Test";
import Settings from "./pages/Settings";

const DEMO_API_KEY = "chatbot-key-demo-001";

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
        <button className="btn btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={handle}>
          Accedi
        </button>
        <button
          className="btn btn-ghost"
          style={{ width: "100%", fontSize: 12 }}
          onClick={() => onLogin(DEMO_API_KEY)}
        >
          Usa account demo
        </button>
      </div>
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

  if (!apiKey) return <Login onLogin={setApiKey} />;

  const pages = {
    dashboard: <Dashboard apiKey={apiKey} />,
    documents: <Documents apiKey={apiKey} />,
    test: <Test apiKey={apiKey} />,
    settings: <Settings apiKey={apiKey} />,
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo">MG Launch</div>
        <div className="sidebar-sub">Chatbot Admin Panel</div>
        {NAV.map(n => (
          <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
            <span className="nav-icon">{n.icon}</span> {n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="nav-item" onClick={() => setApiKey(null)}>
          <span className="nav-icon">🚪</span> Esci
        </button>
      </div>
      <div className="main">{pages[page]}</div>
    </div>
  );
}
