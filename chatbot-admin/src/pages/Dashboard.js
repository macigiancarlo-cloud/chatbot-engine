import { useState, useEffect } from "react";
import { getStatus, getDocumentStats } from "../services/api";

export default function Dashboard({ apiKey }) {
  const [status, setStatus] = useState(null);
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, d] = await Promise.all([getStatus(apiKey), getDocumentStats(apiKey)]);
        setStatus(s);
        setDocs(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiKey]);

  if (loading) return <div className="page-sub">Caricamento...</div>;

  const pct = status ? Math.round((status.conversationsUsed / status.conversationsLimit) * 100) : 0;

  return (
    <div>
      <div className="page-title">Dashboard</div>
      <div className="page-sub">Benvenuto nel pannello di controllo del tuo chatbot.</div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Conversazioni usate</div>
          <div className="stat-value">{status?.conversationsUsed ?? 0}</div>
          <div className="stat-sub">su {status?.conversationsLimit ?? 0} disponibili</div>
          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Conversazioni rimaste</div>
          <div className="stat-value">{status?.conversationsLeft ?? 0}</div>
          <div className="stat-sub">questo mese</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Documenti caricati</div>
          <div className="stat-value">{docs?.documents?.length ?? 0}</div>
          <div className="stat-sub">{docs?.totalChunks ?? 0} chunk totali</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">⚙️ Configurazione Bot</div>
        <div style={{ display: "flex", gap: 32 }}>
          <div>
            <div className="stat-label">Nome bot</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{status?.botName}</div>
          </div>
          <div>
            <div className="stat-label">Piano attivo</div>
            <span className={`badge badge-${status?.plan}`}>{status?.plan}</span>
          </div>
          <div>
            <div className="stat-label">ID Cliente</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: "var(--text2)" }}>{status?.clientId}</div>
          </div>
        </div>
      </div>

      {docs?.documents?.length > 0 && (
        <div className="card">
          <div className="card-title">📄 Documenti nel sistema</div>
          {docs.documents.map((d, i) => (
            <div className="doc-item" key={i}>
              <span className="doc-name">📎 {d.name}</span>
              <span className="doc-chunks">{d.chunkCount} chunk</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
