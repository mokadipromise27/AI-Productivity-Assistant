import { createFileRoute } from "@tanstack/react-router";
import { App } from "./index";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({ meta: [
    { title: "Workplace Chat | AI Workplace Assistant" },
    { name: "description", content: "Your browser-saved workplace conversations with a simulated assistant for reports, priorities and planning." },
    { property: "og:title", content: "Workplace Chat | AI Workplace Assistant" },
    { property: "og:description", content: "Separate workplace conversations, saved in your browser." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ChatPage,
});
function ChatPage() {
  const { threadId } = Route.useParams();
  return <App threadId={threadId} />;
}