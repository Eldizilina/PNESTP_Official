import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import {
  Container, Row, Col, Card, CardBody, Badge,
} from "reactstrap";
import BotaoChat from "./BotaoChat";
export default function PainelAluno() {
  const { user, logout } = useAuth();

  const [notificacoes, setNotificacoes] = useState([]);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [materiais, setMateriais] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Carregar dados ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    async function buscarDados() {
      try {
        // Quando os endpoints estiverem prontos, substituir pelos reais:
        // const [resMateriais, resTarefas] = await Promise.all([
        //   api.get("/salas"),           // salas do aluno
        //   api.get("/exercicios"),      // exercicios pendentes
        // ]);

        // Dados temporários de demonstração
        setNotificacoes([
          { id: "1", titulo: "Nova tarefa de Matemática", descricao: "Lista de Exercícios - Cap. 5 foi adicionada", tipo: "tarefa", lida: false, tempo: "5 min atrás", cor: "#EF4444" },
          { id: "2", titulo: "Material de História disponível", descricao: "Slides sobre Segunda Guerra Mundial", tipo: "material", lida: false, tempo: "1 hora atrás", cor: "#059669" },
          { id: "3", titulo: "Prazo se aproximando", descricao: "Redação sobre Meio Ambiente vence em 2 dias", tipo: "prazo", lida: true, tempo: "2 horas atrás", cor: "#F59E0B" },
        ]);

        setMateriais([
          { id: "1", disciplina: "Matemática", titulo: "Equações do 2º Grau", tipo: "PDF", cor: "linear-gradient(135deg,#8B5CF6,#A855F7)", dataUpload: "Hoje" },
          { id: "2", disciplina: "História", titulo: "Segunda Guerra Mundial", tipo: "PDF", cor: "linear-gradient(135deg,#059669,#10B981)", dataUpload: "Ontem" },
          { id: "3", disciplina: "Química", titulo: "Tabela Periódica", tipo: "PDF", cor: "linear-gradient(135deg,#3B82F6,#1D4ED8)", dataUpload: "2 dias atrás" },
        ]);

        setTarefas([
          { id: "1", disciplina: "Matemática", titulo: "Lista de Exercícios - Cap. 5", prazo: "Amanhã", status: "pendente" },
          { id: "2", disciplina: "Português", titulo: "Redação sobre Meio Ambiente", prazo: "3 dias", status: "pendente" },
          { id: "3", disciplina: "História", titulo: "Pesquisa sobre São Tomé na era Colonial", prazo: "1 semana", status: "em_andamento" },
          { id: "4", disciplina: "Física", titulo: "Teoria de Isaac Newton", prazo: "Entregue", status: "concluida" },
        ]);

        setProfessores([
          { id: "1", nome: "Prof. Ana Silva", disciplina: "Matemática", email: "ana.silva@escola.com", cor: "#8B5CF6" },
          { id: "2", nome: "Prof. Carlos Santos", disciplina: "História", email: "carlos.santos@escola.com", cor: "#059669" },
          { id: "3", nome: "Prof. Maria Oliveira", disciplina: "Português", email: "maria.oliveira@escola.com", cor: "#DC2626" },
          { id: "4", nome: "Prof. João Costa", disciplina: "Química", email: "joao.costa@escola.com", cor: "#3B82F6" },
        ]);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    buscarDados();
  }, [user]);

  // ── Helpers ─────────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch (status) {
      case "pendente": return "#EF4444";
      case "em_andamento": return "#F59E0B";
      case "concluida": return "#10B981";
      default: return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pendente": return "Pendente";
      case "em_andamento": return "Em andamento";
      case "concluida": return "Concluída";
      default: return "Indefinido";
    }
  };

  const marcarComoLida = (id) => setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
  const marcarTodasLidas = () => setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  const notifNaoLidas = notificacoes.filter((n) => !n.lida).length;

  const nomeCompleto = user?.nome || user?.name || "Aluno";
  const primeiroNome = nomeCompleto.split(" ")[0];
  const turma = user?.turma || "Minha Turma";

  // ── Loading ─────────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      {/* Cabeçalho colorido (padrão Argon) */}
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">

            <div>
              <h2 className="text-white mb-0">
                Olá {primeiroNome}, bem-vindo(a) de volta!
              </h2>
              <p className="text-white-50 mb-0">{turma}</p>
            </div>

            {/* Notificações */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
                className="btn btn-sm btn-outline-light position-relative"
              >
                🔔
                {notifNaoLidas > 0 && (
                  <span
                    className="badge badge-danger badge-pill position-absolute"
                    style={{ top: "-6px", right: "-6px", fontSize: "0.65rem" }}
                  >
                    {notifNaoLidas}
                  </span>
                )}
              </button>

              {mostrarNotificacoes && (
                <>
                  {/* Overlay para fechar */}
                  <div
                    onClick={() => setMostrarNotificacoes(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  />
                  <div
                    style={{
                      position: "absolute", top: "110%", right: 0,
                      backgroundColor: "white", borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      border: "1px solid #e5e7eb", width: "340px",
                      maxHeight: "380px", overflowY: "auto", zIndex: 50,
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center p-3"
                      style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <h6 className="mb-0 font-weight-bold">Notificações</h6>
                      {notifNaoLidas > 0 && (
                        <button onClick={marcarTodasLidas}
                          className="btn btn-link btn-sm p-0 text-primary">
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>

                    {notificacoes.length === 0 ? (
                      <p className="text-muted text-center p-3 mb-0">Nenhuma notificação</p>
                    ) : (
                      notificacoes.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => marcarComoLida(n.id)}
                          style={{
                            padding: "0.75rem 1rem",
                            borderBottom: "1px solid #f3f4f6",
                            cursor: "pointer",
                            backgroundColor: n.lida ? "white" : "#f0f7ff",
                          }}
                        >
                          <div className="d-flex align-items-start" style={{ gap: "0.75rem" }}>
                            <div style={{
                              width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                              backgroundColor: n.lida ? "#d1d5db" : n.cor, marginTop: "6px",
                            }} />
                            <div>
                              <p className="mb-0 font-weight-bold" style={{ fontSize: "0.85rem", color: "#111827" }}>
                                {n.titulo}
                              </p>
                              <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>{n.descricao}</p>
                              <p className="mb-0" style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{n.tempo}</p>
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
        </Container>
      </div>

      {/* Conteúdo principal — margem negativa sobe sobre o header */}
      <Container className="mt--7" fluid>

        {/* ── Materiais ─────────────────────────────────────── */}
        <Row className="mb-4">
          <Col>
            <h3 className="mb-3" style={{ color: "#32325d" }}>Materiais da Disciplina</h3>
            <Row>
              {materiais.map((m) => (
                <Col key={m.id} xl="4" lg="6" md="6" className="mb-4">
                  <Card className="shadow h-100" style={{ cursor: "pointer", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{
                      background: m.cor, color: "white", padding: "1rem",
                      height: "80px", display: "flex",
                      alignItems: "center", justifyContent: "space-between",
                    }}>
                      <h4 className="mb-0" style={{ color: "white" }}>{m.disciplina}</h4>
                      <span style={{
                        backgroundColor: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem",
                        borderRadius: "20px", fontSize: "0.75rem",
                      }}>{m.tipo}</span>
                    </div>
                    <CardBody>
                      <h5 className="mb-1">{m.titulo}</h5>
                      <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                        Adicionado {m.dataUpload}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* ── Tarefas ──────────────────────────────────────── */}
        <Row className="mb-4">
          <Col>
            <h3 className="mb-3" style={{ color: "#32325d" }}>Tarefas</h3>
            <Row>
              {tarefas.map((t) => (
                <Col key={t.id} xl="3" lg="4" md="6" className="mb-4">
                  <Card
                    className="shadow h-100"
                    style={{ borderLeft: `4px solid ${getStatusColor(t.status)}`, borderRadius: "8px" }}
                  >
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div style={{ flex: 1, marginRight: "0.5rem" }}>
                          <h5 className="mb-1" style={{ fontSize: "0.95rem" }}>{t.titulo}</h5>
                          <p className="text-muted mb-0" style={{ fontSize: "0.82rem" }}>{t.disciplina}</p>
                        </div>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getStatusColor(t.status),
                            color: "white", padding: "0.3rem 0.6rem",
                            borderRadius: "12px", fontSize: "0.72rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getStatusText(t.status)}
                        </span>
                      </div>
                      <p style={{
                        fontSize: "0.82rem", margin: 0,
                        color: t.status === "pendente" ? "#EF4444" : "#6b7280",
                        fontWeight: t.status === "pendente" ? "600" : "normal",
                      }}>
                        {t.status === "concluida" ? "✓ " : "⏰ "}{t.prazo}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* ── Professores ──────────────────────────────────── */}
        <Row className="mb-5">
          <Col>
            <h3 className="mb-3" style={{ color: "#32325d" }}>Professores</h3>
            <Row>
              {professores.map((p) => (
                <Col key={p.id} xl="3" lg="4" md="6" className="mb-4">
                  <Card className="shadow h-100" style={{ borderRadius: "8px" }}>
                    <CardBody className="d-flex align-items-center" style={{ gap: "1rem" }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "50%",
                        backgroundColor: p.cor, color: "white", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.2rem", fontWeight: "bold",
                      }}>
                        {p.nome.split(" ")[1]?.[0] || "?"}
                      </div>
                      <div>
                        <h5 className="mb-1" style={{ fontSize: "0.95rem" }}>{p.nome}</h5>
                        <p style={{ color: p.cor, fontSize: "0.82rem", margin: "0 0 0.2rem", fontWeight: "600" }}>
                          {p.disciplina}
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>{p.email}</p>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
      <BotaoChat />
    </>
  );
}
