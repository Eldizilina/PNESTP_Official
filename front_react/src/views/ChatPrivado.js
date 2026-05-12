import { useState, useEffect, useRef } from "react";
import { Modal, ModalHeader, ModalBody, Input, Badge } from "reactstrap";
import { Send, Search, X, ArrowLeft } from "react-feather";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

/**
 * ChatPrivado — modal de mensagens directas estilo WhatsApp
 * Uso: <ChatPrivado isOpen={open} toggle={() => setOpen(false)} />
 */
const ChatPrivado = ({ isOpen, toggle }) => {
  const { user } = useAuth();

  const [contactos,      setContactos]      = useState([]);
  const [conversaActiva, setConversaActiva] = useState(null); // user seleccionado
  const [mensagens,      setMensagens]      = useState([]);
  const [texto,          setTexto]          = useState("");
  const [pesquisa,       setPesquisa]       = useState("");
  const [naoLidas,       setNaoLidas]       = useState(0);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);
  const [enviando,       setEnviando]       = useState(false);

  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const pollingRef   = useRef(null);

  // ── Carregar contactos e não lidas ────────────────────
  useEffect(() => {
    if (!isOpen) return;
    carregarContactos();
    carregarNaoLidas();
  }, [isOpen]);

  // ── Polling de mensagens a cada 5s ───────────────────
  useEffect(() => {
    if (!isOpen || !conversaActiva) return;
    pollingRef.current = setInterval(() => {
      carregarMensagens(conversaActiva.id, false);
    }, 5000);
    return () => clearInterval(pollingRef.current);
  }, [isOpen, conversaActiva]);

  // ── Scroll para o fundo ao receber mensagens ─────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // ── Foco no input ao abrir conversa ──────────────────
  useEffect(() => {
    if (conversaActiva) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [conversaActiva]);

  const carregarContactos = async () => {
    try {
      const { data } = await api.get("/mensagens/contactos");
      setContactos(Array.isArray(data) ? data : []);
    } catch (_) {}
  };

  const carregarNaoLidas = async () => {
    try {
      const { data } = await api.get("/mensagens/nao-lidas");
      setNaoLidas(data.nao_lidas || 0);
    } catch (_) {}
  };

  const carregarMensagens = async (contactoId, mostrarLoading = true) => {
    if (mostrarLoading) setLoadingMsgs(true);
    try {
      // Busca inbox e enviadas e cruza com o contacto activo
      const [resInbox, resEnviadas] = await Promise.all([
        api.get("/mensagens/inbox"),
        api.get("/mensagens/enviadas"),
      ]);

      const inbox    = (resInbox.data?.data    || resInbox.data    || [])
        .filter((m) => m.remetente_id === contactoId);
      const enviadas = (resEnviadas.data?.data || resEnviadas.data || [])
        .filter((m) => m.destinatario_id === contactoId);

      // Juntar e ordenar por data
      const todas = [...inbox, ...enviadas].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      setMensagens(todas);

      // Marcar como lidas
      await api.post("/mensagens/todas-lidas");
      carregarNaoLidas();
    } catch (_) {} finally {
      if (mostrarLoading) setLoadingMsgs(false);
    }
  };

  const abrirConversa = (contacto) => {
    setConversaActiva(contacto);
    setMensagens([]);
    carregarMensagens(contacto.id);
  };

  const fecharConversa = () => {
    setConversaActiva(null);
    setMensagens([]);
    clearInterval(pollingRef.current);
  };

  const enviarMensagem = async () => {
    if (!texto.trim() || !conversaActiva || enviando) return;
    const textoEnviar = texto.trim();
    setTexto("");
    setEnviando(true);

    // Optimistic update
    const msgTemp = {
      id:              `temp-${Date.now()}`,
      remetente_id:    user.id,
      destinatario_id: conversaActiva.id,
      assunto:         "Mensagem directa",
      corpo:           textoEnviar,
      created_at:      new Date().toISOString(),
      _temp:           true,
    };
    setMensagens((prev) => [...prev, msgTemp]);

    try {
      await api.post("/mensagens", {
        destinatario_id: conversaActiva.id,
        assunto:         "Mensagem directa",
        corpo:           textoEnviar,
      });
      // Recarregar para confirmar
      await carregarMensagens(conversaActiva.id, false);
    } catch (_) {
      // Remover mensagem temporária em caso de erro
      setMensagens((prev) => prev.filter((m) => m.id !== msgTemp.id));
      setTexto(textoEnviar);
    } finally {
      setEnviando(false);
    }
  };

  // ── Helpers visuais ───────────────────────────────────
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

  const formatarData = (data) => {
    if (!data) return "";
    const d = new Date(data);
    const hoje = new Date();
    const diff = hoje - d;
    if (diff < 86400000) return formatarHora(data);
    if (diff < 604800000) return d.toLocaleDateString("pt-PT", { weekday: "short" });
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
  };

  const contactosFiltrados = contactos.filter((c) =>
    c.name.toLowerCase().includes(pesquisa.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      style={{ maxWidth: "780px" }}
      contentClassName="border-0"
    >
      <div style={{
        display: "flex", height: "580px", borderRadius: "12px",
        overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>

        {/* ── Coluna esquerda — lista de contactos ──── */}
        <div style={{
          width: conversaActiva ? "0" : "100%",
          minWidth: conversaActiva ? "0" : "280px",
          maxWidth: "280px",
          borderRight: "1px solid #f0f0f0",
          display: "flex", flexDirection: "column",
          backgroundColor: "white",
          transition: "all 0.3s",
          overflow: "hidden",
        }}
          className="d-none d-md-flex"
        >
          {/* Header */}
          <div style={{
            padding: "1rem", backgroundColor: "#075e54",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}>
            <h6 className="mb-0 text-white font-weight-bold">Mensagens</h6>
            {naoLidas > 0 && (
              <Badge style={{ backgroundColor: "#25d366", color: "white", fontSize: "0.7rem" }}>
                {naoLidas}
              </Badge>
            )}
          </div>

          {/* Pesquisa */}
          <div style={{ padding: "0.5rem", backgroundColor: "#f0f2f5" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "white", borderRadius: "20px",
              padding: "0.4rem 0.75rem",
            }}>
              <Search size={14} color="#8696a0" />
              <input
                type="text"
                placeholder="Pesquisar contacto..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                style={{
                  border: "none", outline: "none", flex: 1,
                  fontSize: "0.85rem", backgroundColor: "transparent",
                }}
              />
            </div>
          </div>

          {/* Lista de contactos */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {contactosFiltrados.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#8696a0" }}>
                <p style={{ fontSize: "0.85rem" }}>
                  {pesquisa ? "Nenhum contacto encontrado" : "Sem contactos disponíveis"}
                </p>
              </div>
            ) : (
              contactosFiltrados.map((c) => (
                <div
                  key={c.id}
                  onClick={() => abrirConversa(c)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.75rem 1rem", cursor: "pointer",
                    backgroundColor: conversaActiva?.id === c.id ? "#f0f2f5" : "white",
                    borderBottom: "1px solid #f0f2f5",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (conversaActiva?.id !== c.id)
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    if (conversaActiva?.id !== c.id)
                      e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "46px", height: "46px", borderRadius: "50%",
                    backgroundColor: corPerfil(c.perfil), color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold", fontSize: "0.9rem", flexShrink: 0,
                  }}>
                    {getIniciais(c.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontWeight: "600", fontSize: "0.9rem",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {c.name}
                    </p>
                    <p style={{
                      margin: 0, fontSize: "0.75rem", color: "#8696a0",
                    }}>
                      {c.perfil === "professor_diretor" ? "Diretor"
                        : c.perfil === "professor" ? "Professor" : "Aluno"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Coluna direita — conversa ────────────── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          backgroundColor: "#efeae2",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c9b8' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}>

          {conversaActiva ? (
            <>
              {/* Header da conversa */}
              <div style={{
                backgroundColor: "#075e54", padding: "0.75rem 1rem",
                display: "flex", alignItems: "center", gap: "0.75rem",
              }}>
                <button
                  onClick={fecharConversa}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "white", padding: "4px", display: "flex",
                  }}
                  className="d-md-none"
                >
                  <ArrowLeft size={20} />
                </button>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  backgroundColor: corPerfil(conversaActiva.perfil),
                  color: "white", display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: "bold", fontSize: "0.85rem",
                }}>
                  {getIniciais(conversaActiva.name)}
                </div>
                <div>
                  <p style={{ margin: 0, color: "white", fontWeight: "600", fontSize: "0.95rem" }}>
                    {conversaActiva.name}
                  </p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>
                    {conversaActiva.perfil === "professor_diretor" ? "Professor Diretor"
                      : conversaActiva.perfil === "professor" ? "Professor" : "Aluno"}
                  </p>
                </div>
                <button
                  onClick={toggle}
                  style={{
                    marginLeft: "auto", background: "none", border: "none",
                    cursor: "pointer", color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mensagens */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "1rem",
                display: "flex", flexDirection: "column", gap: "0.4rem",
              }}>
                {loadingMsgs ? (
                  <div style={{ textAlign: "center", paddingTop: "2rem" }}>
                    <div className="spinner-border spinner-border-sm text-secondary" />
                  </div>
                ) : mensagens.length === 0 ? (
                  <div style={{
                    textAlign: "center", paddingTop: "3rem", color: "#8696a0",
                  }}>
                    <p style={{ fontSize: "0.85rem" }}>
                      Ainda não há mensagens. Diz olá! 👋
                    </p>
                  </div>
                ) : (
                  mensagens.map((msg) => {
                    const minha = msg.remetente_id === user.id;
                    return (
                      <div key={msg.id} style={{
                        display: "flex",
                        justifyContent: minha ? "flex-end" : "flex-start",
                      }}>
                        <div style={{
                          maxWidth: "70%",
                          backgroundColor: minha ? "#dcf8c6" : "white",
                          borderRadius: minha
                            ? "12px 12px 2px 12px"
                            : "12px 12px 12px 2px",
                          padding: "0.5rem 0.75rem",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          opacity: msg._temp ? 0.7 : 1,
                          position: "relative",
                        }}>
                          <p style={{
                            margin: 0, fontSize: "0.9rem",
                            lineHeight: "1.4", wordBreak: "break-word",
                          }}>
                            {msg.corpo}
                          </p>
                          <p style={{
                            margin: "0.2rem 0 0",
                            fontSize: "0.68rem",
                            color: "#8696a0",
                            textAlign: "right",
                          }}>
                            {formatarData(msg.created_at)}
                            {minha && (
                              <span style={{ marginLeft: "4px" }}>
                                {msg._temp ? "⏳" : "✓"}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input de envio */}
              <div style={{
                backgroundColor: "#f0f2f5", padding: "0.75rem",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Escreve uma mensagem..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviarMensagem()}
                  style={{
                    flex: 1, border: "none", borderRadius: "20px",
                    padding: "0.6rem 1rem", outline: "none",
                    fontSize: "0.9rem", backgroundColor: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                />
                <button
                  onClick={enviarMensagem}
                  disabled={!texto.trim() || enviando}
                  style={{
                    width: "42px", height: "42px", borderRadius: "50%",
                    backgroundColor: texto.trim() ? "#075e54" : "#b2bec3",
                    border: "none", cursor: texto.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s", flexShrink: 0,
                  }}
                >
                  <Send size={18} color="white" />
                </button>
              </div>
            </>
          ) : (
            /* Estado vazio — nenhuma conversa seleccionada */
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              color: "#8696a0", textAlign: "center", padding: "2rem",
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💬</div>
              <h5 style={{ color: "#41525d", marginBottom: "0.5rem" }}>
                Mensagens Privadas
              </h5>
              <p style={{ fontSize: "0.85rem", maxWidth: "260px" }}>
                Selecciona um contacto à esquerda para iniciar uma conversa privada.
              </p>
              <button
                onClick={toggle}
                style={{
                  marginTop: "1rem", background: "none", border: "none",
                  color: "#075e54", cursor: "pointer", fontSize: "0.85rem",
                }}
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ChatPrivado;
