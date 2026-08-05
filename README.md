# AgentRouter Chatbot + TelLink Customer Support

A CLI chatbot, web UI, and **TelLink AI-powered customer support chatbot** powered by AgentRouter — one API key, access to every major LLM.

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

## TelLink Customer Support Chatbot (Live)

The web app is deployed at **https://comradeonboard.github.io/agentrouter-chatbot/**

### Backend (Node.js/Express)

```bash
npm install
npm run init-db
npm start
```

The server runs on port 3001.

Endpoints:
- `POST /api/chat` — Send a customer question (accepts `{ customerId, question }`)
- `GET /api/credits` — Check remaining credit balance
- `GET /api/customers` — List all customers
- `GET /api/health` — Health check

### Web App (React)

```bash
cd src/web
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Mobile App (React Native)

```bash
cd src/mobile
npm install
npm start
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Your Gemini API token | — |
| `GEMINI_MODEL` | Gemini model for support chatbot | `gemini-2.0-flash` |
| `PORT` | Express server port | `3001` |
| `CREDITS_PER_CALL` | Credits deducted per API call | `0.50` |

## Project Structure

```
agentrouter-chatbot/
├── chatbot.py           CLI chatbot with streaming and model switching
├── web_ui.py            Flask web UI with streaming responses
├── agents.py            Multi-agent routing (researcher, coder, writer, analyzer)
├── server.js            Express backend for TelLink support chatbot
├── package.json         Node.js dependencies for backend
├── database/
│   ├── init.sql         SQLite schema and seed data
│   ├── setup.js         Database initialization script
│   └── tellink.db       SQLite database (gitignored)
├── src/
│   ├── web/             React web app (Vite)
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── index.html
│   │   └── src/
│   │       ├── App.jsx
│   │       ├── main.jsx
│   │       └── components/
│   │       └── Chat.jsxx
│   └── mobile/          React Native mobile app
│       ├── package.json
│       ├── App.js
│       └── src/
│           └── components/
│               └── Chat.js
├── requirements.txt     Python dependencies
├── .env.example         Environment template
└── README.md            This file
```