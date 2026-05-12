import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import 'assets/css/custom.css';
import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import { AuthProvider } from "./hooks/useAuth";
import PrivateRoute from "./components/PrivateRoute";

import Home        from "./views/Home";
import AdminLayout from "layouts/Admin.js";
import AuthLayout  from "layouts/Auth.js";
import EntrarSala  from "./views/EntrarSala"; // 👈 aqui

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/"     element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Rotas públicas */}
        <Route path="/auth/*" element={<AuthLayout />} />

        {/* Entrada por link — pública, mas redireciona para login se não autenticado */}
        <Route path="/entrar/:codigo" element={<EntrarSala />} />

        {/* Rotas protegidas — COM sidebar */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute perfis={["professor", "professor_diretor", "aluno"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);