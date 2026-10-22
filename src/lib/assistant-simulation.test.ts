import { describe, expect, it } from "vitest";
import { createThread, readThreads, saveThreads, researchSummary, simulatedReply, SIMULATION_DELAY } from "./assistant-simulation";

describe("simulated assistant", () => {
  it("keeps the requested 1.5 second simulation delay", () => { expect(SIMULATION_DELAY).toBe(1500); });
  it("never claims to read a link", () => { expect(researchSummary("https://example.com/article")).toContain("cannot open links"); });
  it("saves separate conversation histories in localStorage", () => {
    const a = createThread(); const b = createThread();
    a.messages = [{ id: "one", role: "user", parts: [{ type: "text", text: "Write my report" }] }];
    b.messages = [{ id: "two", role: "user", parts: [{ type: "text", text: "Plan my tasks" }] }];
    saveThreads([a, b]);
    expect(readThreads().find((t) => t.id === a.id)?.messages[0]?.parts[0]?.text).toBe("Write my report");
    expect(readThreads().find((t) => t.id === b.id)?.messages[0]?.parts[0]?.text).toBe("Plan my tasks");
  });
  it("uses earlier turns in a simulated follow-up", () => {
    expect(simulatedReply([{ id: "a", role: "user", parts: [{ type: "text", text: "Sales targets" }] }, { id: "b", role: "user", parts: [{ type: "text", text: "Next steps" }] }])).toContain("Sales targets");
  });
});