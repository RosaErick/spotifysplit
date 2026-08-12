import { handleLogout, withEnv } from "../lib/auth.mjs";

export default withEnv(handleLogout);

export const config = { path: "/api/logout", method: "POST" };
