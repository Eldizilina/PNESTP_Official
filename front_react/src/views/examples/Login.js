import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Button, Card, CardHeader, CardBody,
  FormGroup, Form, Input,
  InputGroupAddon, InputGroupText, InputGroup,
  Row, Col, Alert, Container,
} from "reactstrap";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation(); // 👈 lê o state enviado pelo Cadastro
  const { login, loading: authLoading } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [fromRegister, setFromRegister] = useState(false);

  // 👇 Se vier do cadastro, pré-preenche email e password automaticamente
  useEffect(() => {
    if (location.state?.email && location.state?.password) {
      setEmail(location.state.email);
      setPassword(location.state.password);
      setFromRegister(true);
      // Limpa o state da URL para não expor a password no histórico do browser
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      // O próprio login() no useAuth já faz o navigate para o dashboard correto
    } catch (error) {
      console.error("Erro no login:", error);
      setError(error.message || "Erro ao fazer login");
    }
  };

  return (
    <Container fluid style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    }}>
      <Row className="justify-content-center w-100">
        <Col lg="5" md="7" xs="12">
          <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
            <CardHeader className="bg-transparent pb-4">
              <div className="text-center">
                <h3>Acesse sua conta</h3>
                {/* 👇 Mensagem amigável quando vem do cadastro */}
                {fromRegister && (
                  <small className="text-success">
                    ✅ Conta criada! Os seus dados já estão preenchidos.
                  </small>
                )}
              </div>
            </CardHeader>

            <CardBody className="px-lg-5 py-lg-4">
              {error && <Alert color="danger">{error}</Alert>}

              <Form onSubmit={handleLogin}>
                <FormGroup className="mb-3">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText><i className="ni ni-email-83" /></InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </InputGroup>
                </FormGroup>

                <FormGroup className="mb-3">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Senha"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <small className="text-muted">A senha deve conter letras e números</small>
                </FormGroup>

                <div className="text-center">
                  <Button className="my-3" color="primary" type="submit"
                    disabled={authLoading} block>
                    {authLoading
                      ? <><span className="spinner-border spinner-border-sm mr-2"></span>Entrando...</>
                      : "Entrar"
                    }
                  </Button>
                </div>
              </Form>
            </CardBody>

            <div className="px-4 pb-4">
              <Row>
                <Col xs="6">
                  <a className="text-muted" href="/recuperar-senha">
                    <small>Esqueceu a senha?</small>
                  </a>
                </Col>
                <Col xs="6" className="text-right">
                  <Link to="/auth/register" className="text-primary">
                    <small>Criar nova conta</small>
                  </Link>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
