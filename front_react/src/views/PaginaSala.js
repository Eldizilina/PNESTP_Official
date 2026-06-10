import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Button, Modal, ModalHeader, ModalBody,
  ModalFooter, Form, FormGroup, Label, Input, Alert, Badge,
} from "reactstrap";
import {
  ArrowLeft, Users, BookOpen, Mail, Link as LinkIcon,
  Copy, Check, Plus, Upload, Trash2, Download, ExternalLink,
  Send, MessageSquare, Layers, ClipboardList,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import ChatSala from "./ChatSala";

const S = {
  wrap: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  hero: {
    background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0F3460 100%)",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: "-80px",
    right: "-60px",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,200,150,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroGlow2: {
    position: "absolute",
    bottom: "-60px",
    left: "10%",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  backBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "600",
    padding: "0.45rem 0.9rem",
    fontSize: "0.82rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    cursor: "pointer",
    marginBottom: "1rem",
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
    fontWeight: "700",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "0.65rem",
    width: "fit-content",
  },
  heroTitle: {
    fontSize: "1.65rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
  },
  heroSub: {
    fontSize: "0.88rem",
    color: "rgba(255,255,255,0.6)",
    margin: "0.25rem 0 0",
    maxWidth: "620px",
  },
  codeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    backgroundColor: "#EFF6FF",
    color: "#3B82F6",
    borderRadius: "8px",
    padding: "0.25rem 0.55rem",
    fontSize: "0.72rem",
    fontWeight: "700",
    letterSpacing: "0.04em",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #00C896, #00A67E)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "600",
    padding: "0.5rem 1.2rem",
    fontSize: "0.85rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,200,150,0.35)",
    whiteSpace: "nowrap",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "600",
    padding: "0.5rem 1.2rem",
    fontSize: "0.85rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  contentWrapper: {
    padding: "1.5rem 1.5rem 2rem",
  },
  statsWrap: {
    marginTop: "-0.25rem",
    position: "relative",
    zIndex: 10,
  },
  statCard: {
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
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
    borderRadius: "12px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  statNum: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: "600",
    margin: 0,
  },
  mainCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "1.5rem",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #E2E8F0",
    marginTop: "1.5rem",
  },
  tabBar: {
    display: "flex",
    gap: "0.25rem",
    backgroundColor: "#F1F5F9",
    borderRadius: "12px",
    padding: "0.35rem",
    marginBottom: "1.5rem",
    overflowX: "auto",
  },
  tab: (active) => ({
    flex: 1,
    minWidth: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    padding: "0.55rem 0.5rem",
    borderRadius: "9px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: active ? "700" : "500",
    color: active ? "#0F172A" : "#64748B",
    background: active ? "#ffffff" : "transparent",
    boxShadow: active ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
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
    fontWeight: "700",
    color: "#0F172A",
    fontSize: "1.1rem",
  },
  sectionSub: {
    margin: "0.25rem 0 0",
    fontSize: "0.78rem",
    color: "#94A3B8",
  },
  empty: {
    textAlign: "center",
    padding: "3.5rem 2rem",
    color: "#94A3B8",
  },
  emptyIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    backgroundColor: "#F1F5F9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
  materialCard: {
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    overflow: "hidden",
    height: "100%",
    backgroundColor: "#fff",
  },
  materialStripe: (gradient) => ({
    height: "5px",
    background: gradient,
  }),
  iconTile: (bg, color) => ({
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    backgroundColor: bg,
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontWeight: "800",
    fontSize: "0.78rem",
  }),
  actionIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#64748B",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  dangerIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    border: "1px solid #FEE2E2",
    background: "#FEF2F2",
    color: "#EF4444",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  memberCard: {
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    backgroundColor: "#fff",
  },
  inviteBox: {
    border: "1px dashed rgba(0,200,150,0.55)",
    borderRadius: "16px",
    background: "#F0FDF9",
    padding: "1.25rem",
    marginBottom: "1.5rem",
  },
  input: {
    borderRadius: "10px",
    borderColor: "#E2E8F0",
    fontSize: "0.9rem",
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

const PaginaSala = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isDiretor = user?.perfil === "professor_diretor";
  const isProfessor = user?.perfil === "professor" || isDiretor;

  const [sala, setSala] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [membros, setMembros] = useState([]);
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaActiva, setAbaActiva] = useState("materiais");
  const [chatAberto, setChatAberto] = useState(false);

  const [modalConvite, setModalConvite] = useState(false);
  const [conviteEmail, setConviteEmail] = useState("");
  const [convitePapel, setConvitePapel] = useState("aluno");
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [conviteErro, setConviteErro] = useState("");
  const [conviteSucesso, setConviteSucesso] = useState("");
  const [linkCopiado, setLinkCopiado] = useState(false);

  const [modalMaterial, setModalMaterial] = useState(false);
  const [matForm, setMatForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "pdf",
    ficheiro: null,
  });
  const [enviandoMat, setEnviandoMat] = useState(false);
  const [matErro, setMatErro] = useState("");

  const [alerta, setAlerta] = useState({ msg: "", tipo: "" });

  const mostrarAlerta = (msg, tipo = "success") => {
    setAlerta({ msg, tipo });
    setTimeout(() => setAlerta({ msg: "", tipo: "" }), 4000);
  };

  useEffect(() => {
    if (!id) return;
    carregarTudo();
  }, [id]);

  const carregarTudo = async () => {
    setLoading(true);
    try {
      const [resSala, resMat, resMembros] = await Promise.all([
        api.get(`/salas/${id}`),
        api.get(`/salas/${id}/materiais`),
        api.get(`/salas/${id}/membros`),
      ]);
      setSala(resSala.data);
      setMateriais(resMat.data);
      setMembros(resMembros.data);

      if (isDiretor || isProfessor) {
        try {
          const resConv = await api.get(`/salas/${id}/convites`);
          setConvites(resConv.data);
        } catch (_) { }
      }
    } catch (err) {
      mostrarAlerta("Erro ao carregar a sala.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const linkDaSala = `${window.location.origin}/entrar/${sala?.codigo_acesso}`;

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkDaSala);
    } catch (_) {
      const el = document.createElement("textarea");
      el.value = linkDaSala;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2500);
  };

  const partilharWhatsApp = () => {
    const msg = encodeURIComponent(
      `Ola! Estas convidado(a) para a sala *${sala?.nome}* na Plataforma PNESTP.\n\nEntra aqui: ${linkDaSala}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const partilharEmail = () => {
    const assunto = encodeURIComponent(`Convite para a sala ${sala?.nome}`);
    const corpo = encodeURIComponent(
      `Ola!\n\nEstas convidado(a) para a sala "${sala?.nome}" na Plataforma PNESTP.\n\nEntra aqui: ${linkDaSala}\n\nAte breve!`
    );
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, "_blank");
  };

  const handleEnviarConvite = async () => {
    if (!conviteEmail.trim()) {
      setConviteErro("Introduz um email.");
      return;
    }
    setEnviandoConvite(true);
    setConviteErro("");
    setConviteSucesso("");
    try {
      await api.post(`/salas/${id}/convites`, {
        email: conviteEmail.trim(),
        papel: convitePapel,
      });
      setConviteSucesso(`Convite enviado para ${conviteEmail}!`);
      setConviteEmail("");
      const res = await api.get(`/salas/${id}/convites`);
      setConvites(res.data);
    } catch (err) {
      setConviteErro(err?.response?.data?.message || "Erro ao enviar convite.");
    } finally {
      setEnviandoConvite(false);
    }
  };

  const handleEnviarMaterial = async () => {
    if (!matForm.titulo.trim()) {
      setMatErro("O titulo e obrigatorio.");
      return;
    }
    if (matForm.tipo !== "link" && !matForm.ficheiro) {
      setMatErro("Selecciona um ficheiro.");
      return;
    }
    if (matForm.tipo === "link" && !matForm.ficheiro) {
      setMatErro("Introduz o URL.");
      return;
    }

    setEnviandoMat(true);
    setMatErro("");
    try {
      const fd = new FormData();
      fd.append("titulo", matForm.titulo.trim());
      fd.append("descricao", matForm.descricao.trim());
      fd.append("tipo", matForm.tipo);
      if (matForm.tipo === "link") fd.append("url_externa", matForm.ficheiro);
      else fd.append("ficheiro", matForm.ficheiro);

      await api.post(`/salas/${id}/materiais`, fd);
      mostrarAlerta("Material enviado com sucesso!");
      setMatForm({ titulo: "", descricao: "", tipo: "pdf", ficheiro: null });
      setModalMaterial(false);
      const res = await api.get(`/salas/${id}/materiais`);
      setMateriais(res.data);
    } catch (err) {
      setMatErro(err?.response?.data?.message || "Erro ao enviar material.");
    } finally {
      setEnviandoMat(false);
    }
  };

  const handleApagarMaterial = async (mid, titulo) => {
    if (!window.confirm(`Apagar o material "${titulo}"?`)) return;
    try {
      await api.delete(`/salas/${id}/materiais/${mid}`);
      setMateriais((prev) => prev.filter((m) => m.id !== mid));
      mostrarAlerta("Material removido.");
    } catch (_) {
      mostrarAlerta("Erro ao remover material.", "danger");
    }
  };

  const handleCancelarConvite = async (cid) => {
    try {
      await api.delete(`/convites/${cid}`);
      setConvites((prev) => prev.filter((c) => c.id !== cid));
    } catch (_) {
      mostrarAlerta("Erro ao cancelar convite.", "danger");
    }
  };

  const getIniciais = (nome = "") => {
    const p = nome.trim().split(" ");
    return p.length === 1
      ? p[0][0]?.toUpperCase() || "?"
      : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  const corPerfil = (perfil) => {
    switch (perfil) {
      case "professor_diretor": return "#F43F5E";
      case "professor": return "#00C896";
      default: return "#6366F1";
    }
  };

  const labelPerfil = (perfil) => {
    switch (perfil) {
      case "professor_diretor": return "Diretor";
      case "professor": return "Professor";
      default: return "Aluno";
    }
  };

  const iconeTipo = (tipo) => {
    switch (tipo) {
      case "pdf": return "PDF";
      case "imagem": return "IMG";
      case "video": return "VID";
      case "link": return "URL";
      default: return "DOC";
    }
  };

  const materiaisPorProfessor = materiais.reduce((acc, mat) => {
    const nome = mat.autor?.name || "Desconhecido";
    if (!acc[nome]) acc[nome] = [];
    acc[nome].push(mat);
    return acc;
  }, {});

  const convitesPendentes = convites.filter((c) => c.status === "pendente").length;

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
              border: "3px solid #E2E8F0",
              borderTopColor: "#00C896",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }} />
            <p style={{ color: "#64748B", fontSize: "0.9rem" }}>A carregar sala...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sala) {
    return (
      <div style={{ ...S.wrap, padding: "2rem" }}>
        <Alert color="danger">Sala não encontrada ou sem acesso.</Alert>
        <button style={S.btnPrimary} onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Voltar
        </button>
      </div>
    );
  }

  const abas = [
    { key: "materiais", label: "Materiais", icon: <BookOpen size={14} /> },
    { key: "membros", label: "Membros", icon: <Users size={14} />, count: membros.length },
    {
      key: "convites",
      label: "Convites",
      icon: <Mail size={14} />,
      count: convitesPendentes || undefined,
      hide: !isDiretor && !isProfessor,
    },
  ].filter((a) => !a.hide);

  return (
    <div style={S.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .panel-btn:hover { opacity: 0.88 !important; transform: translateY(-2px); }
        .panel-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.09) !important; }
        .tab-btn:hover { background: rgba(255,255,255,0.75) !important; }
        .fade-up-item { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div style={S.hero}>
        <div style={S.heroGlow} />
        <div style={S.heroGlow2} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button className="panel-btn" style={S.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Voltar
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={S.heroBadge}>
                <Layers size={13} />
                Sala
              </div>
              <h1 style={S.heroTitle}>{sala.nome}</h1>
              <p style={S.heroSub}>{sala.descricao || "Sem descricao"}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
                <span style={S.codeBadge}>
                  <LinkIcon size={13} /> {sala.codigo_acesso}
                </span>
                <span style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <Users size={13} /> {membros.length} membros
                </span>
              </div>
            </div>

            <div style={S.headerActions}>
              {isProfessor && (
                <button className="panel-btn" style={S.btnPrimary} onClick={() => setModalMaterial(true)}>
                  <Upload size={16} /> Enviar Material
                </button>
              )}
              <button className="panel-btn" style={S.btnSecondary} onClick={() => setChatAberto(true)}>
                <MessageSquare size={16} /> Chat da Sala
              </button>
              {(isDiretor || isProfessor) && (
                <button className="panel-btn" style={S.btnSecondary} onClick={() => setModalConvite(true)}>
                  <Plus size={16} /> Convidar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={S.contentWrapper}>
        {alerta.msg && (
          <Alert color={alerta.tipo} className="mb-3" style={{ borderRadius: "12px" }}>
            {alerta.msg}
          </Alert>
        )}

        <div style={S.statsWrap}>
          <Row className="g-3">
            {[
              { label: "Materiais", value: materiais.length, icon: <BookOpen size={20} color="#00C896" />, accent: "linear-gradient(90deg,#00C896,#06B6D4)", bg: "#ECFDF5" },
              { label: "Membros", value: membros.length, icon: <Users size={20} color="#6366F1" />, accent: "linear-gradient(90deg,#6366F1,#8B5CF6)", bg: "#EEF2FF" },
              { label: "Convites Pendentes", value: convitesPendentes, icon: <ClipboardList size={20} color="#F59E0B" />, accent: "linear-gradient(90deg,#F59E0B,#EF4444)", bg: "#FFFBEB" },
            ].map((s, i) => (
              <Col key={s.label} xl="4" lg="4" md="6" sm="12">
                <div className="panel-card" style={S.statCard}>
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
                {aba.count !== undefined && (
                  <Badge color={aba.key === "convites" ? "warning" : "primary"} pill style={{ fontSize: "0.65rem" }}>
                    {aba.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {abaActiva === "materiais" && (
            <>
              <div style={S.sectionHead}>
                <div>
                  <h4 style={S.sectionTitle}>Materiais da Sala</h4>
                  <p style={S.sectionSub}>{materiais.length} material{materiais.length !== 1 ? "is" : ""} encontrado{materiais.length !== 1 ? "s" : ""}</p>
                </div>
                {isProfessor && (
                  <button className="panel-btn" style={{ ...S.btnPrimary, boxShadow: "none", padding: "0.45rem 1rem" }} onClick={() => setModalMaterial(true)}>
                    <Upload size={14} /> Enviar Material
                  </button>
                )}
              </div>

              {materiais.length === 0 ? (
                <div style={S.empty}>
                  <div style={S.emptyIcon}><BookOpen size={28} color="#94A3B8" /></div>
                  <p style={{ fontWeight: "600", color: "#475569", margin: "0 0 0.4rem" }}>Ainda nao ha materiais nesta sala.</p>
                  {isProfessor && (
                    <button className="panel-btn" style={{ ...S.btnPrimary, margin: "1rem auto 0" }} onClick={() => setModalMaterial(true)}>
                      <Upload size={14} /> Enviar primeiro material
                    </button>
                  )}
                </div>
              ) : (
                Object.entries(materiaisPorProfessor).map(([nomeProfessor, mats], groupIdx) => (
                  <div key={nomeProfessor} style={{ marginBottom: "1.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div style={S.iconTile("#EEF2FF", "#6366F1")}>{getIniciais(nomeProfessor)}</div>
                      <div>
                        <h6 style={{ margin: 0, fontWeight: "700", color: "#0F172A", fontSize: "0.95rem" }}>{nomeProfessor}</h6>
                        <small style={{ color: "#94A3B8", fontSize: "0.76rem" }}>{mats.length} material(is)</small>
                      </div>
                    </div>

                    <Row className="g-3">
                      {mats.map((mat, idx) => (
                        <Col key={mat.id} xl="4" lg="6" md="6" sm="12">
                          <div className="panel-card fade-up-item" style={{ ...S.materialCard, animationDelay: `${idx * 40}ms` }}>
                            <div style={S.materialStripe(GRADIENTS[(groupIdx + idx) % GRADIENTS.length])} />
                            <div style={{ padding: "1.1rem 1.2rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", flex: 1, minWidth: 0 }}>
                                  <div style={S.iconTile("#ECFDF5", "#00A67E")}>{iconeTipo(mat.tipo)}</div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <h6 style={{
                                      margin: "0 0 0.25rem",
                                      fontWeight: "700",
                                      color: "#0F172A",
                                      fontSize: "0.95rem",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}>
                                      {mat.titulo}
                                    </h6>
                                    {mat.descricao && (
                                      <p style={{ margin: "0 0 0.45rem", color: "#64748B", fontSize: "0.8rem", lineHeight: 1.4 }}>
                                        {mat.descricao}
                                      </p>
                                    )}
                                    <small style={{ color: "#94A3B8", fontSize: "0.72rem", fontWeight: "600" }}>
                                      {mat.tipo?.toUpperCase()}
                                      {mat.tamanho_bytes && ` · ${(mat.tamanho_bytes / 1024).toFixed(0)} KB`}
                                    </small>
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                                  {mat.url_download && (
                                    <a
                                      href={mat.url_download}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={S.actionIcon}
                                      title={mat.tipo === "link" ? "Abrir link" : "Download"}
                                    >
                                      {mat.tipo === "link" ? <ExternalLink size={14} /> : <Download size={14} />}
                                    </a>
                                  )}
                                  {(mat.autor?.id === user?.id || isDiretor) && (
                                    <button
                                      onClick={() => handleApagarMaterial(mat.id, mat.titulo)}
                                      style={S.dangerIcon}
                                      title="Apagar"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))
              )}
            </>
          )}

          {abaActiva === "membros" && (
            <>
              <div style={S.sectionHead}>
                <div>
                  <h4 style={S.sectionTitle}>Membros</h4>
                  <p style={S.sectionSub}>{membros.length} pessoa{membros.length !== 1 ? "s" : ""} nesta sala</p>
                </div>
              </div>
              <Row className="g-3">
                {membros.map((m) => (
                  <Col key={m.id} xl="3" lg="4" md="6" sm="12">
                    <div className="panel-card" style={S.memberCard}>
                      <div style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {m.avatar ? (
                          <img
                            src={`http://localhost:8000/storage/${m.avatar}`}
                            alt={m.name}
                            style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "12px",
                            backgroundColor: corPerfil(m.perfil),
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "800",
                            fontSize: "0.85rem",
                            flexShrink: 0,
                          }}>
                            {getIniciais(m.name)}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            margin: "0 0 0.25rem",
                            fontWeight: "700",
                            color: "#0F172A",
                            fontSize: "0.88rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {m.name}
                            {m.id === user?.id && <span style={{ color: "#94A3B8", fontSize: "0.72rem" }}> (tu)</span>}
                          </p>
                          <Badge style={{ backgroundColor: corPerfil(m.perfil), color: "white", fontSize: "0.65rem" }}>
                            {labelPerfil(m.perfil)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </>
          )}

          {abaActiva === "convites" && (
            <>
              <div style={S.inviteBox}>
                <h6 style={{ margin: "0 0 0.35rem", fontWeight: "700", color: "#0F172A", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <LinkIcon size={15} color="#00A67E" />
                  Link de convite rapido
                </h6>
                <p style={{ margin: "0 0 1rem", color: "#64748B", fontSize: "0.82rem" }}>
                  Partilha este link diretamente para entrar na sala depois do login ou registo.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  <code style={{
                    flex: 1,
                    minWidth: "240px",
                    padding: "0.55rem 0.75rem",
                    backgroundColor: "white",
                    borderRadius: "10px",
                    border: "1px solid #D1FAE5",
                    fontSize: "0.8rem",
                    color: "#0F172A",
                    wordBreak: "break-all",
                  }}>
                    {linkDaSala}
                  </code>
                  <button className="panel-btn" style={{ ...S.btnPrimary, boxShadow: "none", padding: "0.5rem 1rem" }} onClick={copiarLink}>
                    {linkCopiado ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                  </button>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button className="panel-btn" style={{ ...S.btnPrimary, background: "#25D366", boxShadow: "none" }} onClick={partilharWhatsApp}>
                    WhatsApp
                  </button>
                  <button className="panel-btn" style={{ ...S.btnPrimary, background: "#EA4335", boxShadow: "none" }} onClick={partilharEmail}>
                    <Mail size={14} /> Email
                  </button>
                </div>
              </div>

              <div style={{ ...S.materialCard, padding: "1.25rem", marginBottom: "1.5rem" }}>
                <h6 style={{ margin: "0 0 1rem", fontWeight: "700", color: "#0F172A", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Send size={15} /> Convidar por email
                </h6>
                {conviteErro && <Alert color="danger" className="py-2" style={{ borderRadius: "10px" }}>{conviteErro}</Alert>}
                {conviteSucesso && <Alert color="success" className="py-2" style={{ borderRadius: "10px" }}>{conviteSucesso}</Alert>}
                <Row className="align-items-end g-3">
                  <Col md="5">
                    <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Email do convidado</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={conviteEmail}
                      style={S.input}
                      onChange={(e) => setConviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEnviarConvite()}
                    />
                  </Col>
                  <Col md="3">
                    <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Papel</Label>
                    <Input type="select" value={convitePapel} style={S.input} onChange={(e) => setConvitePapel(e.target.value)}>
                      <option value="aluno">Aluno</option>
                      {isDiretor && <option value="professor">Professor</option>}
                    </Input>
                  </Col>
                  <Col md="4">
                    <button
                      style={{ ...S.btnPrimary, width: "100%" }}
                      onClick={handleEnviarConvite}
                      disabled={enviandoConvite}
                    >
                      {enviandoConvite ? <span className="spinner-border spinner-border-sm" /> : <><Send size={14} /> Enviar convite</>}
                    </button>
                  </Col>
                </Row>
              </div>

              {convites.length > 0 && (
                <div style={S.materialCard}>
                  <div style={{ padding: "1.1rem 1.2rem", borderBottom: "1px solid #F1F5F9" }}>
                    <h6 style={{ margin: 0, fontWeight: "700", color: "#0F172A" }}>Convites enviados</h6>
                  </div>
                  <div style={{ padding: "0.25rem 1.2rem" }}>
                    {convites.map((c) => (
                      <div
                        key={c.id}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 0", borderBottom: "1px solid #F8FAFC", gap: "1rem" }}
                      >
                        <div>
                          <p style={{ margin: 0, fontWeight: "600", color: "#0F172A", fontSize: "0.88rem" }}>{c.email_convidado}</p>
                          <small style={{ color: "#94A3B8" }}>
                            {c.papel === "professor" ? "Professor" : "Aluno"} ·{" "}
                            <span style={{
                              color: c.status === "pendente" ? "#F59E0B" : c.status === "aceite" ? "#00A67E" : "#F43F5E",
                              fontWeight: "700",
                            }}>
                              {c.status === "pendente" ? "Pendente" : c.status === "aceite" ? "Aceite" : "Recusado"}
                            </span>
                          </small>
                        </div>
                        {c.status === "pendente" && (
                          <button onClick={() => handleCancelarConvite(c.id)} style={S.dangerIcon} title="Cancelar convite">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={modalMaterial} toggle={() => setModalMaterial(false)}>
        <ModalHeader toggle={() => setModalMaterial(false)}>
          <span style={{ fontWeight: "700", color: "#0F172A" }}>Enviar Material Didactico</span>
        </ModalHeader>
        <ModalBody>
          {matErro && <Alert color="danger" className="py-2" style={{ borderRadius: "10px" }}>{matErro}</Alert>}
          <Form>
            <FormGroup>
              <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Titulo *</Label>
              <Input type="text" placeholder="Titulo do material" style={S.input}
                value={matForm.titulo}
                onChange={(e) => setMatForm({ ...matForm, titulo: e.target.value })} />
            </FormGroup>
            <FormGroup>
              <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Descricao</Label>
              <Input type="textarea" rows={2} placeholder="Descricao opcional..." style={S.input}
                value={matForm.descricao}
                onChange={(e) => setMatForm({ ...matForm, descricao: e.target.value })} />
            </FormGroup>
            <FormGroup>
              <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Tipo</Label>
              <Input type="select" value={matForm.tipo} style={S.input}
                onChange={(e) => setMatForm({ ...matForm, tipo: e.target.value, ficheiro: null })}>
                <option value="pdf">PDF</option>
                <option value="imagem">Imagem</option>
                <option value="video">Video</option>
                <option value="link">Link Externo</option>
                <option value="outro">Outro</option>
              </Input>
            </FormGroup>
            {matForm.tipo === "link" ? (
              <FormGroup>
                <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>URL *</Label>
                <Input type="url" placeholder="https://..." style={S.input}
                  value={typeof matForm.ficheiro === "string" ? matForm.ficheiro : ""}
                  onChange={(e) => setMatForm({ ...matForm, ficheiro: e.target.value })} />
              </FormGroup>
            ) : (
              <FormGroup>
                <Label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Ficheiro *</Label>
                <input
                  type="file"
                  className="form-control"
                  style={S.input}
                  accept={
                    matForm.tipo === "pdf" ? ".pdf" :
                      matForm.tipo === "imagem" ? "image/*" :
                        matForm.tipo === "video" ? "video/*" : "*"
                  }
                  onChange={(e) => setMatForm({ ...matForm, ficheiro: e.target.files?.[0] || null })}
                />
                {matForm.ficheiro && (
                  <small style={{ color: "#00A67E", display: "block", marginTop: "0.4rem" }}>
                    {matForm.ficheiro.name}
                  </small>
                )}
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter style={{ border: "none" }}>
          <Button color="light" style={{ borderRadius: "10px" }} onClick={() => setModalMaterial(false)}>Cancelar</Button>
          <button style={{ ...S.btnPrimary, background: "linear-gradient(135deg,#F59E0B,#EF4444)" }} onClick={handleEnviarMaterial} disabled={enviandoMat}>
            {enviandoMat ? <span className="spinner-border spinner-border-sm" /> : <Upload size={14} />}
            Enviar
          </button>
        </ModalFooter>
      </Modal>

      <ChatSala
        salaId={id}
        salaNome={sala?.nome}
        isOpen={chatAberto}
        toggle={() => setChatAberto(false)}
      />
    </div>
  );
};

export default PaginaSala;
