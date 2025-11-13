#!/bin/bash
# Create git worktree for AI agent

# ./tools/scripts/create-worktree.sh frontend-implement-specialist feature/auth-module
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./create-worktree.sh <agent-name> <branch-name>"
  echo "Example: ./create-worktree.sh agent-1 backend-feature"
  exit 1
fi

AGENT_NAME=$1
BRANCH_NAME=$2
WORKTREE_PATH="../nxloy-${AGENT_NAME}"

echo "Creating worktree for ${AGENT_NAME}..."
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME"

echo "✅ Worktree created at: $WORKTREE_PATH"
echo "📂 cd $WORKTREE_PATH"
echo "🚀 code ."
