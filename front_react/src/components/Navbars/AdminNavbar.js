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
        <Nav className="align-items-center d-none d-md-flex ml-auto" navbar>
          <UncontrolledDropdown nav>
            <DropdownToggle className="pr-0" nav>
              <Media className="align-items-center">

                {/* Avatar — foto se existir, iniciais se não */}
                {user?.avatar ? (
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="avatar"
                      src={`http://localhost:8000/storage/${user.avatar}`}
                      style={{ width: "36px", height: "36px", objectFit: "cover" }}
                    />
                  </span>
                ) : (
                  <span
                    className="avatar avatar-sm rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: avatarColor(),
                      color: "white", fontWeight: "bold",
                      fontSize: "0.85rem", width: "36px", height: "36px",
                    }}
                  >
                    {getIniciais(nomeCompleto)}
                  </span>
                )}

                {/* Nome + perfil */}
                <Media className="ml-2 d-none d-lg-block">
                  <span className="mb-0 text-sm font-weight-bold text-white">
                    {primeiroNome}
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: 0.75, color: "white" }}>
                    {perfilLabel()}
                  </span>
                </Media>
              </Media>
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-arrow" right>

              {/* Cabeçalho do dropdown */}
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Olá, {primeiroNome}!</h6>
              </DropdownItem>

              {/* Link para o perfil */}
              <DropdownItem to="/admin/profile" tag={Link}>
                <i className="ni ni-single-02" />
                <span>Meu Perfil</span>
              </DropdownItem>

              {/* Link para o dashboard do perfil correcto */}
              <DropdownItem
                to={
                  user?.perfil === "aluno"
                    ? "/admin/aluno"
                    : "/admin/professor"
                }
                tag={Link}
              >
                <i className="ni ni-tv-2" />
                <span>Meu Painel</span>
              </DropdownItem>

              <DropdownItem divider />

              {/* Logout */}
              <DropdownItem onClick={logout} style={{ cursor: "pointer" }}>
                <i className="ni ni-user-run" />
                <span>Terminar Sessão</span>
              </DropdownItem>

            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
