import Home           from "./views/Home";
import PainelProfessor from "./views/PainelProfessor";
import PainelAluno     from "./views/PainelAluno";
import PaginaSala      from "./views/PaginaSala";
import Profile         from "./views/examples/Profile";
import Register        from "./views/examples/Register";
import Login           from "./views/examples/Login";

const routes = [
  // ── Auth (sem sidebar) ────────────────────────────────
  {
    path:      "/login",
    name:      "Login",
    component: Login,
    layout:    "/auth",
  },
  {
    path:      "/register",
    name:      "Cadastro",
    component: Register,
    layout:    "/auth",
  },

  // ── Admin (COM sidebar) ───────────────────────────────
  {
    path:          "/professor",
    name:          "Painel Professor",
    icon:          "ni ni-tv-2 text-primary",
    component:     PainelProfessor,
    layout:        "/admin",
    showInSidebar: true,
  },
  {
    path:          "/aluno",
    name:          "Painel Aluno",
    icon:          "ni ni-single-02 text-yellow",
    component:     PainelAluno,
    layout:        "/admin",
    showInSidebar: true,
  },
  {
    path:          "/sala/:id",
    name:          "Sala",
    icon:          "ni ni-book-bookmark text-info",
    component:     PaginaSala,
    layout:        "/admin",
    showInSidebar: false,
  },
  {
    path:          "/profile",
    name:          "Meu Perfil",
    icon:          "ni ni-circle-08 text-pink",
    component:     Profile,
    layout:        "/admin",
    showInSidebar: false,
  },
];

export default routes;