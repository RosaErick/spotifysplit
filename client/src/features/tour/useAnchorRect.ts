// Resolve o alvo de um passo e acompanha o retangulo dele.
//
// `querySelector` sozinho nao serve: os dois conjuntos de navegacao existem
// sempre no DOM e sao escondidos por media query (`.nav-actions` some abaixo de
// 820px, `.mobile-tabbar` some acima). O criterio precisa ser visibilidade
// computada — assim o mesmo passo aponta para a tab bar no mobile e para o
// header no desktop, sem nenhum branch de layout.

import { useEffect, useState } from "react";

const isVisible = (element: HTMLElement) => {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility();
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

/** Primeiro seletor da lista que resolve para um elemento visivel. */
export const resolveAnchor = (selectors: string[]): HTMLElement | null => {
  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element && isVisible(element)) return element;
  }

  return null;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * `null` quando nao ha passo ativo ou quando nenhum seletor resolveu — nesse
 * caso o card do tour cai no modo centrado, sem spotlight.
 */
export const useAnchorRect = (selectors: string[] | null): DOMRect | null => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const key = selectors?.join("|") ?? "";

  useEffect(() => {
    if (!selectors) {
      setRect(null);
      return;
    }

    const target = resolveAnchor(selectors);
    if (!target) {
      setRect(null);
      return;
    }

    const measure = () => setRect(target.getBoundingClientRect());

    // Traz o alvo para a tela antes de medir. `behavior` e JS, entao a regra
    // global de prefers-reduced-motion no CSS nao alcanca isto.
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(target);

    // `capture` porque o scroll pode acontecer num container interno, e o evento
    // de scroll nao borbulha.
    window.addEventListener("scroll", measure, { passive: true, capture: true });
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
    // `key` cobre a mudanca de passo; `selectors` e constante de modulo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return rect;
};
