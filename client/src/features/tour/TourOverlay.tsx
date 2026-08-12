// Scrim, spotlight e o card do passo.
//
// Vai para um portal no `body` porque `.app-background` tem `isolation:
// isolate`, ou seja, e um contexto de empilhamento proprio: de dentro dele
// nenhum z-index alcanca o modal do Radix, que e irmao no `body`. E o passo de
// dentro do estudio precisa ficar acima do modal.

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Card, Heading, Text, Theme } from "@radix-ui/themes";
import { useAppTheme } from "../../components/Layout/AppThemeProvider";
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
  const { theme, accent } = useAppTheme();
  const step = tour?.step ?? null;
  // Precisa vir antes dos hooks de foco: dentro do modal o tour nao pode
  // disputar o foco com o focus trap do Radix.
  const stepInsideStudio = Boolean(step?.insideStudio);
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
    if (!isRunning || stepInsideStudio) return;
    cardRef.current?.focus({ preventScroll: true });
  }, [isRunning, tour?.stepIndex, stepInsideStudio]);

  const handleWindowKey = useCallback(
    (event: KeyboardEvent) => {
      if (!tour) return;

      // Dentro do estudio o Esc pertence ao modal: ele fecha, e o tour avanca
      // sozinho por causa disso.
      if (event.key === "Escape") {
        if (stepInsideStudio) return;
        event.stopPropagation();
        tour.dismiss();
        return;
      }
      if (event.key === "ArrowRight") tour.next();
      if (event.key === "ArrowLeft") tour.back();
    },
    [tour, stepInsideStudio]
  );

  useEffect(() => {
    if (!isRunning) return;
    window.addEventListener("keydown", handleWindowKey);
    return () => window.removeEventListener("keydown", handleWindowKey);
  }, [isRunning, handleWindowKey]);

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

  const insideStudio = Boolean(step.insideStudio);
  const opensStudio = Boolean(step.opensStudio);

  /*
   * O escurecimento vem da sombra de 9999px do spotlight, nunca de um scrim por
   * cima: um scrim de tela cheia cobriria o proprio buraco e o alvo destacado
   * ficaria escuro tambem. O scrim solido so entra quando nao ha ancora.
   *
   * Dentro do estudio quem escurece e o overlay do proprio modal; aqui fica so
   * o anel.
   */
  const spotlightClass = insideStudio
    ? "tour-spotlight tour-spotlight-ring"
    : "tour-spotlight";

  const spotlightStyle = rect
    ? {
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      }
    : undefined;

  // O bloqueio de clique sai quando o passo espera uma acao do usuario: no
  // passo que pede para abrir o estudio, o clique precisa chegar no botao.
  const blocksClicks = !opensStudio && !insideStudio;

  let cardStyle: React.CSSProperties | undefined;
  let placement = "floating";

  if (insideStudio) {
    // Folha na base em qualquer largura: o modal ocupa o centro da tela, e um
    // card ancorado nas abas cobriria justamente a previa que ele descreve.
    placement = "sheet-bottom";
  } else if (isMobile) {
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

    const maxTop = Math.max(VIEWPORT_MARGIN, viewportHeight - cardHeight - VIEWPORT_MARGIN);
    top = Math.min(Math.max(VIEWPORT_MARGIN, top), maxTop);

    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, rect.left),
      Math.max(VIEWPORT_MARGIN, window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN)
    );

    cardStyle = { top, left };
  } else {
    placement = "centered";
  }

  return createPortal(
    <Theme
      appearance={theme}
      accentColor={accent}
      grayColor="sand"
      radius="large"
      scaling="100%"
      hasBackground={false}
      className="tour-theme"
    >
      {blocksClicks && <div className="tour-blocker" aria-hidden="true" />}

      {/* Sem ancora nao ha spotlight, entao o escurecimento precisa vir daqui. */}
      {!rect && !insideStudio && <div className="tour-scrim" aria-hidden="true" />}

      {rect && (
        <div className={spotlightClass} style={spotlightStyle} aria-hidden="true" />
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
            aria-modal={insideStudio ? undefined : true}
            aria-labelledby={`tour-title-${step.id}`}
            aria-describedby={`tour-body-${step.id}`}
            onKeyDown={insideStudio ? undefined : trapTab}
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
                  {isLast ? "Concluir" : opensStudio ? "Pular" : "Avançar"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </Theme>,
    document.body
  );
};
