// Spotlight e o card do passo.
//
// Renderiza dentro da arvore do AppShell, sem portal. Portalizar para o `body`
// so seria necessario para ficar acima do modal do Radix, e o tour deixou de
// conviver com ele: de dentro do body o overlay perdia os tokens do tema (todos
// escopados em `.radix-themes`) e herdava o `pointer-events: none` que o Dialog
// poe no body.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Card, Heading, Text } from "@radix-ui/themes";
import { useAnchorRect } from "./useAnchorRect";
import { useTour } from "./TourProvider";
import "./tour.css";

const CARD_WIDTH = 384;
const ANCHOR_GAP = 12;
const VIEWPORT_MARGIN = 16;
/** Altura suposta antes da primeira medida, so para o primeiro frame. */
const CARD_HEIGHT_GUESS = 240;

const MOBILE_QUERY = "(max-width: 820px)";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);

    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
};

const formatStepNumber = (index: number) => String(index + 1).padStart(2, "0");

export const TourOverlay = () => {
  const tour = useTour();
  const step = tour?.step ?? null;
  const rect = useAnchorRect(step?.anchors ?? null);

  const cardRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT_GUESS);
  const isMobile = useIsMobile();

  const isRunning = tour?.phase === "running";

  useEffect(() => {
    if (!isRunning) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;

    return () => {
      const fallback = document.querySelector<HTMLElement>(".profile-card");
      const target = returnFocusRef.current;
      const alive = target && document.body.contains(target) ? target : fallback;
      alive?.focus?.({ preventScroll: true });
    };
  }, [isRunning]);

  // A altura real do card decide se ele cabe acima ou abaixo da ancora. Sem
  // medir, uma ancora mais alta que a viewport empurrava o card para fora da
  // tela — era o passo dos rankings aparecendo cortado.
  useLayoutEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const measure = () => setCardHeight(element.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [isRunning, step?.id]);

  // `preventScroll` importa: sem ele o navegador rola ate o card e briga com o
  // `scrollIntoView` que ja levou o alvo para o centro.
  useLayoutEffect(() => {
    if (!isRunning) return;
    cardRef.current?.focus({ preventScroll: true });
  }, [isRunning, tour?.stepIndex]);

  const handleWindowKey = useCallback(
    (event: KeyboardEvent) => {
      if (!tour) return;

      if (event.key === "Escape") {
        event.stopPropagation();
        tour.dismiss();
        return;
      }
      if (event.key === "ArrowRight") tour.next();
      if (event.key === "ArrowLeft") tour.back();
    },
    [tour]
  );

  useEffect(() => {
    if (!isRunning) return;
    window.addEventListener("keydown", handleWindowKey);
    return () => window.removeEventListener("keydown", handleWindowKey);
  }, [isRunning, handleWindowKey]);

  // Trap manual: o card e filho do mesmo root da app, entao `inert` no resto da
  // arvore nao serve. Sao tres ou quatro botoes, o ciclo e barato.
  const trapTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const focusables = cardRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled])"
    );
    if (!focusables || focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === cardRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!tour || !isRunning || !step) return null;

  const { stepIndex, stepCount, next, back, dismiss } = tour;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === stepCount - 1;

  const spotlightStyle = rect
    ? {
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      }
    : undefined;

  let cardStyle: React.CSSProperties | undefined;
  let placement = "floating";

  if (isMobile) {
    // A folha iria cobrir o alvo quando ele mesmo esta embaixo (os passos que
    // apontam para a tab bar); nesse caso ela sobe para o topo.
    placement =
      rect && rect.top > window.innerHeight * 0.55 ? "sheet-top" : "sheet-bottom";
  } else if (rect) {
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - ANCHOR_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - ANCHOR_GAP - VIEWPORT_MARGIN;

    let top: number;
    if (spaceBelow >= cardHeight) {
      top = rect.bottom + ANCHOR_GAP;
    } else if (spaceAbove >= cardHeight) {
      top = rect.top - ANCHOR_GAP - cardHeight;
    } else {
      // Ancora maior que a viewport (os dois rankings juntos, por exemplo):
      // nao ha lado bom, entao o card centraliza.
      top = (viewportHeight - cardHeight) / 2;
    }

    const maxTop = Math.max(
      VIEWPORT_MARGIN,
      viewportHeight - cardHeight - VIEWPORT_MARGIN
    );
    top = Math.min(Math.max(VIEWPORT_MARGIN, top), maxTop);

    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, rect.left),
      Math.max(VIEWPORT_MARGIN, window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN)
    );

    cardStyle = { top, left };
  } else {
    placement = "centered";
  }

  return (
    <div className="tour-root">
      {/* Transparente: engole cliques no app sem escurecer nada. Quem escurece
          e a sombra do spotlight — um scrim por cima cobriria o proprio buraco
          e o alvo destacado ficaria escuro tambem. */}
      <div className="tour-blocker" aria-hidden="true" />

      {/* Sem ancora nao ha spotlight, entao o escurecimento vem daqui. */}
      {!rect && <div className="tour-scrim" aria-hidden="true" />}

      {rect && (
        <div className="tour-spotlight" style={spotlightStyle} aria-hidden="true" />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          className={`tour-card-shell tour-card-${placement}`}
          style={cardStyle}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card
            className="tour-card"
            size="3"
            ref={cardRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`tour-title-${step.id}`}
            aria-describedby={`tour-body-${step.id}`}
            onKeyDown={trapTab}
          >
            <p className="tour-progress" aria-hidden="true">
              {Array.from({ length: stepCount }).map((_, index) => (
                <span
                  key={index}
                  className={index === stepIndex ? "tour-progress-current" : undefined}
                >
                  {formatStepNumber(index)}
                </span>
              ))}
            </p>

            <Heading
              id={`tour-title-${step.id}`}
              className="display-heading tour-title"
              size="4"
            >
              {step.title}
            </Heading>

            <Text
              as="p"
              id={`tour-body-${step.id}`}
              size="2"
              color="gray"
              className="tour-body"
            >
              {step.body}
            </Text>

            {step.note && <p className="tour-note serif-accent">{step.note}</p>}

            <div className="tour-footer">
              <Button
                variant="ghost"
                color="gray"
                className="tour-exit clickable-control"
                onClick={dismiss}
              >
                Sair
              </Button>

              <div className="tour-footer-nav">
                {!isFirst && (
                  <Button
                    variant="ghost"
                    color="gray"
                    className="clickable-control"
                    onClick={back}
                  >
                    Voltar
                  </Button>
                )}
                <Button variant="soft" className="clickable-control" onClick={next}>
                  {isLast ? "Concluir" : "Avançar"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
