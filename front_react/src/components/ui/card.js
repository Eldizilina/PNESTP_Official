// src/components/ui/card.jsx
import React from "react";

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl shadow p-4 ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);
