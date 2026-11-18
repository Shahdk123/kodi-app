// codeRunner.web.js — runs Python IN THE BROWSER (Pyodide). No server needed on GitHub Pages.
// Metro picks this file automatically on web; iOS/Android keep using codeRunner.js (Flask).
// Runs inside a Web Worker so a kid's `while True:` can be killed after 5s.

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

const WORKER_SRC = `
importScripts('${PYODIDE_URL}');
const ready = loadPyodide();
self.onmessage = async (e) => {
  const py = await ready;
  let out = '';
  py.setStdout({ batched: (s) => { out += s + '\\n'; } });
  py.setStderr({ batched: (s) => { out += s + '\\n'; } });
  try {
    await py.runPythonAsync(e.data.code);
    self.postMessage({ ok: true, out });
  } catch (err) {
    self.postMessage({ ok: false, out, err: String((err && err.message) || err) });
  }
};
`;

let worker = null;

function startWorker() {
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  worker = new Worker(url);
  return worker;
}

// Warm up so Python is already loaded by the time the child taps ▶
if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
  try { startWorker(); } catch {}
}

// Keep only the useful end of a Python traceback, e.g. "SyntaxError: invalid syntax" + line
function friendlyError(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const last = lines[lines.length - 1] || raw;
  const lineMatch = raw.match(/File "<exec>", line (\d+)/);
  return (lineMatch ? `سطر ${lineMatch[1]} — ` : '') + last;
}

export async function runPythonCode(code) {
  if (!worker) startWorker();
  const w = worker;

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      w.terminate();
      worker = null;
      startWorker(); // fresh Python ready for next run
      resolve({ text: '⏱️ الكود اتأخر أكتر من 5 ثواني', isError: true });
    }, 5000 + (w.__warm ? 0 : 25000)); // first run: allow time to download Python

    w.onmessage = (e) => {
      clearTimeout(timer);
      w.__warm = true;
      const { ok, out, err } = e.data;
      const text = (out || '').trim();
      if (ok) return resolve({ text: text || '(no output)', isError: false });
      resolve({ text: text ? text + '\n\n⚠️ ' + friendlyError(err) : '⚠️ ' + friendlyError(err), isError: !text });
    };
    w.onerror = () => {
      clearTimeout(timer);
      resolve({ text: '⚠️ مش قادر أحمّل بايثون — اتأكد إن النت شغال', isError: true });
    };
    w.postMessage({ code });
  });
}
