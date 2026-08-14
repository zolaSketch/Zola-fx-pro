#!/usr/bin/env bash
# Static export for GitHub Pages.
# API routes cannot be exported, so they are moved aside for the build and
# restored afterwards. Cognition runs in the browser in this mode.
set -euo pipefail
cd "$(dirname "$0")"

cleanup() {
  [ -d .api-stash ] && mv .api-stash src/app/api || true
}
trap cleanup EXIT

[ -d src/app/api ] && mv src/app/api .api-stash

# Clear generated route validators, which still reference the stashed routes.
rm -rf .next/dev .next/types

STATIC=1 npx next build
cleanup
trap - EXIT

# Tell GitHub Pages not to run Jekyll, which ignores _next/.
touch out/.nojekyll
echo "Static site ready in ./out"
