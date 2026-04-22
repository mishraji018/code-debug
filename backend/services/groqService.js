const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Current recommended model (replaces decommissioned llama3-70b-8192)

/**
 * Build the enhanced structured debugging prompt.
 */
function buildPrompt({ code, language, lineOffset, mode = 'debug', level = 'beginner' }) {
  return `You are an expert software engineer, code debugger, and AI pair programmer.

Your task is to analyze the given code and return a COMPLETE structured JSON response.

GLOBAL INSTRUCTIONS:
- Always analyze FULL code context
- Line numbers must match EXACT input (starting from line 1)
- Return ONLY valid JSON (no markdown, no extra text)
- Be precise, do not hallucinate
- Detect MULTIPLE errors if present

INPUT:
{
  "code": "${language} code provided below",
  "mode": "${mode}",
  "level": "${level}"
}

Code to analyze:
${code}

OUTPUT FORMAT (STRICT JSON — return ONLY this, no extra text, no backticks):
{
  "hasError": true or false,

  "errors": [
    {
      "type": "ReferenceError",
      "line": 6,
      "code": "exact line from input",
      "severity": "high | medium | low",
      "message": "short error message",
      "rootCause": "why it happens",
      "explanation": "simple explanation based on level: ${level}",
      "fix": "corrected code snippet"
    }
  ],

  "correctedCode": "FULL fixed version of the entire code",

  "diff": [
    "- broken line",
    "+ fixed line"
  ],

  "improvements": [
    "improvement suggestion 1",
    "improvement suggestion 2"
  ],

  "lineExplanation": [
    "Line 1: what this line does",
    "Line 2: what this line does"
  ],

  "suggestions": [
    {
      "type": "optimization | security | readability | best-practice",
      "message": "specific suggestion"
    }
  ],

  "modeOutput": {
    "summary": "Based on mode '${mode}': brief summary of what was done",
    "detail": "detailed output relevant to the mode"
  },

  "videoSearchQuery": "YouTube search query related to the main issue or concept"
}

RULES:
- severity: high = breaks code, medium = bad practice, low = improvement
- level: ${level} → ${level === 'beginner' ? 'use simple, plain English' : level === 'intermediate' ? 'use technical terms with brief explanations' : 'use deep technical reasoning'}
- mode: ${mode} → ${mode === 'debug' ? 'focus on finding and fixing all errors' : mode === 'optimize' ? 'focus on performance improvements' : mode === 'explain' ? 'explain every part of the code clearly' : 'rewrite as clean, well-structured code'}
- If no errors exist: "hasError": false and "errors": []
- errorLine must NEVER be a blank line`;
}

import axios from 'axios';

/**
 * Call Groq API with retry on rate limit.
 */
async function callGroq(prompt, apiKey, retryCount = 0) {
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2500,
        temperature: 0.1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        validateStatus: () => true, // Resolve all status codes so we can handle them manually
      }
    );

    if (response.status === 429 && retryCount < 3) {
      const delay = (retryCount + 1) * 3000;
      console.warn(`[Groq] Rate limited. Retrying in ${delay / 1000}s... (attempt ${retryCount + 1})`);
      await new Promise((r) => setTimeout(r, delay));
      return callGroq(prompt, apiKey, retryCount + 1);
    }

    // Mock the fetch Response API so the rest of the code works unmodified
    return {
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      json: async () => response.data,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Main service — orchestrates prompt → Groq → parsed result.
 */
export async function analyzeWithGroq({ code, language, lineOffset, mode = 'debug', level = 'beginner' }) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return { ok: false, error: 'Server misconfiguration: GROQ_API_KEY not set in .env' };
  }

  const prompt = buildPrompt({ code, language, lineOffset, mode, level });

  let response;
  try {
    response = await callGroq(prompt, apiKey);
  } catch (err) {
    console.error('[Groq] Network error:', err.message);
    return { ok: false, error: 'Could not reach Groq API. Check your internet connection.' };
  }

  if (!response.ok) {
    let errorMsg = `Groq API error (${response.status})`;
    try {
      const body = await response.json();
      errorMsg = body?.error?.message || errorMsg;
    } catch (_) {}
    console.error('[Groq] API error:', errorMsg);
    return { ok: false, error: errorMsg };
  }

  let apiData;
  try {
    apiData = await response.json();
  } catch (err) {
    return { ok: false, error: 'Failed to parse Groq response.' };
  }

  const rawText = apiData?.choices?.[0]?.message?.content;
  if (!rawText) {
    console.error('[Groq] Empty response:', JSON.stringify(apiData).slice(0, 300));
    return { ok: false, error: 'Groq returned an empty response. Please try again.' };
  }

  let parsed;
  try {
    const clean = rawText.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch (err) {
    console.error('[Groq] JSON parse failed. Raw text:', rawText.slice(0, 400));
    return { ok: false, error: 'Groq returned malformed JSON. Please try again.' };
  }

  // ── Normalise to what the frontend expects ──────────────────
  // Support both the new multi-error format AND the old single-error format
  const firstError = parsed.errors?.[0];

  const errorLineInSnippet = Number(firstError?.line) || 0;
  const absoluteLine =
    parsed.hasError && errorLineInSnippet > 0
      ? Math.max(1, lineOffset + errorLineInSnippet - 1)
      : 0;

  return {
    ok: true,
    result: {
      // Legacy single-error fields (for existing frontend)
      hasError: !!parsed.hasError,
      errorType: firstError?.type || '',
      errorLine: absoluteLine,
      errorCode: firstError?.code || '',
      concept: firstError?.rootCause || '',
      conceptExplanation: firstError?.message || '',
      aiExplanation: firstError?.explanation || '',
      fix: firstError?.fix || '',
      videoSearchQuery: parsed.videoSearchQuery || `${language} debugging tutorial`,

      // New enhanced fields
      errors: (parsed.errors || []).map((e) => ({
        ...e,
        line: parsed.hasError && e.line > 0 ? Math.max(1, lineOffset + e.line - 1) : e.line,
      })),
      correctedCode: parsed.correctedCode || '',
      diff: parsed.diff || [],
      improvements: parsed.improvements || [],
      lineExplanation: parsed.lineExplanation || [],
      suggestions: parsed.suggestions || [],
      modeOutput: parsed.modeOutput || null,
    },
  };
}
