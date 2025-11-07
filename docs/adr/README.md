# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the NxLoy platform.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR follows this structure:

```markdown
# ADR {number}: {Title}

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded


## Context
What is the issue we're seeing that is motivating this decision or change?

## Decision
What is the change we're proposing and/or doing?

## Alternatives Considered
What other options were evaluated? Why were they rejected?

## Consequences
What becomes easier or more difficult to do because of this change?

## Implementation Plan
Step-by-step plan to implement this decision.

## Success Metrics
How will we measure if this decision was successful?
```

## Index

- [ADR-0001](./0001-nx-monorepo-with-git-worktrees.md) - Nx Monorepo with Git Worktrees for Multi-Agent Development

## Creating New ADRs

1. Copy the template above
2. Number sequentially (0002, 0003, etc.)
3. Use descriptive kebab-case filename: `{number}-{short-description}.md`
4. Update this index with a link to the new ADR
5. Discuss with team before marking as "Accepted"

## ADR Lifecycle

- **Proposed**: Under discussion, not yet implemented
- **Accepted**: Decision approved and implemented
- **Deprecated**: No longer relevant or replaced
- **Superseded**: Replaced by a newer ADR (link to replacement)

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard's ADR Template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
