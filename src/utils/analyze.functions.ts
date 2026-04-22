export async function analyzeCode({ data }: {
  data: {
    code: string;
    language: string;
    lineOffset: number;
    mode?: 'debug' | 'optimize' | 'explain' | 'refactor';
    level?: 'beginner' | 'intermediate' | 'expert';
  }
}) {
  try {
    const response = await fetch('https://code-debug-fdpr.onrender.com/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: data.code,
        language: data.language,
        lineOffset: data.lineOffset,
        mode: data.mode ?? 'debug',
        level: data.level ?? 'beginner',
      }),
    });

    const json = await response.json();

    if (!json.ok) {
      return { ok: false as const, error: json.error || 'Analysis failed.' };
    }

    return { ok: true as const, result: json.result };

  } catch (err) {
    console.error('analyzeCode error:', err);
    return {
      ok: false as const,
      error: 'Could not reach the backend server. Please check your internet connection and try again.',
    };
  }
}