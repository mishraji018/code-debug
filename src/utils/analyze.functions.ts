import { createServerFn } from "@tanstack/react-start";

type AnalyzeInput = {
  code: string;
  language: string;
  lineOffset: number;
};

export const analyzeCode = createServerFn({ method: "POST" })
  .inputValidator((input: AnalyzeInput) => {
    if (typeof input?.code !== "string") throw new Error("code must be a string");
    if (typeof input?.language !== "string") throw new Error("language must be a string");
    const lineOffset = Number.isFinite(input?.lineOffset) ? input.lineOffset : 0;
    return { code: input.code, language: input.language, lineOffset };
  })
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      return {
        ok: false as const,
        error: "AI service is not configured (LOVABLE_API_KEY missing).",
      };
    }

    const systemPrompt = `You are an expert code debugger. Analyze the user's code and find the FIRST real bug or runtime error. Be precise about the line number within the snippet provided. Always reply by calling the report_analysis tool — never with prose.`;

    const userPrompt = `Language: ${data.language}\n\nCode:\n\`\`\`${data.language}\n${data.code}\n\`\`\``;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_analysis",
            description: "Report the analysis of the user's code.",
            parameters: {
              type: "object",
              properties: {
                hasError: { type: "boolean" },
                errorType: { type: "string", description: "e.g. NameError, TypeError. Empty string if no error." },
                errorLine: { type: "number", description: "1-based line number within the provided snippet. 0 if no error." },
                errorCode: { type: "string", description: "The exact problematic line of code. Empty if no error." },
                concept: { type: "string", description: "Short concept name, e.g. 'Variable not defined'." },
                conceptExplanation: { type: "string", description: "One-line plain-English explanation." },
                aiExplanation: { type: "string", description: "2-4 sentence beginner-friendly explanation." },
                fix: { type: "string", description: "Corrected code snippet." },
                videoSearchQuery: { type: "string", description: "YouTube search query for a tutorial." },
              },
              required: [
                "hasError",
                "errorType",
                "errorLine",
                "errorCode",
                "concept",
                "conceptExplanation",
                "aiExplanation",
                "fix",
                "videoSearchQuery",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_analysis" } },
    };

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error("AI gateway request failed:", err);
      return { ok: false as const, error: "Could not reach the AI service. Please try again." };
    }

    if (response.status === 429) {
      return { ok: false as const, error: "Rate limit reached. Please wait a moment and try again." };
    }
    if (response.status === 402) {
      return { ok: false as const, error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." };
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("AI gateway error:", response.status, text);
      return { ok: false as const, error: `AI service error (${response.status}).` };
    }

    const payload = await response.json();
    const toolCall = payload?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    if (!argsRaw) {
      console.error("No tool call in AI response:", JSON.stringify(payload).slice(0, 500));
      return { ok: false as const, error: "AI returned no analysis. Please try again." };
    }

    let parsed: {
      hasError: boolean;
      errorType: string;
      errorLine: number;
      errorCode: string;
      concept: string;
      conceptExplanation: string;
      aiExplanation: string;
      fix: string;
      videoSearchQuery: string;
    };
    try {
      parsed = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
    } catch (err) {
      console.error("Failed to parse tool args:", err, argsRaw);
      return { ok: false as const, error: "AI returned an invalid response. Please try again." };
    }

    // Map snippet-relative line back to file-absolute line using offset.
    const errorLineInSnippet = Number(parsed.errorLine) || 0;
    const absoluteLine =
      parsed.hasError && errorLineInSnippet > 0
        ? Math.max(1, data.lineOffset + errorLineInSnippet - 1)
        : 0;

    return {
      ok: true as const,
      result: {
        hasError: !!parsed.hasError,
        errorType: parsed.errorType || "",
        errorLine: absoluteLine,
        errorCode: parsed.errorCode || "",
        concept: parsed.concept || "",
        conceptExplanation: parsed.conceptExplanation || "",
        aiExplanation: parsed.aiExplanation || "",
        fix: parsed.fix || "",
        videoSearchQuery: parsed.videoSearchQuery || `${data.language} ${parsed.errorType || "debugging"} tutorial`,
      },
    };
  });
