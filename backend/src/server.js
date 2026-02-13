// backend/src/server.js
require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0) {
        return callback(new Error("CORS_ORIGIN not configured"), false);
      }

      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ FIX: Express 5 no acepta "*" aquí
app.options(/.*/, cors());

const authRouter = require("./auth");
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
