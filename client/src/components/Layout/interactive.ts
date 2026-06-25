import React from "react";

// Props para transformar um Card em alvo clicavel acessivel (mouse + teclado).
export const interactiveProps = (onClick?: () => void) => {
  if (!onClick) return {};

  return {
    role: "button" as const,
    tabIndex: 0,
    onClick,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    },
  };
};
