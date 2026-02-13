const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const pool = require("./db");

const router = express.Router();

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /auth/register
router.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
  }

  const { name, email, password } = parsed.data;

  try {
    const exists = await pool.query("SELECT id FROM users WHERE email=$1 LIMIT 1", [
      email.toLowerCase(),
    ]);
    if (exists.rowCount) return res.status(409).json({ error: "Email ya registrado" });

    const password_hash = await bcrypt.hash(password, 12);

    const created = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [name, email.toLowerCase(), password_hash]
    );

    const user = created.rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.status(201).json({ token, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error interno" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  try {
    const q = await pool.query(
      `SELECT id, name, email, role, password_hash
       FROM users
       WHERE email=$1
       LIMIT 1`,
      [email.toLowerCase()]
    );

    if (!q.rowCount) return res.status(401).json({ error: "Credenciales incorrectas" });

    const user = q.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales incorrectas" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
