#!/usr/bin/env bash
set -euo pipefail

# === Load environment variables ===
if [ -f ".env" ]; then
  echo "=== Loading environment variables from .env ==="
  set -a
  source .env
  set +a
else
  echo "Warning: .env file not found, aborting."
  exit 1
fi

# === Check GHCR login ===
echo "=== Checking GHCR login ==="
if ! docker system info 2>/dev/null | grep -q "ghcr.io"; then
  if grep -q "ghcr.io" ~/.docker/config.json 2>/dev/null; then
    echo "Already logged in to GHCR."
  else
    echo "Not logged in to GHCR — logging in now..."
    echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
  fi
else
  echo "Already logged in to GHCR."
fi

# === Define images and Dockerfiles ===
declare -A images=(
  [frontend]="Docker/front/Dockerfile ."
  [messageservice]="Docker/messageservice/Dockerfile ."
  [authservice]="Docker/authservice/Dockerfile ."
  [onlineservice]="Docker/onlineservice/Dockerfile ."
  [db]="Docker/postgres/Dockerfile Docker/postgres/"
)

# === Build and push images ===
for image in "${!images[@]}"; do
  IFS=' ' read -r dockerfile context <<< "${images[$image]}"
  echo "=== Building and pushing $image ==="
  docker build -t ghcr.io/$GHCR_USERNAME/$image:latest -f "$dockerfile" $context
  docker push ghcr.io/$GHCR_USERNAME/$image:latest
done

echo "=== All images built and pushed successfully ==="
