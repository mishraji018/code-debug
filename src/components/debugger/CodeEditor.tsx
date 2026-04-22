import Editor, { type OnMount } from "@monaco-editor/react";
import { useRef, useEffect } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (v: string) => void;
  language: string;
  errorLine?: number | null;
  onSelectionChange?: (selected: string, startLine: number) => void;
}

const languageMap: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  html: "html",
  css: "css",
  java: "java",
};

export function CodeEditor({
  value,
  onChange,
  language,
  errorLine,
  onSelectionChange,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme("debugai-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "8b8ba7", fontStyle: "italic" },
        { token: "keyword", foreground: "a78bfa" },
        { token: "string", foreground: "10b981" },
        { token: "number", foreground: "f59e0b" },
        { token: "type", foreground: "6366f1" },
      ],
      colors: {
        "editor.background": "#00000000",
        "editor.foreground": "#e6e7ee",
        "editorLineNumber.foreground": "#5b5b78",
        "editorLineNumber.activeForeground": "#a78bfa",
        "editor.lineHighlightBackground": "#ffffff08",
        "editor.selectionBackground": "#6366f155",
        "editorCursor.foreground": "#a78bfa",
        "editorIndentGuide.background1": "#ffffff10",
      },
    });
    monaco.editor.setTheme("debugai-dark");

    editor.onDidChangeCursorSelection(() => {
      const sel = editor.getSelection();
      const model = editor.getModel();
      if (sel && model && onSelectionChange) {
        const text = model.getValueInRange(sel);
        onSelectionChange(text, sel.startLineNumber);
      }
    });
  };

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    if (errorLine && errorLine > 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(errorLine, 1, errorLine, 1),
          options: {
            isWholeLine: true,
            className: "errorLineBg",
            linesDecorationsClassName: "errorGutter",
            inlineClassName: "errorInline",
          },
        },
      ]);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [errorLine]);

  const lines = value.split("\n").length;
  const chars = value.length;
  const langLabel = language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <div className="glass-strong relative flex h-full flex-col overflow-hidden rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      {/* subtle inner border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10" />

      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
          </div>
          <span className="ml-3 font-mono text-xs text-muted-foreground">
            main.{language === "javascript" ? "js" : language === "python" ? "py" : language}
          </span>
        </div>
        <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {langLabel}
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <Editor
          value={value}
          onChange={(v) => onChange(v ?? "")}
          language={languageMap[language] ?? "plaintext"}
          onMount={handleMount}
          options={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: "all",
            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          }}
        />
        <style>{`
          .errorLineBg { background: color-mix(in oklab, var(--destructive) 14%, transparent) !important; box-shadow: inset 3px 0 0 var(--destructive); }
          .errorGutter { background: var(--destructive); width: 3px !important; margin-left: 3px; box-shadow: 0 0 12px var(--destructive); animation: pulse-glow 1.6s ease-in-out infinite; }
          .errorInline { text-decoration: underline wavy color-mix(in oklab, var(--destructive) 90%, transparent); text-underline-offset: 4px; }
        `}</style>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-4 py-2 font-mono text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>Lines: <span className="text-foreground/80">{lines}</span></span>
          <span className="text-white/10">|</span>
          <span>Characters: <span className="text-foreground/80">{chars}</span></span>
          <span className="text-white/10">|</span>
          <span><span className="text-ai">{langLabel}</span> Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}
