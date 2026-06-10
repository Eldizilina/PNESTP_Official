import { Link } from "react-router-dom";
import {
  DropdownMenu, DropdownItem, UncontrolledDropdown,
  DropdownToggle, Navbar, Nav, Container, Media,
} from "reactstrap";
import { useAuth } from "../../hooks/useAuth";

const AdminNavbar = (props) => {
  const { user, logout } = useAuth();

  const nomeCompleto = user?.name || "Utilizador";
  const primeiroNome = nomeCompleto.split(" ")[0];

  // Iniciais para avatar padrão
  const getIniciais = (nome = "") => {
    const p = nome.trim().split(" ");
    if (p.length === 1) return p[0][0]?.toUpperCase() || "?";
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  // Cor do avatar conforme perfil
  const avatarColor = () => {
    switch (user?.perfil) {
      case "professor_diretor": return "#f5365c"; // vermelho
      case "professor":         return "#2dce89"; // verde
      default:                  return "#5e72e4"; // azul (aluno)
    }
  };

  const perfilLabel = () => {
    switch (user?.perfil) {
      case "professor_diretor": return "Professor Diretor";
      case "professor":         return "Professor";
      default:                  return "Aluno";
    }
  };

  return (
    <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
      <Container fluid>

        {/* Título da página actual (passado via props) */}
        <Link
          className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
          to="/"
        >
          {props.brandText}
        </Link>

        {/* Lado direito — dropdown do utilizador */}
       
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
