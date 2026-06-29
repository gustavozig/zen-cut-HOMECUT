#!/usr/bin/env bash
set -e

REPO="https://gustavozig:${GITHUB_PAT}@github.com/gustavozig/homecut.git"

git config user.email "homecut@replit.dev"
git config user.name "HomeCUT Replit"

# Remove remote se já existir
git remote remove github 2>/dev/null || true

git remote add github "$REPO"
git push github main --force

echo "✅ Push concluído: https://github.com/gustavozig/homecut"
