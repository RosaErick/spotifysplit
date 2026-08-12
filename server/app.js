import express from "express";
import authRoutes from "./routes/auth";
import { env } from "./config/env";

const app = express();

// CORS restrito ao cliente configurado (defesa em profundidade): so o
// CLIENT_URL pode ler respostas da API. Tambem responde ao preflight.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", env.clientUrl);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("health check");
});

// Prefixo /api para o dev local falar o mesmo contrato do deploy same-origin,
// onde a raiz pertence ao SPA (o React Router ja usa /login).
app.use("/api", authRoutes);

export default app;
