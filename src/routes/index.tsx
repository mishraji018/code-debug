import { createFileRoute } from "@tanstack/react-router";
import { DebuggerApp } from "@/components/debugger/DebuggerApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DebugAI — AI-Powered Code Debugger" },
      {
        name: "description",
        content:
          "A next-gen AI code debugger. Paste your code, click analyze, and get plain-English error explanations with one-click fixes.",
      },
      { property: "og:title", content: "DebugAI — AI-Powered Code Debugger" },
      {
        property: "og:description",
        content:
          "Find bugs, understand errors, and learn faster with an AI debugger that explains in plain English.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <DebuggerApp />;
}
