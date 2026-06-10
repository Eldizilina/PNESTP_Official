import { useState, useEffect, useRef } from "react";
import {
  Button, Card, CardBody, CardHeader,
  FormGroup, Form, Input, Container,
  Row, Col, Badge, Modal, ModalHeader,
  ModalBody, ModalFooter, Alert,
} from "reactstrap";
import { Edit, Save, Lock, Book, Users, Mail, X, User, LogOut, Camera, Layers, BookOpen, CheckCircle, ArrowLeft } from "react-feather";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [editMode,   setEditMode]   = useState(false);
  const [formData,   setFormData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");

  const [modalPass,      setModalPass]      = useState(false);
  const [passForm,       setPassForm]       = useState({ password_atual: "", password: "", password_confirmation: "" });
  const [passError,      setPassError]      = useState("");
  const [passSaving,     setPassSaving]     = useState(false);

  const [salas, setSalas] = useState([]);
  const fileInputRef = useRef(null);

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
          avatarPreview: data.avatar ? `http://localhost:8000/storage/${data.avatar}` : null,
        });
      } catch (err) {
        setError("Erro ao carregar perfil.");
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
        avatarFile: file,
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
      fd.append("name", formData.name);
      fd.append("bio", formData.bio);
      fd.append("escola", formData.escola);
      if (formData.avatarFile) fd.append("avatar", formData.avatarFile);
      const { data } = await api.post("/me/profile", fd);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Perfil actualizado!");
      setEditMode(false);
      setFormData((prev) => ({ ...prev, avatarFile: null }));
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/me");
      setFormData({
        name: data.name || "",
        email: data.email || "",
        bio: data.bio || "",
        escola: data.escola || "",
        perfil: data.perfil || "",
        avatar: data.avatar || null,
        avatarPreview: data.avatar ? `http://localhost:8000/storage/${data.avatar}` : null,
      });
      setEditMode(false);
    } catch (_) {
      setError("Erro ao recarregar.");
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarPassword = async () => {
    setPassError("");
    if (!passForm.password_atual) { setPassError("Password actual obrigatória."); return; }
    if (passForm.password !== passForm.password_confirmation) { setPassError("Passwords não coincidem."); return; }
    if (passForm.password.length < 6) { setPassError("Mínimo 6 caracteres."); return; }

    setPassSaving(true);
    try {
      await api.post("/me/password", passForm);
      setSuccess("Password alterada!");
      setModalPass(false);
      setPassForm({ password_atual: "", password: "", password_confirmation: "" });
    } catch (err) {
      setPassError(err.response?.data?.message || "Erro ao alterar.");
    } finally {
      setPassSaving(false);
    }
  };

  const perfilBadge = () => {
    switch (formData?.perfil) {
      case "professor_diretor": return <Badge pill style={{ backgroundColor: "#f5365c", fontSize: "0.7rem" }}>🎓 Director</Badge>;
      case "professor":         return <Badge pill style={{ backgroundColor: "#2dce89", fontSize: "0.7rem" }}>📚 Professor</Badge>;
      default:                  return <Badge pill style={{ backgroundColor: "#5e72e4", fontSize: "0.7rem" }}>🎓 Aluno</Badge>;
    }
  };

  const getIniciais = (nome = "") => {
    const p = nome.trim().split(" ");
    if (p.length === 1) return p[0][0]?.toUpperCase() || "?";
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  const totalMateriais  = salas.reduce((acc, s) => acc + (s.materiais_count  || 0), 0);
  const totalExercicios = salas.reduce((acc, s) => acc + (s.exercicios_count || 0), 0);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", backgroundColor: "#1E1035" }}>
        <div className="text-center">
          <div className="spinner-border text-white mb-3" role="status" />
          <p className="text-white-50">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F2F5" }}>

      {/* ── HEADER ROXO ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #1E1035 0%, #2D1B69 60%, #3B1F8C 100%)",
        padding: "1.5rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glows decorativos */}
        <div style={{
          position: "absolute", top: "-80px", right: "-60px",
          width: "340px", height: "340px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "10%",
          width: "260px", height: "260px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <Container fluid>
          <div
            className="d-flex justify-content-between align-items-center flex-wrap"
            style={{ gap: "1rem", position: "relative", zIndex: 1 }}
          >
            {/* Esquerda: botão voltar + título */}
            <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                <ArrowLeft size={20} color="white" />
              </button>
              <div>
                {/* Badge "Meu Perfil" */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  backgroundColor: "rgba(139,92,246,0.18)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#A78BFA",
                  borderRadius: "20px",
                  padding: "0.25rem 0.8rem",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                }}>
                  <User size={11} /> Meu Perfil
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "white", margin: 0 }}>
                  {formData.name}
                </h1>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", margin: "0.2rem 0 0" }}>
                  Gerencie as suas informações
                </p>
              </div>
            </div>

            {/* Direita: botão sair */}
            <button
              onClick={logout}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </Container>
      </div>

      {/* ── CONTEÚDO ────────────────────────────────────────── */}
      <Container className="mt-4" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="10" md="12">

            {error   && <Alert color="danger"  className="mb-3" toggle={() => setError("")}>{error}</Alert>}
            {success && <Alert color="success" className="mb-3" toggle={() => setSuccess("")}>{success}</Alert>}

            <Row>
              {/* ── Coluna esquerda: avatar + estatísticas ── */}
              <Col lg="4" className="mb-4">
                <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>

                  {/* Área do avatar — mesma paleta do header */}
                  <div style={{
                    background: "linear-gradient(135deg, #1E1035 0%, #2D1B69 100%)",
                    padding: "2rem 1rem",
                    textAlign: "center",
                  }}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      {formData.avatarPreview ? (
                        <img
                          src={formData.avatarPreview}
                          alt="Avatar"
                          className="rounded-circle"
                          style={{ width: "100px", height: "100px", objectFit: "cover", border: "4px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                        />
                      ) : (
                        <div style={{
                          width: "100px", height: "100px", borderRadius: "50%",
                          background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                          color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "2rem", fontWeight: "bold",
                          border: "4px solid white",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}>
                          {getIniciais(formData.name)}
                        </div>
                      )}
                      {editMode && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            position: "absolute", bottom: 0, right: 0,
                            width: "32px", height: "32px", borderRadius: "50%",
                            backgroundColor: "#A78BFA", border: "2px solid white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Camera size={14} color="white" />
                        </button>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                    <h4 className="text-white mb-0 mt-2" style={{ fontSize: "1.1rem" }}>{formData.name}</h4>
                    <div className="mt-1">{perfilBadge()}</div>
                    <p className="text-white-50 mb-0" style={{ fontSize: "0.75rem" }}>{formData.email}</p>
                  </div>

                  <CardBody style={{ padding: "1rem" }}>
                    <Row className="g-2 text-center">
                      {[
                        { icon: <Layers size={18} color="#8B5CF6" />, value: salas.length,       label: "Salas" },
                        { icon: <BookOpen size={18} color="#2dce89" />, value: totalMateriais,   label: "Materiais" },
                        { icon: <CheckCircle size={18} color="#fb6340" />, value: totalExercicios, label: "Exercícios" },
                      ].map((s) => (
                        <Col xs="4" key={s.label}>
                          <div style={{ padding: "0.5rem", backgroundColor: "#F8FAFC", borderRadius: "10px" }}>
                            {s.icon}
                            <h5 className="mb-0 mt-1" style={{ fontSize: "1rem", fontWeight: "700", color: "#0F172A" }}>{s.value}</h5>
                            <small className="text-muted" style={{ fontSize: "0.65rem" }}>{s.label}</small>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    <hr className="my-3" />

                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>Salas que participa</span>
                        <span className="text-muted" style={{ fontSize: "0.7rem" }}>{salas.length} salas</span>
                      </div>
                      <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                        {salas.slice(0, 3).map((sala) => (
                          <div key={sala.id} style={{
                            padding: "0.5rem",
                            backgroundColor: "#F8FAFC",
                            borderRadius: "8px",
                            marginBottom: "0.5rem",
                          }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ fontSize: "0.8rem", fontWeight: "500", color: "#0F172A" }}>{sala.nome}</span>
                              <Badge color="light" style={{ fontSize: "0.6rem" }}>{sala.codigo_acesso}</Badge>
                            </div>
                          </div>
                        ))}
                        {salas.length > 3 && (
                          <div className="text-center mt-1">
                            <small className="text-muted">+{salas.length - 3} outras salas</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* ── Coluna direita: formulário ── */}
              <Col lg="8">
                <Card style={{ borderRadius: "16px", border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardHeader
                    className="d-flex justify-content-between align-items-center flex-wrap"
                    style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #E2E8F0", background: "white", gap: "0.5rem" }}
                  >
                    <h5 className="mb-0" style={{ fontWeight: "600", color: "#0F172A" }}>Informações Pessoais</h5>
                    <div className="d-flex" style={{ gap: "0.5rem" }}>
                      {editMode ? (
                        <>
                          <Button size="sm" color="light" onClick={handleCancel} disabled={saving} style={{ borderRadius: "8px" }}>
                            <X size={14} /> Cancelar
                          </Button>
                          <Button
                            size="sm" onClick={handleSave} disabled={saving}
                            style={{ borderRadius: "8px", background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", border: "none", color: "white" }}
                          >
                            {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={14} />}
                            {" "}Guardar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm" onClick={() => setEditMode(true)}
                          style={{ borderRadius: "8px", background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", border: "none", color: "white" }}
                        >
                          <Edit size={14} /> Editar
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardBody style={{ padding: "1.5rem" }}>
                    <Form>
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569", marginBottom: "0.25rem" }}>Nome Completo</label>
                            <Input
                              name="name" type="text"
                              value={formData.name}
                              onChange={handleChange}
                              disabled={!editMode}
                              style={{ fontSize: "0.85rem", borderRadius: "10px", borderColor: "#E2E8F0" }}
                            />
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569", marginBottom: "0.25rem" }}>Email</label>
                            <Input
                              name="email" type="email"
                              value={formData.email}
                              disabled
                              style={{ fontSize: "0.85rem", borderRadius: "10px", borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      {formData.perfil === "aluno" && (
                        <Row>
                          <Col md="12">
                            <FormGroup>
                              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569", marginBottom: "0.25rem" }}>Escola</label>
                              <Input
                                name="escola" type="text"
                                value={formData.escola}
                                onChange={handleChange}
                                disabled={!editMode}
                                style={{ fontSize: "0.85rem", borderRadius: "10px", borderColor: "#E2E8F0" }}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      )}

                      <FormGroup>
                        <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569", marginBottom: "0.25rem" }}>Sobre Mim</label>
                        <Input
                          name="bio" type="textarea" rows="3"
                          placeholder={editMode ? "Conte um pouco sobre você..." : ""}
                          value={formData.bio}
                          onChange={handleChange}
                          disabled={!editMode}
                          style={{ fontSize: "0.85rem", borderRadius: "10px", borderColor: "#E2E8F0" }}
                        />
                      </FormGroup>

                      <hr className="my-3" />

                      <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: "0.5rem" }}>
                        <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
                          <Lock size={16} color="#64748B" />
                          <span style={{ fontSize: "0.85rem", color: "#0F172A", fontWeight: "500" }}>Segurança</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setModalPass(true)}
                          style={{ borderRadius: "8px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#7C3AED" }}
                        >
                          <Lock size={14} /> Alterar Password
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* ── Modal: Alterar Password ──────────────────────────── */}
      <Modal isOpen={modalPass} toggle={() => { setModalPass(false); setPassError(""); }} style={{ maxWidth: "450px" }}>
        <ModalHeader toggle={() => { setModalPass(false); setPassError(""); }} style={{ borderBottom: "1px solid #E2E8F0" }}>
          <span style={{ fontWeight: "700", color: "#0F172A" }}>🔒 Alterar Password</span>
        </ModalHeader>
        <ModalBody>
          {passError && <Alert color="danger" className="py-2">{passError}</Alert>}
          <Form>
            {[
              { label: "Password Actual",    key: "password_atual",         placeholder: "Digite a sua password actual" },
              { label: "Nova Password",       key: "password",               placeholder: "Mínimo 6 caracteres" },
              { label: "Confirmar Password",  key: "password_confirmation",  placeholder: "Repita a nova password" },
            ].map((f) => (
              <FormGroup key={f.key}>
                <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>{f.label}</label>
                <Input
                  type="password" placeholder={f.placeholder}
                  value={passForm[f.key]}
                  onChange={(e) => setPassForm({ ...passForm, [f.key]: e.target.value })}
                  style={{ borderRadius: "10px", borderColor: "#E2E8F0" }}
                />
              </FormGroup>
            ))}
          </Form>
        </ModalBody>
        <ModalFooter style={{ border: "none", paddingTop: 0 }}>
          <Button color="light" onClick={() => { setModalPass(false); setPassError(""); }} style={{ borderRadius: "10px" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleAlterarPassword} disabled={passSaving}
            style={{ borderRadius: "10px", background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", border: "none", color: "white" }}
          >
            {passSaving ? <span className="spinner-border spinner-border-sm" /> : <Lock size={14} />}
            {" "}Alterar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Profile;
