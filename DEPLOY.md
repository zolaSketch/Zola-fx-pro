# Deploy J.A.R.V.I.S. — permanent link in ~3 minutes

The sandbox preview is temporary and enforces an access token, so a phone can
never reach it. Deploying gives you a permanent HTTPS URL that also unblocks
the live network features (weather, Wikipedia, exchange rates, the LLM).

## One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FzolaSketch%2FZola-fx-pro%2Ftree%2Farena%2F019ffe82-zola-fx-pro&project-name=jarvis&repository-name=jarvis)

## Or manually

1. Go to **[vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
2. Import **`zolaSketch/Zola-fx-pro`**.
3. Set **Branch** to `arena/019ffe82-zola-fx-pro` (not `main`).
4. Framework preset is detected automatically (Next.js). Leave build settings alone.
5. Optional — add environment variables for LLM conversation:

   | Name | Value |
   | --- | --- |
   | `OPENAI_API_KEY` | your key |
   | `OPENAI_BASE_URL` | `https://opencode.ai/zen/v1` |
   | `JARVIS_MODEL` | `claude-sonnet-4-5` |

   Skip these and JARVIS still runs fully on local cognition.
6. Click **Deploy**.

You get a permanent URL such as `https://jarvis-xxxx.vercel.app`.

## Then install it on your phone

1. Open that URL in **Chrome** (Android) or **Safari** (iPhone — required, Chrome
   on iOS cannot install web apps).
2. Tap **INSTALL J.A.R.V.I.S.** when the card appears, or use:
   - Android: ⋮ → *Add to Home screen*
   - iPhone: Share ⬆️ → *Add to Home Screen*
3. Launch it from the home screen icon — fullscreen, no browser chrome.

## Verify it worked

Open `https://your-url.vercel.app/api/health`.

- `"verdict": "LLM uplink operational."` — everything works, including chat.
- Anything else — every tool, the offline knowledge core, memory and voice
  still work; only free-form chat falls back to rules.

## Alternatives

Any Node host works, since this is a standard Next.js app:

```bash
npm install
npm run build
npm run start        # serves on 0.0.0.0:3000
```

Netlify, Cloudflare Pages, Railway and Render all deploy it from the same
repository with no configuration changes.
