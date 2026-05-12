import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Badge, Button, Modal, ModalHeader, ModalBody,
  ModalFooter, Form, FormGroup, Label, Input, Alert,
  Nav, NavItem, NavLink, TabContent, TabPane,
} from "reactstrap";
import {
  ArrowLeft, Users, BookOpen, FileText, Mail,
  Link as LinkIcon, Copy, Check, Plus, Upload,
  Trash2, Download, ExternalLink, Send,
} from "react-feather";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

const PaginaSala = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const isDiretor    = user?.perfil === "professor_diretor";
  const isProfessor  = user?.perfil === "professor" || isDiretor;

  // ── Estado principal ──────────────────────────────────────
  const [sala,          setSala]          = useState(null);
  const [materiais,     setMateriais]     = useState([]);
  const [membros,       setMembros]       = useState([]);
  const [convites,      setConvites]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [abaActiva,     setAbaActiva]     = useState("materiais");

  // ── Convite ───────────────────────────────────────────────
  const [modalConvite,  setModalConvite]  = useState(false);
  const [conviteEmail,  setConviteEmail]  = useState("");
  const [convitePapel,  setConvitePapel]  = useState("aluno");
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [conviteErro,   setConviteErro]   = useState("");
  const [conviteSucesso,setConviteSucesso]= useState("");
  const [linkCopiado,   setLinkCopiado]   = useState(false);

  // ── Material ──────────────────────────────────────────────
  const [modalMaterial, setModalMaterial] = useState(false);
  const [matForm,       setMatForm]       = useState({
    titulo: "", descricao: "", tipo: "pdf", ficheiro: null,
  });
  const [enviandoMat,   setEnviandoMat]   = useState(false);
  const [matErro,       setMatErro]       = useState("");

  // ── Alerta global ─────────────────────────────────────────
  const [alerta,        setAlerta]        = useState({ msg: "", tipo: "" });

  const mostrarAlerta = (msg, tipo = "success") => {
    setAlerta({ msg, tipo });
    setTimeout(() => setAlerta({ msg: "", tipo: "" }), 4000);
  };

  // ── Carregar dados ────────────────────────────────────────
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

      // Convites — apenas para quem pode gerir
      if (isDiretor || isProfessor) {
        try {
          const resConv = await api.get(`/salas/${id}/convites`);
          setConvites(resConv.data);
        } catch (_) {}
      }
    } catch (err) {
      mostrarAlerta("Erro ao carregar a sala.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // ── Link de convite ───────────────────────────────────────
  const linkDaSala = `${window.location.origin}/entrar/${sala?.codigo_acesso}`;

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkDaSala);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2500);
    } catch (_) {
      // fallback
      const el = document.createElement("textarea");
      el.value = linkDaSala;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2500);
    }
  };

  const partilharWhatsApp = () => {
    const msg = encodeURIComponent(
      `Olá! Estás convidado(a) para a sala *${sala?.nome}* na Plataforma PNESTP.\n\nEntra aqui: ${linkDaSala}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const partilharEmail = () => {
    const assunto = encodeURIComponent(`Convite para a sala ${sala?.nome}`);
    const corpo   = encodeURIComponent(
      `Olá!\n\nEstás convidado(a) para a sala "${sala?.nome}" na Plataforma PNESTP.\n\nEntra aqui: ${linkDaSala}\n\nAté breve!`
    );
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, "_blank");
  };

  // ── Enviar convite por email ──────────────────────────────
  const handleEnviarConvite = async () => {
    if (!conviteEmail.trim()) { setConviteErro("Introduz um email."); return; }
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
      // Recarregar lista de convites
      const res = await api.get(`/salas/${id}/convites`);
      setConvites(res.data);
    } catch (err) {
      setConviteErro(err?.response?.data?.message || "Erro ao enviar convite.");
    } finally {
      setEnviandoConvite(false);
    }
  };

  // ── Enviar material ───────────────────────────────────────
  const handleEnviarMaterial = async () => {
    if (!matForm.titulo.trim()) { setMatErro("O título é obrigatório."); return; }
    if (matForm.tipo !== "link" && !matForm.ficheiro) { setMatErro("Selecciona um ficheiro."); return; }
    if (matForm.tipo === "link" && !matForm.ficheiro) { setMatErro("Introduz o URL."); return; }

    setEnviandoMat(true);
    setMatErro("");
    try {
      const fd = new FormData();
      fd.append("titulo",    matForm.titulo.trim());
      fd.append("descricao", matForm.descricao.trim());
      fd.append("tipo",      matForm.tipo);
      if (matForm.tipo === "link") {
        fd.append("url_externa", matForm.ficheiro);
      } else {
        fd.append("ficheiro", matForm.ficheiro);
      }
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

  // ── Apagar material ───────────────────────────────────────
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

  // ── Cancelar convite ──────────────────────────────────────
  const handleCancelarConvite = async (cid) => {
    try {
      await api.delete(`/convites/${cid}`);
      setConvites((prev) => prev.filter((c) => c.id !== cid));
    } catch (_) {
      mostrarAlerta("Erro ao cancelar convite.", "danger");
    }
  };

  // ── Helpers visuais ───────────────────────────────────────
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

  const labelPerfil = (perfil) => {
    switch (perfil) {
      case "professor_diretor": return "Diretor";
      case "professor":         return "Professor";
      default:                  return "Aluno";
    }
  };

  const iconeTipo = (tipo) => {
    switch (tipo) {
      case "pdf":    return "📄";
      case "imagem": return "🖼️";
      case "video":  return "🎬";
      case "link":   return "🔗";
      default:       return "📁";
    }
  };

  // Agrupar materiais por professor
  const materiaisPorProfessor = materiais.reduce((acc, mat) => {
    const nome = mat.autor?.name || "Desconhecido";
    if (!acc[nome]) acc[nome] = [];
    acc[nome].push(mat);
    return acc;
  }, {});

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <Container fluid className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">A carregar sala...</p>
        </div>
      </Container>
    );
  }

  if (!sala) {
    return (
      <Container fluid className="mt-5">
        <Alert color="danger">Sala não encontrada ou sem acesso.</Alert>
        <Button color="primary" onClick={() => navigate(-1)}>Voltar</Button>
      </Container>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className="header bg-gradient-primary pb-8 pt-5 pt-md-8">
        <Container fluid>
          {/* Botão voltar */}
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-outline-light mb-3 d-flex align-items-center"
            style={{ gap: "0.4rem" }}
          >
            <ArrowLeft size={14} /> Voltar
          </button>

          <div className="d-flex justify-content-between align-items-start flex-wrap"
            style={{ gap: "1rem" }}>
            <div>
              <h2 className="text-white mb-1">{sala.nome}</h2>
              <p className="text-white-50 mb-1">{sala.descricao || "Sem descrição"}</p>
              <div className="d-flex align-items-center" style={{ gap: "0.75rem" }}>
                <Badge color="light" style={{ color: "#5e72e4", fontSize: "0.75rem" }}>
                  🔑 {sala.codigo_acesso}
                </Badge>
                <span className="text-white-50" style={{ fontSize: "0.8rem" }}>
                  <Users size={12} className="mr-1" />
                  {membros.length} membros
                </span>
              </div>
            </div>

            {/* Botões de acção */}
            <div className="d-flex" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
              {isProfessor && (
                <Button size="sm" color="warning"
                  onClick={() => setModalMaterial(true)}
                  className="d-flex align-items-center" style={{ gap: "0.4rem" }}>
                  <Upload size={14} /> Enviar Material
                </Button>
              )}
              {/* Convidar — diretor convida todos, professor convida só alunos */}
              {(isDiretor || isProfessor) && (
                <Button size="sm" color="success"
                  onClick={() => setModalConvite(true)}
                  className="d-flex align-items-center" style={{ gap: "0.4rem" }}>
                  <Plus size={14} /> Convidar
                </Button>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt--7" fluid>

        {/* Alerta global */}
        {alerta.msg && (
          <Alert color={alerta.tipo} className="mb-3">
            {alerta.msg}
          </Alert>
        )}

        {/* Abas */}
        <Card className="shadow mb-5">
          <CardHeader className="bg-white border-0 pb-0">
            <Nav tabs className="card-header-tabs">
              {[
                { key: "materiais", label: "Materiais",  icon: <BookOpen size={14} /> },
                { key: "membros",   label: "Membros",    icon: <Users    size={14} /> },
                { key: "convites",  label: "Convites",   icon: <Mail     size={14} />, hide: !isDiretor && !isProfessor },
              ]
                .filter((a) => !a.hide)
                .map((aba) => (
                  <NavItem key={aba.key}>
                    <NavLink
                      className={`d-flex align-items-center ${abaActiva === aba.key ? "active" : ""}`}
                      style={{ gap: "0.4rem", cursor: "pointer", border: "none",
                        background: "none", padding: "0.75rem 1rem" }}
                      onClick={() => setAbaActiva(aba.key)}
                    >
                      {aba.icon} {aba.label}
                      {aba.key === "membros" && (
                        <Badge color="primary" pill style={{ fontSize: "0.65rem", marginLeft: "0.25rem" }}>
                          {membros.length}
                        </Badge>
                      )}
                      {aba.key === "convites" && convites.filter(c => c.status === "pendente").length > 0 && (
                        <Badge color="warning" pill style={{ fontSize: "0.65rem", marginLeft: "0.25rem" }}>
                          {convites.filter(c => c.status === "pendente").length}
                        </Badge>
                      )}
                    </NavLink>
                  </NavItem>
                ))}
            </Nav>
          </CardHeader>

          <CardBody>

            {/* ── Aba Materiais ──────────────────────────── */}
            {abaActiva === "materiais" && (
              <>
                {materiais.length === 0 ? (
                  <div className="text-center py-5">
                    <BookOpen size={40} color="#adb5bd" className="mb-3" />
                    <p className="text-muted mb-0">Ainda não há materiais nesta sala.</p>
                    {isProfessor && (
                      <Button color="warning" size="sm" className="mt-3"
                        onClick={() => setModalMaterial(true)}>
                        Enviar primeiro material
                      </Button>
                    )}
                  </div>
                ) : (
                  // Materiais agrupados por professor
                  Object.entries(materiaisPorProfessor).map(([nomeProfessor, mats]) => (
                    <div key={nomeProfessor} className="mb-4">
                      <div className="d-flex align-items-center mb-3" style={{ gap: "0.5rem" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "50%",
                          backgroundColor: "#5e72e4", color: "white", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.8rem", fontWeight: "bold",
                        }}>
                          {getIniciais(nomeProfessor)}
                        </div>
                        <div>
                          <h6 className="mb-0" style={{ fontSize: "0.9rem" }}>{nomeProfessor}</h6>
                          <small className="text-muted">{mats.length} material(is)</small>
                        </div>
                      </div>

                      <Row>
                        {mats.map((mat) => (
                          <Col key={mat.id} xl="4" lg="6" md="6" className="mb-3">
                            <Card className="shadow-sm h-100"
                              style={{ borderRadius: "10px", border: "1px solid #e9ecef" }}>
                              <CardBody>
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="d-flex align-items-start"
                                    style={{ gap: "0.75rem", flex: 1 }}>
                                    <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>
                                      {iconeTipo(mat.tipo)}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <h6 className="mb-1" style={{
                                        fontSize: "0.9rem", whiteSpace: "nowrap",
                                        overflow: "hidden", textOverflow: "ellipsis",
                                      }}>
                                        {mat.titulo}
                                      </h6>
                                      {mat.descricao && (
                                        <p className="text-muted mb-1" style={{ fontSize: "0.78rem" }}>
                                          {mat.descricao}
                                        </p>
                                      )}
                                      <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                                        {mat.tipo?.toUpperCase()}
                                        {mat.tamanho_bytes && ` · ${(mat.tamanho_bytes / 1024).toFixed(0)} KB`}
                                      </small>
                                    </div>
                                  </div>

                                  {/* Acções */}
                                  <div className="d-flex" style={{ gap: "0.4rem", flexShrink: 0 }}>
                                    {mat.url_download && (
                                      <a
                                        href={mat.url_download}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary p-1"
                                        title={mat.tipo === "link" ? "Abrir link" : "Download"}
                                        style={{ lineHeight: 1 }}
                                      >
                                        {mat.tipo === "link"
                                          ? <ExternalLink size={14} />
                                          : <Download size={14} />
                                        }
                                      </a>
                                    )}
                                    {/* Apagar — autor ou diretor */}
                                    {(mat.autor?.id === user?.id || isDiretor) && (
                                      <button
                                        onClick={() => handleApagarMaterial(mat.id, mat.titulo)}
                                        className="btn btn-sm btn-outline-danger p-1"
                                        title="Apagar"
                                        style={{ lineHeight: 1 }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ── Aba Membros ────────────────────────────── */}
            {abaActiva === "membros" && (
              <Row>
                {membros.map((m) => (
                  <Col key={m.id} xl="3" lg="4" md="6" className="mb-3">
                    <Card className="shadow-sm" style={{ borderRadius: "10px" }}>
                      <CardBody className="d-flex align-items-center" style={{ gap: "0.75rem" }}>
                        {m.avatar ? (
                          <img
                            src={`http://localhost:8000/storage/${m.avatar}`}
                            alt={m.name}
                            className="rounded-circle"
                            style={{ width: "42px", height: "42px", objectFit: "cover", flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: "42px", height: "42px", borderRadius: "50%",
                            backgroundColor: corPerfil(m.perfil), color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: "bold", fontSize: "0.9rem", flexShrink: 0,
                          }}>
                            {getIniciais(m.name)}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p className="mb-0 font-weight-bold"
                            style={{ fontSize: "0.88rem", whiteSpace: "nowrap",
                              overflow: "hidden", textOverflow: "ellipsis" }}>
                            {m.name}
                            {m.id === user?.id && (
                              <span className="text-muted" style={{ fontSize: "0.72rem" }}> (tu)</span>
                            )}
                          </p>
                          <Badge
                            style={{
                              backgroundColor: corPerfil(m.perfil),
                              color: "white", fontSize: "0.65rem",
                            }}
                          >
                            {labelPerfil(m.perfil)}
                          </Badge>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* ── Aba Convites ───────────────────────────── */}
            {abaActiva === "convites" && (
              <>
                {/* Link de convite rápido */}
                <Card className="mb-4" style={{
                  border: "2px dashed #5e72e4", borderRadius: "12px", background: "#f8f9ff"
                }}>
                  <CardBody>
                    <h6 className="font-weight-bold mb-1">
                      <LinkIcon size={14} className="mr-2" style={{ color: "#5e72e4" }} />
                      Link de convite rápido
                    </h6>
                    <p className="text-muted mb-3" style={{ fontSize: "0.82rem" }}>
                      Partilha este link directamente — qualquer pessoa com o link
                      pode entrar na sala após fazer login ou registo.
                    </p>

                    {/* Link */}
                    <div className="d-flex align-items-center mb-3"
                      style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                      <code style={{
                        flex: 1, padding: "0.5rem 0.75rem", backgroundColor: "white",
                        borderRadius: "6px", border: "1px solid #dee2e6",
                        fontSize: "0.8rem", wordBreak: "break-all",
                      }}>
                        {linkDaSala}
                      </code>
                      <Button
                        color={linkCopiado ? "success" : "primary"}
                        size="sm"
                        onClick={copiarLink}
                        className="d-flex align-items-center"
                        style={{ gap: "0.4rem", flexShrink: 0 }}
                      >
                        {linkCopiado ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                      </Button>
                    </div>

                    {/* Botões de partilha */}
                    <div className="d-flex" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                      <Button
                        size="sm"
                        onClick={partilharWhatsApp}
                        style={{
                          backgroundColor: "#25D366", border: "none", color: "white",
                          display: "flex", alignItems: "center", gap: "0.4rem",
                        }}
                      >
                        {/* WhatsApp icon */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        onClick={partilharEmail}
                        style={{
                          backgroundColor: "#EA4335", border: "none", color: "white",
                          display: "flex", alignItems: "center", gap: "0.4rem",
                        }}
                      >
                        <Mail size={14} /> Email
                      </Button>
                    </div>
                  </CardBody>
                </Card>

                {/* Convidar por email */}
                <Card className="mb-4 shadow-sm">
                  <CardHeader className="bg-white border-0 pb-0">
                    <h6 className="mb-0 font-weight-bold">
                      <Send size={14} className="mr-2" />
                      Convidar por email
                    </h6>
                  </CardHeader>
                  <CardBody>
                    {conviteErro   && <Alert color="danger"  className="py-2">{conviteErro}</Alert>}
                    {conviteSucesso && <Alert color="success" className="py-2">{conviteSucesso}</Alert>}
                    <Row className="align-items-end">
                      <Col md="5" className="mb-2">
                        <Label style={{ fontSize: "0.82rem" }}>Email do convidado</Label>
                        <Input
                          type="email" placeholder="email@exemplo.com"
                          value={conviteEmail}
                          onChange={(e) => setConviteEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleEnviarConvite()}
                        />
                      </Col>
                      <Col md="3" className="mb-2">
                        <Label style={{ fontSize: "0.82rem" }}>Papel</Label>
                        <Input
                          type="select"
                          value={convitePapel}
                          onChange={(e) => setConvitePapel(e.target.value)}
                        >
                          <option value="aluno">Aluno</option>
                          {/* Professores só podem convidar alunos */}
                          {isDiretor && <option value="professor">Professor</option>}
                        </Input>
                      </Col>
                      <Col md="4" className="mb-2">
                        <Button
                          color="primary" block
                          onClick={handleEnviarConvite}
                          disabled={enviandoConvite}
                          className="d-flex align-items-center justify-content-center"
                          style={{ gap: "0.4rem" }}
                        >
                          {enviandoConvite
                            ? <span className="spinner-border spinner-border-sm" />
                            : <><Send size={14} /> Enviar convite</>
                          }
                        </Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Lista de convites pendentes */}
                {convites.length > 0 && (
                  <Card className="shadow-sm">
                    <CardHeader className="bg-white border-0 pb-0">
                      <h6 className="mb-0 font-weight-bold">Convites enviados</h6>
                    </CardHeader>
                    <CardBody>
                      {convites.map((c) => (
                        <div key={c.id}
                          className="d-flex justify-content-between align-items-center py-2"
                          style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <div>
                            <p className="mb-0" style={{ fontSize: "0.88rem" }}>
                              {c.email_convidado}
                            </p>
                            <small className="text-muted">
                              {c.papel === "professor" ? "Professor" : "Aluno"} ·{" "}
                              <span style={{
                                color: c.status === "pendente" ? "#f5a623"
                                  : c.status === "aceite" ? "#2dce89" : "#f5365c"
                              }}>
                                {c.status === "pendente" ? "⏳ Pendente"
                                  : c.status === "aceite" ? "✓ Aceite" : "✗ Recusado"}
                              </span>
                            </small>
                          </div>
                          {c.status === "pendente" && (
                            <button
                              onClick={() => handleCancelarConvite(c.id)}
                              className="btn btn-sm btn-outline-danger p-1"
                              title="Cancelar convite"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}
              </>
            )}

          </CardBody>
        </Card>
      </Container>

      {/* ── Modal: Enviar Material ──────────────────────── */}
      <Modal isOpen={modalMaterial} toggle={() => setModalMaterial(false)}>
        <ModalHeader toggle={() => setModalMaterial(false)}>
          Enviar Material Didáctico
        </ModalHeader>
        <ModalBody>
          {matErro && <Alert color="danger" className="py-2">{matErro}</Alert>}
          <Form>
            <FormGroup>
              <Label>Título *</Label>
              <Input type="text" placeholder="Título do material"
                value={matForm.titulo}
                onChange={(e) => setMatForm({ ...matForm, titulo: e.target.value })} />
            </FormGroup>
            <FormGroup>
              <Label>Descrição</Label>
              <Input type="textarea" rows={2} placeholder="Descrição opcional..."
                value={matForm.descricao}
                onChange={(e) => setMatForm({ ...matForm, descricao: e.target.value })} />
            </FormGroup>
            <FormGroup>
              <Label>Tipo</Label>
              <Input type="select" value={matForm.tipo}
                onChange={(e) => setMatForm({ ...matForm, tipo: e.target.value, ficheiro: null })}>
                <option value="pdf">PDF</option>
                <option value="imagem">Imagem</option>
                <option value="video">Vídeo</option>
                <option value="link">Link Externo</option>
                <option value="outro">Outro</option>
              </Input>
            </FormGroup>
            {matForm.tipo === "link" ? (
              <FormGroup>
                <Label>URL *</Label>
                <Input type="url" placeholder="https://..."
                  value={typeof matForm.ficheiro === "string" ? matForm.ficheiro : ""}
                  onChange={(e) => setMatForm({ ...matForm, ficheiro: e.target.value })} />
              </FormGroup>
            ) : (
              <FormGroup>
                <Label>Ficheiro *</Label>
                <input
                  type="file"
                  className="form-control"
                  accept={
                    matForm.tipo === "pdf"    ? ".pdf"    :
                    matForm.tipo === "imagem" ? "image/*" :
                    matForm.tipo === "video"  ? "video/*" : "*"
                  }
                  onChange={(e) => setMatForm({ ...matForm, ficheiro: e.target.files?.[0] || null })}
                />
                {matForm.ficheiro && (
                  <small className="text-success mt-1 d-block">
                    ✓ {matForm.ficheiro.name}
                  </small>
                )}
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalMaterial(false)}>Cancelar</Button>
          <Button color="warning" onClick={handleEnviarMaterial} disabled={enviandoMat}>
            {enviandoMat
              ? <span className="spinner-border spinner-border-sm mr-1" />
              : <Upload size={14} className="mr-1" />
            }
            Enviar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default PaginaSala;