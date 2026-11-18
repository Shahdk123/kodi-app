// codeRunner.js — sends code to the local Python backend for execution
// The backend is a tiny Flask server (server.py) you run separately.
// If it's not running, the app shows a helpful error message.

// Change this to your computer's local IP if testing on a physical phone
// e.g. 'http://192.168.1.5:5001'
// For simulator/emulator, localhost works fine.
const BASE_URL = 'http://localhost:5001';

export async function runPythonCode(code) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const resp = await fetch(`${BASE_URL}/run_code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await resp.json();

    if (data.error && !data.output) {
      return { text: data.error, isError: true };
    }
    const out = data.output || '';
    const err = data.error  || '';
    return {
      text: out + (err ? '\n\n⚠️ ' + err : '') || '(no output)',
      isError: !!err && !out,
    };
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === 'AbortError') {
      return { text: '⏱️ Request timed out after 8 seconds', isError: true };
    }
    throw e;   // let the caller show the "start server.py" message
  }
}
