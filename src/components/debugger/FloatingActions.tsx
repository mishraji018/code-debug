import { Search, Scissors, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface FloatingActionsProps {
  onAnalyzeFull: () => void;
  onAnalyzeSelected: () => void;
  onClear: () => void;
  loading: boolean;
  hasSelection: boolean;
}

export function FloatingActions({
  onAnalyzeFull,
  onAnalyzeSelected,
  onClear,
  loading,
  hasSelection,
}: FloatingActionsProps) {
  const baseBtn =
    "group relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pointer-events-auto"
      >
        <div className="glass-strong flex items-center gap-2 rounded-full p-1.5 shadow-2xl shadow-black/40">
          {/* Analyze Full */}
          <motion.button
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAnalyzeFull}
            disabled={loading}
            title="Analyze your entire code with AI"
            className={`${baseBtn} bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_40%,transparent)] hover:shadow-[0_0_32px_color-mix(in_oklab,var(--primary)_70%,transparent)]`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Full Code
              </>
            )}
            <Tooltip>Run AI analysis on the whole file</Tooltip>
          </motion.button>

          {/* Analyze Selected */}
          <motion.button
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAnalyzeSelected}
            disabled={loading || !hasSelection}
            title={hasSelection ? "Analyze just the highlighted code" : "Highlight some code first"}
            className={`${baseBtn} bg-gradient-to-br from-ai/80 to-ai text-ai-foreground shadow-[0_0_20px_color-mix(in_oklab,var(--ai)_40%,transparent)] hover:shadow-[0_0_32px_color-mix(in_oklab,var(--ai)_70%,transparent)]`}
          >
            <Scissors className="h-4 w-4" />
            Analyze Selected
            <Tooltip>Only analyze the text you've highlighted</Tooltip>
          </motion.button>

          {/* Clear */}
          <motion.button
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClear}
            disabled={loading}
            title="Clear editor and results"
            className={`${baseBtn} glass border-destructive/30 text-destructive hover:bg-destructive/15 hover:shadow-[0_0_20px_color-mix(in_oklab,var(--destructive)_40%,transparent)]`}
          >
            <Trash2 className="h-4 w-4" />
            Clear
            <Tooltip>Reset the editor and output panel</Tooltip>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
      {children}
    </span>
  );
}
