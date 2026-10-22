import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Mail, NotebookPen, CalendarCheck, Loader2, Sparkles, GripVertical, Trash2, Plus, Search, MessagesSquare, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchTool } from "@/components/research-tool";
import { ChatTool } from "@/components/chat-tool";
import { usePersisted } from "@/hooks/use-persisted";
import { createThread, readThreads, saveThreads } from "@/lib/assistant-simulation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Assistant" },
      { name: "description", content: "Five workplace tools for emails, meeting notes, daily planning, simulated research and browser-saved AI chats." },
      { property: "og:title", content: "AI Workplace Assistant" },
      { property: "og:description", content: "Summarize emails, extract action items and plan your day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type Tool = "email" | "meeting" | "planner" | "research" | "chat";
type Item = { id: string; text: string; done: boolean; priority?: "High" | "Medium" | "Low" | undefined };

const uid = () => Math.random().toString(36).slice(2, 10);
const think = () => new Promise((r) => setTimeout(r, 1500));

const sentences = (t: string) => t.replace(/\s+/g, " ").split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 3);

function mockSummary(text: string) {
  const s = sentences(text);
  if (!s.length) return "";
  const keys = /(please|need|deadline|by|meeting|action|request|important|asap|review|confirm|update)/i;
  const picked = [s[0], ...s.slice(1).filter((x) => keys.test(x))].slice(0, 4);
  return `Summary:\n${picked.map((p) => `• ${p}`).join("\n")}\n\nTone: ${/urgent|asap|immediately/i.test(text) ? "Urgent" : "Neutral"} · ${s.length} sentences condensed to ${picked.length}.`;
}

function mockActions(text: string): Item[] {
  const lines = text.split(/\n|(?<=[.!?])\s+/).map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim()).filter(Boolean);
  const re = /(will|should|need|must|todo|to do|action|follow up|send|schedule|review|prepare|fix|update|create|call|email)/i;
  let acts = lines.filter((l) => re.test(l));
  if (!acts.length) acts = lines.slice(0, 3);
  return acts.map((a) => ({ id: uid(), text: a.charAt(0).toUpperCase() + a.slice(1), done: false }));
}

function mockPlan(text: string): Item[] {
  const parts = text.split(/\n|,|;|\.\s|\band\b|\bthen\b/i).map((p) => p.trim()).filter((p) => p.length > 2);
  const score = (p: string) => /(urgent|deadline|asap|boss|client|due|important)/i.test(p) ? 0 : /(meeting|call|review|report|email)/i.test(p) ? 1 : 2;
  const pr = ["High", "Medium", "Low"] as const;
  return parts.sort((a, b) => score(a) - score(b)).map((p) => ({ id: uid(), text: p.charAt(0).toUpperCase() + p.slice(1), done: false, priority: pr[score(p)] }));
}

const tools: { id: Tool; label: string; icon: typeof Mail }[] = [
  { id: "email", label: "Email Assistant", icon: Mail },
  { id: "meeting", label: "Meeting Notes", icon: NotebookPen },
  { id: "planner", label: "Task Planner", icon: CalendarCheck },
  { id: "research", label: "Research Assistant", icon: Search },
  { id: "chat", label: "AI Chatbot", icon: MessagesSquare },
];

export function App({ threadId }: { threadId?: string }) {
  const [tool, setTool] = usePersisted<Tool>("wa-tool", "email");
  const navigate = useNavigate();
  const activeTool = threadId ? "chat" : tool === "chat" ? "email" : tool;
  function selectTool(id: Tool) {
    if (id === "chat") {
      const threads = readThreads();
      const current = threads[0] ?? createThread();
      if (!threads.length) saveThreads([current]);
      void navigate({ to: "/chat/$threadId", params: { threadId: current.id } });
    } else { setTool(id); if (threadId) void navigate({ to: "/" }); }
  }
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="order-last md:order-first sticky bottom-0 z-10 bg-sidebar text-sidebar-foreground md:static md:w-64 md:min-h-screen">
        <div className="hidden md:flex items-center gap-2 px-6 py-6 font-display text-xl">
          <BriefcaseBusiness className="h-5 w-5 text-accent" /> Assistant
        </div>
        <nav className="flex md:flex-col justify-around md:justify-start gap-1 p-2 md:px-3">
          {tools.map((t) => (
            <Button variant="ghost" key={t.id} onClick={() => selectTool(t.id)} aria-label={t.label} aria-current={activeTool === t.id ? "page" : undefined}
              className={`flex h-auto min-w-0 flex-1 md:flex-none flex-col md:flex-row items-center md:justify-start gap-1 md:gap-3 rounded-lg px-1 md:px-3 py-2 md:py-3 text-[10px] md:text-sm whitespace-normal transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground ${activeTool === t.id ? "bg-sidebar-accent text-accent" : ""}`}>
              <t.icon className="h-5 w-5" />
              <span>{t.label}</span>
            </Button>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="border-b bg-card px-4 py-4 md:px-8">
          <h1 className="text-xl md:text-2xl font-semibold">AI Workplace Assistant <span className="text-muted-foreground font-normal">- Built with Lovable</span></h1>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full">
          {activeTool === "email" && <EmailTool />}
          {activeTool === "meeting" && <MeetingTool />}
          {activeTool === "planner" && <PlannerTool />}
          {activeTool === "research" && <ResearchTool />}
          {threadId && <ChatTool threadId={threadId} />}
        </main>
        <footer className="border-t px-4 py-4 md:px-8 text-xs text-muted-foreground">
          AI outputs should be reviewed for accuracy. This assistant uses generative AI and may produce imperfect results. Always verify important information.
        </footer>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-card">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function RunButton({ loading, onClick, label, disabled }: { loading: boolean; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {loading ? "Thinking…" : label}
    </button>
  );
}

const inputCls = "w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function EmailTool() {
  const [input, setInput] = usePersisted("wa-email-in", "");
  const [out, setOut] = usePersisted("wa-email-out", "");
  const [loading, setLoading] = useState(false);
  const run = async () => { setLoading(true); await think(); setOut(mockSummary(input)); setLoading(false); };
  return (
    <div className="grid gap-5">
      <Card title="Paste your email">
        <textarea className={inputCls} rows={8} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste a long email here…" />
        <RunButton loading={loading} onClick={run} label="Summarize" disabled={!input.trim()} />
      </Card>
      {out && <Card title="Summary (editable)">
        <textarea className={inputCls} rows={8} value={out} onChange={(e) => setOut(e.target.value)} />
      </Card>}
    </div>
  );
}

function ItemList({ items, setItems, draggable }: { items: Item[]; setItems: (i: Item[]) => void; draggable?: boolean }) {
  const [drag, setDrag] = useState<number | null>(null);
  const update = (id: string, p: Partial<Item>) => setItems(items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const move = (from: number, to: number) => { const n = [...items]; const [m] = n.splice(from, 1); if (!m) return; n.splice(to, 0, m); setItems(n); };
  const badge = { High: "bg-destructive/15 text-destructive", Medium: "bg-accent/30 text-accent-foreground", Low: "bg-secondary text-secondary-foreground" };
  return (
    <ul className="grid gap-2">
      {items.map((it, idx) => (
        <li key={it.id} draggable={draggable}
          onDragStart={() => setDrag(idx)} onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (drag !== null && drag !== idx) move(drag, idx); setDrag(null); }}
          className={`flex items-center gap-2 rounded-lg border bg-background p-2 ${drag === idx ? "opacity-50" : ""}`}>
          {draggable && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />}
          <input type="checkbox" checked={it.done} onChange={(e) => update(it.id, { done: e.target.checked })} className="h-4 w-4 accent-primary shrink-0" />
          <input value={it.text} onChange={(e) => update(it.id, { text: e.target.value })}
            className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${it.done ? "line-through text-muted-foreground" : ""}`} />
          {it.priority && (
            <select value={it.priority} onChange={(e) => update(it.id, { priority: e.target.value as Item["priority"] })}
              className={`rounded-md px-2 py-1 text-xs font-medium ${badge[it.priority]}`}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          )}
          {draggable && <div className="flex flex-col md:hidden">
            <button className="text-xs px-1" onClick={() => idx > 0 && move(idx, idx - 1)} aria-label="Move up">▲</button>
            <button className="text-xs px-1" onClick={() => idx < items.length - 1 && move(idx, idx + 1)} aria-label="Move down">▼</button>
          </div>}
          <button onClick={() => setItems(items.filter((i) => i.id !== it.id))} aria-label="Delete" className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
      <button onClick={() => setItems([...items, { id: uid(), text: "New item", done: false, priority: draggable ? "Medium" : undefined }])}
        className="mt-1 inline-flex items-center gap-1 self-start text-sm text-primary hover:underline">
        <Plus className="h-4 w-4" /> Add item
      </button>
    </ul>
  );
}

function MeetingTool() {
  const [input, setInput] = usePersisted("wa-meet-in", "");
  const [items, setItems] = usePersisted<Item[]>("wa-meet-out", []);
  const [loading, setLoading] = useState(false);
  const run = async () => { setLoading(true); await think(); setItems(mockActions(input)); setLoading(false); };
  return (
    <div className="grid gap-5">
      <Card title="Raw meeting notes">
        <textarea className={inputCls} rows={8} value={input} onChange={(e) => setInput(e.target.value)} placeholder="- Sarah will send the report by Friday&#10;- Need to schedule client call…" />
        <RunButton loading={loading} onClick={run} label="Extract Action Items" disabled={!input.trim()} />
      </Card>
      {items.length > 0 && <Card title="Action items"><ItemList items={items} setItems={setItems} /></Card>}
    </div>
  );
}

function PlannerTool() {
  const [input, setInput] = usePersisted("wa-plan-in", "");
  const [items, setItems] = usePersisted<Item[]>("wa-plan-out", []);
  const [loading, setLoading] = useState(false);
  const run = async () => { setLoading(true); await think(); setItems(mockPlan(input)); setLoading(false); };
  return (
    <div className="grid gap-5">
      <Card title="Describe your day">
        <textarea className={inputCls} rows={6} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Client report due today, team meeting at 10, reply to emails, gym…" />
        <RunButton loading={loading} onClick={run} label="Plan My Day" disabled={!input.trim()} />
      </Card>
      {items.length > 0 && <Card title="Prioritized plan (drag to reorder)"><ItemList items={items} setItems={setItems} draggable /></Card>}
    </div>
  );
}
