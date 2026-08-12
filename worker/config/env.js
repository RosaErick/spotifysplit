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

// No Workers as variaveis chegam por requisicao (binding `env`), nao em
// `process.env`. Por isso a validacao roda na borda da requisicao e nao no
// import: e o equivalente ao `validateEnv()` do servidor local.
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
