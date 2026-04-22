import { useState, useCallback } from "react";
import { toast } from "sonner";
import { TopNavbar } from "@/components/debugger/TopNavbar";
import { CodeEditor } from "@/components/debugger/CodeEditor";
import { FloatingActions } from "@/components/debugger/FloatingActions";
import { AIOutputPanel } from "@/components/debugger/AIOutputPanel";
import { Code2, Bot } from "lucide-react";
import { defaultCode, mockAnalysis, type AnalysisResult } from "@/lib/mockAnalysis";

export function DebuggerApp() {
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>(defaultCode.python);
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionStartLine, setSelectionStartLine] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mobileTab, setMobileTab] = useState<"editor" | "results">("editor");

  const handleLangChange = (l: string) => {
    setLanguage(l);
    setCode(defaultCode[l] ?? "");
    setResult(null);
  };

  const handleSelectionChange = useCallback((text: string, startLine: number) => {
    setSelectedText(text);
    setSelectionStartLine(startLine);
  }, []);

  const runAnalysis = useCallback(
    (mode: "full" | "selected") => {
      if (mode === "selected" && !selectedText.trim()) {
        toast.warning("⚠️ Please select some code first!");
        return;
      }

      // Snippet to analyze + line offset
      const snippet = mode === "full" ? code : selectedText;
      const lineOffset = mode === "full" ? 0 : selectionStartLine;

      // For the demo we still use the mock response, but we adjust the
      // reported line number based on the offset so the error highlights
      // the correct line in the editor.
      // actual line = selectionStartLine + errorLineInSnippet - 1
      const errorLineInSnippet = mockAnalysis.line;
      const adjustedLine =
        mode === "full"
          ? errorLineInSnippet
          : Math.max(1, lineOffset + errorLineInSnippet - 1);

      setLoading(true);
      setResult(null);
      setMobileTab("results");

      // (snippet would be sent to the AI here)
      void snippet;

      setTimeout(() => {
        setResult({ ...mockAnalysis, line: adjustedLine });
        setLoading(false);
      }, 2000);
    },
    [code, selectedText, selectionStartLine],
  );

  const handleClear = () => {
    setCode("");
    setResult(null);
    setSelectedText("");
    setSelectionStartLine(1);
  };

  const handleNewFile = () => {
    setCode(defaultCode[language] ?? "");
    setResult(null);
  };

  const hasSelection = selectedText.trim().length > 0;

  return (
    <div className="flex h-screen flex-col">
      <TopNavbar
        language={language}
        onLanguageChange={handleLangChange}
        onNewFile={handleNewFile}
      />

      {/* Mobile tabs */}
      <div className="flex gap-1 px-3 pt-3 md:hidden">
        {(["editor", "results"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={`glass flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold transition-all ${
              mobileTab === t ? "bg-primary/20 text-primary" : "text-muted-foreground"
            }`}
          >
            {t === "editor" ? <Code2 className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            {t === "editor" ? "Editor" : "Results"}
          </button>
        ))}
      </div>

      <main className="flex flex-1 gap-3 overflow-hidden p-3 md:gap-4 md:p-4">
        {/* Editor panel */}
        <section
          className={`relative flex-1 md:basis-3/5 ${
            mobileTab === "editor" ? "flex" : "hidden"
          } md:flex`}
        >
          <div className="relative h-full w-full">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              errorLine={result?.line ?? null}
              onSelectionChange={handleSelectionChange}
            />
            <FloatingActions
              onAnalyzeFull={() => runAnalysis("full")}
              onAnalyzeSelected={() => runAnalysis("selected")}
              onClear={handleClear}
              loading={loading}
              hasSelection={hasSelection}
            />
          </div>
        </section>

        {/* Output panel */}
        <section
          className={`flex-1 md:basis-2/5 ${
            mobileTab === "results" ? "flex" : "hidden"
          } md:flex`}
        >
          <div className="h-full w-full">
            <AIOutputPanel loading={loading} result={result} />
          </div>
        </section>
      </main>
    </div>
  );
}
