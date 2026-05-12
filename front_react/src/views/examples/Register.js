import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button, Card, CardHeader, CardBody,
  FormGroup, Form, Input, InputGroup,
  InputGroupAddon, InputGroupText,
  Row, Col, Alert, Container
} from 'reactstrap';
import { useAuth } from "../../hooks/useAuth";

const Cadastro = () => {
  const navigate = useNavigate();
  const { register, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    confirmarPassword: "", perfil: "", escola: "",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    setError("");

    if (!/^[A-Za-zÀ-ÿ\s]{3,}$/.test(formData.name)) {
      setError("Nome deve conter apenas letras e no mínimo 3 caracteres");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Por favor, insira um email válido");
      return false;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(formData.password)) {
      setError("A senha deve conter letras e números, com no mínimo 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmarPassword) {
      setError("As senhas não coincidem!");
      return false;
    }
    if (!formData.perfil) {
      setError("Selecione uma categoria");
      return false;
    }
    if (formData.perfil === "aluno" && !formData.escola) {
      setError("Nome da escola é obrigatório para alunos");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setError("");
      setSuccess("");

      const userData = {
        name:                  formData.name.trim(),
        email:                 formData.email.trim(),
        password:              formData.password,
        password_confirmation: formData.confirmarPassword,
        perfil:                formData.perfil,
        ...(formData.perfil === "aluno" && { escola: formData.escola.trim() }),
      };

      // register() apenas cria a conta — o navigate fica aqui
      await register(userData);

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");

      setTimeout(() => {
        navigate("/auth/login", {
          state: {
            email:    formData.email.trim(),
            password: formData.password,
          },
        });
      }, 1500);

    } catch (err) {
      setError(err.message || "Erro ao realizar cadastro.");
    }
  };

  return (
    <Container fluid style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(to right, #eef2f3, #8e9eab)',
      padding: '20px'
    }}>
      <Row className="justify-content-center w-100">
        <Col lg="5" md="7" xs="12">
          <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
            <CardHeader className="bg-transparent pb-3">
              <div className="text-center">
                <h3 style={{ fontSize: '1.5rem' }}>Criar nova conta</h3>
                <small className="text-muted">Todos os campos são obrigatórios</small>
              </div>
            </CardHeader>

            <CardBody className="px-4 py-3">
              {error   && <Alert color="danger"  className="py-2">{error}</Alert>}
              {success && <Alert color="success" className="py-2">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Nome */}
                <FormGroup className="mb-2">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText><i className="ni ni-single-02" /></InputGroupText>
                    </InputGroupAddon>
                    <Input placeholder="Nome completo" type="text" name="name"
                      value={formData.name} onChange={handleChange} required />
                  </InputGroup>
                  <small className="text-muted">Mínimo 3 letras, sem números</small>
                </FormGroup>

                {/* Email */}
                <FormGroup className="mb-2">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText><i className="ni ni-email-83" /></InputGroupText>
                    </InputGroupAddon>
                    <Input placeholder="Email" type="email" name="email"
                      value={formData.email} onChange={handleChange} required />
                  </InputGroup>
                </FormGroup>

                {/* Senha e Confirmar */}
                <Row>
                  <Col md="6">
                    <FormGroup className="mb-2">
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText>
                        </InputGroupAddon>
                        <Input placeholder="Senha" type="password" name="password"
                          value={formData.password} onChange={handleChange} required />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup className="mb-2">
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText>
                        </InputGroupAddon>
                        <Input placeholder="Confirmar Senha" type="password" name="confirmarPassword"
                          value={formData.confirmarPassword} onChange={handleChange} required />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                </Row>
                <small className="text-muted d-block mb-2">
                  A senha deve conter letras e números (mínimo 6 caracteres)
                </small>

                {/* Perfil — ✅ valor "diretor" corrigido para "professor_diretor" */}
                <FormGroup className="mb-2">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText><i className="ni ni-badge" /></InputGroupText>
                    </InputGroupAddon>
                    <Input type="select" name="perfil" value={formData.perfil}
                      onChange={handleChange} required>
                      <option value="">Selecione seu perfil</option>
                      <option value="professor">Professor</option>
                      <option value="aluno">Aluno</option>
                      <option value="professor_diretor">Diretor de Turma</option>
                    </Input>
                  </InputGroup>
                </FormGroup>

                {/* Escola — apenas alunos */}
                {formData.perfil === 'aluno' && (
                  <FormGroup className="mb-3">
                    <InputGroup className="input-group-alternative">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="ni ni-hat-3" /></InputGroupText>
                      </InputGroupAddon>
                      <Input placeholder="Nome da escola" type="text" name="escola"
                        value={formData.escola} onChange={handleChange}
                        required={formData.perfil === 'aluno'} minLength={3} />
                    </InputGroup>
                    <small className="text-muted">Mínimo 3 caracteres</small>
                  </FormGroup>
                )}

                <div className="text-center">
                  <Button color="primary" type="submit"
                    disabled={authLoading} block className="mt-3">
                    {authLoading
                      ? <><span className="spinner-border spinner-border-sm mr-2"></span>Registrando...</>
                      : 'Criar conta'
                    }
                  </Button>
                </div>
              </Form>
            </CardBody>

            <div className="px-4 pb-3 text-center">
              <small className="text-muted">
                Já tem uma conta?{' '}
                <Link to="/auth/login" className="text-primary font-weight-bold">
                  Faça login
                </Link>
              </small>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cadastro;