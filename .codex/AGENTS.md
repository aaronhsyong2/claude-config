# Codex Compatibility Layer

This repository is the canonical source for the user's shared coding-agent configuration. Keep this file lean: reusable behavior belongs in `rules/`, `skills/`, `agents/`, or `commands/`, not in this standing prompt.

## Progressive rule loading

Before editing code, read only the rules that apply to the task:

- Apply the relevant files under `rules/common/`.
- For TypeScript or JavaScript work, also apply the relevant files under `rules/typescript/`.
- Language-specific rules override common rules when they conflict.
- `rules/common/security.md`, `rules/common/testing.md`, and `rules/common/git-workflow.md` are required when the task touches those areas.
- Treat `rules/common/hooks.md` and `hooks/sensitive-path-guard.sh` as safety policy. Codex's sandbox and approval controls provide the executable boundary because Claude hooks do not run in Codex.

Do not load every rule pre-emptively. Use progressive disclosure and keep working context focused.

## Canonical workflows

- `skills/` is the canonical workflow surface. Read a selected skill's `SKILL.md` completely before following it.
- `commands/` is the legacy command compatibility surface. A Codex adapter for a command must read the corresponding command file completely before execution.
- When creating or reviewing agents, skills, MCP integrations, system prompts, or agentic workflows, use the `build-an-agent` skill as the source of truth.
- Do not duplicate shared workflow content in Codex configuration. Codex-specific files should adapt the canonical source to Codex capabilities.

## Agent roles

Project-local Codex roles under `.codex/agents/` adapt the canonical definitions under `agents/`:

- `backend`, `database`, `frontend`, `test`, and `docs` implement scoped domain work.
- `code-reviewer`, `comment-analyzer`, `pr-test-analyzer`, `silent-failure-hunter`, `type-design-analyzer`, and `code-simplifier` support the `commands/ecc-review-pr.md` review stack.

Each role must read its named canonical `agents/<role>.md` file before acting. Respect the scope paths and dependency ordering supplied by the parent workflow. Use independent roles in parallel when the active workflow calls for it.

## Browser and documentation tools

Use Codex's available browser-native tools for navigation, screenshots, console/network inspection, and browser validation. Prefer structural snapshots when page structure matters more than pixels. Do not claim to have used a Claude-only MCP or a tool that is not enabled in the active Codex session.

For ordinary documentation research, use built-in web search or the `docs-researcher` role and prefer primary sources. If a workflow explicitly requires an unavailable integration such as Context7, report the missing dependency instead of claiming parity.

## External actions and local safety

- Treat networked tools as read-only unless the user explicitly approves a state-changing action such as posting, publishing, pushing, merging, changing credentials, or modifying a third-party resource.
- Preserve user configuration and unrelated worktree changes.
- Never hardcode or expose secrets.
- Review the diff and run relevant verification before proposing a commit or push.
- Do not bypass Codex sandbox or approval controls.
