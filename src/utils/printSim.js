// printSim.js — tiny, safe "pretend Python" for Lesson 1: understands print("text") and print(2 + 3).
// Instant, works offline on every platform (no server, no Pyodide download needed for the puzzles).

function calc(expr) {
  const t = expr.replace(/\s+/g, '');
  if (!/^\d+([+\-*]\d+)*$/.test(t)) return null;
  const parts = t.match(/\d+|[+\-*]/g);
  const nums = [Number(parts[0])];
  const ops = [];
  for (let i = 1; i < parts.length; i += 2) {
    const op = parts[i], n = Number(parts[i + 1]);
    if (op === '*') nums[nums.length - 1] *= n;
    else { ops.push(op); nums.push(n); }
  }
  return ops.reduce((r, op, i) => (op === '+' ? r + nums[i + 1] : r - nums[i + 1]), nums[0]);
}

export function simulate(code) {
  const out = [];
  for (const raw of code.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^print\((.*)\)$/);
    if (!m) return { lines: out, error: true };
    const arg = m[1].trim();
    const s = arg.match(/^"(.*)"$/) || arg.match(/^'(.*)'$/);
    if (s) { out.push(s[1]); continue; }
    const n = calc(arg);
    if (n !== null) { out.push(String(n)); continue; }
    return { lines: out, error: true };
  }
  return { lines: out, error: false };
}
