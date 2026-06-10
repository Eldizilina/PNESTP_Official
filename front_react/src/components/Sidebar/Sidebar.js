/*eslint-disable*/
import logoPNESTP from "assets/img/PNESTP.png";
import { useState } from "react";
import { NavLink as NavLinkRRD, Link, useNavigate } from "react-router-dom";
import { PropTypes } from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import {
  Collapse, DropdownMenu, DropdownItem, UncontrolledDropdown,
  DropdownToggle, Media, NavbarBrand, Navbar, NavItem,
  NavLink, Nav, Container, Row, Col,
} from "reactstrap";

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleCollapse = () => setCollapseOpen((v) => !v);
  const closeCollapse = () => setCollapseOpen(false);

  // Rota activa
  const activeRoute = (routeName) =>
    window.location.pathname.indexOf(routeName) > -1 ? "active" : "";

  // Links de navegação principais
  const createLinks = (routes) =>
    routes
      .filter((r) => r.layout === "/admin" && r.showInSidebar !== false)
      .filter((r) => !r.perfis || r.perfis.includes(user?.perfil)) // 👈
      .map((prop, key) => (
        <NavItem key={key} className={activeRoute(prop.layout + prop.path)}>
          <NavLink to={prop.layout + prop.path} tag={NavLinkRRD} onClick={closeCollapse}>
            <i className={prop.icon} />
            {prop.name}
          </NavLink>
        </NavItem>
      ));

  const { bgColor, routes, logo } = props;

  // Iniciais do utilizador
  const getIniciais = (nome = "") => {
    const p = nome.trim().split(" ");
    if (p.length === 1) return p[0][0]?.toUpperCase() || "?";
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  const nomeCompleto = user?.name || "Utilizador";
  const primeiroNome = nomeCompleto.split(" ")[0];

  const avatarColor = () => {
    switch (user?.perfil) {
      case "professor_diretor": return "#f5365c";
      case "professor": return "#2dce89";
      default: return "#5e72e4";
    }
  };

  const perfilLabel = () => {
    switch (user?.perfil) {
      case "professor_diretor": return "Professor Diretor";
      case "professor": return "Professor";
      default: return "Aluno";
    }
  };

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>

        {/* Toggler mobile */}
        <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
          <span className="navbar-toggler-icon" />
        </button>

        {/* Logo */}
        {logo && (
          <NavbarBrand tag={Link} to="/">
            <img
              alt="PNESTP"
              src={logoPNESTP}
              style={{
                height: "auto", width: "220px",
                maxHeight: "80px", objectFit: "contain",
                objectPosition: "left center",
              }}
            />
          </NavbarBrand>
        )}

        {/* Avatar mobile (topo da sidebar) */}
        <Nav className="align-items-center d-md-none">
          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
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
                      backgroundColor: avatarColor(), color: "white",
                      fontWeight: "bold", fontSize: "0.85rem",
                      width: "36px", height: "36px",
                    }}
                  >
                    {getIniciais(nomeCompleto)}
                  </span>
                )}
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Olá, {primeiroNome}!</h6>
              </DropdownItem>
              <DropdownItem to="/admin/profile" tag={Link}>
                <i className="ni ni-single-02" /><span>Meu Perfil</span>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={logout} style={{ cursor: "pointer" }}>
                <i className="ni ni-user-run" /><span>Terminar Sessão</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>

        {/* Collapse — conteúdo da sidebar */}
        <Collapse navbar isOpen={collapseOpen}>

          {/* Header do collapse (mobile) */}
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo && (
                <Col className="collapse-brand" xs="6">
                  <Link to="/">
                    <img alt="PNESTP" src={logoPNESTP} />
                  </Link>
                </Col>
              )}
              <Col className="collapse-close" xs="6">
                <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
                  <span /><span />
                </button>
              </Col>
            </Row>
          </div>

          {/* Links de navegação principais */}
          <Nav navbar>{createLinks(routes)}</Nav>

          {/* Divider + perfil do utilizador no fundo */}
          <hr className="my-3" />

          <Nav navbar className="mb-3">

            {/* Link Meu Perfil */}
            <NavItem className={activeRoute("/admin/profile")}>
              <NavLink
                to="/admin/profile"
                tag={NavLinkRRD}
                onClick={closeCollapse}
              >
                <i className="ni ni-single-02" />
                Meu Perfil
              </NavLink>
            </NavItem>

            {/* Utilizador actual — avatar + nome + perfil */}
            <NavItem>
              <div
                className="d-flex align-items-center px-3 py-2"
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fe",
                  margin: "0 0.5rem",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
                onClick={() => { navigate("/admin/profile"); closeCollapse(); }}
              >
                {/* Avatar */}
                {user?.avatar ? (
                  <img
                    alt="avatar"
                    src={`http://localhost:8000/storage/${user.avatar}`}
                    className="rounded-circle"
                    style={{ width: "38px", height: "38px", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%",
                    backgroundColor: avatarColor(), color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold", fontSize: "0.9rem", flexShrink: 0,
                  }}>
                    {getIniciais(nomeCompleto)}
                  </div>
                )}

                {/* Info */}
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <p className="mb-0 font-weight-bold text-dark"
                    style={{ fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {nomeCompleto}
                  </p>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.72rem" }}>
                    {perfilLabel()}
                  </p>
                </div>
              </div>
            </NavItem>

            {/* Logout */}
            <NavItem>
              <NavLink
                href="#"
                onClick={(e) => { e.preventDefault(); logout(); }}
                style={{ color: "#f5365c", cursor: "pointer" }}
              >
                <i className="ni ni-user-run" style={{ color: "#f5365c" }} />
                Terminar Sessão
              </NavLink>
            </NavItem>

          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = {
  routes: [{}],
};

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
};

export default Sidebar;
