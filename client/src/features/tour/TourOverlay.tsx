// Scrim, spotlight e o card do passo.
//
// Nao usa Popover do Radix: ele gerencia foco, clique-fora e dismiss de um jeito
// que precisaria ser desligado item a item para conviver com o overlay, e no
// mobile o comportamento certo nao e popover — e folha ancorada na borda.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Card, Heading, Text } from "@radix-ui/themes";
import { useAnchorRect } from "./useAnchorRect";
import { useTour } from "./TourProvider";
import "./tour.css";

const CARD_WIDTH = 384;
const ANCHOR_GAP = 12;
const VIEWPORT_MARGIN = 16;
/** Espaco minimo abaixo do alvo para o card caber la; senao vai para cima. */
const SPACE_FOR_CARD = 260;

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
  const isMobile = useIsMobile();

  const isRunning = tour?.phase === "running";

  // Guarda para onde devolver o foco. O convite some ao ser aceito, entao o
  // proprio botao que abriu o tour pode nao existir mais na saida — por isso a
  // saida cai no card de perfil e nao neste elemento.
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

  // Sem alvo visivel, o card fica centrado e o spotlight nao aparece. Nenhum
  // texto do tour usa "o botao ao lado", justamente para esse caso.
  const spotlightStyle = rect
    ? {
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      }
    : undefined;

  let cardStyle: React.CSSProperties | undefined;
  let cardPlacement = "floating";

  if (isMobile) {
    // A folha iria cobrir o alvo quando ele mesmo esta embaixo (passos que
    // apontam para a tab bar); nesse caso ela sobe para o topo.
    cardPlacement =
      rect && rect.top > window.innerHeight * 0.55 ? "sheet-top" : "sheet-bottom";
  } else if (rect) {
    const below = window.innerHeight - rect.bottom >= SPACE_FOR_CARD;
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, rect.left),
      window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN
    );

    cardStyle = below
      ? { top: rect.bottom + ANCHOR_GAP, left }
      : { bottom: window.innerHeight - rect.top + ANCHOR_GAP, left };
  } else {
    cardPlacement = "centered";
  }

  return (
    <div className="tour-root">
      {/* Engole cliques no app. Clicar aqui nao fecha: fechar por clique-fora
          num tour e o jeito classico de perder o usuario sem querer. */}
      <div className="tour-scrim" aria-hidden="true" />

      {rect && (
        <div className="tour-spotlight" style={spotlightStyle} aria-hidden="true" />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          className={`tour-card-shell tour-card-${cardPlacement}`}
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

            {step.note && (
              <p className="tour-note serif-accent">{step.note}</p>
            )}

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
