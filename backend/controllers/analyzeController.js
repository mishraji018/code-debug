import { analyzeWithGroq } from '../services/groqService.js';

export async function analyze(req, res) {
  const {
    code,
    language = 'unknown',
    mode = 'debug',       // debug | optimize | explain | refactor
    level = 'beginner',  // beginner | intermediate | expert
    lineOffset = 1,
  } = req.body;

  // ── Input validation ─────────────────────────────────────────
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return res.status(400).json({
      ok: false,
      error: 'code is required and must be a non-empty string.',
    });
  }

  const validModes = ['debug', 'optimize', 'explain', 'refactor'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({
      ok: false,
      error: `mode must be one of: ${validModes.join(', ')}.`,
    });
  }

  const validLevels = ['beginner', 'intermediate', 'expert'];
  if (!validLevels.includes(level)) {
    return res.status(400).json({
      ok: false,
      error: `level must be one of: ${validLevels.join(', ')}.`,
    });
  }

  // ── Call Groq ─────────────────────────────────────────────────
  const result = await analyzeWithGroq({ code, language, mode, level, lineOffset });

  if (!result.ok) {
    return res.status(502).json(result);
  }

  return res.status(200).json(result);
}
