import { createFileRoute } from "@tanstack/react-router";
import { NotesApp } from "@/components/notes/NotesApp";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "DebugAI — Notes" },
      {
        name: "description",
        content: "Write and manage your notes with an integrated AI assistant.",
      },
    ],
  }),
  component: NotesRoute,
});

function NotesRoute() {
  return <NotesApp />;
}
