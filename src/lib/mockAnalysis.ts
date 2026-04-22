export type AnalysisResult = {
  error: string;
  line: number;
  snippet: string;
  concept: string;
  conceptDetail: string;
  explanation: string;
  fix: string;
  video: {
    title: string;
    channel: string;
    duration: string;
    thumbnail: string;
    url: string;
  };
};

export const mockAnalysis: AnalysisResult = {
  error: "NameError",
  line: 5,
  snippet: "print(username)",
  concept: "Variable not defined",
  conceptDetail:
    "A variable was used before it was given a value. Python looks up the name and can't find it.",
  explanation:
    "You are trying to use a variable 'username' that has not been declared anywhere above. Python cannot find it in memory, so it raises a NameError. Define the variable before you use it.",
  fix: "username = 'YourName'\nprint(username)",
  video: {
    title: "Python NameError - Variable Not Defined Explained",
    channel: "Programming with Mosh",
    duration: "8:24",
    thumbnail: "https://img.youtube.com/vi/TqPzwenhMj0/0.jpg",
    url: "https://youtube.com/watch?v=TqPzwenhMj0",
  },
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
