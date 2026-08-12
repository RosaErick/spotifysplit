import { handleLogin, withEnv } from "../lib/auth.mjs";

export default withEnv(handleLogin);

// Prefixo /api porque cliente e API dividem a mesma origem e o React Router
// ja usa /login.
export const config = { path: "/api/login", method: "GET" };
