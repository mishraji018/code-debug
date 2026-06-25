export interface Note {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'debugai_notes';

export const notesStore = {
  getNotes: (): Note[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load notes', e);
    }
    return [];
  },

  saveNotes: (notes: Note[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes', e);
    }
  },

  createNote: (title: string, language: string, content: string = ''): Note => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      language,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const notes = notesStore.getNotes();
    notes.unshift(newNote); // Add to beginning
    notesStore.saveNotes(notes);
    return newNote;
  },

  updateNote: (id: string, updates: Partial<Note>) => {
    const notes = notesStore.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates, updatedAt: Date.now() };
      notesStore.saveNotes(notes);
    }
  },

  deleteNote: (id: string) => {
    const notes = notesStore.getNotes();
    const newNotes = notes.filter((n) => n.id !== id);
    notesStore.saveNotes(newNotes);
  }
};
