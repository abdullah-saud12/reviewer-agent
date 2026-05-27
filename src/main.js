import fs from 'fs';
import { securityAgent } from './agents/security.js';
import { performanceAgent } from './agents/performance.js';
import { aggregate } from './aggregator.js';

const SEVERITY_EMOJI = {
  critical: '🔴',
  high:     '🟠',
  medium:   '🟡',
  low:      '🔵',
  info:     '⚪',
};

// read diff from a file path or stdin when '-' is passed
async function readDiff(arg) {
  if (arg === '-') {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
  }
  return fs.readFileSync(arg, 'utf8');
}

function printFinding(finding, index) {
  const emoji = SEVERITY_EMOJI[finding.severity] ?? '•';
  const location = finding.file
    ? `  📄 ${finding.file}${finding.line ? `:${finding.line}` : ''}\n`
    : '';
  console.log(
    `${index + 1}. ${emoji} [${finding.severity.toUpperCase()}] [${finding.category}] ${finding.title}\n` +
    location +
    `  ${finding.description}\n`
  );
}

async function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.error('Usage: node src/main.js <diff-file> | node src/main.js -');
    process.exit(1);
  }

  let diff;
  try {
    diff = await readDiff(arg);
  } catch (err) {
    console.error(`Error reading diff: ${err.message}`);
    process.exit(1);
  }

  if (!diff.trim()) {
    console.log('No diff provided.');
    process.exit(0);
  }

  let findings;
  try {
    // run all agents in parallel
    const results = await Promise.all([
      securityAgent(diff),
      performanceAgent(diff),
    ]);
    findings = aggregate(results.flat());
  } catch (err) {
    console.error(`Review failed: ${err.message}`);
    process.exit(1);
  }

  if (findings.length === 0) {
    console.log('✅ No issues found.');
    process.exit(0);
  }

  console.log(`\nFound ${findings.length} issue${findings.length === 1 ? '' : 's'}:\n`);
  findings.forEach(printFinding);

  // exit 1 if any critical or high findings — allows use in CI
  const blocking = findings.some(f => f.severity === 'critical' || f.severity === 'high');
  process.exit(blocking ? 1 : 0);
}

main();
