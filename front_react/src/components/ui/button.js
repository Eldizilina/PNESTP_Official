// src/components/ui/button.jsx
import React from "react";

export const Button = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${className}`}
  >
    {children}
  </button>
);
