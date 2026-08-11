// Destinos de compartilhamento por link externo.
//
// LIMITE IMPORTANTE: nenhuma rede aceita receber um ARQUIVO por URL — os
// endpoints publicos (`intent`, `share/url`) so levam texto e link. Por isso o
// fluxo do estudio e: baixar a imagem e abrir a rede com a legenda pronta, para
// o usuario anexar o arquivo.
//
// O Instagram nao entra nesta lista porque nao tem endpoint de composicao
// nenhum: nem imagem, nem texto. O unico caminho real ate o story e a Web Share
// API (folha nativa do celular, que anexa o arquivo) — ver SocialShareRow.

export interface SocialTarget {
  value: string;
  label: string;
  buildUrl: (text: string, url: string) => string;
}

const encode = encodeURIComponent;

export const socialTargets: SocialTarget[] = [
  {
    value: "x",
    label: "X",
    buildUrl: (text, url) =>
      `https://x.com/intent/post?text=${encode(text)}&url=${encode(url)}`,
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    buildUrl: (text, url) => `https://wa.me/?text=${encode(`${text} ${url}`)}`,
  },
  {
    value: "telegram",
    label: "Telegram",
    buildUrl: (text, url) =>
      `https://t.me/share/url?url=${encode(url)}&text=${encode(text)}`,
  },
];

/** Fallback de desktop: nao ha composicao por URL, so a home do Instagram. */
export const INSTAGRAM_URL = "https://www.instagram.com/";
