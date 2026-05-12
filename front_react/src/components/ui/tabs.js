// src/components/ui/tabs.jsx
import React, { useState } from "react";

export const Tabs = ({ defaultValue, children, className = "" }) => {
  const [active, setActive] = useState(defaultValue);

  const context = {
    active,
    setActive,
  };

  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { context })
      )}
    </div>
  );
};

export const TabsList = ({ children }) => (
  <div className="flex gap-2 mb-4">{children}</div>
);

export const TabsTrigger = ({ value, children, context }) => {
  const isActive = context?.active === value;
  return (
    <button
      onClick={() => context?.setActive(value)}
      className={`px-3 py-1 rounded ${
        isActive ? "bg-blue-600 text-white" : "bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, context }) => {
  if (context?.active !== value) return null;
  return <div>{children}</div>;
};
