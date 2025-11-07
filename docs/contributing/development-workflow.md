# Development Workflow

**Related**: [Getting Started](./getting-started.md) | [Code Standards](./code-standards.md) | [Testing Standards](./testing-standards.md) | [Pull Request Process](./pull-request-process.md)

---

## 1. Choose a Task

- Check [GitHub Issues](link) for open tasks
- Or see `docs/tasks/READY.md` for prioritized tasks
- Assign yourself to avoid duplicated effort
- Comment on the issue to indicate you're working on it

## 2. Create a Branch

**Branch Naming Convention**:
```bash
<type>/<issue-number>-<short-description>

Examples:
feature/123-add-oauth-login
fix/456-loyalty-points-calculation
docs/789-update-readme
refactor/012-split-customer-service
```

**Types**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

**Create branch**:
```bash
# IMPORTANT: Create from current branch (see CLAUDE.md)
git checkout -b feature/123-add-oauth-login
```

## 3. Develop

**Follow these steps**:
1. Write failing test first (TDD)
2. Implement feature to make test pass
3. Refactor code while keeping tests green
4. Ensure code meets standards (see Code Standards section)
5. Update documentation

**Common commands**:
```bash
# Serve application
nx serve backend

# Run tests (affected only)
nx affected:test

# Run tests with coverage
nx test backend --coverage

# Lint and fix
nx affected:lint --fix

# Format code
nx format:write
```

## 4. Commit Changes

**Commit Message Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Example**:
```
feat(auth): add Google OAuth login

Implement Google OAuth 2.0 authentication flow with PKCE.
- Add passport-google-oauth20 strategy
- Add callback endpoint
- Update auth module
- Add integration tests

Closes #123
```

**Commit Guidelines**:
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to" not "moves cursor to")
- Limit first line to 72 characters
- Reference issues in footer ("Closes #123")

## 5. Create Changeset (if applicable)

If your changes affect packages that are published:

```bash
pnpm changeset
```

Follow prompts to:
- Select affected packages
- Choose version bump type (major, minor, patch)
- Write changelog description

---

**Last Updated**: 2025-11-08
**Source**: CONTRIBUTING.md (Lines 113-227)
