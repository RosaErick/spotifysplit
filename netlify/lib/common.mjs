// Gera uma string aleatoria com seguranca criptografica (CSPRNG).
// Usada como `state` anti-CSRF do fluxo OAuth — nao pode ser previsivel.
// Web Crypto em vez de `node:crypto`: e global no Node 20 e mantem o codigo
// igual ao da alternativa em Workers.
export const generateRandomString = (length) => {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
};

// Le um cookie do header cru `Cookie` (sem depender de cookie-parser).
export const readCookie = (cookieHeader, name) => {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }

  return null;
};

// Monta o valor de `Set-Cookie`. `maxAge` em segundos (o header usa segundos;
// o `res.cookie` do Express usava milissegundos).
export const buildSetCookie = (name, value, { maxAge, secure, path = "/" }) => {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];

  if (secure) attributes.push("Secure");

  return attributes.join("; ");
};
