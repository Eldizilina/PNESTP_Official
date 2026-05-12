import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Button, Form, FormGroup, Label, Input, Modal,
  ModalHeader, ModalBody, ModalFooter, Badge,
} from "reactstrap";
import {
  Plus, Upload, FileText, Mail,
  Users, BookOpen, ClipboardList, TrendingUp, Bell, X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import BotaoChat from "./BotaoChat";

const PainelProfessor = () => {
  const { user } = useAuth();

  // ── Perfil ────────────────────────────────────────────────
  // true  → pode criar salas
  // false → apenas professor (sem criação de salas)
  const isDiretor = user?.perfil === "professor_diretor";

  // ── Estados ───────────────────────────────────────────────
  const [turmas, setTurmas] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [abaActiva, setAbaActiva] = useState("turmas");
  const [loading, setLoading] = useState(true);

  // Modais
  const [modalTurma, setModalTurma] = useState(false);
  const [modalMaterial, setModalMaterial] = useState(false);

  // Form: criar turma (apenas diretor)
  const [turmaForm, setTurmaForm] = useState({ nome: "", descricao: "" });

  // Form: enviar material
  const [materialForm, setMaterialForm] = useState({
    titulo: "", descricao: "", tipo: "pdf", ficheiro: null, turmaId: "",
  });

  // Notificações
  const [notifications, setNotifications] = useState([
    { id: 1, type: "success", title: "Tarefa Corrigida", message: "Corrigiu 5 tarefas da Turma A", time: "2 min atrás", read: false },
    { id: 2, type: "warning", title: "Prazo Próximo", message: "Entrega da avaliação do 2º período em 2 dias", time: "1 hora atrás", read: false },
    { id: 3, type: "info", title: "Nova Mensagem", message: "Aluno João enviou uma mensagem", time: "3 horas atrás", read: true },
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const navigate = useNavigate();

  // ── Carregar dados ────────────────────────────────────────
  useEffect(() => {
    async function carregar() {
      try {
        const { data: dataTurmas } = await api.get("/salas");
        setTurmas(Array.isArray(dataTurmas) ? dataTurmas : (dataTurmas?.data || []));
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
      }

      try {
        // Materiais são por sala — carrega se houver turma activa
        // Por agora deixa vazio; preenche ao seleccionar turma
        setMateriais([]);
      } catch (err) {
        console.error("Erro ao carregar materiais:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  // ── Acções ────────────────────────────────────────────────
  const handleCriarTurma = async () => {
    if (!turmaForm.nome.trim()) { alert("O nome da turma é obrigatório!"); return; }
    try {
      await api.post("/salas", turmaForm);
      alert("Sala criada com sucesso!");
      setTurmaForm({ nome: "", descricao: "" });
      setModalTurma(false);
      const { data } = await api.get("/salas");
      setTurmas(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      const msg = err?.response?.status === 403
        ? "Apenas o Professor Diretor pode criar salas."
        : "Erro ao criar sala.";
      alert(msg);
    }
  };

  const handleUploadMaterial = async () => {
    if (!materialForm.titulo.trim()) { alert("O título é obrigatório!"); return; }
    if (!materialForm.turmaId) { alert("Seleccione a sala."); return; }

    if (materialForm.tipo === "link") {
      const url = typeof materialForm.ficheiro === "string" ? materialForm.ficheiro.trim() : "";
      if (!url) { alert("Introduz o URL do material."); return; }
    } else {
      if (!materialForm.ficheiro) { alert("Selecciona um ficheiro para enviar."); return; }
    }

    // 👇 confirmar no console o que está a ser enviado
    console.log("A enviar material:", {
      titulo: materialForm.titulo,
      tipo: materialForm.tipo,
      turmaId: materialForm.turmaId,
      ficheiro: materialForm.ficheiro,
    });

    try {
      const fd = new FormData();
      fd.append("titulo", materialForm.titulo.trim());
      fd.append("descricao", materialForm.descricao.trim());
      fd.append("tipo", materialForm.tipo);

      if (materialForm.tipo === "link") {
        fd.append("url_externa", materialForm.ficheiro);
      } else {
        fd.append("ficheiro", materialForm.ficheiro);
      }

      // 👇 confirmar o FormData
      for (let [key, val] of fd.entries()) {
        console.log(key, val);
      }

      await api.post(`/salas/${materialForm.turmaId}/materiais`, fd);

      alert("Material enviado com sucesso!");
      setMaterialForm({ titulo: "", descricao: "", tipo: "pdf", ficheiro: null, turmaId: "" });
      setModalMaterial(false);

    } catch (err) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        alert("Erro de validação:\n" + Object.values(errors).flat().join("\n"));
      } else {
        alert(err?.response?.data?.message || "Erro ao enviar material.");
      }
    }
  };

  const handleApagarSala = async (id, nome) => {
    if (!window.confirm(`Tens a certeza que queres apagar a sala "${nome}"?\nEsta acção não pode ser desfeita.`)) return;

    try {
      await api.delete(`/salas/${id}`);
      setTurmas((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const msg = err?.response?.status === 403
        ? "Não tens permissão para apagar esta sala."
        : "Erro ao apagar sala.";
      alert(msg);
    }
  };

  // ── Helpers notificações ──────────────────────────────────
  const markAsRead = (id) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const removeNotif = (id) => setNotifications((p) => p.filter((n) => n.id !== id));
  const notifIcon = (t) => ({ success: "✅", warning: "⚠️", error: "❌" }[t] ?? "ℹ️");

  const nomeCompleto = user?.nome || user?.name || "Professor";
  const primeiroNome = nomeCompleto.split(" ")[0];

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">Carregando painel...</p>
        </div>
      </Container>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {/* ── Header colorido ─────────────────────────────── */}
      <div className="header bg-gradient-primary pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: "1rem" }}>

            {/* Título */}
            <div>
              <h2 className="text-white mb-0">
                Olá {primeiroNome}!{" "}
                <small style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                  {isDiretor ? "Professor Diretor" : "Professor"}
                </small>
              </h2>
              <p className="text-white-50 mb-0">Gerencie as suas turmas e actividades</p>
            </div>

            <div className="d-flex align-items-center" style={{ gap: "0.75rem" }}>

              {/* Botões de acção rápida */}
              {/* Criar sala — visível APENAS ao Professor Diretor */}
              {isDiretor && (
                <Button
                  size="sm" color="success"
                  onClick={() => setModalTurma(true)}
                  className="d-flex align-items-center"
                  style={{ gap: "0.4rem" }}
                >
                  <Plus size={14} /> Nova Sala
                </Button>
              )}

              {/* Enviar material — disponível a todos os professores */}
              <Button
                size="sm" color="warning"
                onClick={() => setModalMaterial(true)}
                className="d-flex align-items-center"
                style={{ gap: "0.4rem" }}
              >
                <Upload size={14} /> Material
              </Button>

              {/* Notificações */}
              <div style={{ position: "relative" }}>
                <button
                  className="btn btn-sm btn-outline-light position-relative"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span
                      className="badge badge-danger badge-pill position-absolute"
                      style={{ top: "-6px", right: "-6px", fontSize: "0.65rem" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <>
                    <div onClick={() => setIsNotifOpen(false)}
                      style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                    <div style={{
                      position: "absolute", top: "110%", right: 0,
                      backgroundColor: "white", borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      border: "1px solid #e5e7eb", width: "340px",
                      maxHeight: "380px", overflowY: "auto", zIndex: 50,
                    }}>
                      <div className="d-flex justify-content-between align-items-center p-3"
                        style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <h6 className="mb-0 font-weight-bold">Notificações</h6>
                        <div className="d-flex" style={{ gap: "0.5rem" }}>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead}
                              className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.78rem" }}>
                              Marcar todas
                            </button>
                          )}
                          <button onClick={() => setIsNotifOpen(false)}
                            className="btn btn-link btn-sm p-0 text-muted">✕</button>
                        </div>
                      </div>

                      {notifications.length === 0 ? (
                        <p className="text-muted text-center p-3 mb-0">Sem notificações</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} onClick={() => markAsRead(n.id)}
                            style={{
                              padding: "0.75rem 1rem", cursor: "pointer",
                              borderBottom: "1px solid #f3f4f6",
                              backgroundColor: n.read ? "white" : "#f0f7ff",
                            }}>
                            <div className="d-flex align-items-start" style={{ gap: "0.75rem" }}>
                              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{notifIcon(n.type)}</span>
                              <div style={{ flex: 1 }}>
                                <p className="mb-0 font-weight-bold" style={{ fontSize: "0.85rem" }}>{n.title}</p>
                                <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>{n.message}</p>
                                <p className="mb-0" style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{n.time}</p>
                              </div>
                              <button
                                className="btn btn-link btn-sm p-0 text-muted"
                                onClick={(e) => { e.stopPropagation(); removeNotif(n.id); }}
                              >✕</button>
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
        </Container>
      </div>

      {/* ── Conteúdo principal ──────────────────────────── */}
      <Container className="mt--7" fluid>

        {/* Cards de estatísticas */}
        <Row className="mb-4">
          <Col xl="4" lg="6" md="6" className="mb-4">
            <Card className="shadow" style={{ borderLeft: "4px solid #5e72e4" }}>
              <CardBody className="d-flex align-items-center" style={{ gap: "1rem" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  backgroundColor: "#e8ebff", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Users size={22} color="#5e72e4" />
                </div>
                <div>
                  <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Total de Salas
                  </p>
                  <h3 className="mb-0 font-weight-bold">{turmas.length}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl="4" lg="6" md="6" className="mb-4">
            <Card className="shadow" style={{ borderLeft: "4px solid #2dce89" }}>
              <CardBody className="d-flex align-items-center" style={{ gap: "1rem" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  backgroundColor: "#e0f7ee", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <BookOpen size={22} color="#2dce89" />
                </div>
                <div>
                  <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Materiais
                  </p>
                  <h3 className="mb-0 font-weight-bold">{materiais.length}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl="4" lg="6" md="6" className="mb-4">
            <Card className="shadow" style={{ borderLeft: "4px solid #fb6340" }}>
              <CardBody className="d-flex align-items-center" style={{ gap: "1rem" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  backgroundColor: "#ffe5dc", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <ClipboardList size={22} color="#fb6340" />
                </div>
                <div>
                  <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Exercícios
                  </p>
                  <h3 className="mb-0 font-weight-bold">—</h3>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Abas */}
        <Card className="shadow mb-5">
          <CardHeader className="bg-white border-0 pb-0">
            <ul className="nav nav-tabs card-header-tabs">
              {[
                { key: "turmas", label: "Turmas", icon: <BookOpen size={14} /> },
                { key: "tarefas", label: "Tarefas", icon: <FileText size={14} /> },
                { key: "avaliacoes", label: "Avaliações", icon: <ClipboardList size={14} /> },
                { key: "mensagens", label: "Mensagens", icon: <Mail size={14} /> },
              ].map((aba) => (
                <li key={aba.key} className="nav-item">
                  <button
                    className={`nav-link d-flex align-items-center ${abaActiva === aba.key ? "active" : ""}`}
                    style={{ gap: "0.4rem", border: "none", background: "none", cursor: "pointer" }}
                    onClick={() => setAbaActiva(aba.key)}
                  >
                    {aba.icon} {aba.label}
                  </button>
                </li>
              ))}
            </ul>
          </CardHeader>

          <CardBody>

            {/* ── Aba Turmas ──────────────────────────────── */}
            {abaActiva === "turmas" && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Minhas Salas</h4>
                  {/* Botão criar sala — apenas diretor */}
                  {isDiretor && (
                    <Button color="primary" size="sm" onClick={() => setModalTurma(true)}
                      className="d-flex align-items-center" style={{ gap: "0.4rem" }}>
                      <Plus size={14} /> Nova Sala
                    </Button>
                  )}
                </div>

                {turmas.length === 0 ? (
                  <div className="text-center py-5">
                    <Users size={40} color="#adb5bd" className="mb-3" />
                    <p className="text-muted mb-0">
                      {isDiretor
                        ? "Nenhuma sala criada. Clique em \"Nova Sala\" para começar."
                        : "Ainda não pertences a nenhuma sala. Aguarda um convite do Director de Turma."}
                    </p>
                  </div>
                ) : (
                  <Row>
                    {turmas.map((t) => (
                      <Col key={t.id} xl="4" lg="6" md="6" className="mb-4">
                        <Card
                          className="shadow-sm h-100"
                          style={{
                            borderRadius: "10px", border: "1px solid #e9ecef",
                            cursor: "pointer",                          // 👈 mão ao passar
                            transition: "box-shadow 0.2s, transform 0.2s",
                          }}
                          onClick={() => navigate(`/admin/sala/${t.id}`)} // 👈 navegar para a sala
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "";
                            e.currentTarget.style.transform = "";
                          }}
                        >
                          <CardBody>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="mb-0">{t.nome}</h5>
                              <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
                                <Badge color="primary" pill style={{ fontSize: "0.7rem" }}>
                                  {t.codigo_acesso || "—"}
                                </Badge>
                                {isDiretor && t.criador_id === user?.id && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // 👈 evita abrir a sala ao apagar
                                      handleApagarSala(t.id, t.nome);
                                    }}
                                    style={{
                                      background: "none", border: "none", cursor: "pointer",
                                      color: "#f5365c", padding: "2px", lineHeight: 1,
                                    }}
                                    title="Apagar sala"
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                              {t.descricao || "Sem descrição"}
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex" style={{ gap: "0.75rem", fontSize: "0.78rem", color: "#6c757d" }}>
                                <span><Users size={12} className="mr-1" />{t.alunos_count ?? "—"} alunos</span>
                                <span><BookOpen size={12} className="mr-1" />{t.materiais_count ?? "—"} materiais</span>
                              </div>
                              {/* Indicador visual de clicável */}
                              <span style={{ fontSize: "0.72rem", color: "#5e72e4" }}>
                                Ver sala →
                              </span>
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}

                  </Row>
                )}
              </>
            )}

            {/* ── Aba Tarefas ─────────────────────────────── */}
            {abaActiva === "tarefas" && (
              <div className="text-center py-5">
                <FileText size={40} color="#adb5bd" className="mb-3" />
                <h5 className="text-muted">Tarefas e Exercícios</h5>
                <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                  Selecciona uma sala para ver e criar exercícios.
                </p>
                <Button color="warning" size="sm" onClick={() => setAbaActiva("turmas")}>
                  Ver Salas
                </Button>
              </div>
            )}

            {/* ── Aba Avaliações ──────────────────────────── */}
            {abaActiva === "avaliacoes" && (
              <div className="text-center py-5">
                <TrendingUp size={40} color="#adb5bd" className="mb-3" />
                <h5 className="text-muted">Relatórios de Desempenho</h5>
                <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                  Os gráficos e relatórios aparecerão aqui.
                </p>
              </div>
            )}

            {/* ── Aba Mensagens ───────────────────────────── */}
            {abaActiva === "mensagens" && (
              <div className="text-center py-5">
                <Mail size={40} color="#adb5bd" className="mb-3" />
                <h5 className="text-muted">Central de Mensagens</h5>
                <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                  As suas conversas aparecerão aqui.
                </p>
              </div>
            )}

          </CardBody>
        </Card>
      </Container>

      {/* ── Modal: Criar Sala (apenas Professor Diretor) ── */}
      {isDiretor && (
        <Modal isOpen={modalTurma} toggle={() => setModalTurma(false)}>
          <ModalHeader toggle={() => setModalTurma(false)}>
            Criar Nova Sala
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label>Nome da Sala *</Label>
                <Input
                  type="text"
                  placeholder="Ex: Matemática 10ª Classe"
                  value={turmaForm.nome}
                  onChange={(e) => setTurmaForm({ ...turmaForm, nome: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Descrição</Label>
                <Input
                  type="textarea" rows={3}
                  placeholder="Descrição opcional..."
                  value={turmaForm.descricao}
                  onChange={(e) => setTurmaForm({ ...turmaForm, descricao: e.target.value })}
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setModalTurma(false)}>Cancelar</Button>
            <Button color="primary" onClick={handleCriarTurma}>Criar Sala</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* ── Modal: Enviar Material (todos os professores) ─ */}
      <Modal isOpen={modalMaterial} toggle={() => setModalMaterial(false)}>
        <ModalHeader toggle={() => setModalMaterial(false)}>
          Enviar Material Didáctico
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Título *</Label>
              <Input
                type="text" placeholder="Título do material"
                value={materialForm.titulo}
                onChange={(e) => setMaterialForm({ ...materialForm, titulo: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Descrição</Label>
              <Input
                type="textarea" rows={2} placeholder="Descrição opcional..."
                value={materialForm.descricao}
                onChange={(e) => setMaterialForm({ ...materialForm, descricao: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Tipo</Label>
              <Input
                type="select" value={materialForm.tipo}
                onChange={(e) => setMaterialForm({ ...materialForm, tipo: e.target.value })}
              >
                <option value="pdf">PDF</option>
                <option value="imagem">Imagem</option>
                <option value="video">Vídeo</option>
                <option value="link">Link Externo</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>Sala *</Label>
              <Input
                type="select" value={materialForm.turmaId}
                onChange={(e) => setMaterialForm({ ...materialForm, turmaId: e.target.value })}
              >
                <option value="">Seleccione a sala</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </Input>
            </FormGroup>

            {materialForm.tipo === "link" ? (
              <FormGroup>
                <Label>URL do Material</Label>
                <Input
                  type="url" placeholder="https://..."
                  value={typeof materialForm.ficheiro === "string" ? materialForm.ficheiro : ""}
                  onChange={(e) => setMaterialForm({ ...materialForm, ficheiro: e.target.value })}
                />
              </FormGroup>
            ) : (
              <FormGroup>
                <Label>Ficheiro</Label>
                <Input
                  type="file"
                  className="form-control"
                  accept={
                    materialForm.tipo === "pdf" ? ".pdf" :
                      materialForm.tipo === "imagem" ? "image/*" : "video/*"
                  }
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    console.log("Ficheiro seleccionado:", file); // confirmar no console
                    setMaterialForm((prev) => ({ ...prev, ficheiro: file || null }));
                  }}
                />
                {/* Mostrar nome do ficheiro seleccionado */}
                {materialForm.ficheiro && (
                  <small className="text-success mt-1 d-block">
                    ✓ {materialForm.ficheiro.name} ({(materialForm.ficheiro.size / 1024).toFixed(1)} KB)
                  </small>
                )}
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalMaterial(false)}>Cancelar</Button>
          <Button color="warning" onClick={handleUploadMaterial}>Enviar Material</Button>
        </ModalFooter>
      </Modal>
      <BotaoChat />
    </>
  );
};

export default PainelProfessor;
