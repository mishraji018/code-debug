export type ErrorItem = {
  type: string;
  line: number;
  code: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  rootCause: string;
  explanation: string;
  fix: string;
};

export type AnalysisResult = {
  hasError: boolean;
  // Legacy single-error fields (kept for backward compat)
  error: string;
  line: number;
  snippet: string;
  concept: string;
  conceptDetail: string;
  explanation: string;
  fix: string;
  codeExplanation?: {
    summary: string;
    breakdown: { line: string; explains: string }[];
    tip: string;
  };
  video: {
    title: string;
    channel: string;
    duration: string;
    thumbnail: string;
    url: string;
  };
  // New enhanced fields
  errors?: ErrorItem[];
  correctedCode?: string;
  diff?: string[];
  improvements?: string[];
  lineExplanation?: string[];
  suggestions?: { type: string; message: string }[];
  modeOutput?: { summary: string; detail: string } | null;
};

export const defaultCode: Record<string, string> = {
  python: `# Try clicking "Analyze Full Code"
def greet():
    message = "Hello, world!"
    print(message)
print(username)
greet()
`,
  javascript: `// Try clicking "Analyze Full Code"
function greet() {
  const message = "Hello, world!";
  console.log(message);
}
console.log(username);
greet();
`,
  html: `<!doctype html>
<html>
  <body>
    <h1>Hello</h1>
  </body>
</html>
`,
  css: `.card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(16px);
}
`,
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println(username);
  }
}
`,
};

export const languages = [
  { id: "python", label: "Python", emoji: "🐍" },
  { id: "javascript", label: "JavaScript", emoji: "⚡" },
  { id: "html", label: "HTML", emoji: "🌐" },
  { id: "css", label: "CSS", emoji: "🎨" },
  { id: "java", label: "Java", emoji: "☕" },
] as const;
