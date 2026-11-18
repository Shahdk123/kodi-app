# server.py — Minimal Python backend for the Kodi mobile app
#
# Only does ONE thing: execute Python code safely and return the output.
# All lesson logic, TTS, and speech recognition run natively on the device.
#
# Run with: python server.py
# Then the Expo app calls http://localhost:5001/run_code

import os, sys, subprocess, tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)   # allow requests from the Expo app (different origin)

BLOCKED = [
    "import os", "import sys", "import subprocess", "import socket",
    "import requests", "open(", "__import__", "exec(", "eval("
]

@app.route("/run_code", methods=["POST"])
def run_code():
    data = request.get_json()
    code = (data or {}).get("code", "").strip()
    if not code:
        return jsonify({"output": "", "error": "لا يوجد كود"})

    lower = code.lower()
    for b in BLOCKED:
        if b in lower:
            return jsonify({"output": "", "error": f"⚠️ أمر غير مسموح: {b}"})

    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py",
                                          delete=False, encoding="utf-8") as f:
            f.write(code); tmp = f.name
        result = subprocess.run(
            [sys.executable, tmp], capture_output=True,
            text=True, timeout=5, encoding="utf-8"
        )
        os.unlink(tmp)
        err = "\n".join(
            l.replace(tmp, "code.py") if 'File "' in l else l
            for l in result.stderr.split("\n")
        ).strip()
        return jsonify({"output": result.stdout.strip(), "error": err})
    except subprocess.TimeoutExpired:
        try: os.unlink(tmp)
        except: pass
        return jsonify({"output": "", "error": "⏱️ الكود اتأخر أكتر من 5 ثواني"})
    except Exception as e:
        return jsonify({"output": "", "error": str(e)})

@app.route("/health")
def health():
    return jsonify({"ok": True, "msg": "Kodi code server running ✅"})

if __name__ == "__main__":
    print("\n🐍 Kodi Code Server running on http://localhost:5001\n")
    app.run(port=5001, debug=False)
