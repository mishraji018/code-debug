import axios from 'axios';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; 

function buildChatPrompt(prompt, context) {
  let finalPrompt = `You are an expert AI assistant integrated into a developer's Notes application.
Your goal is to provide clear, accurate, and helpful answers to the user's questions.

`;

  if (context && context.trim() !== '') {
    finalPrompt += `Here is the current content of the note the user is looking at. Use this context if it is relevant to their question:
--- NOTE CONTEXT START ---
${context}
--- NOTE CONTEXT END ---

`;
  }

  finalPrompt += `User's question/prompt:
${prompt}

Please provide your answer below in Markdown format. Be concise but thorough.`;

  return finalPrompt;
}

async function callGroq(promptText, apiKey, retryCount = 0) {
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 2500,
        temperature: 0.5,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        validateStatus: () => true,
      }
    );

    if (response.status === 429 && retryCount < 3) {
      const delay = (retryCount + 1) * 3000;
      console.warn(`[Groq Chat] Rate limited. Retrying in ${delay / 1000}s... (attempt ${retryCount + 1})`);
      await new Promise((r) => setTimeout(r, delay));
      return callGroq(promptText, apiKey, retryCount + 1);
    }

    return {
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      json: async () => response.data,
    };
  } catch (err) {
    throw err;
  }
}

export async function chatWithGroq({ prompt, context }) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return { ok: false, error: 'Server misconfiguration: GROQ_API_KEY not set in .env' };
  }

  const fullPrompt = buildChatPrompt(prompt, context);

  let response;
  try {
    response = await callGroq(fullPrompt, apiKey);
  } catch (err) {
    console.error('[Groq Chat] Network error:', err.message);
    return { ok: false, error: 'Could not reach Groq API. Check your internet connection.' };
  }

  if (!response.ok) {
    let errorMsg = `Groq API error (${response.status})`;
    try {
      const body = await response.json();
      errorMsg = body?.error?.message || errorMsg;
    } catch (_) {}
    console.error('[Groq Chat] API error:', errorMsg);
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
    console.error('[Groq Chat] Empty response:', JSON.stringify(apiData).slice(0, 300));
    return { ok: false, error: 'Groq returned an empty response. Please try again.' };
  }

  return {
    ok: true,
    result: {
      answer: rawText.trim()
    },
  };
}
