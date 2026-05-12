import { useState, useEffect, useRef } from "react";
import {
  Button, Card, CardHeader, CardBody,
  FormGroup, Form, Input, Container,
  Row, Col, Badge, Modal, ModalHeader,
  ModalBody, ModalFooter, Alert,
} from "reactstrap";
import UserHeader from "../../components/Headers/UserHeader";
import { Edit, Save, Lock, Book, Users, Mail, X, User, LogOut, Camera } from "react-feather";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

const Profile = () => {
  const { user, logout, setUser } = useAuth();

  const [editMode,   setEditMode]   = useState(false);
  const [formData,   setFormData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");

  // Modal alterar password
  const [modalPass,      setModalPass]      = useState(false);
  const [passForm,       setPassForm]       = useState({ password_atual: "", password: "", password_confirmation: "" });
  const [passError,      setPassError]      = useState("");
  const [passSaving,     setPassSaving]     = useState(false);

  // Salas para estatísticas
  const [salas,          setSalas]          = useState([]);

  const fileInputRef = useRef(null);

  // ── Carregar perfil ─────────────────────────────────────
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get("/me");
        setFormData({
          name:   data.name   || "",
          email:  data.email  || "",
          bio:    data.bio    || "",
          escola: data.escola || "",
          perfil: data.perfil || "",
          avatar: data.avatar || null,
          // preview local (não enviado ao backend directamente)
          avatarPreview: data.avatar
            ? `http://localhost:8000/storage/${data.avatar}`
            : null,
        });
      } catch (err) {
        setError("Erro ao carregar perfil. Tente novamente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchSalas() {
      try {
        const { data } = await api.get("/salas");
        setSalas(Array.isArray(data) ? data : (data?.data || []));
      } catch (_) {}
    }

    fetchProfile();
    fetchSalas();
  }, []);

  // ── Helpers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        avatarFile:    file,
        avatarPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("name",   formData.name);
      fd.append("bio",    formData.bio);
      fd.append("escola", formData.escola);
      if (formData.avatarFile) {
        fd.append("avatar", formData.avatarFile);
      }
      const { data } = await api.post("/me/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Actualizar o user no contexto
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Perfil actualizado com sucesso!");
      setEditMode(false);
      setFormData((prev) => ({ ...prev, avatarFile: null }));
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao actualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/me");
      setFormData({
        name:          data.name   || "",
        email:         data.email  || "",
        bio:           data.bio    || "",
        escola:        data.escola || "",
        perfil:        data.perfil || "",
        avatar:        data.avatar || null,
        avatarPreview: data.avatar
          ? `http://localhost:8000/storage/${data.avatar}`
          : null,
      });
      setEditMode(false);
    } catch (_) {
      setError("Erro ao recarregar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarPassword = async () => {
    setPassError("");
    if (!passForm.password_atual) { setPassError("Introduz a password actual."); return; }
    if (passForm.password !== passForm.password_confirmation) { setPassError("As passwords não coincidem."); return; }
    if (passForm.password.length < 6) { setPassError("A nova password deve ter pelo menos 6 caracteres."); return; }

    setPassSaving(true);
    try {
      await api.post("/me/password", passForm);
      setSuccess("Password alterada com sucesso!");
      setModalPass(false);
      setPassForm({ password_atual: "", password: "", password_confirmation: "" });
    } catch (err) {
      setPassError(err.response?.data?.message || "Erro ao alterar password.");
    } finally {
      setPassSaving(false);
    }
  };

  // Badge conforme perfil
  const perfilBadge = () => {
    switch (formData?.perfil) {
      case "professor_diretor": return <Badge color="danger"  className="mt-1">Professor Diretor</Badge>;
      case "professor":         return <Badge color="info"    className="mt-1">Professor</Badge>;
      default:                  return <Badge color="success" className="mt-1">Aluno</Badge>;
    }
  };

  // Iniciais para avatar padrão
  const getIniciais = (nome = "") => {
    const p = nome.trim().split(" ");
    if (p.length === 1) return p[0][0]?.toUpperCase() || "?";
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  // ── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <UserHeader />
        <Container className="mt--7" fluid>
          <Row className="justify-content-center">
            <Col xl="8">
              <Card className="bg-secondary shadow">
                <CardBody className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted mt-3 mb-0">A carregar perfil...</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  if (!formData) {
    return (
      <>
        <UserHeader />
        <Container className="mt--7" fluid>
          <Row className="justify-content-center">
            <Col xl="8">
              <Card className="bg-secondary shadow">
                <CardBody className="text-center py-5">
                  <p className="text-danger">Erro ao carregar perfil. Tente novamente mais tarde.</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col xl="8" lg="10" md="12">

            {/* Alertas globais */}
            {error   && <Alert color="danger"  className="mb-3" toggle={() => setError("")}>{error}</Alert>}
            {success && <Alert color="success" className="mb-3" toggle={() => setSuccess("")}>{success}</Alert>}

            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Minha Conta</h3>
                    {perfilBadge()}
                  </Col>
                  <Col className="text-right" xs="4">
                    <div className="d-flex justify-content-end align-items-center" style={{ gap: "0.5rem" }}>
                      {editMode ? (
                        <>
                          <Button color="danger" onClick={handleCancel} size="sm" disabled={saving}>
                            <X size={14} className="mr-1" />Cancelar
                          </Button>
                          <Button color="primary" onClick={handleSave} size="sm" disabled={saving}>
                            {saving
                              ? <span className="spinner-border spinner-border-sm mr-1" />
                              : <Save size={14} className="mr-1" />
                            }
                            Guardar
                          </Button>
                        </>
                      ) : (
                        <Button color="primary" onClick={() => setEditMode(true)} size="sm">
                          <Edit size={14} className="mr-1" />Editar
                        </Button>
                      )}
                      {/* Logout */}
                      <Button
                        color="light" size="sm"
                        onClick={logout}
                        title="Terminar sessão"
                        style={{ border: "1px solid #dee2e6" }}
                      >
                        <LogOut size={14} />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                <Form>

                  {/* ── Avatar ────────────────────────────── */}
                  <div className="text-center mb-4">
                    <div style={{ position: "relative", display: "inline-block" }}>
                      {formData.avatarPreview ? (
                        <img
                          src={formData.avatarPreview}
                          alt="Avatar"
                          className="rounded-circle"
                          style={{ width: "120px", height: "120px", objectFit: "cover", border: "3px solid #dee2e6" }}
                        />
                      ) : (
                        <div style={{
                          width: "120px", height: "120px", borderRadius: "50%",
                          backgroundColor: "#5e72e4", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "2.5rem", fontWeight: "bold", border: "3px solid #dee2e6",
                        }}>
                          {getIniciais(formData.name)}
                        </div>
                      )}

                      {/* Botão câmara — apenas em editMode */}
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            position: "absolute", bottom: "4px", right: "4px",
                            width: "32px", height: "32px", borderRadius: "50%",
                            backgroundColor: "#5e72e4", border: "2px solid white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Camera size={14} color="white" />
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handlePhotoChange}
                    />

                    <div className="mt-2">
                      <h5 className="mb-0">{formData.name}</h5>
                      <small className="text-muted">{formData.email}</small>
                    </div>
                  </div>

                  {/* ── Estatísticas rápidas ──────────────── */}
                  <Row className="mb-4">
                    <Col xs="4" className="text-center">
                      <div style={{ padding: "0.75rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                        <h4 className="mb-0 font-weight-bold" style={{ color: "#5e72e4" }}>
                          {salas.length}
                        </h4>
                        <small className="text-muted">Salas</small>
                      </div>
                    </Col>
                    <Col xs="4" className="text-center">
                      <div style={{ padding: "0.75rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                        <h4 className="mb-0 font-weight-bold" style={{ color: "#2dce89" }}>
                          {salas.reduce((acc, s) => acc + (s.materiais_count || 0), 0)}
                        </h4>
                        <small className="text-muted">Materiais</small>
                      </div>
                    </Col>
                    <Col xs="4" className="text-center">
                      <div style={{ padding: "0.75rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                        <h4 className="mb-0 font-weight-bold" style={{ color: "#fb6340" }}>
                          {salas.reduce((acc, s) => acc + (s.exercicios_count || 0), 0)}
                        </h4>
                        <small className="text-muted">Exercícios</small>
                      </div>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  {/* ── Informações pessoais ──────────────── */}
                  <h6 className="heading-small text-muted mb-4">
                    <User size={14} className="mr-2" />
                    Informações Pessoais
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label>Nome Completo</label>
                          <Input
                            name="name" type="text"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!editMode}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label>Email</label>
                          <Input
                            name="email" type="email"
                            value={formData.email}
                            disabled // email não é editável
                          />
                          <small className="text-muted">O email não pode ser alterado.</small>
                        </FormGroup>
                      </Col>
                    </Row>

                    {/* Escola — visível apenas para alunos */}
                    {formData.perfil === "aluno" && (
                      <Row>
                        <Col lg="12">
                          <FormGroup>
                            <label>Escola</label>
                            <Input
                              name="escola" type="text"
                              value={formData.escola}
                              onChange={handleChange}
                              disabled={!editMode}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    )}
                  </div>

                  <hr className="my-4" />

                  {/* ── Bio ───────────────────────────────── */}
                  <h6 className="heading-small text-muted mb-4">
                    <Mail size={14} className="mr-2" />
                    Sobre Mim
                  </h6>
                  <div className="pl-lg-4">
                    <FormGroup>
                      <Input
                        name="bio" type="textarea" rows="4"
                        placeholder={editMode ? "Escreve algo sobre ti..." : ""}
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </FormGroup>
                  </div>

                  <hr className="my-4" />

                  {/* ── Salas / Turmas ────────────────────── */}
                  <h6 className="heading-small text-muted mb-4">
                    {formData.perfil === "aluno"
                      ? <><Users size={14} className="mr-2" />Minhas Salas</>
                      : <><Book  size={14} className="mr-2" />Salas que Lecciono</>
                    }
                  </h6>
                  <div className="pl-lg-4">
                    {salas.length === 0 ? (
                      <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                        Ainda não pertences a nenhuma sala.
                      </p>
                    ) : (
                      <Row>
                        {salas.map((sala) => (
                          <Col key={sala.id} md="6" className="mb-3">
                            <div style={{
                              padding: "0.75rem 1rem", backgroundColor: "#f8f9fa",
                              borderRadius: "8px", border: "1px solid #e9ecef",
                            }}>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-0" style={{ fontSize: "0.9rem" }}>{sala.nome}</h6>
                                  <small className="text-muted">{sala.descricao || "Sem descrição"}</small>
                                </div>
                                <Badge color="light" style={{ fontSize: "0.7rem", color: "#5e72e4", border: "1px solid #5e72e4" }}>
                                  {sala.codigo_acesso}
                                </Badge>
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>

                  <hr className="my-4" />

                  {/* ── Segurança ─────────────────────────── */}
                  <h6 className="heading-small text-muted mb-4">
                    <Lock size={14} className="mr-2" />
                    Segurança
                  </h6>
                  <div className="pl-lg-4">
                    <Button
                      color="secondary" size="sm"
                      onClick={() => setModalPass(true)}
                    >
                      <Lock size={14} className="mr-1" />
                      Alterar Password
                    </Button>
                  </div>

                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ── Modal: Alterar Password ─────────────────────── */}
      <Modal isOpen={modalPass} toggle={() => { setModalPass(false); setPassError(""); }}>
        <ModalHeader toggle={() => { setModalPass(false); setPassError(""); }}>
          Alterar Password
        </ModalHeader>
        <ModalBody>
          {passError && <Alert color="danger">{passError}</Alert>}
          <Form>
            <FormGroup>
              <label>Password Actual *</label>
              <Input
                type="password" placeholder="Password actual"
                value={passForm.password_atual}
                onChange={(e) => setPassForm({ ...passForm, password_atual: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Nova Password *</label>
              <Input
                type="password" placeholder="Mínimo 6 caracteres"
                value={passForm.password}
                onChange={(e) => setPassForm({ ...passForm, password: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Confirmar Nova Password *</label>
              <Input
                type="password" placeholder="Repete a nova password"
                value={passForm.password_confirmation}
                onChange={(e) => setPassForm({ ...passForm, password_confirmation: e.target.value })}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => { setModalPass(false); setPassError(""); }}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleAlterarPassword} disabled={passSaving}>
            {passSaving
              ? <span className="spinner-border spinner-border-sm mr-1" />
              : <Lock size={14} className="mr-1" />
            }
            Alterar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Profile;