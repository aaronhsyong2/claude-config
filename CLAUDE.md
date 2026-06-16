# Global Instructions

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

### Available Skills

- `/office-hours` — YC-style office hours
- `/plan-ceo-review` — CEO/founder plan review
- `/plan-eng-review` — Eng manager plan review
- `/plan-design-review` — Designer plan review
- `/design-consultation` — Design consultation with research
- `/design-shotgun` — Multiple AI design variants
- `/design-html` — Production-quality HTML output
- `/review` — Pre-landing PR review
- `/ship` — Ship workflow (merge, test, review, deploy)
- `/land-and-deploy` — Merge PR and deploy
- `/canary` — Post-deploy canary monitoring
- `/benchmark` — Performance regression detection
- `/browse` — Headless browser for QA and dogfooding
- `/connect-chrome` — Connect to running Chrome
- `/qa` — QA test and fix bugs
- `/qa-only` — Report-only QA testing
- `/design-review` — Visual QA audit
- `/setup-browser-cookies` — Import browser cookies
- `/setup-deploy` — Configure deployment settings
- `/setup-gbrain` — Set up gbrain for agent
- `/retro` — Weekly engineering retrospective
- `/investigate` — Systematic debugging
- `/document-release` — Post-ship docs update
- `/codex` — OpenAI Codex CLI wrapper
- `/cso` — Chief Security Officer audit
- `/autoplan` — Auto-review pipeline
- `/plan-devex-review` — Developer experience review
- `/devex-review` — Live DX audit
- `/careful` — Safety guardrails for destructive commands
- `/freeze` — Restrict edits to specific directory
- `/guard` — Full safety mode
- `/unfreeze` — Clear freeze boundary
- `/gstack-upgrade` — Upgrade gstack
- `/learn` — Manage project learnings
- `/autopilot` — Full gstack session orchestrator (idea to shipped product)


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
