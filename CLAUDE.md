# Global Instructions

## Web browsing

Use the `chrome-devtools` MCP tools (`mcp__chrome-devtools__*`) for browser work —
navigation, form filling, screenshots, console and network inspection, performance
traces, Lighthouse audits. Prefer `take_snapshot` over a screenshot when you need
the page's structure rather than its pixels.

`mcp__claude-in-chrome__*` is the fallback when you need the user's own logged-in
Chrome session rather than a fresh browser.

# Global Claude Code memory

## Building agents and skills
When designing, scaffolding, refactoring, or reviewing an agent, a skill, an MCP
integration, a system prompt, or any agentic workflow, use the **`build-an-agent`**
skill as the source of truth. It's installed at `~/.claude/skills/build-an-agent/`
and auto-loads via progressive disclosure, so you usually don't need to do anything
special — but if a task touches agent architecture and the skill hasn't triggered,
consult it explicitly.

Quick reminder of the house style (full detail in the skill):
- Decouple interface (MCP) from behavior (skills); keep the model's standing
  context lean.
- No god prompts — scoped skills loaded on demand, not one giant system prompt.
- One job per skill; compose via skills calling skills.
- Offload deterministic work to bundled `scripts/`; the model reads stdout/stderr.
- Version-control skills in git; use scoped, short-lived credentials.
