# AI Code Review Engine

## What this is
A command-line engine that reviews a code diff and returns structured, ranked
findings. Specialized AI agents (Security, Performance) each review the diff in
their own category and return validated JSON; an aggregator filters low-confidence
noise, de-duplicates, and ranks by severity.

This is stage one of a larger platform. Full vision lives in `docs/VISION.md`.
Current scope = the engine only: diff in, review out. No GitHub, server, or DB yet.

## Start of every session
**Always read `PROGRESS.md` first.** It records where the last session ended and what's next. Before wrapping up, update it with what changed and what comes next.

## Tech stack
- Node.js 20+ (ES modules: use `import`/`export`, not `require`)
- Plain JavaScript (no TypeScript in V1; can add types later if it grows)
- Anthropic API via the official `@anthropic-ai/sdk` (one call per agent per diff)
- Output validation via lightweight runtime checks (see "Working rules")
- No web framework, database, or queue in V1

## Common commands
- Install deps: `npm install`
- Run a review: `node src/main.js <diff-file>` or `git diff | node src/main.js -`
- Run evals: `node evals/run-evals.js`

## Project layout
- `src/schema.js` — the `Finding` shape + a `validateFinding()` runtime check
- `src/llm-client.js` — Anthropic SDK wrapper
- `src/agents/base.js` — the reusable agent loop (shared by all agents)
- `src/agents/<name>.js` — one specialized reviewer per category (just a prompt)
- `src/aggregator.js` — filter → dedupe → rank (plain JS, no AI call)
- `src/main.js` — CLI entry point
- `evals/run-evals.js` — quality measurement against labelled diffs
- `docs/VISION.md` — the full platform PRD (do not treat as V1 scope)

## How to add a new review category
Create a new file under `src/agents/` that exports an agent built on the shared
base (a `category` string + a `SYSTEM_PROMPT`), then register it in the agents
list in `main.js`. Add the new category to the allowed categories in `schema.js`.
Nothing else changes.

## Code style
- ES modules everywhere (`import`/`export`). Set `"type": "module"` in package.json.
- Prefer clear, readable code over clever code; this is a portfolio project.
- Use `async`/`await`, not raw promise chains.
- Small, single-purpose modules — keep the agent loop and the prompts separate.
- Every agent must return findings that pass `validateFinding()`.

## Working rules
- One task per session. Don't sprawl a single conversation across unrelated work.
- Explore and plan before implementing; show the plan before writing code.
- No TypeScript build step in V1 — keep it runnable with plain `node`.
- Validate model output at runtime: parse the JSON, check required fields and
  types, and retry once if it's malformed (JS won't catch this for you the way
  Pydantic did, so the check has to be explicit).
- When changing an agent's system prompt, run the evals to confirm it actually
  improved results before committing — don't tune on vibes.
- Keep a prompt journal: when a prompt change helps, note what changed and why
  in `PROGRESS.md` so the lesson survives.
- Do not expand scope into GitHub/webhooks/database work — that's a later stage.

## Decisions & why
- Plain JavaScript for V1 (simpler to start); the eventual platform in VISION.md
  targets TypeScript, so adding types is a planned later step, not a rewrite.
- One agent per category (not one mega-prompt) so each reviewer stays focused
  and findings are easier to attribute and filter.
- Aggregator is deterministic JS, not an LLM call — cheaper and more reliable.
- Default model is the fast/cheap tier per agent; escalate a specific agent to a
  stronger model only if evals show it's missing real issues.

## Lessons learned / gotchas
<!-- Add to this as you go. Example format: -->
<!-- - Models wrap JSON in ```fences``` despite instructions — strip them before JSON.parse. -->