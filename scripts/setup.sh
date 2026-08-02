#!/bin/bash
set -euo pipefail

echo "==> Creating Remotion project structure..."

# Create blank Remotion project if src doesn't exist
if [ ! -d "src" ]; then
    npx create-video@latest \
        --yes \
        --blank \
        --no-tailwind \
        .
fi

echo "==> Installing npm dependencies..."
npm install

echo "==> Setup complete!"
echo
echo "Start dev server:"
echo "  docker compose up remotion"
echo
echo "Render video:"
echo "  docker compose --profile render up render"
