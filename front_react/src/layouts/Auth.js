import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import routes from '../routes';

const Auth = () => {
  const getRoutes = () => {
    return routes.map((route, key) => {
      if (route.layout === "/auth") {
        return (
          <Route
            key={key}
            path={route.path}
            element={<route.component />} 
            exact={route.exact}
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="main-content">
      <Routes>
        {getRoutes()}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </div>
  );
};

export default Auth;