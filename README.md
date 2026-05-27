# 🔍 reviewer-agent

> **AI-powered code review engine.** Point it at a diff, get back structured, ranked findings — security vulnerabilities, performance issues, and more.

---

## ✨ What it does

`reviewer-agent` runs your code diff through specialized AI agents, each focused on a single review category. Findings are validated, deduplicated, and ranked by severity before being printed to your terminal — or piped into your CI pipeline.

```
git diff | node src/main.js -
```

```
Found 4 issues:

1. 🔴 [CRITICAL] [security] SQL Injection Vulnerability
   📄 src/user.js:6
   User input is interpolated directly into a SQL query...

2. 🟠 [HIGH] [performance] N+1 Query Pattern
   📄 src/user.js:12
   One database query is executed per item in a loop...

3. 🟡 [MEDIUM] [security] Missing Authorization Check
   📄 src/user.js:5
   No ownership check before returning user data...

4. 🔵 [LOW] [performance] Unnecessary SELECT *
   📄 src/user.js:6
   Fetching all columns increases payload size...
```

---

## 🚀 Quick start

```bash
# Install dependencies
npm install

# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-...

# Review a diff file
node src/main.js changes.diff

# Or pipe directly from git
git diff | node src/main.js -

# Review the last commit
git diff HEAD~1 | node src/main.js -

# Review everything since branching from main
git diff main...dev | node src/main.js -
```

---

## 🤖 Agents

| Agent | Covers |
|-------|--------|
| **Security** | OWASP Top 10 — injection, XSS, hardcoded secrets, broken auth, data exposure, insecure deps |
| **Performance** | N+1 queries, O(n²) algorithms, missing caching, blocking I/O, unnecessary allocations |

Each agent is a focused system prompt built on a shared base — adding a new category is [one file](#adding-a-new-agent).

---

## 🏗️ Architecture

```
git diff | node src/main.js -
              │
              ├─ securityAgent(diff)    ─┐
              │                          ├─ Promise.all → aggregate() → print
              └─ performanceAgent(diff) ─┘

Each agent:
  base.js → llm-client.js → Anthropic API
                ↓
           validateFinding()
                ↓
        retry once with errors if invalid
```

**Key design decisions:**

- **One agent per category** — focused prompts outperform a single mega-prompt and findings are easier to filter and tune
- **Retry logic in `llm-client.js`** — agents trust that what comes back is valid JSON; retry is an implementation detail of the client
- **Aggregator is plain JS** — filter → deduplicate → rank with no AI call; deterministic and cheap
- **Exit code `1` on critical/high** — drop it into any CI pipeline as a quality gate

---

## 🔧 CI integration

```yaml
# GitHub Actions example
- name: Review diff
  run: git diff origin/main | node src/main.js -
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

The process exits `0` (pass) if no critical or high findings are found, `1` (fail) otherwise.

---

## ➕ Adding a new agent

Create `src/agents/<name>.js`:

```js
import { createAgent } from './base.js';

export const myAgent = createAgent({
  category: 'my-category',
  systemPrompt: `You are a ... reviewer. Return only a JSON array of findings.`,
});
```

Then register it in `src/main.js`:

```js
import { myAgent } from './agents/my-agent.js';

const results = await Promise.all([
  securityAgent(diff),
  performanceAgent(diff),
  myAgent(diff),           // ← add here
]);
```

Add the new category to `src/constants/findings.js`:

```js
export const CATEGORIES = ['security', 'performance', 'my-category'];
```

That's it — nothing else changes.

---

## 📦 Tech stack

- **Node.js 20+** — ES modules (`import`/`export`)
- **[@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk)** — one API call per agent per diff
- **Plain JavaScript** — no build step, runs with `node` directly

---

## 🗺️ Roadmap

See [`docs/VISION.md`](docs/VISION.md) for the full platform vision. V1 scope is the engine only — diff in, review out.

- [ ] GitHub webhook integration
- [ ] PR comment posting
- [ ] Multi-provider LLM support (OpenAI, Gemini)
- [ ] Eval suite for prompt quality measurement
- [ ] More agents: style, accessibility, test coverage
