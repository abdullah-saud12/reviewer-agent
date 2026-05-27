import { callModel } from '../llm-client.js';

// factory that binds a category and system prompt to a reusable review function
export function createAgent({ category, systemPrompt }) {
  // returned function is what callers invoke with a diff string
  return async function reviewDiff(diff) {
    const userMessage = [
      `Review the following code diff and return a JSON array of findings.`,
      `Each finding must include: category, severity, title, description, and optionally file and line.`,
      `Return only the JSON array — no explanation, no markdown.\n`,
      `Diff:\n${diff}`,
    ].join('\n');

    return callModel({ systemPrompt, userMessage });
  };
}
