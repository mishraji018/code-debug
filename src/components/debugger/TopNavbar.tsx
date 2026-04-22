import { Terminal, Plus, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { languages } from "@/lib/mockAnalysis";

interface TopNavbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onNewFile: () => void;
}

export function TopNavbar({ language, onLanguageChange, onNewFile }: TopNavbarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.id === language) ?? languages[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="glass-navbar relative z-30 flex h-16 items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-ai/40 blur-xl" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-ai shadow-[0_0_20px_color-mix(in_oklab,var(--ai)_50%,transparent)]">
            <Terminal className="h-5 w-5 text-white" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans text-lg font-bold tracking-tight sm:text-xl">
              Debug<span className="shimmer-text">AI</span>
            </h1>
            <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-[11px] font-extrabold tracking-wider text-primary shadow-[0_0_15px_color-mix(in_oklab,var(--primary)_35%,transparent)] sm:text-xs">
              ✨ Made by Mishra_ji
            </span>
          </div>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Code Debugger
          </p>
        </div>
      </div>

      {/* Language selector */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
          aria-label="Select language"
        >
          <span className="text-base">{current.emoji}</span>
          <span>{current.label}</span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="glass-strong absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl shadow-2xl">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  onLanguageChange(l.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                  l.id === language ? "bg-primary/15 text-primary" : ""
                }`}
              >
                <span className="text-base">{l.emoji}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewFile}
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-white/8"
          title="Start a new file"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New File</span>
        </button>
      </div>
    </header>
  );
}
