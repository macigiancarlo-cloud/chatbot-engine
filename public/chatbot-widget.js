/**
 * MG LAUNCH CHATBOT WIDGET
 *
 * Il cliente incolla questo script nel suo sito con una sola riga:
 *
 * <script src="chatbot-widget.js" data-api-key="chatbot-key-xxx" data-server="https://tuo-server.com"></script>
 *
 * Il widget appare automaticamente come bolla nell'angolo in basso a destra.
 */

(function () {
  // ─── CONFIGURAZIONE ────────────────────────────────────────────────────────
  // Legge la configurazione dagli attributi del tag script
  const script = document.currentScript;
  const API_KEY = script.getAttribute("data-api-key") || "chatbot-key-demo-001";
  const SERVER = (script.getAttribute("data-server") || "http://localhost:3000").replace(/\/$/, "");
  const BOT_NAME = script.getAttribute("data-bot-name") || "Assistente";
  const PRIMARY_COLOR = script.getAttribute("data-color") || "#6c63ff";

  // ─── STATO ─────────────────────────────────────────────────────────────────
  let sessionId = null;
  let isOpen = false;
  let isLoading = false;

  // ─── STILI ─────────────────────────────────────────────────────────────────
  const styles = `
    #mg-chatbot-widget * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* Bolla di apertura */
    #mg-chat-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${PRIMARY_COLOR};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      z-index: 99999;
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
    }

    #mg-chat-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(0,0,0,0.3);
    }

    #mg-chat-bubble svg {
      width: 26px;
      height: 26px;
      fill: white;
    }

    /* Finestra chat */
    #mg-chat-window {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      height: 520px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      z-index: 99998;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    #mg-chat-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    /* Header */
    #mg-chat-header {
      background: ${PRIMARY_COLOR};
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    #mg-chat-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #mg-chat-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    #mg-chat-title {
      color: white;
      font-weight: 700;
      font-size: 15px;
    }

    #mg-chat-subtitle {
      color: rgba(255,255,255,0.8);
      font-size: 12px;
      margin-top: 2px;
    }

    #mg-chat-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 20px;
      opacity: 0.8;
      line-height: 1;
      padding: 4px;
    }

    #mg-chat-close:hover { opacity: 1; }

    /* Messaggi */
    #mg-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8f8fb;
    }

    .mg-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .mg-msg-bot {
      background: #ffffff;
      color: #222;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .mg-msg-user {
      background: ${PRIMARY_COLOR};
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .mg-msg-typing {
      background: #ffffff;
      color: #999;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      font-style: italic;
      font-size: 13px;
    }

    /* Input */
    #mg-chat-input-area {
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    #mg-chat-input {
      flex: 1;
      border: 1px solid #e0e0e0;
      border-radius: 24px;
      padding: 10px 16px;
      font-size: 14px;
      outline: none;
      transition: border 0.15s;
      resize: none;
      background: #f8f8fb;
    }

    #mg-chat-input:focus {
      border-color: ${PRIMARY_COLOR};
      background: white;
    }

    #mg-chat-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${PRIMARY_COLOR};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, transform 0.15s;
      flex-shrink: 0;
    }

    #mg-chat-send:hover { transform: scale(1.08); }
    #mg-chat-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    #mg-chat-send svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    /* Footer */
    #mg-chat-footer {
      text-align: center;
      padding: 6px;
      font-size: 11px;
      color: #bbb;
      background: white;
    }

    #mg-chat-footer a {
      color: ${PRIMARY_COLOR};
      text-decoration: none;
      font-weight: 600;
    }

    /* Scrollbar */
    #mg-chat-messages::-webkit-scrollbar { width: 4px; }
    #mg-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #mg-chat-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
  `;

  // ─── HTML ───────────────────────────────────────────────────────────────────
  function buildHTML() {
    return `
      <div id="mg-chatbot-widget">

        <!-- Bolla di apertura -->
        <button id="mg-chat-bubble" title="Apri chat">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </button>

        <!-- Finestra chat -->
        <div id="mg-chat-window">

          <!-- Header -->
          <div id="mg-chat-header">
            <div id="mg-chat-header-info">
              <div id="mg-chat-avatar">🤖</div>
              <div>
                <div id="mg-chat-title">${BOT_NAME}</div>
                <div id="mg-chat-subtitle">Online • Rispondo subito</div>
              </div>
            </div>
            <button id="mg-chat-close">✕</button>
          </div>

          <!-- Messaggi -->
          <div id="mg-chat-messages">
            <div class="mg-msg mg-msg-bot">
              Ciao! 👋 Sono ${BOT_NAME}. Come posso aiutarti oggi?
            </div>
          </div>

          <!-- Input -->
          <div id="mg-chat-input-area">
            <input id="mg-chat-input" type="text" placeholder="Scrivi un messaggio..." maxlength="500" />
            <button id="mg-chat-send" title="Invia">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>

          <!-- Footer -->
          <div id="mg-chat-footer">Powered by <a href="#" target="_blank">MG Launch</a></div>

        </div>
      </div>
    `;
  }

  // ─── LOGICA ─────────────────────────────────────────────────────────────────

  // Aggiunge un messaggio nella chat
  function addMessage(text, type) {
    const container = document.getElementById("mg-chat-messages");
    const msg = document.createElement("div");
    msg.className = `mg-msg mg-msg-${type}`;
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
  }

  // Apre e chiude la finestra chat
  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById("mg-chat-window");
    if (isOpen) {
      win.classList.add("open");
      document.getElementById("mg-chat-input").focus();
    } else {
      win.classList.remove("open");
    }
  }

  // Invia il messaggio al server
  async function sendMessage() {
    if (isLoading) return;
    const input = document.getElementById("mg-chat-input");
    const message = input.value.trim();
    if (!message) return;

    input.value = "";
    isLoading = true;
    document.getElementById("mg-chat-send").disabled = true;

    // Mostra il messaggio dell'utente
    addMessage(message, "user");

    // Mostra indicatore di caricamento
    const typingMsg = addMessage("...", "typing");

    try {
      const res = await fetch(`${SERVER}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ message, sessionId }),
      });

      const data = await res.json();

      // Rimuove indicatore di caricamento
      typingMsg.remove();

      if (res.ok) {
        sessionId = data.sessionId;
        addMessage(data.reply, "bot");
      } else {
        addMessage("Spiacente, si è verificato un errore. Riprova.", "bot");
      }
    } catch (err) {
      typingMsg.remove();
      addMessage("Impossibile connettersi al server. Riprova più tardi.", "bot");
    } finally {
      isLoading = false;
      document.getElementById("mg-chat-send").disabled = false;
      input.focus();
    }
  }

  // ─── INIZIALIZZAZIONE ───────────────────────────────────────────────────────
  function init() {
    // Aggiunge gli stili
    const styleTag = document.createElement("style");
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);

    // Aggiunge l'HTML
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildHTML();
    document.body.appendChild(wrapper);

    // Event listeners
    document.getElementById("mg-chat-bubble").addEventListener("click", toggleChat);
    document.getElementById("mg-chat-close").addEventListener("click", toggleChat);
    document.getElementById("mg-chat-send").addEventListener("click", sendMessage);
    document.getElementById("mg-chat-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Avvia quando il DOM è pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
