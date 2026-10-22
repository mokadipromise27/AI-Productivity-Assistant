import { useState } from "react";
import { Copy, Check, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePersisted } from "@/hooks/use-persisted";
import { researchSummary, waitForSimulation } from "@/lib/assistant-simulation";

export function ResearchTool() {
  const [input, setInput] = usePersisted("wa-research-in", "");
  const [output, setOutput] = usePersisted("wa-research-out", "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  async function run() {
    setLoading(true); setCopied(false); await waitForSimulation();
    setOutput(researchSummary(input)); setLoading(false);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(output); setCopied(true); setError(""); }
    catch { setError("Copy unavailable. Select the output and copy it manually."); }
  }
  return <div className="grid gap-5">
    <section className="rounded-lg border bg-card p-5 shadow-card">
      <h2 className="mb-3 text-lg font-semibold">AI Research Assistant</h2>
      <textarea aria-label="Research topic, article, or link" className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" rows={8} placeholder="Enter a topic, paste an article, or add a link…" value={input} onChange={(e) => setInput(e.target.value)} />
      <Button className="mt-3" disabled={loading || !input.trim()} onClick={run}>{loading ? <Loader2 className="animate-spin" /> : <Search />}{loading ? "Thinking…" : "Research"}</Button>
    </section>
    {output && <section className="rounded-lg border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Research findings</h2><Button variant="outline" size="sm" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy"}</Button></div>
      <textarea aria-label="Editable research findings" className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" rows={16} value={output} onChange={(e) => { setOutput(e.target.value); setCopied(false); }} />
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </section>}
  </div>;
}