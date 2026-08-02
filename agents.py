import os
from openai import OpenAI

BASE_URL = "https://agentrouter.org/v1"

AGENT_DEFS = {
    "researcher": {
        "model": "claude-sonnet-4-5-20250929",
        "system": "You are a research agent. Provide thorough, well-sourced, factual answers. Be concise but comprehensive.",
    },
    "coder": {
        "model": "gpt-4o",
        "system": "You are a coding agent. Write clean, efficient code. Explain your logic. Prefer Python and JavaScript.",
    },
    "writer": {
        "model": "claude-opus-4-5-20250929",
        "system": "You are a writing agent. Produce clear, engaging, well-structured prose. Adapt tone to the request.",
    },
    "analyzer": {
        "model": "deepseek-reasoner",
        "system": "You are an analysis agent. Break down complex problems step by step. Identify patterns, trade-offs, and risks.",
    },
}


def get_client():
    api_key = os.environ.get("AGENTROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("AGENTROUTER_API_KEY not set")
    return OpenAI(api_key=api_key, base_url=BASE_URL)


def route(task_type, user_message, history=None):
    agent = AGENT_DEFS.get(task_type)
    if not agent:
        raise ValueError(f"Unknown agent type: {task_type}. Available: {list(AGENT_DEFS.keys())}")

    client = get_client()
    messages = []

    if history:
        messages.extend(history)

    messages.append({"role": "system", "content": agent["system"]})
    messages.append({"role": "user", "content": user_message})

    stream = client.chat.completions.create(
        model=agent["model"],
        messages=messages,
        stream=True,
    )

    full_reply = ""
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            full_reply += delta
            print(delta, end="", flush=True)
    print()

    return full_reply


def list_agents():
    return list(AGENT_DEFS.keys())


def get_agent_info(name):
    return AGENT_DEFS.get(name)