import json

from flask import Flask, render_template_string, request, jsonify, session, Response
from openai import OpenAI
import os

BASE_URL = "https://agentrouter.org/v1"
DEFAULT_MODEL = "gpt-4o"

app = Flask(__name__)
app.secret_key = os.urandom(24).hex()

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AgentRouter Chatbot</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; height: 100vh; display: flex; flex-direction: column; }
#header { background: #16213e; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #0f3460; }
#header h1 { font-size: 16px; color: #e94560; }
#model-select { background: #0f3460; color: #e0e0e0; border: 1px solid #1a1a4e; padding: 6px 10px; border-radius: 6px; font-size: 13px; }
#chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.message { max-width: 80%; padding: 10px 16px; border-radius: 12px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
.user { background: #e94560; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
.bot { background: #16213e; color: #e0e0e0; align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid #0f3460; }
#input-area { padding: 12px 20px; background: #16213e; border-top: 1px solid #0f3460; display: flex; gap: 10px; }
#input { flex: 1; background: #0f3460; color: #e0e0e0; border: 1px solid #1a1a4e; padding: 10px 14px; border-radius: 8px; font-size: 14px; outline: none; }
#input:focus { border-color: #e94560; }
#send { background: #e94560; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
#send:hover { background: #c73652; }
#send:disabled { opacity: 0.5; cursor: not-allowed; }
#typing { color: #888; font-size: 13px; padding: 4px 20px; display: none; }
</style>
</head>
<body>
<div id="header">
  <h1>AgentRouter Chat</h1>
  <select id="model-select"></select>
</div>
<div id="chat"></div>
<div id="typing">Bot is typing...</div>
<div id="input-area">
  <input id="input" placeholder="Type a message..." autocomplete="off" />
  <button id="send">Send</button>
</div>
<script>
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const modelSelect = document.getElementById('model-select');
const typing = document.getElementById('typing');

function scroll() { chat.scrollTop = chat.scrollHeight; }

function addMsg(role, text) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.textContent = text;
  chat.appendChild(div);
  scroll();
}

async function loadModels() {
  const res = await fetch('/api/models');
  const data = await res.json();
  modelSelect.innerHTML = '';
  data.models.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    if (m === data.default) opt.selected = true;
    modelSelect.appendChild(opt);
  });
}

async function send() {
  const text = input.value.trim();
  if (!text) return;
  addMsg('user', text);
  input.value = '';
  sendBtn.disabled = true;
  typing.style.display = 'block';

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: text, model: modelSelect.value})
  });
  typing.style.display = 'none';
  sendBtn.disabled = false;

  if (res.status === 401) {
    addMsg('bot', 'Error: Invalid API key. Set AGENTROUTER_API_KEY.');
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  addMsg('bot', '');
  const botMsg = chat.lastChild;

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices[0].delta.content;
          if (delta) {
            fullText += delta;
            botMsg.textContent = fullText;
            scroll();
          }
        } catch(e) {}
      }
    }
  }
}

input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
sendBtn.addEventListener('click', send);

loadModels();
</script>
</body>
</html>"""


def get_client():
    api_key = os.environ.get("AGENTROUTER_API_KEY")
    if not api_key:
        return None
    return OpenAI(api_key=api_key, base_url=BASE_URL)


@app.route("/")
def index():
    return render_template_string(TEMPLATE)


@app.route("/api/models")
def models():
    client = get_client()
    default = DEFAULT_MODEL
    try:
        if client:
            resp = client.models.list()
            model_list = [m.id for m in resp.data]
            return jsonify({"models": model_list, "default": default})
    except Exception:
        pass
    return jsonify({"models": [DEFAULT_MODEL], "default": default})


@app.route("/api/chat", methods=["POST"])
def chat():
    client = get_client()
    if not client:
        return jsonify({"error": "API key not set"}), 401

    data = request.get_json()
    message = data.get("message", "")
    model = data.get("model", DEFAULT_MODEL)

    if "messages" not in session:
        session["messages"] = []

    session["messages"].append({"role": "user", "content": message})

    try:
        stream = client.chat.completions.create(
            model=model,
            messages=session["messages"],
            stream=True,
        )

        def generate():
            full = ""
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    full += delta
                    yield "data: " + json.dumps({"content": delta}) + "\n\n"
            session["messages"].append({"role": "assistant", "content": full})
            yield "data: [DONE]\n\n"

        return Response(generate(), mimetype="text/event-stream")
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)