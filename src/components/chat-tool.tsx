import { useEffect, useRef, useState } from "react";
import { useHydrated, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2, BriefcaseBusiness, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { createThread, readThreads, saveThreads, simulatedReply, waitForSimulation, type ChatThread, type ChatMessage } from "@/lib/assistant-simulation";

export function ChatTool({ threadId }: { threadId: string }) {
  const hydrated = useHydrated();
  return hydrated ? <ChatWindow key={threadId} threadId={threadId} /> : <div className="p-5 text-muted-foreground">Loading conversations…</div>;
}
function ChatWindow({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const stored = readThreads();
    if (!stored.some((t) => t.id === threadId)) { stored.push({ id: threadId, title: "New conversation", messages: [] }); saveThreads(stored); }
    return stored;
  });
  const thread = threads.find((t) => t.id === threadId);
  const messages = thread?.messages ?? [];
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { textarea.current?.focus(); }, [loading]);
  function persist(next: ChatThread[]) { try { saveThreads(next); setThreads(next); setError(""); return true; } catch { setError("Unable to save chat history. Please free up browser storage and try again."); return false; } }
  function newChat() {
    const next = createThread(); if (persist([...readThreads(), next])) void navigate({ to: "/chat/$threadId", params: { threadId: next.id } });
  }
  function remove(id: string) {
    let next = readThreads().filter((t) => t.id !== id);
    if (!next.length) next = [createThread()];
    if (persist(next) && id === threadId) { const first = next[0]; if (first) void navigate({ to: "/chat/$threadId", params: { threadId: first.id } }); }
  }
  async function send(text: string) {
    if (!text.trim() || loading || !thread) return;
    const user: ChatMessage = { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text: text.trim() }] };
    const history = [...messages, user];
    const title = messages.length ? thread.title : text.trim().slice(0, 45);
    if (!persist(readThreads().map((t) => t.id === threadId ? { ...t, title, messages: history } : t))) return;
    setInput(""); setLoading(true); textarea.current?.focus();
    await waitForSimulation();
    const reply: ChatMessage = { id: crypto.randomUUID(), role: "assistant", parts: [{ type: "text", text: simulatedReply(history) }] };
    // Read current storage so switching conversations cannot overwrite another thread.
    persist(readThreads().map((t) => t.id === threadId ? { ...t, messages: [...history, reply] } : t));
    setLoading(false);
  }
  return <section className="grid min-w-0 gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
    <aside className="min-w-0 lg:border-r lg:pr-4">
      <Button variant="outline" className="mb-3 w-full" onClick={newChat}><Plus />New conversation</Button>
      <div className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Conversation history">{threads.map((t) => <div key={t.id} className={`flex min-w-0 shrink-0 items-center rounded-md lg:shrink ${t.id === threadId ? "bg-secondary" : ""}`}>
        <Button variant="ghost" className="min-w-0 flex-1 justify-start" aria-current={t.id === threadId ? "page" : undefined} onClick={() => void navigate({ to: "/chat/$threadId", params: { threadId: t.id } })}><span className="max-w-36 truncate">{t.title}</span></Button>
        <Button variant="ghost" size="icon-sm" title="Delete conversation" aria-label={`Delete conversation ${t.title}`} onClick={() => remove(t.id)}><Trash2 /></Button>
      </div>)}</div>
    </aside>
    <div className="flex h-[min(650px,calc(100dvh-300px))] min-h-[350px] min-w-0 flex-col rounded-lg border bg-card shadow-card md:h-[650px]">
      <div className="flex items-center gap-3 border-b p-4"><BriefcaseBusiness className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Workplace assistant</h2><span className="ml-auto text-xs text-muted-foreground">Simulated AI</span></div>
      <Conversation><ConversationContent className="gap-5 p-4">
        {!messages.length && <div className="py-8"><h3 className="mb-5 text-xl">What are we working on today?</h3><div className="flex flex-wrap gap-2">{["Help me write a report", "Prioritize my tasks", "Draft a meeting agenda"].map((p) => <Button key={p} variant="outline" className="h-auto whitespace-normal py-2 text-left" onClick={() => void send(p)}>{p}</Button>)}</div></div>}
        {messages.map((m) => <Message key={m.id} from={m.role}><span className="text-xs text-muted-foreground">{m.role === "user" ? "You" : "Workplace assistant"}</span><MessageContent className={m.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground" : ""}>{m.parts.map((p, i) => <MessageResponse key={i}>{p.text}</MessageResponse>)}</MessageContent>{m.role === "assistant" && <Button size="icon-sm" variant="ghost" title="Copy response" aria-label="Copy response" onClick={async () => { try { await navigator.clipboard.writeText(m.parts.map((p) => p.text).join("\n")); setCopied(m.id); } catch { setError("Unable to copy. Select the response to copy manually."); } }}>{copied === m.id ? <Check /> : <Copy />}</Button>}</Message>)}
        {loading && <div role="status"><Shimmer>Workplace assistant is typing…</Shimmer></div>}
      </ConversationContent><ConversationScrollButton /></Conversation>
      <div className="border-t p-3">{error && <p role="alert" className="mb-2 text-sm text-destructive">{error}</p>}<PromptInput onSubmit={({ text }) => { void send(text); }}><PromptInputTextarea ref={textarea} aria-label="Message workplace assistant" placeholder="Message your workplace assistant…" value={input} onChange={(e) => setInput(e.target.value)} /><PromptInputFooter className="justify-end"><PromptInputSubmit status={loading ? "submitted" : "ready"} disabled={loading || !input.trim()} /></PromptInputFooter></PromptInput></div>
    </div>
  </section>;
}