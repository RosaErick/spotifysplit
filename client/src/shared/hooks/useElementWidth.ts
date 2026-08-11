// Largura real de um elemento, observada em tempo real.
// Usado por layouts que precisam do valor em px (canvas, captura de imagem),
// onde porcentagem de CSS nao resolve.

import { useEffect, useRef, useState } from "react";

export const useElementWidth = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () =>
      setWidth(Math.round(element.getBoundingClientRect().width));

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
};
