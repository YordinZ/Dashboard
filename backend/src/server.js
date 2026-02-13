require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.use(helmet());
app.use(express.json());

// ✅ CORS DEBE IR ANTES DE LAS RUTAS
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "").split(",").filter(Boolean),
    credentials: true,
  })
);

// Ahora sí las rutas
const authRouter = require("./auth");
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("API running on http://localhost:4000");
});
