import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";

export default function Test({ apiKey }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Ciao! Sono il tuo chatbot. Scrivimi qualcosa per testare." }
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await sendMessage(apiKey, userMsg, sessionId);
      setSessionId(res.sessionId);
      setMessages(prev => [...prev, { role: "bot", text: res.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "bot", text: "❌ Errore: " + (e.response?.data?.error || "Server non raggiungibile") }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => {
    setMessages([{ role: "bot", text: "Conversazione resettata. Scrivimi qualcosa!" }]);
    setSessionId(null);
  };

  return (
    <div>
      <div className="page-title">Test Chatbot</div>
      <div className="page-sub">Prova il tuo chatbot direttamente qui prima di pubblicarlo.</div>

      <div className="card">
        <div className="card-title" style={{ justifyContent: "space-between" }}>
          <span>💬 Chat di test</span>
          <button className="btn btn-ghost" onClick={handleReset} style={{ fontSize: 12, padding: "6px 14px" }}>
            Reset conversazione
          </button>
        </div>

        <div className="chat-box">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
          ))}
          {loading && <div className="chat-msg bot">...</div>}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <input
            className="input"
            placeholder="Scrivi un messaggio..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
            Invia
          </button>
        </div>

        {sessionId && (
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--text2)", fontFamily: "DM Mono, monospace" }}>
            Session: {sessionId}
          </div>
        )}
      </div>
    </div>
  );
}
