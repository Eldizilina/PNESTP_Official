import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, Alert, Button } from "reactstrap";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

/**
 * Página de entrada por link de convite.
 * URL: /entrar/:codigo
 *
 * Fluxo:
 * 1. Se não autenticado → guarda o código e redireciona para registo/login
 * 2. Se autenticado → entra na sala automaticamente
 */
const EntrarSala = () => {
  const { codigo }  = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [estado,    setEstado]    = useState("a_processar"); // a_processar | sucesso | erro | ja_membro
  const [sala,      setSala]      = useState(null);
  const [mensagem,  setMensagem]  = useState("");

  useEffect(() => {
    if (!codigo) { setEstado("erro"); setMensagem("Código inválido."); return; }

    // Se não autenticado — guardar código e redirecionar para registo
    if (!user) {
      localStorage.setItem("convite_codigo", codigo);
      navigate("/auth/register", {
        state: { mensagem: `Regista-te para entrares na sala com código ${codigo}` }
      });
      return;
    }

    entrarNaSala();
  }, [user, codigo]);

  const entrarNaSala = async () => {
    try {
      const { data } = await api.post("/salas/entrar", { codigo });
      setSala(data.sala);
      setEstado("sucesso");
      // Redirecionar para a sala após 2 segundos
      setTimeout(() => {
        const destino = user?.perfil === "aluno" ? "/admin/aluno" : "/admin/professor";
        navigate(destino);
      }, 2000);
    } catch (err) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.message || "Erro ao entrar na sala.";
      if (status === 422 && msg.toLowerCase().includes("já")) {
        setEstado("ja_membro");
        setSala(err?.response?.data?.sala || null);
      } else {
        setEstado("erro");
        setMensagem(msg);
      }
    }
  };

  const irParaPainel = () => {
    const destino = user?.perfil === "aluno" ? "/admin/aluno" : "/admin/professor";
    navigate(destino);
  };

  return (
    <Container fluid style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }}>
      <Row className="justify-content-center w-100">
        <Col lg="5" md="7" xs="12">
          <Card className="shadow-lg border-0" style={{ borderRadius: "16px" }}>
            <CardBody className="text-center py-5 px-4">

              {estado === "a_processar" && (
                <>
                  <div className="spinner-border text-primary mb-3" role="status" />
                  <h5>A processar convite...</h5>
                  <p className="text-muted mb-0">Código: <strong>{codigo}</strong></p>
                </>
              )}

              {estado === "sucesso" && (
                <>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                  <h4 className="text-success mb-2">Entraste na sala!</h4>
                  <p className="text-muted mb-3">
                    Bem-vindo(a) à sala <strong>{sala?.nome}</strong>.
                  </p>
                  <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                    A redirecionar para o teu painel...
                  </p>
                </>
              )}

              {estado === "ja_membro" && (
                <>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👋</div>
                  <h4 className="mb-2">Já és membro!</h4>
                  <p className="text-muted mb-4">
                    Já pertences a esta sala{sala ? `: ${sala.nome}` : ""}.
                  </p>
                  <Button color="primary" onClick={irParaPainel}>
                    Ir para o meu painel
                  </Button>
                </>
              )}

              {estado === "erro" && (
                <>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
                  <h4 className="text-danger mb-2">Não foi possível entrar</h4>
                  <Alert color="danger" className="text-left">
                    {mensagem}
                  </Alert>
                  <Button color="primary" onClick={irParaPainel}>
                    Ir para o meu painel
                  </Button>
                </>
              )}

            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EntrarSala;
