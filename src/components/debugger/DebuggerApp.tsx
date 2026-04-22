import { useState, useCallback } from "react";
import { TopNavbar } from "@/components/debugger/TopNavbar";
import { CodeEditor } from "@/components/debugger/CodeEditor";
import { FloatingActions } from "@/components/debugger/FloatingActions";
import { AIOutputPanel } from "@/components/debugger/AIOutputPanel";
import { Code2, Bot } from "lucide-react";
import { defaultCode, mockAnalysis, type AnalysisResult } from "@/lib/mockAnalysis";

export function DebuggerApp() {
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>(defaultCode.python);
  const [selection, setSelection] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mobileTab, setMobileTab] = useState<"editor" | "results">("editor");

  const handleLangChange = (l: string) => {
    setLanguage(l);
    setCode(defaultCode[l] ?? "");
    setResult(null);
  };

  const runAnalysis = useCallback(() => {
    setLoading(true);
    setResult(null);
    setMobileTab("results");
    setTimeout(() => {
      setResult(mockAnalysis);
      setLoading(false);
    }, 2000);
  }, []);

  const handleClear = () => {
    setCode("");
    setResult(null);
    setSelection("");
  };

  const handleNewFile = () => {
    setCode(defaultCode[language] ?? "");
    setResult(null);
  };

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
              onSelectionChange={setSelection}
            />
            <FloatingActions
              onAnalyzeFull={runAnalysis}
              onAnalyzeSelected={runAnalysis}
              onClear={handleClear}
              loading={loading}
              hasSelection={selection.trim().length > 0}
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
