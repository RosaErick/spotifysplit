import express from "express";
import authRoutes from "./routes/auth";

const app = express();

app.get("/", (req, res) => {
  res.send("health check");
});

app.use(authRoutes);

export default app;
