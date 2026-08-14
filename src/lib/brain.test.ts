import { describe, expect, it } from "vitest";
import { understand } from "./brain";
import { TOOL_SCHEMAS, type ToolName } from "./tools";

/** Every emitted call must validate against the shared schema. */
function expectValidCalls(input: string) {
  const { calls } = understand(input);
  for (const c of calls) {
    const schema = TOOL_SCHEMAS[c.name as ToolName];
    expect(schema, `unknown tool: ${c.name}`).toBeDefined();
    const parsed = schema.safeParse(c.args);
    expect(parsed.success, `bad args for ${c.name}: ${JSON.stringify(c.args)}`).toBe(true);
  }
  return calls;
}

describe("power control", () => {
  it("extracts a numeric level", () => {
    const calls = expectValidCalls("divert 75% to the reactor");
    expect(calls[0].name).toBe("set_power");
    expect((calls[0].args as { level: number }).level).toBe(75);
  });

  it("understands word numbers", () => {
    const calls = expectValidCalls("give the reactor maximum power");
    expect((calls[0].args as { level: number }).level).toBe(100);
  });

  it("clamps out-of-range values", () => {
    const calls = expectValidCalls("set power to 480");
    expect((calls[0].args as { level: number }).level).toBeLessThanOrEqual(100);
  });

  it("warns above the thermal envelope", () => {
    expect(understand("reactor to 100").reply.toLowerCase()).toContain("thermal");
  });

  it("asks for a level when none is given", () => {
    const { calls, reply } = understand("adjust the reactor");
    expect(calls).toHaveLength(0);
    expect(reply).toMatch(/level/i);
  });
});

describe("scanning", () => {
  it("emits a scan with the right focus", () => {
    const calls = expectValidCalls("scan orbital space");
    expect(calls[0].name).toBe("scan_threats");
    expect((calls[0].args as { focus: string }).focus).toBe("orbital");
  });

  it("handles casual phrasing", () => {
    expect(expectValidCalls("is anyone out there?")[0].name).toBe("scan_threats");
  });
});

describe("suit control", () => {
  it("deploys by default", () => {
    const calls = expectValidCalls("suit up");
    expect(calls[0].name).toBe("suit_control");
    expect((calls[0].args as { action: string }).action).toBe("deploy");
  });

  it("detects retraction", () => {
    const calls = expectValidCalls("take off the suit");
    expect((calls[0].args as { action: string }).action).toBe("retract");
  });

  it("parses a mark designation", () => {
    const calls = expectValidCalls("deploy mark VII");
    expect((calls[0].args as { mark: string }).mark).toBe("VII");
  });
});

describe("protocols", () => {
  it.each([
    ["run house party protocol", "house_party"],
    ["initiate lockdown", "lockdown"],
    ["clean slate protocol", "clean_slate"],
    ["summon veronica", "veronica"],
  ])("%s -> %s", (input, expected) => {
    const calls = expectValidCalls(input);
    expect(calls[0].name).toBe("run_protocol");
    expect((calls[0].args as { name: string }).name).toBe(expected);
  });
});

describe("timers", () => {
  it("parses minutes", () => {
    const calls = expectValidCalls("set a timer for 5 minutes");
    expect(calls[0].name).toBe("start_timer");
    expect((calls[0].args as { seconds: number }).seconds).toBe(300);
  });

  it("parses seconds", () => {
    const calls = expectValidCalls("countdown 45 seconds");
    expect((calls[0].args as { seconds: number }).seconds).toBe(45);
  });
});

describe("conversation", () => {
  it("greets without tool calls", () => {
    const { calls, reply } = understand("hello jarvis");
    expect(calls).toHaveLength(0);
    expect(reply.length).toBeGreaterThan(0);
  });

  it("stays in character on unknown input", () => {
    const { reply } = understand("qwertyuiop asdfgh");
    expect(reply).toMatch(/sir/i);
  });

  it("never returns an empty reply", () => {
    for (const s of ["", "   ", "?", "jarvis", "do the thing"]) {
      expect(understand(s).reply.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("schema conformance", () => {
  it("all rules emit valid tool calls", () => {
    const corpus = [
      "status report", "full diagnostics", "scan the perimeter", "power 50",
      "suit up", "retract armour", "lockdown", "house party protocol",
      "set repulsors to 80", "red alert", "stand down", "timer for 2 minutes",
      "play some music", "make a note buy more palladium", "clear the log",
      "what time is it", "what's the weather", "tell me a joke", "help",
      "power down", "boost the uplink to 95", "thank you",
    ];
    for (const c of corpus) expectValidCalls(c);
  });
});
