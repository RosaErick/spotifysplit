const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const env = {
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL || ""),
};

export const getApiUrl = (path: string) => `${env.apiUrl}${path}`;
