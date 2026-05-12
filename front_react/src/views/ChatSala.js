import { useState, useEffect, useRef } from "react";
import { Send, X, Users } from "react-feather";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

/**
 * ChatSala — chat de grupo da sala estilo WhatsApp
 * Uso: <ChatSala salaId={id} salaNome={nome} isOpen={open} toggle={() => setOpen(false)} />
 */
const ChatSala = ({ salaId, salaNome, isOpen, toggle }) => {
  const { user } = useAuth();

  const [mensagens,  setMensagens]  = useState([]);
  const [membros,    setMembros]    = useState([]);
  const [texto,      setTexto]      = useState("");
  const [loading,    setLoading]    = useState(true);
  const [enviando,   setEnviando]   = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const pollingRef = useRef(null);

  // ── Carregar ao abrir ─────────────────────────────────
  useEffect(() => {
    if (!isOpen || !salaId) return;
    carregarMensagens(true);
    carregarMembros();
    setTimeout(() => inputRef.current?.focus(), 200);

    // Polling a cada 4 segundos
    pollingRef.current = setInterval(() => carregarMensagens(false), 4000);
    return () => clearInterval(pollingRef.current);
  }, [isOpen, salaId]);

  // ── Scroll para o fundo ───────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const carregarMensagens = async (mostrarLoading = false) => {
    if (mostrarLoading) setLoading(true);
    try {
      const { data } = await api.get(`/salas/${salaId}/mensagens`);
      const lista = Array.isArray(data)
        ? data
        : (data?.data || []);
      // Ordenar por data ascendente
      setMensagens([...lista].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      ));
    } catch (_) {} finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  const carregarMembros = async () => {
    try {
      const { data } = await api.get(`/salas/${salaId}/membros`);
      setMembros(Array.isArray(data) ? data : []);
    } catch (_) {}
  };

  const enviarMensagem = async () => {
    if (!texto.trim() || enviando) return;
    const textoEnviar = texto.trim();
    setTexto("");
    setEnviando(true);

    // Optimistic update
    const msgTemp = {
      id:           `temp-${Date.now()}`,
      remetente_id: user.id,
      sala_id:      salaId,
      assunto:      "Mensagem de sala",
      corpo:        textoEnviar,
      created_at:   new Date().toISOString(),
      remetente:    { id: user.id, name: user.name, avatar: user.avatar, perfil: user.perfil },
      _temp:        true,
    };
    setMensagens((prev) => [...prev, msgTemp]);

    try {
      await api.post(`/salas/${salaId}/mensagens`, {
        assunto: "Mensagem de sala",
        corpo:   textoEnviar,
      });
      await carregarMensagens(false);
    } catch (_) {
      setMensagens((prev) => prev.filter((m) => m.id !== msgTemp.id));
      setTexto(textoEnviar);
    } finally {
      setEnviando(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────
  const getIniciais = (nome = "") => {
    const p = nome.trim().split(" ");
    return p.length === 1
      ? p[0][0]?.toUpperCase() || "?"
      : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  const corPerfil = (perfil) => {
    switch (perfil) {
      case "professor_diretor": return "#f5365c";
      case "professor":         return "#2dce89";
      default:                  return "#5e72e4";
    }
  };

  const formatarHora = (data) => {
    if (!data) return "";
    return new Date(data).toLocaleTimeString("pt-PT", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  // Agrupar mensagens consecutivas do mesmo remetente
  const mensagensAgrupadas = mensagens.reduce((acc, msg, i) => {
    const anterior = mensagens[i - 1];
    const mesmaPessoa = anterior?.remetente_id === msg.remetente_id;
    const minha = msg.remetente_id === user.id;
    acc.push({ ...msg, minha, mesmaPessoa });
    return acc;
  }, []);

  if (!isOpen) return null;

  // ── Render — painel flutuante ─────────────────────────
  return (
    <div style={{
      position: "fixed",
      bottom: "1.5rem",
      right: "1.5rem",
      width: "380px",
      height: "560px",
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      zIndex: 1050,
      overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{
        backgroundColor: "#075e54",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}>
        {/* Ícone de grupo */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Users size={20} color="white" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, color: "white", fontWeight: "600",
            fontSize: "0.95rem", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {salaNome || "Sala"}
          </p>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.72rem" }}>
            {membros.length} participantes
          </p>
        </div>

        <button
          onClick={toggle}
          style={{
            background: "none", border: "none",
            cursor: "pointer", color: "rgba(255,255,255,0.8)",
            display: "flex", padding: "4px",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Área de mensagens */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem 0.75rem",
        backgroundColor: "#efeae2",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c9b8' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        display: "flex",
        flexDirection: "column",
        gap: "0.2rem",
      }}>
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: "2rem" }}>
            <div className="spinner-border spinner-border-sm text-secondary" />
          </div>
        ) : mensagensAgrupadas.length === 0 ? (
          <div style={{
            textAlign: "center", paddingTop: "3rem",
            color: "#8696a0",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👋</div>
            <p style={{ fontSize: "0.82rem" }}>
              Sê o primeiro a enviar uma mensagem!
            </p>
          </div>
        ) : (
          mensagensAgrupadas.map((msg) => (
            <div key={msg.id} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.minha ? "flex-end" : "flex-start",
              marginBottom: "0.15rem",
            }}>
              {/* Nome do remetente (apenas em mensagens de outros, primeira da sequência) */}
              {!msg.minha && !msg.mesmaPessoa && (
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: "0.4rem", marginBottom: "0.2rem",
                  paddingLeft: "0.25rem",
                }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%",
                    backgroundColor: corPerfil(msg.remetente?.perfil),
                    color: "white", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", fontWeight: "bold", flexShrink: 0,
                  }}>
                    {getIniciais(msg.remetente?.name || "")}
                  </div>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: "600",
                    color: corPerfil(msg.remetente?.perfil),
                  }}>
                    {msg.remetente?.name}
                  </span>
                </div>
              )}

              {/* Bolha da mensagem */}
              <div style={{
                maxWidth: "82%",
                backgroundColor: msg.minha ? "#dcf8c6" : "white",
                borderRadius: msg.minha
                  ? "12px 12px 2px 12px"
                  : "12px 12px 12px 2px",
                padding: "0.45rem 0.7rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                opacity: msg._temp ? 0.7 : 1,
              }}>
                <p style={{
                  margin: 0, fontSize: "0.875rem",
                  lineHeight: "1.4", wordBreak: "break-word",
                  color: "#111b21",
                }}>
                  {msg.corpo}
                </p>
                <p style={{
                  margin: "0.15rem 0 0",
                  fontSize: "0.65rem",
                  color: "#8696a0",
                  textAlign: "right",
                }}>
                  {formatarHora(msg.created_at)}
                  {msg.minha && (
                    <span style={{ marginLeft: "3px" }}>
                      {msg._temp ? "⏳" : "✓"}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        backgroundColor: "#f0f2f5",
        padding: "0.6rem 0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Mensagem..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviarMensagem()}
          style={{
            flex: 1, border: "none", borderRadius: "20px",
            padding: "0.55rem 1rem", outline: "none",
            fontSize: "0.88rem", backgroundColor: "white",
            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
          }}
        />
        <button
          onClick={enviarMensagem}
          disabled={!texto.trim() || enviando}
          style={{
            width: "40px", height: "40px", borderRadius: "50%",
            backgroundColor: texto.trim() ? "#075e54" : "#b2bec3",
            border: "none",
            cursor: texto.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s", flexShrink: 0,
          }}
        >
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
};

export default ChatSala;
