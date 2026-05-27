import { SEVERITIES } from './constants/findings.js';

const SEVERITY_RANK = Object.fromEntries(SEVERITIES.map((s, i) => [s, i]));

// drop info findings unless they are the only ones present
function filter(findings) {
  const meaningful = findings.filter(f => f.severity !== 'info');
  return meaningful.length > 0 ? meaningful : findings;
}

// merge findings with the same title+file, keeping the higher severity
function deduplicate(findings) {
  const map = new Map();
  for (const finding of findings) {
    const key = `${finding.title.toLowerCase()}::${finding.file ?? ''}`;
    const existing = map.get(key);
    if (!existing || SEVERITY_RANK[finding.severity] < SEVERITY_RANK[existing.severity]) {
      map.set(key, finding);
    }
  }
  return Array.from(map.values());
}

// sort by severity: critical first, info last
function rank(findings) {
  return [...findings].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

export function aggregate(findings) {
  return rank(deduplicate(filter(findings)));
}
