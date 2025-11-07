#!/bin/bash
# Cleanup git worktree

if [ -z "$1" ]; then
  echo "Usage: ./cleanup-worktree.sh <agent-name>"
  echo "Example: ./cleanup-worktree.sh agent-1"
  exit 1
fi

AGENT_NAME=$1
WORKTREE_PATH="../nxloy-${AGENT_NAME}"

if [ -d "$WORKTREE_PATH" ]; then
  echo "Removing worktree at: $WORKTREE_PATH"
  git worktree remove "$WORKTREE_PATH" --force
  echo "✅ Worktree removed"
else
  echo "⚠️  Worktree not found: $WORKTREE_PATH"
fi

# List remaining worktrees
echo ""
echo "Remaining worktrees:"
git worktree list
