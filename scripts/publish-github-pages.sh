#!/usr/bin/env bash
# Create chrisloken/phosphene (or $GITHUB_PAGES_OWNER/$GITHUB_PAGES_REPO),
# push main, and deploy GitHub Pages.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OWNER="${GITHUB_PAGES_OWNER:-chrisloken}"
REPO="${GITHUB_PAGES_REPO:-phosphene}"
FULL="${OWNER}/${REPO}"
PAGES_URL="https://${OWNER}.github.io/${REPO}/"
BRANCH="${GITHUB_PAGES_SOURCE_BRANCH:-main}"
GH_PAGES_BRANCH="gh-pages"

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: missing required command: $1" >&2
    exit 1
  fi
}

need git
need gh
need npm

if [[ -z "${GH_TOKEN:-${GITHUB_TOKEN:-}}" ]]; then
  if ! gh auth status >/dev/null 2>&1; then
    echo "error: GitHub CLI is not authenticated. Export GH_TOKEN or run gh auth login." >&2
    exit 1
  fi
fi

AUTH_USER="$(gh api user --jq .login)"
echo "Publishing Phosphene"
echo "  authenticated as: ${AUTH_USER}"
echo "  repository:       ${FULL}"
echo "  pages url:        ${PAGES_URL}"

if [[ ! -d .git ]]; then
  git init -b "$BRANCH"
fi

if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git -c user.name="${GIT_AUTHOR_NAME:-Cursor Agent}" \
      -c user.email="${GIT_AUTHOR_EMAIL:-cursoragent@cursor.com}" \
      -c commit.gpgsign=false \
      commit -m "Publish Phosphene to GitHub Pages"
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "error: nothing to publish (no commits)." >&2
  exit 1
fi

echo "Installing and building…"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
PHOSPHENE_BASE="/${REPO}/" npm run build
touch dist/.nojekyll

create_repo() {
  gh repo create "$FULL" \
    --public \
    --description "Phosphene — closed-eye vision from an open camera. A WebGL2 installation." \
    --homepage "$PAGES_URL" \
    --disable-wiki
}

if gh repo view "$FULL" >/dev/null 2>&1; then
  echo "Repository ${FULL} already exists."
else
  echo "Creating ${FULL}…"
  if ! create_repo; then
    echo >&2
    echo "error: could not create ${FULL} (authenticated as ${AUTH_USER})." >&2
    echo "Log in as ${OWNER} with a token that can create public repositories," >&2
    echo "then re-run: ./scripts/publish-github-pages.sh" >&2
    if [[ "$AUTH_USER" != "$OWNER" ]]; then
      echo >&2
      echo "The current token belongs to ${AUTH_USER}, not ${OWNER}." >&2
      echo "GitHub Pages for this piece must live at ${PAGES_URL}." >&2
    fi
    exit 1
  fi
fi

TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -n "$TOKEN" ]]; then
  REMOTE_URL="https://x-access-token:${TOKEN}@github.com/${FULL}.git"
else
  REMOTE_URL="https://github.com/${FULL}.git"
fi

if git remote get-url github >/dev/null 2>&1; then
  git remote set-url github "$REMOTE_URL"
else
  git remote add github "$REMOTE_URL"
fi

echo "Pushing ${BRANCH}…"
git push github "HEAD:refs/heads/${BRANCH}"

echo "Deploying ${GH_PAGES_BRANCH} from dist/…"
WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp -R dist/. "$WORK"/
git -C "$WORK" init -b "$GH_PAGES_BRANCH"
git -C "$WORK" add -A
git -C "$WORK" \
  -c user.name="${GIT_AUTHOR_NAME:-Cursor Agent}" \
  -c user.email="${GIT_AUTHOR_EMAIL:-cursoragent@cursor.com}" \
  -c commit.gpgsign=false \
  commit -m "Deploy Phosphene to GitHub Pages"
git -C "$WORK" remote add origin "$REMOTE_URL"
git -C "$WORK" push -f origin "$GH_PAGES_BRANCH"

echo "Enabling GitHub Pages from ${GH_PAGES_BRANCH}…"
PAGES_BODY="$(cat <<EOF
{"source":{"branch":"${GH_PAGES_BRANCH}","path":"/"}}
EOF
)"
if ! gh api "repos/${FULL}/pages" >/dev/null 2>&1; then
  echo "$PAGES_BODY" | gh api -X POST "repos/${FULL}/pages" --input - >/dev/null
else
  echo "$PAGES_BODY" | gh api -X PUT "repos/${FULL}/pages" --input - >/dev/null || true
fi

gh api -X PATCH "repos/${FULL}" \
  -f homepage="$PAGES_URL" \
  -f has_wiki=false >/dev/null || true

echo
echo "Published ${FULL}"
echo "  source:  https://github.com/${FULL}"
echo "  site:    ${PAGES_URL}"
echo "Pages can take a minute to become live."
