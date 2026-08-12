// Ambiente comum dos testes de componente.
//
// O jsdom nao implementa nada de layout nem de ponteiro, e o Radix Themes conta
// com as duas coisas. Os stubs abaixo existem so para os componentes montarem;
// nenhum deles simula comportamento real, e nenhum teste deve depender do que
// eles devolvem.

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// O `Reveal` anima com `whileInView` do framer-motion. Os filhos sao
// renderizados de qualquer jeito — so a animacao depende do observer —, entao um
// stub inerte basta para a arvore montar.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}

// Cada teste comeca com storage limpo: estado vazado entre testes de
// persistencia e exatamente o tipo de falso verde que estes testes existem para
// impedir.
beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
