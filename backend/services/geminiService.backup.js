// ─── GEMINI SERVICE (BACKUP) ──────────────────────────────────────────────────
// This file is kept as backup in case you want to switch back to Google Gemini.
// To re-enable: update analyzeController.js to import analyzeWithGemini from here,
// and set GEMINI_API_KEY in backend/.env
//
// Original endpoint: https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

function buildPrompt({ code, language, lineOffset }) {
  return `You are an expert code debugger.
Analyze this ${language} code carefully.

Code:
\`\`\`${language}
${code}
\`\`\`

IMPORTANT RULES:
- errorLine must be the EXACT line number where the broken code is (NOT a blank line, NOT next line).
- Line numbers start from ${lineOffset}.
- If no real error exists, set hasError to false.

Respond ONLY with raw JSON (no markdown, no backticks):
{
  "hasError": true or false,
  "errorType": "NameError" or null,
  "errorLine": 5 or null,
  "errorCode": "the broken line of code" or null,
  "concept": "variable not defined" or null,
  "conceptExplanation": "simple one line explanation" or null,
  "aiExplanation": "detailed explanation in simple English" or null,
  "fix": "corrected code here" or null,
  "videoSearchQuery": "search query for YouTube",
  "codeExplanation": {
    "summary": "what this code does in 1 sentence",
    "breakdown": [
      { "line": "code snippet", "explains": "what it does" }
    ],
    "tip": "one improvement suggestion"
  }
}`;
}

async function callGemini(prompt, apiKey, retryCount = 0) {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1500, temperature: 0.1 },
    }),
  });

  if (response.status === 429 && retryCount < 3) {
    const delay = (retryCount + 1) * 5000;
    await new Promise((r) => setTimeout(r, delay));
    return callGemini(prompt, apiKey, retryCount + 1);
  }

  return response;
}

export async function analyzeWithGemini({ code, language, lineOffset }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, error: 'GEMINI_API_KEY not set in .env' };

  const prompt = buildPrompt({ code, language, lineOffset });

  let response;
  try {
    response = await callGemini(prompt, apiKey);
  } catch (err) {
    return { ok: false, error: 'Could not reach Gemini API.' };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return { ok: false, error: body?.error?.message || `Gemini error (${response.status})` };
  }

  const apiData = await response.json();
  const rawText = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return { ok: false, error: 'Gemini returned empty response.' };

  try {
    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    const errorLineInSnippet = Number(parsed.errorLine) || 0;
    const absoluteLine =
      parsed.hasError && errorLineInSnippet > 0
        ? Math.max(1, lineOffset + errorLineInSnippet - 1)
        : 0;

    return {
      ok: true,
      result: {
        hasError: !!parsed.hasError,
        errorType: parsed.errorType || '',
        errorLine: absoluteLine,
        errorCode: parsed.errorCode || '',
        concept: parsed.concept || '',
        conceptExplanation: parsed.conceptExplanation || '',
        aiExplanation: parsed.aiExplanation || '',
        fix: parsed.fix || '',
        videoSearchQuery: parsed.videoSearchQuery || `${language} debugging tutorial`,
        codeExplanation: parsed.codeExplanation || null,
      },
    };
  } catch (err) {
    return { ok: false, error: 'Failed to parse Gemini JSON response.' };
  }
}
