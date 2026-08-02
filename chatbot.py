import os
import sys
from openai import OpenAI

BASE_URL = "https://agentrouter.org/v1"
DEFAULT_MODEL = "gpt-4o"

AVAILABLE_MODELS = [
    "gpt-4o",
    "gpt-4o-mini",
    "claude-sonnet-4-5-20250929",
    "claude-opus-4-5-20250929",
    "gemini-2.5-pro",
    "deepseek-reasoner",
    "deepseek-v3",
    "qwen-max",
]


def get_client(api_key):
    return OpenAI(api_key=api_key, base_url=BASE_URL)


def list_models(client):
    try:
        models = client.models.list()
        return [m.id for m in models.data]
    except Exception:
        return AVAILABLE_MODELS


def chat_stream(client, model, messages):
    print(f"\n[{model}] ", end="", flush=True)
    full_reply = ""
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            full_reply += delta
            print(delta, end="", flush=True)
    print("\n")
    return full_reply


def chat_once(client, model, messages):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=False,
    )
    return response.choices[0].message.content


def show_models(client):
    models = list_models(client)
    print("\nAvailable models:")
    for i, m in enumerate(models, 1):
        marker = " *" if m == DEFAULT_MODEL else ""
        print(f"  {i}. {m}{marker}")
    print()


def main():
    api_key = os.environ.get("AGENTROUTER_API_KEY")
    if not api_key:
        print("Error: set AGENTROUTER_API_KEY environment variable", file=sys.stderr)
        sys.exit(1)

    client = get_client(api_key)
    model = os.environ.get("AR_MODEL", DEFAULT_MODEL)
    messages = []

    print(f"AgentRouter Chatbot — model: {model}")
    print("Commands: /models, /switch <num>, /clear, /quit\n")

    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit", "q"):
            print("Goodbye.")
            break

        if user_input == "/models":
            show_models(client)
            continue

        if user_input.startswith("/switch"):
            parts = user_input.split()
            if len(parts) < 2:
                print("Usage: /switch <number>")
                show_models(client)
                continue
            try:
                idx = int(parts[1]) - 1
                models = list_models(client)
                model = models[idx]
                print(f"Model switched to: {model}\n")
            except (ValueError, IndexError):
                print("Invalid model number. Try /models")
            continue

        if user_input == "/clear":
            messages = []
            print("History cleared.\n")
            continue

        messages.append({"role": "user", "content": user_input})

        try:
            reply = chat_stream(client, model, messages)
            messages.append({"role": "assistant", "content": reply})
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()