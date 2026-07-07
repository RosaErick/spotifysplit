import { randomBytes } from "crypto";

// Gera uma string aleatoria com seguranca criptografica (CSPRNG).
// Usada como `state` anti-CSRF do fluxo OAuth — nao pode ser previsivel.
export const generateRandomString = (length) =>
  randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
