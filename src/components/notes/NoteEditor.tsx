import { useEffect, useState } from "react";
import type { Note } from "@/utils/notes.store";

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (id: string, content: string) => void;
}

export function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setContent(note.content);
    }
  }, [note?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (note) {
      onUpdateNote(note.id, newContent);
    }
  };

  if (!note) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a note from the sidebar or create a new one.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-white/5 p-4">
        <h2 className="text-xl font-bold">{note.title}</h2>
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </p>
      </div>
      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Write your note here... (Markdown is supported)"
          className="h-full w-full resize-none rounded-lg border-none bg-transparent p-2 text-foreground focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
}
