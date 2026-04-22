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
} from "lucide-react";
import { useState } from "react";
import type { AnalysisResult } from "@/lib/mockAnalysis";

interface AIOutputPanelProps {
  loading: boolean;
  result: AnalysisResult | null;
}

export function AIOutputPanel({ loading, result }: AIOutputPanelProps) {
  return (
    <div className="glass-strong relative flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-md bg-ai/40 blur-md" />
            <Bot className="relative h-4 w-4 text-ai" />
          </div>
          <h2 className="text-sm font-semibold tracking-wide">AI Output</h2>
        </div>
        <span className="rounded-full bg-ai/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ai">
          {loading ? "Analyzing" : result ? "Complete" : "Idle"}
        </span>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <SkeletonState key="loading" />
          ) : result ? (
            <ResultsState key="results" result={result} />
          ) : (
            <EmptyState key="empty" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

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

function SkeletonState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="glass space-y-3 rounded-xl p-4"
        >
          <div className="skeleton-shimmer h-4 w-1/3 rounded" />
          <div className="skeleton-shimmer h-3 w-full rounded" />
          <div className="skeleton-shimmer h-3 w-4/5 rounded" />
        </div>
      ))}
    </motion.div>
  );
}

function ResultsState({ result }: { result: AnalysisResult }) {
  const cards = [
    <ErrorCard key="err" result={result} />,
    <ConceptCard key="con" result={result} />,
    <AIExplanationCard key="ai" result={result} />,
    <VideoCard key="vid" result={result} />,
  ];
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
          transition={{ duration: 0.4, delay: i * 0.15, ease: "easeOut" }}
        >
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}

function ErrorCard({ result }: { result: AnalysisResult }) {
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
            <span className="rounded-full bg-destructive/20 px-2 py-0.5 font-mono text-[10px] text-destructive">
              Line {result.line}
            </span>
          </div>
          <p className="mt-1 text-sm">
            <span className="font-mono font-semibold text-destructive">{result.error}</span>
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-destructive/20 bg-black/40 p-2.5 font-mono text-xs text-foreground/90">
            <code>{result.snippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function ConceptCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="glass-tint-warning rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-warning/20">
          <Lightbulb className="h-5 w-5 text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-warning">Concept</h3>
          <p className="mt-1 text-sm font-medium">{result.concept}</p>
          <p className="mt-1 text-xs text-muted-foreground">{result.conceptDetail}</p>
        </div>
      </div>
    </div>
  );
}

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
          <h3 className="font-semibold">AI Explanation & Fix</h3>
        </div>
        <span className="rounded-full bg-ai/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          <span className="shimmer-text">AI</span>
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{result.explanation}</p>

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

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
              <>
                <Check className="h-3 w-3" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto p-3 font-mono text-xs text-foreground/95">
          <code>{result.fix}</code>
        </pre>
      </div>
    </div>
  );
}

function VideoCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="glass-tint-info rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <Youtube className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Recommended Video</h3>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="relative aspect-video bg-black/40">
          <img
            src={result.video.thumbnail}
            alt={result.video.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-2xl">
              <Play className="ml-0.5 h-5 w-5 fill-black text-black" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white">
            {result.video.duration}
          </span>
        </div>
        <div className="space-y-2 p-3">
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug">
            {result.video.title}
          </h4>
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
