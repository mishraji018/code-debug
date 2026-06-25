import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Lightbulb,
  Sparkles,
  Youtube,
  Copy,
  Check,
  Bot,
  Play,
  CheckCircle2,
  BookOpen,
  List,
  ArrowUpRight,
  Wand2,
  GitCompare,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { AnalysisResult, ErrorItem } from "@/lib/mockAnalysis";
import { chatWithAI } from "@/utils/chat.functions";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface AIOutputPanelProps {
  loading: boolean;
  result: AnalysisResult | null;
  onScrollToLine: (line: number) => void;
  onApplyFix: (correctedCode: string) => void;
  codeContext: string; // The current code to send to AI
}

export function AIOutputPanel({ loading, result, onScrollToLine, onApplyFix, codeContext }: AIOutputPanelProps) {
  const [view, setView] = useState<"analysis" | "chat">("analysis");

  return (
    <div className="glass-strong relative flex h-full flex-col overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-md bg-ai/40 blur-md" />
              <Bot className="relative h-4 w-4 text-ai" />
            </div>
            <h2 className="text-sm font-semibold tracking-wide">AI Assistant</h2>
          </div>
          <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setView("analysis")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                view === "analysis" ? "bg-ai/20 text-ai" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setView("chat")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                view === "chat" ? "bg-ai/20 text-ai" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Chat
            </button>
          </div>
        </div>
        <span className="rounded-full bg-ai/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ai hidden sm:block">
          {loading && view === "analysis" ? "Analyzing" : result && view === "analysis" ? "Complete" : "Ready"}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-4 flex flex-col">
        {view === "analysis" ? (
          <AnimatePresence mode="wait">
            {loading ? (
              <SkeletonState key="loading" />
            ) : result ? (
              <ResultsState key="results" result={result} onScrollToLine={onScrollToLine} onApplyFix={onApplyFix} />
            ) : (
              <EmptyState key="empty" />
            )}
          </AnimatePresence>
        ) : (
          <ChatView codeContext={codeContext} />
        )}
      </div>
    </div>
  );
}

// ── Chat View ───────────────────────────────────────────────
function ChatView({ codeContext }: { codeContext: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: "Hi! Ask me anything about your current code snippet." }
  ]);
  const [input, setInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isChatting) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsChatting(true);

    const res = await chatWithAI({ prompt: userMsg.content, context: codeContext });
    
    if (res.ok && res.result) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", content: res.result.answer }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", content: "Sorry, I couldn't process that. Error: " + res.error }
      ]);
    }
    setIsChatting(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pb-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-primary/20 text-primary" : "bg-ai/20 text-ai"}`}>
              {msg.role === "user" ? <span className="text-xs font-bold">U</span> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary/10 text-foreground" : "bg-white/5 text-foreground/90"} max-w-[85%] whitespace-pre-wrap`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isChatting && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ai/20 text-ai">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-white/5 px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-ai animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-ai animate-pulse delay-75" />
              <span className="h-1.5 w-1.5 rounded-full bg-ai animate-pulse delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto shrink-0 pt-2 border-t border-white/5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code..."
            className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-ai/50 focus:outline-none focus:ring-1 focus:ring-ai/50 transition-all"
            disabled={isChatting}
          />
          <button
            type="submit"
            disabled={isChatting || !input.trim()}
            className="absolute right-2 rounded-full p-2 text-muted-foreground hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Zap className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-center px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-pulse rounded-full bg-ai/30 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-ai/30 to-primary/30 ring-1 ring-white/10">
          <Bot className="h-10 w-10 text-ai" />
        </div>
      </div>
      <h3 className="text-lg font-semibold">Write your code and click Analyze</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Our AI will read your code, find errors, explain them in plain English, and suggest a fix.
      </p>
      <div className="mt-6 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-ai" style={{ animation: "dots 1.4s infinite ease-in-out" }} />
        <span className="h-2 w-2 rounded-full bg-ai" style={{ animation: "dots 1.4s infinite ease-in-out 0.2s" }} />
        <span className="h-2 w-2 rounded-full bg-ai" style={{ animation: "dots 1.4s infinite ease-in-out 0.4s" }} />
      </div>
    </motion.div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────
function SkeletonState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <Sparkles className="h-4 w-4 text-ai" />
        AI is analyzing your code...
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="glass space-y-3 rounded-xl p-4">
          <div className="skeleton-shimmer h-4 w-1/3 rounded" />
          <div className="skeleton-shimmer h-3 w-full rounded" />
          <div className="skeleton-shimmer h-3 w-4/5 rounded" />
        </div>
      ))}
    </motion.div>
  );
}

// ── Results orchestrator ──────────────────────────────────────
function ResultsState({
  result,
  onScrollToLine,
  onApplyFix,
}: {
  result: AnalysisResult;
  onScrollToLine: (line: number) => void;
  onApplyFix: (code: string) => void;
}) {
  // Use new errors array if present, else fall back to legacy single error
  const hasMultiErrors = result.errors && result.errors.length > 0;

  const cards = result.hasError
    ? [
        // 🚨 1. Multi-error list
        hasMultiErrors
          ? <MultiErrorCard key="multi-err" errors={result.errors!} onScrollToLine={onScrollToLine} />
          : <ErrorCard key="err" result={result} onScrollToLine={onScrollToLine} />,
        // 💡 2. Explanation
        <AIExplanationCard key="ai" result={result} />,
        // 🛠 3. Fix + Apply
        result.correctedCode
          ? <CorrectedCodeCard key="corrected" result={result} onApplyFix={onApplyFix} />
          : null,
        // 🔄 4. Diff
        result.diff && result.diff.length > 0
          ? <DiffCard key="diff" diff={result.diff} />
          : null,
        // ⚡ 5. Suggestions
        result.suggestions && result.suggestions.length > 0
          ? <SuggestionsCard key="sug" suggestions={result.suggestions} />
          : null,
        // 📺 6. Video
        <VideoCard key="vid" result={result} />,
      ].filter(Boolean)
    : [
        // ✅ Success
        <SuccessCard key="ok" />,
        // Summary / breakdown
        ...(result.codeExplanation ? [
          <CodeSummaryCard key="sum" result={result} />,
          <CodeBreakdownCard key="brk" result={result} />,
          <ProTipCard key="tip" result={result} />,
        ] : []),
        // Output
        result.executionOutput
          ? <OutputCard key="out" result={result} />
          : null,
        // Improvements
        result.improvements && result.improvements.length > 0
          ? <ImprovementsCard key="imp" improvements={result.improvements} />
          : null,
        // Suggestions
        result.suggestions && result.suggestions.length > 0
          ? <SuggestionsCard key="sug" suggestions={result.suggestions} />
          : null,
        <VideoCard key="vid" result={result} />,
      ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {cards.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
        >
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── 🚨 Multi-error list card ─────────────────────────────────
function MultiErrorCard({
  errors,
  onScrollToLine,
}: {
  errors: ErrorItem[];
  onScrollToLine: (line: number) => void;
}) {
  return (
    <div className="glass-tint-error relative overflow-hidden rounded-xl p-4">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-destructive shadow-[0_0_12px_var(--destructive)]" />
      <div className="mb-3 flex items-center gap-2 pl-2">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <h3 className="font-semibold text-destructive">
          {errors.length} Error{errors.length > 1 ? "s" : ""} Detected
        </h3>
      </div>
      <div className="space-y-2 pl-2">
        {errors.map((err, i) => (
          <button
            key={i}
            onClick={() => onScrollToLine(err.line)}
            className="w-full rounded-lg border border-destructive/20 bg-black/30 p-3 text-left transition-all hover:border-destructive/40 hover:bg-destructive/10 active:scale-[0.99]"
            title="Click to scroll to this line in editor"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    err.severity === "high"
                      ? "bg-destructive/20 text-destructive"
                      : err.severity === "medium"
                      ? "bg-warning/20 text-warning"
                      : "bg-muted/20 text-muted-foreground"
                  }`}
                >
                  {err.severity}
                </span>
                <span className="font-mono text-xs font-semibold text-destructive">
                  {err.type}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ArrowUpRight className="h-3 w-3" />
                Line {err.line}
              </div>
            </div>
            <p className="mt-1.5 text-xs text-foreground/80">{err.message}</p>
            {err.code && (
              <code className="mt-1.5 block rounded bg-black/40 px-2 py-1 font-mono text-[11px] text-destructive/90">
                {err.code}
              </code>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Legacy single error card (fallback) ───────────────────────
function ErrorCard({
  result,
  onScrollToLine,
}: {
  result: AnalysisResult;
  onScrollToLine: (line: number) => void;
}) {
  return (
    <div className="glass-tint-error relative overflow-hidden rounded-xl p-4 shadow-[0_0_24px_color-mix(in_oklab,var(--destructive)_15%,transparent)]">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-destructive shadow-[0_0_12px_var(--destructive)]" />
      <div className="flex items-start gap-3 pl-2">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-destructive">Error Detected</h3>
            <button
              onClick={() => onScrollToLine(result.line)}
              className="flex items-center gap-1 rounded-full bg-destructive/20 px-2 py-0.5 font-mono text-[10px] text-destructive transition-colors hover:bg-destructive/30"
              title="Jump to line"
            >
              <ArrowUpRight className="h-3 w-3" />
              Line {result.line}
            </button>
          </div>
          <p className="mt-1 text-sm">
            <span className="font-mono font-semibold text-destructive">{result.error}</span>
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-destructive/20 bg-black/40 p-2.5 font-mono text-xs text-foreground/90">
            <code>{result.snippet}</code>
          </pre>
          {result.concept && (
            <p className="mt-2 text-xs text-muted-foreground">{result.conceptDetail}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 💡 AI Explanation + fix snippet ──────────────────────────
function AIExplanationCard({ result }: { result: AnalysisResult }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="glass-tint-ai rounded-xl p-4 shadow-[0_0_30px_color-mix(in_oklab,var(--ai)_15%,transparent)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-ai" />
          <h3 className="font-semibold">AI Explanation</h3>
        </div>
        <span className="rounded-full bg-ai/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          <span className="shimmer-text">AI</span>
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{result.explanation}</p>

      {result.fix && (
        <>
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="relative overflow-hidden rounded-lg border border-success/25 bg-success/5">
            <div className="flex items-center justify-between border-b border-success/15 bg-success/10 px-3 py-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-success">
                Suggested Fix
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-success transition-colors hover:bg-success/20"
              >
                {copied ? (
                  <><Check className="h-3 w-3" /> Copied!</>
                ) : (
                  <><Copy className="h-3 w-3" /> Copy</>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto p-3 font-mono text-xs text-foreground/95">
              <code>{result.fix}</code>
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

// ── ✨ Corrected Code + Apply Fix button ─────────────────────
function CorrectedCodeCard({
  result,
  onApplyFix,
}: {
  result: AnalysisResult;
  onApplyFix: (code: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [copied, setCopied] = useState(false);
  if (!result.correctedCode) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.correctedCode!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-tint-success rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-success" />
          <h3 className="font-semibold text-success">Corrected Code</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-success transition-colors hover:bg-success/20"
          >
            {copied ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
          </button>
          <button
            onClick={() => onApplyFix(result.correctedCode!)}
            className="flex items-center gap-1.5 rounded-md bg-success/20 px-3 py-1.5 text-xs font-semibold text-success transition-all hover:bg-success/30 hover:shadow-[0_0_16px_color-mix(in_oklab,var(--success)_40%,transparent)]"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Apply Fix
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {!collapsed && (
        <pre className="mt-3 max-h-60 overflow-y-auto overflow-x-auto rounded-lg border border-success/20 bg-black/40 p-3 font-mono text-xs text-foreground/90 scrollbar-thin">
          <code>{result.correctedCode}</code>
        </pre>
      )}
    </div>
  );
}

// ── 🔄 Diff card ─────────────────────────────────────────────
function DiffCard({ diff }: { diff: string[] }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="glass rounded-xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Diff View</h3>
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>
      {!collapsed && (
        <div className="rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-sm">
          {diff.map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith("+")
                  ? "text-success"
                  : line.startsWith("-")
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ⚡ Suggestions ────────────────────────────────────────────
function SuggestionsCard({ suggestions }: { suggestions: { type: string; message: string }[] }) {
  return (
    <div className="glass-tint-info rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Suggestions</h3>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg bg-black/20 p-2.5">
            <span className="mt-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
              {s.type}
            </span>
            <p className="text-xs text-foreground/85">{s.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Improvements list ─────────────────────────────────────────
function ImprovementsCard({ improvements }: { improvements: string[] }) {
  return (
    <div className="glass-tint-warning rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-warning" />
        <h3 className="font-semibold text-warning">Improvements</h3>
      </div>
      <ul className="space-y-1.5">
        {improvements.map((imp, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
            {imp}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── ✅ Success card ───────────────────────────────────────────
function SuccessCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-success/30 bg-success/5 p-4 shadow-[0_0_30px_color-mix(in_oklab,var(--success)_18%,transparent)] backdrop-blur-md">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-success shadow-[0_0_12px_var(--success)]" />
      <div className="flex items-start gap-3 pl-2">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success/20">
          <CheckCircle2 className="h-5 w-5 text-success" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-success">No Errors Found! Your code is clean.</h3>
          <p className="mt-1 text-sm text-foreground/90">
            The AI analyzed your snippet and no obvious bugs or syntax errors were found.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Code summary (no-error state) ────────────────────────────
function CodeSummaryCard({ result }: { result: AnalysisResult }) {
  if (!result.codeExplanation) return null;
  return (
    <div className="glass-tint-info rounded-xl p-4">
      <div className="mb-2 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-primary">What Your Code Does</h3>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{result.codeExplanation.summary}</p>
    </div>
  );
}

function CodeBreakdownCard({ result }: { result: AnalysisResult }) {
  if (!result.codeExplanation?.breakdown || result.codeExplanation.breakdown.length === 0)
    return null;
  return (
    <div className="glass-tint-ai rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <List className="h-4 w-4 text-ai" />
        <h3 className="font-semibold text-ai">Code Breakdown</h3>
      </div>
      <div className="space-y-2">
        {result.codeExplanation.breakdown.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-1.5 rounded-lg border border-ai/20 bg-black/20 p-2.5 sm:flex-row sm:items-center sm:gap-3"
          >
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-ai sm:w-1/2 break-all min-w-[50%]">
              {item.line}
            </code>
            <p className="text-xs text-foreground/90 sm:w-1/2">{item.explains}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProTipCard({ result }: { result: AnalysisResult }) {
  if (!result.codeExplanation) return null;
  return (
    <div className="glass-tint-warning rounded-xl p-4">
      <div className="mb-2 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-warning" />
        <h3 className="font-semibold text-warning">AI Suggestion</h3>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{result.codeExplanation.tip}</p>
    </div>
  );
}

// ── 🖥️ Output card ───────────────────────────────────────────
function OutputCard({ result }: { result: AnalysisResult }) {
  if (!result.executionOutput) return null;
  return (
    <div className="glass-tint-success rounded-xl p-4">
      <div className="mb-2 flex items-center gap-2">
        <Play className="h-4 w-4 text-success" />
        <h3 className="font-semibold text-success">Expected Output</h3>
      </div>
      <pre className="mt-3 overflow-x-auto rounded-lg border border-success/20 bg-black/40 p-3 font-mono text-xs text-foreground/90 scrollbar-thin">
        <code>{result.executionOutput}</code>
      </pre>
    </div>
  );
}

// ── YouTube video card ────────────────────────────────────────
function VideoCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="glass-tint-info rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <Youtube className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Recommended Video</h3>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-ai/15 to-black/40">
          {result.video.thumbnail ? (
            <img
              src={result.video.thumbnail}
              alt={result.video.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-2xl">
              <Play className="ml-0.5 h-5 w-5 fill-black text-black" />
            </div>
          </div>
          {result.video.duration ? (
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white">
              {result.video.duration}
            </span>
          ) : null}
        </div>
        <div className="space-y-2 p-3">
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug">{result.video.title}</h4>
          <p className="text-xs text-muted-foreground">{result.video.channel}</p>
          <a
            href={result.video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/30 hover:shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
          >
            <Play className="h-3 w-3 fill-primary" /> Watch Now
          </a>
        </div>
      </div>
    </div>
  );
}
