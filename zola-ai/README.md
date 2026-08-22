# Zola AI Council

Zola AI Council is a no-model-download web assistant that routes each question to several currently free open-weight models, collects their independent answers, and asks a separate free “chair” model to synthesize one final response.

## How the council works

1. **Live catalog** — the app reads OpenRouter's current model catalog and admits only explicit `:free` routes with zero prompt and completion prices.
2. **Task routing** — a local heuristic classifies the request as general, reasoning, writing, or code.
3. **Diverse selection** — the router scores all current free models and chooses models from different provider/model families.
4. **Independent proposals** — 2–4 selected models answer independently in parallel.
5. **Chair synthesis** — another free model compares the proposals, resolves disagreements, removes unsupported claims, and streams a final answer.
6. **Transparent review** — users can expand “AI brains combined” beneath the final response to inspect every council draft and the actual model names returned by OpenRouter.

If Council mode is disabled, the router picks one known open-weight `:free` model and uses one request. If the live catalog is temporarily unavailable, `openrouter/free` is the last-resort automatic fallback.

## User requirements satisfied

- No AI model weights are downloaded to the user's computer.
- The app never selects a paid model; it blocks any route that is not `openrouter/free` or an explicit `:free` model ID.
- There is no subscription or per-token charge from Zola.
- The live free-model catalog is used instead of a stale hard-coded list.
- Qwen, Llama, Gemma, Nemotron, GPT-OSS, and other open models can participate whenever they are present in the live free catalog.

## Required free account

Cloud inference still needs someone to provide compute. This implementation uses OpenRouter's free tier:

1. Create an account at <https://openrouter.ai/>.
2. Create a key at <https://openrouter.ai/keys> (a credit card is not required for the free tier).
3. Paste the key into the in-app connection dialog — **never paste it into a chat message or commit it to Git**.

The key is sent directly from the browser to OpenRouter. It is held in `sessionStorage` by default and disappears when the browser session closes. “Remember” stores it in that browser's `localStorage`.

OpenRouter's free tier is rate-limited and the free model roster changes. Council mode uses `council size + 1` requests for each user question. The quick single-model mode uses one request.

## Privacy

No model weights are downloaded. Chats and knowledge documents are stored in browser local storage. To generate an answer, the latest question, relevant conversation context, attachments, and retrieved knowledge excerpts are sent to OpenRouter and the cloud inference providers selected for that request. Users should not submit secrets or sensitive personal data and should review their OpenRouter privacy settings.

## Run

```bash
cd zola-ai
python3 -m http.server 4173 --bind 0.0.0.0
```

Open `http://localhost:4173` or deploy the directory to any static HTTPS host.

## Tests

```bash
npm run check
```
