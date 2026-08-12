// Estado do tour: em que fase esta, em que passo, e se o estudio esta aberto.
//
// Fica dentro do AppShell, e nao no main.tsx: o AppShell envolve exatamente as
// paginas autenticadas, e o tour nao deve existir no login nem em /sobre.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { readTourRecord, shouldOfferTour, writeTourRecord } from "./tourStorage";
import { resolveStepIndex, TOUR_STEPS, TourStep } from "./tourSteps";

type TourPhase = "hidden" | "invite" | "running";

type TourContextValue = {
  phase: TourPhase;
  step: TourStep | null;
  stepIndex: number;
  stepCount: number;
  /** O modal do estudio esta aberto agora. */
  studioOpen: boolean;
  startTour: () => void;
  next: () => void;
  back: () => void;
  finish: () => void;
  dismiss: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

const STUDIO_SELECTOR = '[data-tour-id="studio-dialog"]';

// A leitura do storage acontece uma vez, no primeiro render: se fosse num
// efeito, o convite piscaria na tela de quem ja dispensou.
const initialPhase = (): TourPhase =>
  shouldOfferTour(readTourRecord()) ? "invite" : "hidden";

/*
 * Presenca de um elemento no DOM. O modal do Radix vive num portal fora da
 * arvore do AppShell, entao observar o `body` e mais simples e mais robusto do
 * que levantar o estado `open` do ImageStudioDialog ate aqui.
 */
const useElementPresence = (selector: string, active: boolean) => {
  const [present, setPresent] = useState(false);

  useEffect(() => {
    if (!active) {
      setPresent(false);
      return;
    }

    const check = () => setPresent(Boolean(document.querySelector(selector)));
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [selector, active]);

  return present;
};

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [phase, setPhase] = useState<TourPhase>(initialPhase);
  const [stepIndex, setStepIndex] = useState(0);

  const isRunning = phase === "running";
  const studioOpen = useElementPresence(STUDIO_SELECTOR, isRunning);

  // Ref porque `next`/`back` sao lidos dentro do updater do setState, onde o
  // valor capturado pela closure ficaria velho.
  const studioOpenRef = useRef(studioOpen);
  studioOpenRef.current = studioOpen;

  const step = isRunning ? TOUR_STEPS[stepIndex] ?? null : null;

  const startTour = useCallback(() => {
    setStepIndex(0);
    setPhase("running");
  }, []);

  const finish = useCallback(() => {
    writeTourRecord("done");
    setPhase("hidden");
  }, []);

  const dismiss = useCallback(() => {
    writeTourRecord("dismissed");
    setPhase("hidden");
  }, []);

  /*
   * O passo de dentro do modal so existe com o modal aberto. Quem clicou
   * "Avancar" em vez de abrir pula direto para o seguinte, nos dois sentidos —
   * senao o tour pararia num passo sem ancora e sem contexto.
   */
  const resolveIndex = useCallback(
    (from: number, direction: 1 | -1) =>
      resolveStepIndex(from, direction, studioOpenRef.current),
    []
  );

  const next = useCallback(() => {
    setStepIndex((current) => {
      const target = resolveIndex(current, 1);

      if (target > TOUR_STEPS.length - 1) {
        finish();
        return current;
      }

      return target;
    });
  }, [finish, resolveIndex]);

  const back = useCallback(() => {
    setStepIndex((current) => Math.max(0, resolveIndex(current, -1)));
  }, [resolveIndex]);

  // Avanco automatico: o modal abriu no passo que pedia isso, ou fechou no
  // passo que vivia dentro dele.
  useEffect(() => {
    if (!step) return;

    if (step.opensStudio && studioOpen) {
      setStepIndex((current) => current + 1);
      return;
    }

    if (step.insideStudio && !studioOpen) {
      setStepIndex((current) => {
        const target = current + 1;
        if (target > TOUR_STEPS.length - 1) {
          finish();
          return current;
        }
        return target;
      });
    }
  }, [step, studioOpen, finish]);

  const value = useMemo<TourContextValue>(
    () => ({
      phase,
      step,
      stepIndex,
      stepCount: TOUR_STEPS.length,
      studioOpen,
      startTour,
      next,
      back,
      finish,
      dismiss,
    }),
    [phase, step, stepIndex, studioOpen, startTour, next, back, finish, dismiss]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

/*
 * Devolve `null` fora do provider em vez de lancar: os gatilhos vivem em
 * componentes que tambem sao montados fora das paginas autenticadas. Quem
 * consome trata a ausencia escondendo o gatilho.
 */
export const useTour = () => useContext(TourContext);
