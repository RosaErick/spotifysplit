// Deteccao de navegador embutido de app (Instagram, Facebook, TikTok...).
//
// Esses webviews tem cookie jar proprio: nao existe sessao do Spotify dentro
// deles, entao o login sempre exige digitar email e senha, mesmo para quem esta
// logado no Spotify no navegador de verdade. Alguns ainda quebram o redirect do
// OAuth no meio do caminho.
//
// Nao da para consertar isso pelo app — o jeito e avisar e pedir para abrir no
// navegador do sistema.

const IN_APP_SIGNATURES = [
  "FBAN", // Facebook (iOS)
  "FBAV", // Facebook (Android)
  "FB_IAB", // Facebook in-app browser
  "Instagram",
  "TikTok",
  "BytedanceWebview",
  "Line/",
  "LinkedInApp",
  "Snapchat",
  "Pinterest",
];

/*
 * Deteccao por user agent e imprecisa por natureza: identifica os webviews mais
 * comuns, nao todos. Errar para menos e aceitavel — quem nao for detectado
 * apenas nao ve o aviso, e o fluxo segue igual. Errar para mais custaria um
 * aviso desnecessario, por isso a lista e de assinaturas explicitas e nao de
 * heuristica generica de webview.
 */
export const isInAppBrowser = (): boolean => {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent || "";
  return IN_APP_SIGNATURES.some((signature) => userAgent.includes(signature));
};
