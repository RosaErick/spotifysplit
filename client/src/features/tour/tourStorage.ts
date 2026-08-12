// Persistencia do tour numa chave so, no padrao `sonarstats_*` ja usado pelo
// tema e pelo estudio de imagem.
//
// JSON em vez de tres booleanos: uma leitura, uma escrita, e evoluir o formato
// depois nao exige migracao. Nao ha chave legada — o tour e feature nova.

import { TOUR_VERSION } from "./tourSteps";

const TOUR_KEY = "sonarstats_tour";

export type TourStatus = "done" | "dismissed";

export type TourRecord = {
  /** Versao do conteudo do tour quando ele foi resolvido. */
  v: number;
  status: TourStatus;
  /** Nao alimenta nenhuma regra hoje; existe para debug e para evitar migracao. */
  at: string;
};

const isTourRecord = (value: unknown): value is TourRecord => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.v === "number" &&
    (record.status === "done" || record.status === "dismissed")
  );
};

/*
 * Leitura defensiva: localStorage pode lancar (Safari privado, storage cheio) e
 * o valor pode ter sido editado a mao. Qualquer coisa fora do formato e tratada
 * como "nunca viu o tour" — o custo de errar para esse lado e um convite a mais,
 * nao uma tela quebrada.
 */
export const readTourRecord = (): TourRecord | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(TOUR_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isTourRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeTourRecord = (status: TourStatus) => {
  if (typeof window === "undefined") return;

  try {
    const record: TourRecord = {
      v: TOUR_VERSION,
      status,
      at: new Date().toISOString(),
    };
    window.localStorage.setItem(TOUR_KEY, JSON.stringify(record));
  } catch {
    // Sem storage o tour volta a ser oferecido na proxima visita. E aceitavel:
    // a alternativa seria quebrar a home por causa de um convite.
  }
};

/*
 * Quem dispensou nao e reconvidado, nem por versao nova: reaparecer para quem
 * disse "agora nao" e exatamente a sugestao que o requisito proibe. O caminho de
 * volta e permanente e explicito — "Como funciona", no menu.
 *
 * Quem concluiu volta a ser convidado quando entram passos novos.
 */
export const shouldOfferTour = (record: TourRecord | null): boolean => {
  if (!record) return true;
  if (record.status === "dismissed") return false;

  return record.v < TOUR_VERSION;
};
