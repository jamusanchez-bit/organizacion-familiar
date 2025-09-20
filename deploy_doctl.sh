#!/usr/bin/env bash
set -euo pipefail

echo "Deploy to DigitalOcean App Platform via doctl"

if ! command -v doctl >/dev/null 2>&1; then
  echo "doctl not found. Install from https://docs.digitalocean.com/reference/doctl/ and authenticate (doctl auth init)"
  exit 1
fi

read -p "GitHub repo (owner/repo) [jamusanchez-bit/organizacion-familiar]: " REPO
REPO=${REPO:-jamusanchez-bit/organizacion-familiar}

read -p "OpenAI API key (API_KEY) (will be hidden): " -r API_KEY
if [ -z "$API_KEY" ]; then
  echo "API_KEY is required for TTS/chat; aborting."; exit 1
fi

read -p "SESSION_SECRET (press enter to auto-generate): " -r SESSION_SECRET
if [ -z "$SESSION_SECRET" ]; then
  SESSION_SECRET=$(head -c 32 /dev/urandom | base64 | tr -d '\n')
  echo "Generated SESSION_SECRET"
fi

read -p "CAMON_SECRET (optional, press enter to leave empty): " -r CAMON_SECRET

SPEC_FILE="app.spec.generated.yaml"
cat > "$SPEC_FILE" <<EOF
name: organizacion-familiar-app
services:
  - name: web
    github:
      repo: "$REPO"
      branch: "main"
      deploy_on_push: true
    dockerfile_path: Dockerfile
    run_command: "node working.cjs"
    instance_size_slug: "basic-xxs"
    instance_count: 1
    envs:
      - key: API_KEY
        scope: RUN_AND_BUILD
        value: "$API_KEY"
      - key: SESSION_SECRET
        scope: RUN_AND_BUILD
        value: "$SESSION_SECRET"
      - key: CAMON_SECRET
        scope: RUN_AND_BUILD
        value: "$CAMON_SECRET"
    http_port: 10000
    routes:
      - path: /

EOF

echo "Generated $SPEC_FILE"

echo "Checking doctl authentication..."
if ! doctl account get >/dev/null 2>&1; then
  echo "doctl not authenticated. Run: doctl auth init"; exit 1
fi

echo "Creating app on DigitalOcean App Platform (this may take a few minutes)..."
set +e
DOCTL_OUT=$(doctl apps create --spec "$SPEC_FILE" 2>&1)
DOCTL_EXIT=$?
set -e

echo "$DOCTL_OUT"
if [ $DOCTL_EXIT -ne 0 ]; then
  echo "doctl reported an error creating the app. Please inspect the output above."; exit $DOCTL_EXIT
fi

echo "App creation submitted. The command above includes the app ID and URL when ready."
echo "Cleanup: leaving $SPEC_FILE in place for inspection." 

echo "Done. If you need me to generate DNS/nginx or help with testing after deploy, tell me the app URL and I'll help debug voice/TTS." 
