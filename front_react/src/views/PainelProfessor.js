import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, CardBody,
  Button, Form, FormGroup, Label, Input, Modal,
  ModalHeader, ModalBody, ModalFooter, Badge,
} from "reactstrap";
import {
  Plus, Upload, FileText, Mail,
  Users, BookOpen, ClipboardList, TrendingUp, Bell, X,
  ChevronRight, Layers, BarChart2, MessageSquare,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import BotaoChat from "./BotaoChat";

/* ─── Paleta e tokens ──────────────────────────────────────────
   Accent:   #00C896  (verde-menta vibrante)
   Surface:  #0F172A  (azul-noite profundo)
   Mid:      #1E293B
   Card:     #ffffff
   Muted:    #64748B
─────────────────────────────────────────────────────────────── */

const S = {
  // Layout
  wrap: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  // Header
  hero: {
    background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0F3460 100%)",
    padding: "2rem 2rem",
    position: "relative",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute", top: "-80px", right: "-60px",
    width: "340px", height: "340px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,200,150,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroGlow2: {
    position: "absolute", bottom: "-60px", left: "10%",
    width: "260px", height: "260px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroTitle: {
    fontSize: "1.65rem", fontWeight: "700", color: "#fff",
    margin: 0, letterSpacing: "-0.02em",
  },
  heroSub: {
    fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", margin: "0.2rem 0 0",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "rgba(0,200,150,0.18)",
    border: "1px solid rgba(0,200,150,0.4)",
    color: "#00C896",
    borderRadius: "20px",
    padding: "0.3rem 0.9rem",
    fontSize: "0.72rem",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "0.6rem",
    width: "fit-content",
  },
  // Stat cards
  statsWrap: {
    padding: "0 1.5rem",
    marginTop: "1.5rem",
    position: "relative",
    zIndex: 10,
  },
  statCard: {
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    overflow: "hidden",
    cursor: "default",
    transition: "transform 0.2s, box-shadow 0.2s",
    height: "100%",
    backgroundColor: "white",
  },
  statTop: (accent) => ({
    height: "4px",
    background: accent,
    borderRadius: "4px 4px 0 0",
  }),
  statContent: {
    padding: "1.1rem 1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIcon: (bg) => ({
    width: "44px", height: "44px", borderRadius: "12px",
    background: bg, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  }),
  statNum: {
    fontSize: "1.75rem", fontWeight: "800",
    color: "#0F172A", margin: 0, lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.75rem", color: "#64748B",
    textTransform: "uppercase", letterSpacing: "0.06em",
    fontWeight: "600", margin: 0,
  },
  // Tabs
  tabBar: {
    display: "flex", gap: "0.25rem",
    backgroundColor: "#F1F5F9",
    borderRadius: "12px",
    padding: "0.35rem",
    marginBottom: "1.5rem",
  },
  tab: (active) => ({
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", gap: "0.4rem",
    padding: "0.55rem 0.5rem",
    borderRadius: "9px", border: "none", cursor: "pointer",
    fontSize: "0.82rem", fontWeight: active ? "700" : "500",
    color: active ? "#0F172A" : "#64748B",
    background: active ? "#ffffff" : "transparent",
    boxShadow: active ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
    transition: "all 0.18s",
  }),
  // Sala card
  salaCard: {
    borderRadius: "16px", border: "1px solid #E2E8F0",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    overflow: "hidden",
    height: "100%",
    backgroundColor: "#ffffff",
  },
  salaStripe: (gradient) => ({
    height: "6px", background: gradient,
  }),
  salaCode: {
    fontSize: "0.68rem", fontWeight: "700",
    letterSpacing: "0.1em", textTransform: "uppercase",
    backgroundColor: "#EFF6FF", color: "#3B82F6",
    borderRadius: "6px", padding: "0.15rem 0.5rem",
  },
  salaName: {
    fontSize: "1rem", fontWeight: "700",
    color: "#0F172A", margin: 0,
  },
  salaDesc: {
    fontSize: "0.82rem", color: "#64748B",
    margin: "0.3rem 0 0", lineHeight: 1.4,
  },
  salaMeta: {
    display: "flex", alignItems: "center",
    gap: "0.5rem", fontSize: "0.75rem", color: "#94A3B8",
  },
  salaArrow: {
    marginLeft: "auto", color: "#00C896",
    display: "flex", alignItems: "center",
  },
  // Action buttons
  btnPrimary: {
    background: "linear-gradient(135deg, #00C896, #00A67E)",
    border: "none", borderRadius: "10px",
    color: "#fff", fontWeight: "600",
    padding: "0.5rem 1.2rem",
    fontSize: "0.85rem",
    display: "flex", alignItems: "center", gap: "0.5rem",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,200,150,0.35)",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "10px", color: "#fff",
    fontWeight: "600", padding: "0.5rem 1.2rem",
    fontSize: "0.85rem",
    display: "flex", alignItems: "center", gap: "0.5rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  btnDanger: {
    background: "none", border: "none", cursor: "pointer",
    color: "#F87171", padding: "4px", lineHeight: 1,
    borderRadius: "6px", transition: "background 0.15s",
  },
  // Notif dropdown
  notifBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px", padding: "0.5rem 0.8rem",
    cursor: "pointer", position: "relative",
    display: "flex", alignItems: "center",
    color: "white",
    transition: "all 0.2s ease",
  },
  notifDot: {
    position: "absolute", top: "-5px", right: "-5px",
    backgroundColor: "#F43F5E", color: "white",
    borderRadius: "50%", width: "18px", height: "18px",
    fontSize: "0.65rem", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontWeight: "bold", border: "2px solid #0F172A",
  },
  notifDropdown: {
    position: "absolute", top: "110%", right: 0,
    backgroundColor: "white", borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    border: "1px solid #E2E8F0", width: "340px",
    maxHeight: "400px", overflowY: "auto", zIndex: 9999,
  },
  // Empty state
  empty: {
    textAlign: "center", padding: "3.5rem 2rem",
    color: "#94A3B8",
  },
  emptyIcon: {
    width: "64px", height: "64px", borderRadius: "18px",
    backgroundColor: "#F1F5F9",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 1rem",
  },
  // Main content card
  mainCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #E2E8F0",
  },
  // Content wrapper
  contentWrapper: {
    padding: "0 1.5rem 2rem",
  },
  // Header actions wrapper
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
};

const GRADIENTS = [
  "linear-gradient(90deg,#6366F1,#8B5CF6)",
  "linear-gradient(90deg,#00C896,#06B6D4)",
  "linear-gradient(90deg,#F59E0B,#EF4444)",
  "linear-gradient(90deg,#EC4899,#F43F5E)",
  "linear-gradient(90deg,#3B82F6,#6366F1)",
  "linear-gradient(90deg,#10B981,#6366F1)",
];

const PainelProfessor = () => {
  const { user } = useAuth();
  const isDiretor = user?.perfil === "professor_diretor";

  const [turmas,       setTurmas]       = useState([]);
  const [materiais,    setMateriais]    = useState([]);
  const [abaActiva,    setAbaActiva]    = useState("turmas");
  const [loading,      setLoading]      = useState(true);
  const [modalTurma,   setModalTurma]   = useState(false);
  const [modalMaterial,setModalMaterial]= useState(false);
  const [turmaForm,    setTurmaForm]    = useState({ nome: "", descricao: "" });
  const [materialForm, setMaterialForm] = useState({
    titulo: "", descricao: "", tipo: "pdf", ficheiro: null, turmaId: "",
  });
  const [notifications, setNotifications] = useState([
    { id: 1, type: "success", title: "Tarefa Corrigida",  message: "Corrigiu 5 tarefas da Turma A",              time: "2 min",   read: false },
    { id: 2, type: "warning", title: "Prazo Próximo",     message: "Entrega da avaliação do 2º período em 2 dias",time: "1 h",     read: false },
    { id: 3, type: "info",    title: "Nova Mensagem",     message: "Aluno João enviou uma mensagem",             time: "3 h",     read: true  },
  ]);
  const [isNotifOpen,  setIsNotifOpen]  = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const navigate    = useNavigate();

  useEffect(() => {
    async function carregar() {
      try {
        const { data } = await api.get("/salas");
        setTurmas(Array.isArray(data) ? data : (data?.data || []));
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const handleCriarTurma = async () => {
    if (!turmaForm.nome.trim()) { alert("O nome é obrigatório!"); return; }
    try {
      await api.post("/salas", turmaForm);
      setTurmaForm({ nome: "", descricao: "" });
      setModalTurma(false);
      const { data } = await api.get("/salas");
      setTurmas(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      alert(err?.response?.status === 403 ? "Apenas o Diretor pode criar salas." : "Erro ao criar sala.");
    }
  };

  const handleUploadMaterial = async () => {
    if (!materialForm.titulo.trim()) { alert("O título é obrigatório!"); return; }
    if (!materialForm.turmaId)       { alert("Selecciona a sala."); return; }
    if (materialForm.tipo !== "link" && !materialForm.ficheiro) { alert("Selecciona um ficheiro."); return; }
    try {
      const fd = new FormData();
      fd.append("titulo",    materialForm.titulo.trim());
      fd.append("descricao", materialForm.descricao.trim());
      fd.append("tipo",      materialForm.tipo);
      if (materialForm.tipo === "link") fd.append("url_externa", materialForm.ficheiro);
      else fd.append("ficheiro", materialForm.ficheiro);
      await api.post(`/salas/${materialForm.turmaId}/materiais`, fd);
      alert("Material enviado!");
      setMaterialForm({ titulo: "", descricao: "", tipo: "pdf", ficheiro: null, turmaId: "" });
      setModalMaterial(false);
    } catch (err) {
      const errors = err?.response?.data?.errors;
      alert(errors ? Object.values(errors).flat().join("\n") : err?.response?.data?.message || "Erro.");
    }
  };

  const handleApagarSala = async (id, nome) => {
    if (!window.confirm(`Apagar a sala "${nome}"?`)) return;
    try {
      await api.delete(`/salas/${id}`);
      setTurmas(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(err?.response?.status === 403 ? "Sem permissão." : "Erro ao apagar.");
    }
  };

  const markAsRead    = (id) => setNotifications(p => p.map(n => n.id === id ? {...n, read: true} : n));
  const markAllAsRead = ()   => setNotifications(p => p.map(n => ({...n, read: true})));
  const removeNotif   = (id) => setNotifications(p => p.filter(n => n.id !== id));
  const notifIcon     = (t)  => ({success:"✅",warning:"⚠️",error:"❌"}[t] ?? "ℹ️");

  const nomeCompleto = user?.name || "Professor";
  const primeiroNome = nomeCompleto.split(" ")[0];

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%",
          border: "3px solid #E2E8F0", borderTopColor: "#00C896",
          animation: "spin 0.8s linear infinite", margin: "0 auto 1rem",
        }} />
        <p style={{ color: "#64748B", fontSize: "0.9rem" }}>A carregar...</p>
      </div>
    </div>
  );

  const abas = [
    { key: "turmas",     label: "Salas",       icon: <Layers size={14} /> },
    { key: "tarefas",    label: "Tarefas",      icon: <FileText size={14} /> },
    { key: "avaliacoes", label: "Avaliações",   icon: <BarChart2 size={14} /> },
    { key: "mensagens",  label: "Mensagens",    icon: <MessageSquare size={14} /> },
  ];

  return (
    <div style={S.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .sala-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        .btn-hero:hover { opacity: 0.85 !important; transform: translateY(-2px) !important; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.1) !important; }
        .notif-item:hover { background: #F8FAFC !important; }
        .tab-btn:hover { background: rgba(255,255,255,0.7) !important; transform: translateY(-1px); }
        .fade-up-item { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={S.hero}>
        <div style={S.heroGlow} />
        <div style={S.heroGlow2} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>

            {/* Saudação - lado esquerdo */}
            <div>
              <div style={S.heroBadge}>
                {/* <span>{isDiretor ? "🎓" : "📚"}</span>
                 <span>{isDiretor ? "Director de Turma" : "Professor"}</span>*/}
              </div>
              <h1 style={S.heroTitle}>Olá, {primeiroNome}! </h1>
              <p style={S.heroSub}>
                {turmas.length > 0
                  ? `Tens ${turmas.length} sala${turmas.length > 1 ? "s" : ""} activa${turmas.length > 1 ? "s" : ""}`
                  : "Bem-vindo ao teu painel"}
              </p>
            </div>

            {/* Ações - lado direito (centralizado verticalmente) */}
            <div style={S.headerActions}>
              {isDiretor && (
                <button style={S.btnPrimary} className="btn-hero"
                  onClick={() => setModalTurma(true)}>
                  <Plus size={16} /> Nova Sala
                </button>
              )}
              <button style={S.btnSecondary} className="btn-hero"
                onClick={() => setModalMaterial(true)}>
                <Upload size={16} /> Enviar Material
              </button>

              {/* Notificações */}
              <div style={{ position: "relative" }}>
                <button 
                  style={S.notifBtn} 
                  className="btn-hero"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && <span style={S.notifDot}>{unreadCount}</span>}
                </button>

                {isNotifOpen && (
                  <>
                    <div onClick={() => setIsNotifOpen(false)}
                      style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                    <div style={S.notifDropdown}>
                      <div style={{ padding: "1rem 1rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9" }}>
                        <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0F172A" }}>Notificações</span>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#00C896", fontSize: "0.78rem", fontWeight: "600" }}>
                              Marcar todas
                            </button>
                          )}
                          <button onClick={() => setIsNotifOpen(false)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: "1rem" }}>✕</button>
                        </div>
                      </div>
                      {notifications.length === 0
                        ? <p style={{ textAlign: "center", color: "#94A3B8", padding: "2rem", fontSize: "0.85rem" }}>Sem notificações</p>
                        : notifications.map(n => (
                          <div key={n.id} className="notif-item" onClick={() => markAsRead(n.id)}
                            style={{ padding: "0.85rem 1rem", cursor: "pointer", borderBottom: "1px solid #F8FAFC", backgroundColor: n.read ? "white" : "#F0FDF9" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{notifIcon(n.type)}</span>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: "600", fontSize: "0.84rem", color: "#0F172A" }}>{n.title}</p>
                                <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748B" }}>{n.message}</p>
                                <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", color: "#94A3B8" }}>{n.time}</p>
                              </div>
                              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", padding: "2px" }}
                                onClick={e => { e.stopPropagation(); removeNotif(n.id); }}>✕</button>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO PRINCIPAL ─────────────────────────────── */}
      <div style={S.contentWrapper}>

        {/* Stats cards */}
        <div style={S.statsWrap}>
          <Row className="g-3">
            {[
              { label: "Total de Salas",   value: turmas.length, icon: <Layers size={20} color="#6366F1" />,     accent: "linear-gradient(90deg,#6366F1,#8B5CF6)", bg: "#EEF2FF" },
              { label: "Materiais",        value: materiais.length, icon: <BookOpen size={20} color="#00C896" />, accent: "linear-gradient(90deg,#00C896,#06B6D4)", bg: "#ECFDF5" },
              { label: "Exercícios",       value: "—",           icon: <ClipboardList size={20} color="#F59E0B" />, accent: "linear-gradient(90deg,#F59E0B,#EF4444)", bg: "#FFFBEB" },
            ].map((s, i) => (
              <Col key={i} xl="4" lg="4" md="6" sm="12">
                <div className="stat-card" style={S.statCard}>
                  <div style={S.statTop(s.accent)} />
                  <div style={S.statContent}>
                    <div style={S.statIcon(s.bg)}>{s.icon}</div>
                    <div>
                      <p style={S.statLabel}>{s.label}</p>
                      <p style={S.statNum}>{s.value}</p>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Card principal com abas */}
        <div style={{ ...S.mainCard, marginTop: "1.5rem" }}>

          {/* Tab bar */}
          <div style={S.tabBar}>
            {abas.map(a => (
              <button key={a.key} className="tab-btn"
                style={S.tab(abaActiva === a.key)}
                onClick={() => setAbaActiva(a.key)}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>

          {/* ── Aba Salas ──────────────────────────────── */}
          {abaActiva === "turmas" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: "700", color: "#0F172A", fontSize: "1.1rem" }}>Minhas Salas</h4>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "#94A3B8" }}>
                    {turmas.length} sala{turmas.length !== 1 ? "s" : ""} encontrada{turmas.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {isDiretor && (
                  <button style={{ ...S.btnPrimary, boxShadow: "none", padding: "0.45rem 1rem" }} className="btn-hero"
                    onClick={() => setModalTurma(true)}>
                    <Plus size={14} /> Nova Sala
                  </button>
                )}
              </div>

              {turmas.length === 0 ? (
                <div style={S.empty}>
                  <div style={S.emptyIcon}><Layers size={28} color="#94A3B8" /></div>
                  <p style={{ fontWeight: "600", color: "#475569", margin: "0 0 0.4rem" }}>
                    {isDiretor ? "Cria a tua primeira sala" : "Ainda não tens salas"}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: 0 }}>
                    {isDiretor
                      ? "Clica em \"Nova Sala\" para começar."
                      : "Aguarda um convite do Director de Turma."}
                  </p>
                </div>
              ) : (
                <Row className="g-4">
                  {turmas.map((t, idx) => (
                    <Col key={t.id} xl="4" lg="6" md="6" sm="12">
                      <div className="sala-card" style={S.salaCard}
                        onClick={() => navigate(`/admin/sala/${t.id}`)}>
                        <div style={S.salaStripe(GRADIENTS[idx % GRADIENTS.length])} />
                        <div style={{ padding: "1.1rem 1.2rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                            <p style={S.salaName}>{t.nome}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0, marginLeft: "0.5rem" }}>
                              <span style={S.salaCode}>{t.codigo_acesso || "—"}</span>
                              {isDiretor && t.criador_id === user?.id && (
                                <button style={S.btnDanger}
                                  onClick={e => { e.stopPropagation(); handleApagarSala(t.id, t.nome); }}
                                  title="Apagar sala">
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p style={S.salaDesc}>{t.descricao || "Sem descrição"}</p>
                          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center" }}>
                            <div style={S.salaMeta}>
                              <Users size={12} />
                              <span>{t.alunos_count ?? "—"} alunos</span>
                              <span style={{ color: "#E2E8F0" }}>·</span>
                              <BookOpen size={12} />
                              <span>{t.materiais_count ?? "—"} materiais</span>
                            </div>
                            <div style={S.salaArrow}>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}

          {/* ── Aba Tarefas ─────────────────────────────── */}
          {abaActiva === "tarefas" && (
            <div style={S.empty}>
              <div style={S.emptyIcon}><FileText size={28} color="#94A3B8" /></div>
              <p style={{ fontWeight: "600", color: "#475569", margin: "0 0 0.4rem" }}>Tarefas e Exercícios</p>
              <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: "0 0 1.25rem" }}>
                Entra numa sala para criar e gerir exercícios.
              </p>
              <button style={{ ...S.btnPrimary, margin: "0 auto" }} className="btn-hero"
                onClick={() => setAbaActiva("turmas")}>
                <Layers size={14} /> Ver Salas
              </button>
            </div>
          )}

          {/* ── Aba Avaliações ──────────────────────────── */}
          {abaActiva === "avaliacoes" && (
            <div style={S.empty}>
              <div style={S.emptyIcon}><BarChart2 size={28} color="#94A3B8" /></div>
              <p style={{ fontWeight: "600", color: "#475569", margin: "0 0 0.4rem" }}>Relatórios de Desempenho</p>
              <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: 0 }}>
                Os gráficos e estatísticas aparecerão aqui em breve.
              </p>
            </div>
          )}

          {/* ── Aba Mensagens ───────────────────────────── */}
          {abaActiva === "mensagens" && (
            <div style={S.empty}>
              <div style={S.emptyIcon}><MessageSquare size={28} color="#94A3B8" /></div>
              <p style={{ fontWeight: "600", color: "#475569", margin: "0 0 0.4rem" }}>Central de Mensagens</p>
              <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: 0 }}>
                Usa o botão de chat no canto inferior direito para mensagens privadas.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── Modal: Criar Sala ────────────────────────────── */}
      {isDiretor && (
        <Modal isOpen={modalTurma} toggle={() => setModalTurma(false)}>
          <ModalHeader toggle={() => setModalTurma(false)}>
            <span style={{ fontWeight: "700", color: "#0F172A" }}>✨ Nova Sala</span>
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Nome da Sala *</Label>
                <Input type="text" placeholder="Ex: Matemática 10ª Classe"
                  style={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
                  value={turmaForm.nome}
                  onChange={e => setTurmaForm({ ...turmaForm, nome: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Descrição</Label>
                <Input type="textarea" rows={3} placeholder="Descrição opcional..."
                  style={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
                  value={turmaForm.descricao}
                  onChange={e => setTurmaForm({ ...turmaForm, descricao: e.target.value })} />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter style={{ border: "none" }}>
            <Button color="light" style={{ borderRadius: "10px" }} onClick={() => setModalTurma(false)}>Cancelar</Button>
            <button style={S.btnPrimary} className="btn-hero" onClick={handleCriarTurma}>
              <Plus size={14} /> Criar Sala
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* ── Modal: Enviar Material ───────────────────────── */}
      <Modal isOpen={modalMaterial} toggle={() => setModalMaterial(false)}>
        <ModalHeader toggle={() => setModalMaterial(false)}>
          <span style={{ fontWeight: "700", color: "#0F172A" }}>📎 Enviar Material</span>
        </ModalHeader>
        <ModalBody>
          <Form>
            {[
              { label: "Título *", name: "titulo", type: "text", placeholder: "Título do material" },
              { label: "Descrição", name: "descricao", type: "textarea", placeholder: "Descrição opcional..." },
            ].map(f => (
              <FormGroup key={f.name}>
                <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>{f.label}</Label>
                <Input {...f} style={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
                  rows={f.type === "textarea" ? 2 : undefined}
                  value={materialForm[f.name]}
                  onChange={e => setMaterialForm({ ...materialForm, [f.name]: e.target.value })} />
              </FormGroup>
            ))}
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Tipo</Label>
                  <Input type="select" style={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
                    value={materialForm.tipo}
                    onChange={e => setMaterialForm({ ...materialForm, tipo: e.target.value })}>
                    <option value="pdf">PDF</option>
                    <option value="imagem">Imagem</option>
                    <option value="video">Vídeo</option>
                    <option value="link">Link Externo</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Sala *</Label>
                  <Input type="select" style={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
                    value={materialForm.turmaId}
                    onChange={e => setMaterialForm({ ...materialForm, turmaId: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            {materialForm.tipo === "link" ? (
              <FormGroup>
                <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>URL</Label>
                <Input type="url" placeholder="https://..." style={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
                  value={typeof materialForm.ficheiro === "string" ? materialForm.ficheiro : ""}
                  onChange={e => setMaterialForm({ ...materialForm, ficheiro: e.target.value })} />
              </FormGroup>
            ) : (
              <FormGroup>
                <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Ficheiro</Label>
                <input type="file" className="form-control"
                  style={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
                  accept={materialForm.tipo === "pdf" ? ".pdf" : materialForm.tipo === "imagem" ? "image/*" : "video/*"}
                  onChange={e => setMaterialForm({ ...materialForm, ficheiro: e.target.files?.[0] || null })} />
                {materialForm.ficheiro && (
                  <small style={{ color: "#00C896", display: "block", marginTop: "0.4rem" }}>
                    ✓ {materialForm.ficheiro.name}
                  </small>
                )}
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter style={{ border: "none" }}>
          <Button color="light" style={{ borderRadius: "10px" }} onClick={() => setModalMaterial(false)}>Cancelar</Button>
          <button style={{ ...S.btnPrimary, background: "linear-gradient(135deg,#F59E0B,#EF4444)" }} className="btn-hero"
            onClick={handleUploadMaterial}>
            <Upload size={14} /> Enviar
          </button>
        </ModalFooter>
      </Modal>

      <BotaoChat />
    </div>
  );
};

export default PainelProfessor;