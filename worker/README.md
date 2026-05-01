# SpellSmart TTS Worker

Cloudflare Worker that proxies Google Cloud Text-to-Speech for live TTS of user-uploaded words. Edge-caches responses so repeated words across users hit free.

## First-time setup

1. From `worker/`, install deps:
   ```
   npm install
   ```

2. Authenticate Wrangler with your Cloudflare account (one-time):
   ```
   npx wrangler login
   ```

3. Set the GCP service account secrets. Open your service account JSON
   (`spellsmart-494820-...json`) and copy the `client_email` and `private_key`
   fields:

   ```
   npx wrangler secret put GCP_CLIENT_EMAIL
   # paste the client_email value, e.g. spellsmart-tts@spellsmart-494820.iam.gserviceaccount.com

   npx wrangler secret put GCP_PRIVATE_KEY
   # paste the entire private_key value INCLUDING the -----BEGIN/END----- lines
   # and the \n escape sequences exactly as they appear in the JSON
   ```

4. Deploy:
   ```
   npm run deploy
   ```

   Wrangler prints the URL, something like
   `https://spellsmart-tts.<account>.workers.dev`. Add that to
   `app.json`'s `extra.ttsProxyUrl`.

## Local testing

`.dev.vars` (gitignored) contains the same secrets for local dev:
```
GCP_CLIENT_EMAIL=...
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Then `npm run dev` and visit
`http://localhost:8787/?text=hello` — should download an mp3.

## API

```
GET /?text=<text>
```

Returns `audio/mpeg` of the spoken text. Cached at the edge for 30 days
keyed by voice + text — repeated requests for the same text are served
from cache without hitting GCP.

`text` is capped at 200 characters.
