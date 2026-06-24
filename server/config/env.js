const requiredEnvVars = [
  "CLIENT_ID",
  "CLIENT_SECRET",
  "REDIRECT_URI",
  "CLIENT_URL",
  "SPOTIFY_SCOPES",
];

const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  port: process.env.PORT || 3000,
  clientId: getRequiredEnv("CLIENT_ID"),
  clientSecret: getRequiredEnv("CLIENT_SECRET"),
  redirectUri: getRequiredEnv("REDIRECT_URI"),
  clientUrl: getRequiredEnv("CLIENT_URL"),
  spotifyScopes: getRequiredEnv("SPOTIFY_SCOPES"),
};

export const validateEnv = () => {
  requiredEnvVars.forEach(getRequiredEnv);
};
