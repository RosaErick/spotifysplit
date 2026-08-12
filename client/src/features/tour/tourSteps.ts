// Conteudo do tour: so dados e texto, sem JSX e sem DOM.
//
// Todos os passos ficam na home, na ordem de leitura da propria pagina: quem
// voce e, seus rankings, como ler os numeros, para onde ir, como ajustar.

export type TourStep = {
  id: string;
  title: string;
  body: string;
  /** Ressalva honesta sobre o dado, em Fraunces italico — a "letra miuda" do encarte. */
  note?: string;
  /** Seletores em ordem de prioridade; vence o primeiro que estiver visivel. */
  anchors: string[];
};

/*
 * Incrementar SOMENTE quando entrar passo novo, nunca por ajuste de texto —
 * senao isto vira contador de deploy e reconvida quem ja concluiu a cada
 * correcao de virgula.
 */
export const TOUR_VERSION = 1;

export const TOUR_STEPS: TourStep[] = [
  {
    id: "profile",
    title: "Seu cartão e a imagem pra baixar",
    body: "Seus números de conta ficam aqui: seguidores, playlists e artistas que você segue. O botão \"Gerar imagem\" monta um pôster do seu ranking ou um mosaico de capas, pra baixar.",
    anchors: [".profile-card"],
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
    body: "Vai de 0 a 100 e é calculado pelo Spotify a partir do total de reproduções da faixa e de quão recentes elas são — de todo mundo, não das suas. Não mede qualidade: um clássico com bilhões de plays antigos pode pontuar abaixo de um lançamento em alta. A mesma música em single e em álbum recebe notas separadas, e a nota do artista sai da popularidade das faixas dele.",
    note: "Os gêneros embaixo do nome são a classificação do próprio Spotify, feita por artista e não por faixa — por isso às vezes destoam do que a pessoa lança hoje.",
    anchors: ['[data-tour-id="popularity"]', '[data-tour-id="ranking-row"]'],
  },
  {
    id: "navigation",
    title: "Busca e biblioteca",
    body: "A busca varre o catálogo inteiro do Spotify — músicas, artistas e álbuns. A biblioteca mostra o que você salvou: músicas curtidas, álbuns e os artistas que segue.",
    anchors: [".mobile-tabbar", ".nav-actions"],
  },
  {
    id: "appearance",
    title: "Cor, tema e o que o app não faz",
    body: "Dá pra alternar entre claro e escuro e escolher a cor de destaque; a escolha fica salva neste navegador. Em \"Sobre\" está o resto: o login acontece no Spotify, o app só lê os seus dados e não guarda nada.",
    anchors: [".mobile-tab-more", ".utility-actions"],
  },
];
