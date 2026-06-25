import { useState, useEffect } from "react";
import { NotesSidebar } from "./NotesSidebar";
import { NoteEditor } from "./NoteEditor";
import { AIChatPanel } from "./AIChatPanel";
import { notesStore, type Note } from "@/utils/notes.store";

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    const loadedNotes = notesStore.getNotes();
    setNotes(loadedNotes);
    if (loadedNotes.length > 0) {
      setActiveNoteId(loadedNotes[0].id);
    }
  }, []);

  const handleCreateNote = () => {
    const title = window.prompt("Enter a title for the new note:");
    if (title && title.trim()) {
      const newNote = notesStore.createNote(title.trim());
      setNotes(notesStore.getNotes());
      setActiveNoteId(newNote.id);
    }
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      notesStore.deleteNote(id);
      const updatedNotes = notesStore.getNotes();
      setNotes(updatedNotes);
      if (activeNoteId === id) {
        setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      }
    }
  };

  const handleUpdateNote = (id: string, content: string) => {
    notesStore.updateNote(id, { content });
    setNotes(notesStore.getNotes());
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <NotesSidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
      />
      <div className="flex flex-1 overflow-hidden">
        <NoteEditor note={activeNote} onUpdateNote={handleUpdateNote} />
        {activeNote && <AIChatPanel context={activeNote.content} />}
      </div>
    </div>
  );
}
