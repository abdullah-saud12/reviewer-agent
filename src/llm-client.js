import Anthropic from '@anthropic-ai/sdk';
import { validateFinding } from './schema.js';

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

// single shared client instance — reads ANTHROPIC_API_KEY from env
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// remove ```json or ``` fences models add despite instructions
function stripFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

// prepend the prefill character and parse into an array of raw finding objects
function parseFindings(text, prefill = '') {
  const parsed = JSON.parse(stripFences(prefill + text));
  return Array.isArray(parsed) ? parsed : [parsed];
}

// validate every finding and collect all errors prefixed with their index
function collectErrors(findings) {
  return findings.flatMap((finding, i) => {
    const result = validateFinding(finding);
    return result.valid ? [] : result.errors.map(e => `finding[${i}]: ${e}`);
  });
}

// call the model, validate findings, retry once with errors if invalid, throw if still broken
export async function callModel({ systemPrompt, userMessage, model = DEFAULT_MODEL }) {
  // prefill forces the model to continue a JSON array rather than adding prose
  const PREFILL = '[';
  const messages = [
    { role: 'user', content: userMessage },
    { role: 'assistant', content: PREFILL },
  ];

  const firstResponse = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  const firstText = firstResponse.content[0].text;
  let findings;

  try {
    findings = parseFindings(firstText, PREFILL);
  } catch {
    throw new Error(`Model returned non-JSON output: ${firstText.slice(0, 200)}`);
  }

  const errors = collectErrors(findings);
  if (errors.length === 0) return findings;

  // inject the exact errors into the retry prompt so the model knows what to fix
  const retryMessages = [
    ...messages,
    { role: 'assistant', content: firstText },
    {
      role: 'user',
      content: `Your response had the following validation errors. Fix them and return only the corrected JSON array:\n\n${errors.join('\n')}`,
    },
  ];

  const retryResponse = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: retryMessages,
  });

  const retryText = retryResponse.content[0].text;

  try {
    findings = parseFindings(retryText);
  } catch {
    throw new Error(`Model returned non-JSON output on retry: ${retryText.slice(0, 200)}`);
  }

  const retryErrors = collectErrors(findings);
  if (retryErrors.length > 0) {
    throw new Error(`Findings failed validation after retry:\n${retryErrors.join('\n')}`);
  }

  return findings;
}
