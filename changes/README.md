# Changes Directory

This directory contains detailed change logs organized by git branch for easy navigation and historical reference.

## Organization Structure

```
changes/
├── README.md                       # This file
├── {branch-name}/                  # Changes grouped by git branch
│   └── YYYY-MM-DD-{description}.md # Date-prefixed change files
└── roadmap-update-*.md            # Cross-cutting roadmap updates (root level)
```

## Naming Conventions

### Subdirectories
- Named after git branch: `auth/`, `loyalty/`, `blockchain/`, etc.
- Groups all changes related to that feature branch

### Change Files
Format: `YYYY-MM-DD-{kebab-case-description}.md`

Examples:
- `2025-11-13-env-config-no-fallbacks.md`
- `2025-11-11-auth-module-implementation.md`
- `2025-11-12-test-infrastructure-fixes.md`

**Why date prefix?**
- Enables chronological sorting (ls, file browsers)
- Clear timeline of changes
- Easy to find recent changes

## File Content Structure

Each change file should include:

```markdown
**Issue**: #{issue-number} or Brief Title
**Date**: YYYY-MM-DD
**Branch**: {branch-name} (NxLoy Platform)

## Summary
[1-2 sentence overview]

## Problem Statement
[What was wrong? Why did we need this change?]

## Changes Made
[Detailed list of modifications with code examples]

## Testing
[Test results, coverage, verification steps]

## Breaking Changes
[⚠️ Any breaking changes and migration steps]

## Benefits
[Why this change improves the system]

## Files Changed
[List of new/modified files]

## Standards Compliance
[Reference to CLAUDE.md, ADRs, etc.]

## Next Steps
[Follow-up tasks if any]
```

## Current Branches

### auth/
Authentication and authorization related changes:
- Environment configuration hardening
- Auth module implementation
- Test infrastructure improvements
- Security enhancements

### (More branches will be added as features are developed)

## Cross-Cutting Changes

Files in the root `changes/` directory (not in subdirectories):
- **Roadmap updates**: Affect multiple domains
- **Infrastructure changes**: Impact entire platform
- **Breaking changes**: Require platform-wide updates

## Best Practices

1. **Create change file after completing a logical unit of work**
   - Don't wait until PR is ready
   - Document as you build

2. **Use descriptive titles**
   - Good: `env-config-no-fallbacks`
   - Bad: `updates`, `fixes`, `changes`

3. **Include code examples**
   - Show before/after for clarity
   - Helps future developers understand intent

4. **Reference standards**
   - Link to CLAUDE.md sections
   - Cite ADRs (Architecture Decision Records)
   - Reference relevant documentation

5. **Document breaking changes prominently**
   - Use ⚠️ warning symbol
   - Provide migration steps
   - List affected files/modules

6. **Keep it concise but complete**
   - Focus on "why" more than "what"
   - Include enough detail for future reference
   - Link to related docs rather than duplicating

## Relationship to Other Documentation

- **changes/** - Chronological change history (what happened when)
- **docs/adr/** - Architecture decisions (why we chose this approach)
- **docs/guides/** - How-to guides (how to use features)
- **docs/architecture/** - System design (how it's structured)
- **docs/contributing/** - Development standards (how to contribute)

## Searching for Changes

```bash
# Find all changes related to authentication
grep -r "authentication" changes/auth/

# Find changes in November 2025
ls changes/**/2025-11-*.md

# Find all breaking changes
grep -r "Breaking Change" changes/

# List changes by date (most recent first)
ls -t changes/**/*.md
```

## Maintenance

- **Archive old branches**: After merge to main, consider moving to `changes/archived/{branch}/`
- **Update this README**: When adding new branch directories
- **Link from PR descriptions**: Reference change files in pull request descriptions

---

**Note**: This organization follows industry best practices for changelog management and makes it easy to:
- Navigate changes by feature area (branch directories)
- Sort chronologically (date prefixes)
- Search and filter (consistent naming)
- Understand context (comprehensive content structure)
