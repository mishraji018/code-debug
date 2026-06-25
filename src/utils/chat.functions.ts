// Note: using localhost or render URL based on env if available, else localhost:3001
const API_URL = 'http://localhost:3001/api/chat';

export async function chatWithAI({ prompt, context }: { prompt: string; context?: string }) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        context: context || '',
      }),
    });

    const json = await response.json();

    if (!json.ok) {
      return { ok: false as const, error: json.error || 'Chat failed.' };
    }

    return { ok: true as const, result: json.result };

  } catch (err) {
    console.error('chatWithAI error:', err);
    return {
      ok: false as const,
      error: 'Could not reach the backend server. Please check your internet connection and try again.',
    };
  }
}
