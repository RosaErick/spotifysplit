import { handleCallback, withEnv } from "../lib/auth.mjs";

export default withEnv(handleCallback);

export const config = { path: "/api/callback", method: "GET" };
