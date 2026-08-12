// Estado do tour: em que fase esta e em que passo.
//
// Fica dentro do AppShell, e nao no main.tsx: o AppShell envolve exatamente as
// paginas autenticadas, e o tour nao deve existir no login nem em /sobre.

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { readTourRecord, shouldOfferTour, writeTourRecord } from "./tourStorage";
import { TOUR_STEPS, TourStep } from "./tourSteps";

type TourPhase = "hidden" | "invite" | "running";

type TourContextValue = {
  phase: TourPhase;
  step: TourStep | null;
  stepIndex: number;
  stepCount: number;
  startTour: () => void;
  next: () => void;
  back: () => void;
  /** Chegou ao fim: grava `done`. */
  finish: () => void;
  /** Saiu antes do fim, ou recusou o convite: grava `dismissed`. */
  dismiss: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

// A leitura do storage acontece uma vez, no primeiro render: se fosse num
// efeito, o convite piscaria na tela de quem ja dispensou.
const initialPhase = (): TourPhase =>
  shouldOfferTour(readTourRecord()) ? "invite" : "hidden";

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [phase, setPhase] = useState<TourPhase>(initialPhase);
  const [stepIndex, setStepIndex] = useState(0);

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

  // Avancar do ultimo passo e concluir; nao existe "proximo" que nao leve a
  // lugar nenhum.
  const next = useCallback(() => {
    setStepIndex((current) => {
      if (current >= TOUR_STEPS.length - 1) {
        finish();
        return current;
      }
      return current + 1;
    });
  }, [finish]);

  const back = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const value = useMemo<TourContextValue>(
    () => ({
      phase,
      step: phase === "running" ? TOUR_STEPS[stepIndex] ?? null : null,
      stepIndex,
      stepCount: TOUR_STEPS.length,
      startTour,
      next,
      back,
      finish,
      dismiss,
    }),
    [phase, stepIndex, startTour, next, back, finish, dismiss]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

/*
 * Devolve `null` fora do provider em vez de lancar: os gatilhos vivem em
 * componentes que tambem sao montados fora das paginas autenticadas. Quem
 * consome trata a ausencia escondendo o gatilho.
 */
export const useTour = () => useContext(TourContext);
