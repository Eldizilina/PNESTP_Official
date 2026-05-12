import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { Container } from "reactstrap";
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import routes from "routes.js";

const Admin = (props) => {
  const mainContent = React.useRef(null);
  const location    = useLocation();

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

const getRoutes = (routes) => {
  console.log("=== ROTAS REGISTADAS ===");
  return routes.map((prop, key) => {
    if (prop.layout === "/admin") {
      console.log(`Rota: ${prop.path} → ${prop.component?.name}`);
      return (
        <Route
          path={prop.path}
          element={<prop.component />}
          key={key}
        />
      );
    }
    return null;
  });
};
  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (path.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "PNESTP";
  };

  return (
    <>
      <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/",
          imgSrc: require("../assets/img/brand/argon-react.png"),
          imgAlt: "PNESTP",
        }}
      />
      <div className="main-content" ref={mainContent}>
        <AdminNavbar
          {...props}
          brandText={getBrandText(location.pathname)}
        />
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Container fluid>
          <AdminFooter />
        </Container>
      </div>
    </>
  );
};

export default Admin;