import "dotenv/config";
import app from "./app";
import { env, validateEnv } from "./config/env";

validateEnv();

app.listen(env.port, () => {
  console.log(`Server is up on port ${env.port}`);
});
