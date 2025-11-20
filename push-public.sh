#!/bin/bash

# Commit message from argument or default
MSG=${1:-"update"}

echo "📌 Staging all files..."
git add .

echo "📝 Committing..."
git commit -m "$MSG"

# Detect branch (main or master)
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "⬆️  Pushing to $BRANCH..."
git push origin $BRANCH

echo "🌍 Making repository public..."
gh repo edit --visibility public

echo "✅ Done! Repo is now public and updated."
