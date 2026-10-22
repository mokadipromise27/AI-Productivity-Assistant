export const SIMULATION_DELAY = 1500;
export const waitForSimulation = () => new Promise<void>((resolve) => setTimeout(resolve, SIMULATION_DELAY));

export function researchSummary(input: string) {
  const topic = input.trim();
  const isLink = /^https?:\/\/\S+$/i.test(topic);
  const excerpt = topic.replace(/\s+/g, " ").slice(0, 650);
  return `Summary\n${isLink ? `Link supplied: ${topic}\nThis simulated assistant cannot open links. Paste the article text for a summary of its contents.` : `Based on your input: ${excerpt}${topic.length > 650 ? "…" : ""}`}\n\nInsights\n• Identify the core problem, intended audience, and measurable outcome.\n• Distinguish supported facts from assumptions and check the original sources.\n• Consider how this topic affects your team's current priorities.\n\nRecommendations\n1. Gather reliable sources and compare their findings.\n2. Document key takeaways, uncertainties, and practical next steps.\n3. Test one actionable idea and review the outcome.\n\nSimulation only — these suggestions are not verified research.`;
}

export type ChatMessage = { id: string; role: "user" | "assistant"; parts: { type: "text"; text: string }[] };
export type ChatThread = { id: string; title: string; messages: ChatMessage[] };
export const THREAD_STORAGE_KEY = "wa-chat-threads";
export function createThread(): ChatThread {
  return { id: crypto.randomUUID(), title: "New conversation", messages: [] };
}
export function readThreads(): ChatThread[] {
  try {
    const saved = JSON.parse(localStorage.getItem(THREAD_STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((t) => typeof t.id === "string" && typeof t.title === "string" && Array.isArray(t.messages)) : [];
  } catch { return []; }
}
export function saveThreads(threads: ChatThread[]) {
  localStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(threads));
}
export function simulatedReply(messages: ChatMessage[]) {
  const prompt = messages.at(-1)?.parts.map((p) => p.text).join(" ") ?? "";
  const previous = messages.filter((m) => m.role === "user").slice(0, -1).at(-1)?.parts.map((p) => p.text).join(" ");
  const context = previous ? `\n\nContinuing from your earlier request: “${previous.slice(0, 180)}”.` : "";
  if (/report|write|draft/i.test(prompt)) return `Here's a report outline for **${prompt}**:\n\n1. **Executive summary:** State the goal and main finding.\n2. **Progress:** Summarize completed work and measurable results.\n3. **Risks:** Note blockers, uncertainties, and decisions needed.\n4. **Next steps:** Assign owners and due dates.\n\nWhat is the report's audience and subject?${context}`;
  if (/prioriti|tasks|plan/i.test(prompt)) return `Let's organize **${prompt}**:\n\n- **First:** Urgent work with a deadline or a dependent teammate.\n- **Next:** Important work that advances your main goals.\n- **Later:** Routine tasks you can batch or delegate.\n\nShare your tasks and deadlines so we can make a concrete plan.${context}`;
  return `For **${prompt}**, start by defining the outcome, identifying the key information, and choosing one practical next action.\n\n- What would a successful result look like?\n- Who needs to be involved?\n- What is your deadline?${context}`;
}