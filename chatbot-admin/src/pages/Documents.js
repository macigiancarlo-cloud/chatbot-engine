import { useState, useEffect, useRef } from "react";
import { uploadText, uploadPdf, getDocumentStats, clearDocuments } from "../services/api";

export default function Documents({ apiKey }) {
  const [docs, setDocs] = useState(null);
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const refreshDocs = () => {
    getDocumentStats(apiKey).then(d => setDocs(d));
  };

  useEffect(() => {
    getDocumentStats(apiKey).then(d => setDocs(d));
  }, [apiKey]);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleTextUpload = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await uploadText(apiKey, text, filename || "documento.txt");
      showAlert(`✅ ${res.filename} caricato — ${res.chunksCreated} chunk creati`);
      setText(""); setFilename("");
      refreshDocs();
    } catch (e) {
      showAlert("❌ Errore nel caricamento", "error");
    } finally { setLoading(false); }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadPdf(apiKey, file);
      showAlert(`✅ ${res.filename} caricato — ${res.chunksCreated} chunk creati`);
      refreshDocs();
    } catch (e) {
      showAlert("❌ Errore nel caricamento PDF", "error");
    } finally { setLoading(false); }
  };

  const handleClear = async () => {
    if (!window.confirm("Eliminare tutti i documenti?")) return;
    await clearDocuments(apiKey);
    showAlert("🗑️ Tutti i documenti eliminati");
    refreshDocs();
  };

  return (
    <div>
      <div className="page-title">Documenti</div>
      <div className="page-sub">Carica i documenti aziendali. Il chatbot risponderà basandosi su di essi.</div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="card">
        <div className="card-title">📄 Carica testo</div>
        <label>Nome file (opzionale)</label>
        <input className="input" placeholder="es. faq-azienda.txt" value={filename} onChange={e => setFilename(e.target.value)} />
        <label>Contenuto</label>
        <textarea className="textarea" placeholder="Incolla qui il testo del documento..." value={text} onChange={e => setText(e.target.value)} style={{ minHeight: 160 }} />
        <button className="btn btn-primary" onClick={handleTextUpload} disabled={loading || !text.trim()}>
          {loading ? "Caricamento..." : "Carica testo"}
        </button>
      </div>

      <div className="card">
        <div className="card-title">📎 Carica PDF</div>
        <div className="file-drop" onClick={() => fileRef.current.click()}>
          <div className="file-drop-icon">📂</div>
          <div className="file-drop-text">Clicca per scegliere un file o <span>trascina qui</span></div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 6 }}>Solo PDF, max 10MB</div>
        </div>
        <input type="file" accept=".pdf" ref={fileRef} style={{ display: "none" }} onChange={handlePdfUpload} />
      </div>

      <div className="card">
        <div className="card-title" style={{ justifyContent: "space-between" }}>
          <span>📚 Documenti caricati ({docs?.documents?.length ?? 0})</span>
          {docs?.documents?.length > 0 && (
            <button className="btn btn-danger" onClick={handleClear}>Elimina tutti</button>
          )}
        </div>
        {docs?.documents?.length === 0 && (
          <div style={{ color: "var(--text2)", fontSize: 14 }}>Nessun documento caricato.</div>
        )}
        {docs?.documents?.map((d, i) => (
          <div className="doc-item" key={i}>
            <span className="doc-name">📎 {d.name}</span>
            <span className="doc-chunks">{d.chunkCount} chunk</span>
          </div>
        ))}
      </div>
    </div>
  );
}