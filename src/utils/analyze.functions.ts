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
    const response = await fetch('http://localhost:3001/api/analyze', {
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
      error: 'Could not reach the backend server. Is it running on port 3001?',
    };
  }
}