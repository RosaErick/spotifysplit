const requiredEnvVars = [
  "CLIENT_ID",
  "CLIENT_SECRET",
  "REDIRECT_URI",
  "CLIENT_URL",
  "SPOTIFY_SCOPES",
];

const getRequiredEnv = (source, key) => {
  const value = source[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

// A validacao roda dentro do handler, nao no import: function serverless nao
// tem um start onde falhar cedo, e efeito colateral em import esconderia o
// erro num cold start silencioso.
export const readEnv = (source) => {
  requiredEnvVars.forEach((key) => getRequiredEnv(source, key));

  return {
    clientId: source.CLIENT_ID,
    clientSecret: source.CLIENT_SECRET,
    redirectUri: source.REDIRECT_URI,
    clientUrl: source.CLIENT_URL,
    spotifyScopes: source.SPOTIFY_SCOPES,
  };
};
