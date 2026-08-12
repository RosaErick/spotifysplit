// Conteudo do tour: so dados e texto, sem JSX e sem DOM.
//
// Os dois primeiros passos sao interativos: o tour pede para abrir o estudio de
// imagem e so avanca quando o modal abre de fato. Os quatro seguintes rodam na
// home, na ordem de leitura da propria pagina.

export type TourStep = {
  id: string;
  title: string;
  body: string;
  /** Ressalva honesta sobre o dado, em Fraunces italico — a "letra miuda" do encarte. */
  note?: string;
  /** Seletores em ordem de prioridade; vence o primeiro que estiver visivel. */
  anchors: string[];
  /**
   * O passo espera o usuario abrir o estudio. O tour nao bloqueia cliques aqui,
   * avanca sozinho quando o modal aparece, e "Avancar" pula o passo de dentro
   * do modal (que nao teria ancora).
   */
  opensStudio?: boolean;
  /** O passo vive dentro do modal; sai sozinho quando o modal fecha. */
  insideStudio?: boolean;
};

/*
 * Incrementar SOMENTE quando entrar passo novo, nunca por ajuste de texto —
 * senao isto vira contador de deploy e reconvida quem ja concluiu a cada
 * correcao de virgula.
 */
export const TOUR_VERSION = 1;

export const TOUR_STEPS: TourStep[] = [
  {
    id: "studio-open",
    title: "Uma imagem com os seus stats",
    body: "Esse botão monta uma imagem pronta pra baixar a partir do que você mais ouve. Abre ele pra ver os dois formatos.",
    anchors: [".profile-action"],
    opensStudio: true,
  },
  {
    id: "studio-formats",
    title: "Pôster ou mosaico",
    body: "O pôster lista o seu ranking de artistas ou de faixas. O mosaico monta uma grade de capas de álbum ou de fotos de artista. Nos dois dá pra escolher o período e a cor, e exportar em PNG ou JPG.",
    anchors: ['[data-tour-id="studio-formats"]'],
    insideStudio: true,
  },
  {
    id: "rankings",
    title: "Top artistas e top faixas",
    body: "Os dois rankings vêm prontos do Spotify — o app não recalcula nada. Abrindo cada um dá pra trocar o período: últimas 4 semanas, últimos 6 meses ou o último ano.",
    note: "Os períodos são aproximados; quem define o corte é o Spotify. E \"top álbuns\" não existe: a API só devolve top de artistas e de faixas.",
    anchors: ['[data-tour-id="rankings"]'],
  },
  {
    id: "popularity",
    title: "Popularidade é um número de catálogo",
    body: "Vai de 0 a 100 e é calculado pelo Spotify a partir do total de reproduções da faixa e de quão recentes elas são — de todo mundo, não das suas. Não mede qualidade: um clássico com bilhões de plays antigos pode pontuar abaixo de um lançamento em alta.",
    note: "Os gêneros embaixo do nome são a classificação do próprio Spotify, feita por artista e não por faixa — por isso às vezes destoam do que a pessoa lança hoje.",
    anchors: ['[data-tour-id="popularity"]', '[data-tour-id="ranking-row"]'],
  },
  {
    id: "navigation",
    title: "Busca e biblioteca",
    body: "A busca varre o catálogo inteiro do Spotify. A biblioteca mostra o que você salvou: músicas curtidas, álbuns e os artistas que segue.",
    anchors: [".mobile-tabbar", ".nav-actions"],
  },
  {
    id: "appearance",
    title: "Cor e tema",
    body: "Dá pra alternar entre claro e escuro e escolher a cor de destaque. A escolha fica salva neste navegador.",
    anchors: [".mobile-tab-more", ".utility-actions"],
  },
];

/**
 * Proximo indice na direcao dada, pulando os passos que so existem com o modal
 * do estudio aberto. Funcao pura para poder ser testada sem DOM.
 */
export const resolveStepIndex = (
  from: number,
  direction: 1 | -1,
  studioOpen: boolean
): number => {
  let target = from + direction;

  while (
    target >= 0 &&
    target < TOUR_STEPS.length &&
    TOUR_STEPS[target].insideStudio &&
    !studioOpen
  ) {
    target += direction;
  }

  return target;
};
