import { useState, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // ─── LOGIN ───────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/login", { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // ✅ Agora aponta para as rotas dentro do AdminLayout
      const perfil = data.user.perfil;
      if (perfil === "professor_diretor") navigate("/admin/professor");
      else if (perfil === "professor") navigate("/admin/professor");
      else navigate("/admin/aluno");

    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao fazer login";
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── REGISTER ────────────────────────────────────────────
  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post("/register", formData);

      // Guarda token e utilizador mas NÃO faz navigate
      // (o Cadastro.js trata do redirect para o login)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const msg = Object.values(errors).flat().join(" | ");
        throw new Error(msg);
      }
      throw new Error(err.response?.data?.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  // ─── LOGOUT ──────────────────────────────────────────────
  const logout = async () => {
    try { await api.post("/logout"); } catch (_) { }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth/register");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return ctx;
};