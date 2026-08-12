import { handleRefreshToken, withEnv } from "../lib/auth.mjs";

export default withEnv(handleRefreshToken);

export const config = { path: "/api/refresh_token", method: "POST" };
