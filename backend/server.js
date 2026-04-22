import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import analyzeRouter from './routes/analyze.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: "https://code-debug-fawn.vercel.app",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: '1mb' }));

// ── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 20,               // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please wait a moment.' },
});
app.use('/api', limiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api', analyzeRouter);

// ── Health check ──────────────────────────────────────────────
app.get('/', (_, res) => res.json({ status: 'OK', service: 'AI Code Debugger API' }));

// ── 404 handler ───────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ ok: false, error: 'Route not found.' }));

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ ok: false, error: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
