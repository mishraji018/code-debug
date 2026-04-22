import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

import { TopNavbar } from "@/components/debugger/TopNavbar";
import { CodeEditor, type CodeEditorHandle } from "@/components/debugger/CodeEditor";
import { FloatingActions } from "@/components/debugger/FloatingActions";
import { AIOutputPanel } from "@/components/debugger/AIOutputPanel";
import { Code2, Bot } from "lucide-react";
import { defaultCode, type AnalysisResult } from "@/lib/mockAnalysis";
import { analyzeCode } from "@/utils/analyze.functions";

export function DebuggerApp() {
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>(defaultCode.python);
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionStartLine, setSelectionStartLine] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mobileTab, setMobileTab] = useState<"editor" | "results">("editor");

  // Ref to CodeEditor for scrollToLine
  const editorRef = useRef<CodeEditorHandle>(null);

  const handleLangChange = (l: string) => {
    setLanguage(l);
    setCode(defaultCode[l] ?? "");
    setResult(null);
  };

  const handleSelectionChange = useCallback((text: string, startLine: number) => {
    setSelectedText(text);
    setSelectionStartLine(startLine);
  }, []);

  // Scroll editor to a specific line (used from output panel)
  const scrollToLine = useCallback((line: number) => {
    editorRef.current?.scrollToLine(line);
    setMobileTab("editor");
  }, []);

  const runAnalysis = useCallback(
    async (mode: "full" | "selected") => {
      if (mode === "selected" && !selectedText.trim()) {
        toast.warning("⚠️ Please select some code first!");
        return;
      }

      const snippet = mode === "full" ? code : selectedText;
      if (!snippet.trim()) {
        toast.warning("⚠️ Editor is empty — write some code first!");
        return;
      }
      const lineOffset = mode === "full" ? 1 : selectionStartLine;

      setLoading(true);
      setResult(null);
      setMobileTab("results");

      try {
        const response = await analyzeCode({
          data: { code: snippet, language, lineOffset },
        });

        if (!response.ok) {
          toast.error(response.error);
          setLoading(false);
          return;
        }

        const r = response.result;

        // Warn if first error line is blank
        if (r.hasError && r.errorLine > 0) {
          const lines = code.split('\n');
          const lineIdx = r.errorLine - 1;
          if (lines[lineIdx] !== undefined && lines[lineIdx].trim() === "") {
            toast.warning(`Line detection issue — check line ${r.errorLine}`);
          }
        }

        setResult({
          hasError: r.hasError,
          error: r.errorType,
          line: r.errorLine,
          snippet: r.errorCode,
          concept: r.concept,
          conceptDetail: r.conceptExplanation,
          explanation: r.aiExplanation,
          fix: r.fix,
          codeExplanation: r.codeExplanation,
          // Enhanced fields
          errors: r.errors,
          correctedCode: r.correctedCode,
          diff: r.diff,
          improvements: r.improvements,
          lineExplanation: r.lineExplanation,
          suggestions: r.suggestions,
          modeOutput: r.modeOutput,
          video: {
            title: r.hasError
              ? `${r.errorType} — ${r.concept}`
              : "Clean Code Best Practices",
            channel: "YouTube Search",
            duration: "",
            thumbnail: "",
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(r.videoSearchQuery)}`,
          },
        });
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong analyzing your code.");
      } finally {
        setLoading(false);
      }
    },
    [code, language, selectedText, selectionStartLine],
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

  // Apply Fix: replace editor content with correctedCode from AI
  const handleApplyFix = useCallback((correctedCode: string) => {
    setCode(correctedCode);
    setResult(null);
    setMobileTab("editor");
    toast.success("✅ Fix applied! Review the corrected code.");
  }, []);

  const hasSelection = selectedText.trim().length > 0;

  // All error lines for multi-highlight
  const errorLines = result?.errors?.map((e) => e.line).filter((l) => l > 0) ?? [];

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNavbar
        language={language}
        onLanguageChange={handleLangChange}
        onNewFile={handleNewFile}
      />

      {/* Mobile tabs — only visible below md */}
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

      {/* Main grid — 2 columns on desktop, stacked on mobile */}
      <main
        className="
          flex flex-1 gap-3 overflow-hidden p-3
          md:grid md:gap-4 md:p-4
          md:[grid-template-columns:2fr_1fr]
          xl:[grid-template-columns:2.5fr_1fr]
        "
      >
        {/* Editor panel */}
        <section
          className={`relative min-h-0 ${
            mobileTab === "editor" ? "flex" : "hidden"
          } md:flex md:h-full md:flex-col`}
        >
          <div className="relative h-full w-full">
            <CodeEditor
              ref={editorRef}
              value={code}
              onChange={setCode}
              language={language}
              errorLine={result?.hasError ? result.line : null}
              errorLines={errorLines}
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
          className={`min-h-0 overflow-hidden ${
            mobileTab === "results" ? "flex h-[40vh]" : "hidden"
          } md:flex md:h-full md:flex-col`}
        >
          <div className="h-full w-full overflow-hidden">
            <AIOutputPanel
              loading={loading}
              result={result}
              onScrollToLine={scrollToLine}
              onApplyFix={handleApplyFix}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default DebuggerApp;
