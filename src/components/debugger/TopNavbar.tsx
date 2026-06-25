import { Terminal, Plus, ChevronDown, FolderOpen, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { languages } from "@/lib/mockAnalysis";
import { Note } from "@/utils/notes.store";

interface TopNavbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onNewFile: () => void;
  notes: Note[];
  onLoadNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export function TopNavbar({ language, onLanguageChange, onNewFile, notes, onLoadNote, onDeleteNote }: TopNavbarProps) {
  const [openLang, setOpenLang] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.id === language) ?? languages[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setOpenLang(false);
      if (notesRef.current && !notesRef.current.contains(e.target as Node)) setOpenNotes(false);
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
      <div ref={langRef} className="relative">
        <button
          onClick={() => {
            setOpenLang((o) => !o);
            setOpenNotes(false);
          }}
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
          aria-label="Select language"
        >
          <span className="text-base">{current.emoji}</span>
          <span>{current.label}</span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${openLang ? "rotate-180" : ""}`}
          />
        </button>
        {openLang && (
          <div className="glass-strong absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl shadow-2xl">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  onLanguageChange(l.id);
                  setOpenLang(false);
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
        {/* Saved Notes Dropdown */}
        <div ref={notesRef} className="relative hidden sm:block">
          <button
            onClick={() => {
              setOpenNotes((o) => !o);
              setOpenLang(false);
            }}
            className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:border-primary/50"
            aria-label="Saved notes"
          >
            <FolderOpen className="h-4 w-4" />
            <span>My Notes</span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${openNotes ? "rotate-180" : ""}`}
            />
          </button>
          {openNotes && (
            <div className="glass-strong absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl shadow-2xl max-h-80 overflow-y-auto scrollbar-thin">
              {notes.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No saved notes yet.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="group flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 cursor-pointer"
                    onClick={() => {
                      onLoadNote(note);
                      setOpenNotes(false);
                    }}
                  >
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="truncate w-full text-left font-medium">{note.title}</span>
                      <span className="text-xs text-muted-foreground">{languages.find(l => l.id === note.language)?.label || 'Code'}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive p-1"
                      title="Delete Note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
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
