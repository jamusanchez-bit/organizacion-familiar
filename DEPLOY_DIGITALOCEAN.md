Deployment steps for DigitalOcean App Platform (Option A)

Overview
--------
This repo contains a Node.js single-file server `working.cjs` that serves the frontend and API.
We'll provide a Dockerfile so you can deploy to DigitalOcean App Platform easily. App Platform will
provide HTTPS automatically and let you set environment variables (API_KEY / SESSION_SECRET / CAMON_SECRET).

Prerequisites
-------------
- A GitHub repo with this project pushed.
- A DigitalOcean account with App Platform access.
- (Optional) `doctl` CLI installed if you want to use the CLI.

Recommended env vars
--------------------
- API_KEY: OpenAI API key (for chat & TTS)
- SESSION_SECRET: random secret for sessions
- CAMON_SECRET: optional secret to protect Ca'mon POSTs
- PORT: optional (default 10000)

Quick steps (App Platform web UI)
---------------------------------
1. Push your code to GitHub.
2. In DigitalOcean, go to Apps -> Create App.
3. Connect your GitHub repo and pick the branch.
4. For the service, choose "Dockerfile" or "Build from source" and point to the root where `Dockerfile` is located.
   - If you pick "Dockerfile", App Platform will build the image automatically.
5. Set the run command: `node working.cjs` and the port to `10000` (or set PORT env var).
6. Add environment variables under "Environment" (API_KEY, SESSION_SECRET, CAMON_SECRET).
7. Deploy. App Platform will provide an HTTPS URL once the deployment completes.

Quick steps (doctl + repo)
--------------------------
1. Install and authenticate doctl: `doctl auth init`
2. Create app spec file or use the guided `doctl apps create --spec ./app.yaml`. See DigitalOcean docs.

Testing after deploy
--------------------
- Open the HTTPS URL provided by App Platform.
- Visit `/english?user=javier` to open the Ca'mon page.
- Test voice chat (chat -> record) in Chrome and accept microphone permission.

Notes & troubleshooting
-----------------------
- If voice doesn't start, open DevTools Console and check network calls to `/api/dev/log` and `/api/chat-elizabeth`.
- Ensure `API_KEY` is set in the App Platform env vars so server can call OpenAI.
- If TTS fails, the server will fallback to returning `response` text; the client uses `speechSynthesis` as a fallback.

If you want, I can prepare an `app.yaml` spec for DigitalOcean App Platform to create the app via `doctl` automatically; tell me your preferred domain and I'll generate it.
