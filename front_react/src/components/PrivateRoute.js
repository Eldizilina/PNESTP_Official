import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = ({ children, perfis = [] }) => {
  const { user } = useAuth();

  // Não autenticado → vai para cadastro
  if (!user) return <Navigate to="/auth/register" replace />;

  // Perfil não autorizado para esta rota → vai para o dashboard correcto
  if (perfis.length > 0 && !perfis.includes(user.perfil)) {
    if (user.perfil === "professor_diretor") return <Navigate to="/admin/dashboard" replace />;
    if (user.perfil === "professor")         return <Navigate to="/professor/dashboard" replace />;
    return <Navigate to="/aluno/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;