import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Row, Col, Badge } from "reactstrap";
import {
  Bell, BookOpen, CalendarClock, CheckCircle2, ClipboardList,
  Clock3, FileText, Mail, Users, X,
} from "lucide-react";
import BotaoChat from "./BotaoChat";

const S = {
  wrap: {
    minHeight: "100vh",
    backgroundColor: "#FFF7ED",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  hero: {
    background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8E7 45%, #FDBA21 100%)",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
    borderBottom: "1px solid #F59E0B",
  },
  heroGlow: {
    position: "absolute",
    top: "-90px",
    right: "-70px",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(234,88,12,0.22) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroGlow2: {
    position: "absolute",
    bottom: "-90px",
    left: "8%",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(245,158,11,0.20) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    backgroundColor: "#FFFFFF",
    border: "1px solid #FDBA74",
    color: "#EA580C",
    borderRadius: "20px",
    padding: "0.3rem 0.85rem",
    fontSize: "0.72rem",
    fontWeight: "800",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "0.7rem",
    boxShadow: "0 8px 22px rgba(249,115,22,0.10)",
  },
  heroTitle: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#1F2937",
    margin: 0,
  },
  heroSub: {
    fontSize: "0.9rem",
    color: "#9A3412",
    margin: "0.25rem 0 0",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  notifBtn: {
    background: "#FFFFFF",
    border: "1px solid #FDBA74",
    borderRadius: "12px",
    padding: "0.55rem 0.8rem",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    color: "#EA580C",
    boxShadow: "0 8px 22px rgba(249,115,22,0.10)",
  },
  notifDot: {
    position: "absolute",
    top: "-7px",
    right: "-7px",
    backgroundColor: "#EF4444",
    color: "white",
    borderRadius: "50%",
    width: "19px",
    height: "19px",
    fontSize: "0.65rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    border: "2px solid #FFFFFF",
  },
  notifDropdown: {
    position: "absolute",
    top: "110%",
    right: 0,
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 42px rgba(124,45,18,0.16)",
    border: "1px solid #FED7AA",
    width: "340px",
    maxHeight: "400px",
    overflowY: "auto",
    zIndex: 9999,
  },
  contentWrapper: {
    padding: "1.5rem 1.5rem 2rem",
  },
  statCard: {
    borderRadius: "16px",
    border: "1px solid #FED7AA",
    boxShadow: "0 4px 24px rgba(124,45,18,0.07)",
    overflow: "hidden",
    height: "100%",
    backgroundColor: "white",
  },
  statTop: (accent) => ({
    height: "4px",
    background: accent,
  }),
  statContent: {
    padding: "1.1rem 1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIcon: (bg) => ({
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  statNum: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#1F2937",
    margin: 0,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#9A3412",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: "700",
    margin: 0,
  },
  mainCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    boxShadow: "0 4px 24px rgba(124,45,18,0.07)",
    border: "1px solid #FED7AA",
    marginTop: "1.5rem",
  },
  tabBar: {
    display: "flex",
    gap: "0.25rem",
    backgroundColor: "#FFF7ED",
    borderRadius: "12px",
    padding: "0.35rem",
    marginBottom: "1.5rem",
    overflowX: "auto",
  },
  tab: (active) => ({
    flex: 1,
    minWidth: "128px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    padding: "0.58rem 0.55rem",
    borderRadius: "9px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: active ? "800" : "600",
    color: active ? "#C2410C" : "#9A3412",
    background: active ? "#FFFFFF" : "transparent",
    boxShadow: active ? "0 2px 10px rgba(249,115,22,0.13)" : "none",
  }),
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  sectionTitle: {
    margin: 0,
    fontWeight: "800",
    color: "#1F2937",
    fontSize: "1.1rem",
  },
  sectionSub: {
    margin: "0.25rem 0 0",
    fontSize: "0.78rem",
    color: "#B45309",
  },
  itemCard: {
    borderRadius: "16px",
    border: "1px solid #FED7AA",
    boxShadow: "0 2px 12px rgba(124,45,18,0.05)",
    overflow: "hidden",
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  cardStripe: (gradient) => ({
    height: "6px",
    background: gradient,
  }),
  itemBody: {
    padding: "1.1rem 1.2rem",
  },
  iconTile: (bg, color) => ({
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    backgroundColor: bg,
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontWeight: "800",
    fontSize: "0.76rem",
  }),
  title: {
    margin: "0 0 0.25rem",
    fontWeight: "800",
    color: "#1F2937",
    fontSize: "0.96rem",
    lineHeight: 1.25,
  },
  desc: {
    margin: 0,
    color: "#78716C",
    fontSize: "0.8rem",
    lineHeight: 1.4,
  },
  statusPill: (color) => ({
    backgroundColor: color,
    color: "white",
    padding: "0.3rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.68rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
  }),
  teacherAvatar: (color) => ({
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    backgroundColor: color,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "1rem",
    flexShrink: 0,
  }),
  empty: {
    textAlign: "center",
    padding: "3.5rem 2rem",
    color: "#B45309",
  },
  emptyIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    backgroundColor: "#FFF7ED",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
};

const MATERIAL_GRADIENTS = [
  "linear-gradient(90deg,#F97316,#F59E0B)",
  "linear-gradient(90deg,#FB7185,#F97316)",
  "linear-gradient(90deg,#22C55E,#14B8A6)",
  "linear-gradient(90deg,#3B82F6,#8B5CF6)",
];

export default function PainelAluno() {
  const { user } = useAuth();

  const [notificacoes, setNotificacoes] = useState([]);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [materiais, setMateriais] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaActiva, setAbaActiva] = useState("materiais");

  useEffect(() => {
    if (!user) return;

    async function buscarDados() {
      try {
        setNotificacoes([
          { id: "1", titulo: "Nova tarefa de Matematica", descricao: "Lista de Exercicios - Cap. 5 foi adicionada", tipo: "tarefa", lida: false, tempo: "5 min atras", cor: "#EF4444" },
          { id: "2", titulo: "Material de Historia disponivel", descricao: "Slides sobre Segunda Guerra Mundial", tipo: "material", lida: false, tempo: "1 hora atras", cor: "#10B981" },
          { id: "3", titulo: "Prazo se aproximando", descricao: "Redacao sobre Meio Ambiente vence em 2 dias", tipo: "prazo", lida: true, tempo: "2 horas atras", cor: "#F97316" },
        ]);

        setMateriais([
          { id: "1", disciplina: "Matematica", titulo: "Equacoes do 2 Grau", tipo: "PDF", cor: "linear-gradient(135deg,#F97316,#F59E0B)", dataUpload: "Hoje" },
          { id: "2", disciplina: "Historia", titulo: "Segunda Guerra Mundial", tipo: "PDF", cor: "linear-gradient(135deg,#22C55E,#14B8A6)", dataUpload: "Ontem" },
          { id: "3", disciplina: "Quimica", titulo: "Tabela Periodica", tipo: "PDF", cor: "linear-gradient(135deg,#3B82F6,#8B5CF6)", dataUpload: "2 dias atras" },
        ]);

        setTarefas([
          { id: "1", disciplina: "Matematica", titulo: "Lista de Exercicios - Cap. 5", prazo: "Amanha", status: "pendente" },
          { id: "2", disciplina: "Portugues", titulo: "Redacao sobre Meio Ambiente", prazo: "3 dias", status: "pendente" },
          { id: "3", disciplina: "Historia", titulo: "Pesquisa sobre Sao Tome na era Colonial", prazo: "1 semana", status: "em_andamento" },
          { id: "4", disciplina: "Fisica", titulo: "Teoria de Isaac Newton", prazo: "Entregue", status: "concluida" },
        ]);

        setProfessores([
          { id: "1", nome: "Prof. Ana Silva", disciplina: "Matematica", email: "ana.silva@escola.com", cor: "#F97316" },
          { id: "2", nome: "Prof. Carlos Santos", disciplina: "Historia", email: "carlos.santos@escola.com", cor: "#10B981" },
          { id: "3", nome: "Prof. Maria Oliveira", disciplina: "Portugues", email: "maria.oliveira@escola.com", cor: "#EF4444" },
          { id: "4", nome: "Prof. Joao Costa", disciplina: "Quimica", email: "joao.costa@escola.com", cor: "#3B82F6" },
        ]);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    buscarDados();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pendente": return "#EF4444";
      case "em_andamento": return "#F97316";
      case "concluida": return "#10B981";
      default: return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pendente": return "Pendente";
      case "em_andamento": return "Em andamento";
      case "concluida": return "Concluida";
      default: return "Indefinido";
    }
  };

  const statusIcon = (status) => {
    if (status === "concluida") return <CheckCircle2 size={14} />;
    if (status === "em_andamento") return <Clock3 size={14} />;
    return <CalendarClock size={14} />;
  };

  const marcarComoLida = (id) => setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
  const marcarTodasLidas = () => setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  const notifNaoLidas = notificacoes.filter((n) => !n.lida).length;

  const nomeCompleto = user?.nome || user?.name || "Aluno";
  const primeiroNome = nomeCompleto.split(" ")[0];
  const turma = user?.turma || "Minha Turma";
  const tarefasPendentes = tarefas.filter((t) => t.status !== "concluida").length;

  const abas = [
    { key: "materiais", label: "Materiais", icon: <BookOpen size={14} />, count: materiais.length },
    { key: "tarefas", label: "Tarefas", icon: <ClipboardList size={14} />, count: tarefasPendentes },
    { key: "professores", label: "Professores", icon: <Users size={14} />, count: professores.length },
  ];

  if (loading) {
    return (
      <div style={S.wrap}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "3px solid #FED7AA",
              borderTopColor: "#F97316",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }} />
            <p style={{ color: "#9A3412", fontSize: "0.9rem" }}>Carregando painel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .student-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(124,45,18,0.11) !important; }
        .student-btn:hover { opacity: 0.88 !important; transform: translateY(-2px); }
        .tab-btn:hover { background: #FFFFFF !important; }
        .fade-up-item { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div style={S.hero}>
        <div style={S.heroGlow} />
        <div style={S.heroGlow2} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={S.heroBadge}>
                <BookOpen size={13} />
                Area do Aluno
              </div>
              <h1 style={S.heroTitle}>Ola, {primeiroNome}!</h1>
              <p style={S.heroSub}>{turma} · continua o teu ritmo de estudo</p>
            </div>

            <div style={S.headerActions}>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
                  className="student-btn"
                  style={S.notifBtn}
                  title="Notificacoes"
                >
                  <Bell size={18} />
                  {notifNaoLidas > 0 && <span style={S.notifDot}>{notifNaoLidas}</span>}
                </button>

                {mostrarNotificacoes && (
                  <>
                    <div onClick={() => setMostrarNotificacoes(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                    <div style={S.notifDropdown}>
                      <div style={{ padding: "1rem 1rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #FFF7ED" }}>
                        <span style={{ fontWeight: "800", fontSize: "0.9rem", color: "#1F2937" }}>Notificacoes</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {notifNaoLidas > 0 && (
                            <button
                              onClick={marcarTodasLidas}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#EA580C", fontSize: "0.78rem", fontWeight: "800" }}
                            >
                              Marcar todas
                            </button>
                          )}
                          <button
                            onClick={() => setMostrarNotificacoes(false)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#FDBA74", padding: 0 }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {notificacoes.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#B45309", padding: "2rem", fontSize: "0.85rem", margin: 0 }}>Nenhuma notificacao</p>
                      ) : (
                        notificacoes.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => marcarComoLida(n.id)}
                            style={{
                              padding: "0.85rem 1rem",
                              cursor: "pointer",
                              borderBottom: "1px solid #FFF7ED",
                              backgroundColor: n.lida ? "white" : "#FFF7ED",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                              <div style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: n.lida ? "#FED7AA" : n.cor,
                                marginTop: "0.35rem",
                                flexShrink: 0,
                              }} />
                              <div>
                                <p style={{ margin: 0, fontWeight: "800", color: "#1F2937", fontSize: "0.84rem" }}>{n.titulo}</p>
                                <p style={{ margin: "0.1rem 0", color: "#78716C", fontSize: "0.78rem" }}>{n.descricao}</p>
                                <p style={{ margin: 0, color: "#B45309", fontSize: "0.7rem" }}>{n.tempo}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={S.contentWrapper}>
        <Row className="g-3">
          {[
            { label: "Materiais", value: materiais.length, icon: <BookOpen size={20} color="#F97316" />, accent: "linear-gradient(90deg,#F97316,#F59E0B)", bg: "#FFF7ED" },
            { label: "Tarefas Ativas", value: tarefasPendentes, icon: <ClipboardList size={20} color="#EF4444" />, accent: "linear-gradient(90deg,#EF4444,#F97316)", bg: "#FEF2F2" },
            { label: "Professores", value: professores.length, icon: <Users size={20} color="#10B981" />, accent: "linear-gradient(90deg,#10B981,#14B8A6)", bg: "#ECFDF5" },
          ].map((s) => (
            <Col key={s.label} xl="4" lg="4" md="6" sm="12">
              <div className="student-card" style={S.statCard}>
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

        <div style={S.mainCard}>
          <div style={S.tabBar}>
            {abas.map((aba) => (
              <button
                key={aba.key}
                className="tab-btn"
                style={S.tab(abaActiva === aba.key)}
                onClick={() => setAbaActiva(aba.key)}
              >
                {aba.icon}
                {aba.label}
                <Badge color={aba.key === "tarefas" ? "warning" : "light"} pill style={{ fontSize: "0.65rem", color: aba.key === "tarefas" ? "#fff" : "#C2410C" }}>
                  {aba.count}
                </Badge>
              </button>
            ))}
          </div>

          {abaActiva === "materiais" && (
            <>
              <div style={S.sectionHead}>
                <div>
                  <h4 style={S.sectionTitle}>Materiais da Disciplina</h4>
                  <p style={S.sectionSub}>Conteudos recentes para continuares a estudar.</p>
                </div>
              </div>

              {materiais.length === 0 ? (
                <div style={S.empty}>
                  <div style={S.emptyIcon}><BookOpen size={28} color="#F97316" /></div>
                  <p style={{ fontWeight: "800", margin: 0 }}>Ainda nao ha materiais disponiveis.</p>
                </div>
              ) : (
                <Row className="g-3">
                  {materiais.map((m, idx) => (
                    <Col key={m.id} xl="4" lg="6" md="6" sm="12">
                      <div className="student-card fade-up-item" style={{ ...S.itemCard, animationDelay: `${idx * 40}ms` }}>
                        <div style={S.cardStripe(m.cor || MATERIAL_GRADIENTS[idx % MATERIAL_GRADIENTS.length])} />
                        <div style={S.itemBody}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
                            <div style={S.iconTile("#FFF7ED", "#F97316")}>
                              <FileText size={20} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start" }}>
                                <p style={{ ...S.title, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.titulo}</p>
                                <span style={{
                                  backgroundColor: "#FFF7ED",
                                  color: "#EA580C",
                                  borderRadius: "999px",
                                  padding: "0.18rem 0.55rem",
                                  fontSize: "0.68rem",
                                  fontWeight: "800",
                                  flexShrink: 0,
                                }}>
                                  {m.tipo}
                                </span>
                              </div>
                              <p style={{ ...S.desc, fontWeight: "700", color: "#C2410C" }}>{m.disciplina}</p>
                              <p style={{ ...S.desc, marginTop: "0.35rem" }}>Adicionado {m.dataUpload}</p>
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

          {abaActiva === "tarefas" && (
            <>
              <div style={S.sectionHead}>
                <div>
                  <h4 style={S.sectionTitle}>Tarefas</h4>
                  <p style={S.sectionSub}>{tarefasPendentes} tarefa{tarefasPendentes !== 1 ? "s" : ""} ainda precisam da tua atencao.</p>
                </div>
              </div>

              <Row className="g-3">
                {tarefas.map((t, idx) => (
                  <Col key={t.id} xl="3" lg="4" md="6" sm="12">
                    <div className="student-card fade-up-item" style={{ ...S.itemCard, animationDelay: `${idx * 40}ms` }}>
                      <div style={S.cardStripe(`linear-gradient(90deg,${getStatusColor(t.status)},#FDBA74)`)} />
                      <div style={S.itemBody}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={S.title}>{t.titulo}</p>
                            <p style={{ ...S.desc, fontWeight: "700", color: "#C2410C" }}>{t.disciplina}</p>
                          </div>
                          <span style={S.statusPill(getStatusColor(t.status))}>
                            {getStatusText(t.status)}
                          </span>
                        </div>
                        <p style={{
                          margin: 0,
                          color: t.status === "pendente" ? "#EF4444" : "#78716C",
                          fontSize: "0.82rem",
                          fontWeight: "800",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}>
                          {statusIcon(t.status)}
                          {t.prazo}
                        </p>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </>
          )}

          {abaActiva === "professores" && (
            <>
              <div style={S.sectionHead}>
                <div>
                  <h4 style={S.sectionTitle}>Professores</h4>
                  <p style={S.sectionSub}>Contactos e disciplinas da tua equipa docente.</p>
                </div>
              </div>

              <Row className="g-3">
                {professores.map((p, idx) => (
                  <Col key={p.id} xl="3" lg="4" md="6" sm="12">
                    <div className="student-card fade-up-item" style={{ ...S.itemCard, animationDelay: `${idx * 40}ms` }}>
                      <div style={S.itemBody}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                          <div style={S.teacherAvatar(p.cor)}>
                            {p.nome.split(" ")[1]?.[0] || "?"}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ ...S.title, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</p>
                            <p style={{ margin: "0 0 0.25rem", color: p.cor, fontSize: "0.82rem", fontWeight: "800" }}>{p.disciplina}</p>
                            <p style={{ ...S.desc, display: "flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              <Mail size={12} /> {p.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </div>
      </div>

      <BotaoChat />
    </div>
  );
}

