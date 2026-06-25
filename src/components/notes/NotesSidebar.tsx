import { Plus, FileText, Trash2 } from "lucide-react";
import type { Note } from "@/utils/notes.store";

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
}

export function NotesSidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}: NotesSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r border-white/5 bg-black/20">
      <div className="flex items-center justify-between border-b border-white/5 p-4">
        <h2 className="text-sm font-semibold tracking-wide">My Notes</h2>
        <button
          onClick={onCreateNote}
          className="rounded bg-primary/20 p-1.5 text-primary transition-colors hover:bg-primary/30"
          title="New Note"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No notes yet. Click + to create one.
          </div>
        ) : (
          <div className="space-y-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  activeNoteId === note.id
                    ? "bg-white/10 text-foreground"
                    : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
                }`}
                onClick={() => onSelectNote(note.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{note.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  title="Delete note"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
