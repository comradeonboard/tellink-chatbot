# AgentRouter Chatbot

A CLI chatbot and web UI powered by AgentRouter — one API key, access to every major LLM.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and paste your token
```

## Run CLI Chatbot

```bash
source .env
python chatbot.py
```

Commands:
- `/models` — list available models
- `/switch <num>` — switch model
- `/clear` — clear conversation history
- `/quit` — exit

## Run Web UI

```bash
source .env
python web_ui.py
```

Open http://localhost:5000 in your browser.

## Run Multi-Agent

```bash
source .env
python -c "from agents import route; route('researcher', 'Explain quantum computing')"
```

Available agents: `researcher`, `coder`, `writer`, `analyzer`

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `AGENTROUTER_API_KEY` | Your AgentRouter API token | — |
| `AR_MODEL` | Default model for CLI | `gpt-4o` |

## Project Structure

```
agentrouter-chatbot/
├── chatbot.py       CLI chatbot with streaming and model switching
├── web_ui.py        Flask web UI with streaming responses
├── agents.py        Multi-agent routing (researcher, coder, writer, analyzer)
├── requirements.txt Dependencies
├── .env.example     Environment template
└── README.md        This file
```