# Pull Request Process

**Related**: [Development Workflow](./development-workflow.md) | [Code Standards](./code-standards.md) | [Testing Standards](./testing-standards.md)

---

## Before Creating PR

**Checklist**:
- [ ] All tests pass: `nx affected:test`
- [ ] Linting passes: `nx affected:lint`
- [ ] Code formatted: `nx format:write`
- [ ] Type checking passes: `nx run-many --target=typecheck --all`
- [ ] Code meets standards (40 lines/method, 3 params, etc.)
- [ ] Tests added/updated (80% coverage minimum)
- [ ] Documentation updated
- [ ] Changeset created (if applicable): `pnpm changeset`
- [ ] No commented-out code or debug logs

## Creating Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/123-oauth-login
   ```

2. **Open Pull Request** on GitHub

3. **Fill out PR template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Related Issue
   Closes #123

   ## Type of Change
   - [ ] Bug fix
   - [x] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - Describe how you tested changes
   - List test scenarios covered

   ## Screenshots (if UI changes)
   (Attach screenshots)

   ## Checklist
   - [x] Tests pass
   - [x] Linting passes
   - [x] Documentation updated
   - [x] Changeset created
   ```

4. **Request review** from relevant team members

## PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(auth): add Google OAuth login
fix(loyalty): correct points calculation for tier upgrades
docs(readme): update installation instructions
```

## Review Process

### For PR Authors

**When feedback is received**:
1. Address all comments
2. Make requested changes
3. Re-request review
4. Don't force-push after review starts (makes tracking changes harder)

**Responding to feedback**:
- Be open to suggestions
- Ask clarifying questions if needed
- Explain your reasoning if you disagree
- Mark conversations as resolved after addressing

### For Reviewers

**What to check**:
- [ ] Code meets standards (40 lines/method, 3 params, single responsibility)
- [ ] Tests are comprehensive (80%+ coverage, no mocks, uses factories)
- [ ] No obvious bugs or edge cases missed
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] No secrets or sensitive data committed

**Providing feedback**:
- Be constructive and specific
- Suggest alternatives, don't just criticize
- Use "nit:" prefix for minor/optional suggestions
- Approve if changes are good, even with minor "nit" comments

**Review types**:
- **Approve** - Changes are good, ready to merge
- **Request Changes** - Issues must be fixed before merging
- **Comment** - Feedback without blocking merge

## Merge Requirements

- ✅ At least 1 approval from team member
- ✅ All conversations resolved
- ✅ CI checks pass (tests, lint, build)
- ✅ No merge conflicts
- ✅ Up-to-date with base branch

## Merging

**Merge Strategy**: Squash and Merge (default)
- Keeps main branch history clean
- All commits squashed into one commit
- PR title becomes commit message

**After Merge**:
1. Delete feature branch (automatically or manually)
2. Update local repo: `git pull origin main`
3. Move task to DONE in `docs/tasks/DONE.md`

---

**Last Updated**: 2025-11-08
**Source**: CONTRIBUTING.md (Lines 1357-1480)
