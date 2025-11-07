# Getting Started for Contributors

**Related**: [Code of Conduct](./code-of-conduct.md) | [Development Workflow](./development-workflow.md) | [Testing Standards](./testing-standards.md)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: 18.x or 20.x
- **pnpm**: 10.14.0 or higher
- **Git**: 2.40+
- **PostgreSQL**: 14+ (for backend development)

## Initial Setup

1. **Fork the repository** (if external contributor)

2. **Clone your fork**:
   ```bash
   git clone https://github.com/channainfo/nxloy.git
   cd nxloy
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**:
   ```bash
   cd packages/database
   pnpm prisma migrate dev
   pnpm prisma generate
   cd ../..
   ```

6. **Verify setup**:
   ```bash
   nx affected:test
   nx affected:lint
   ```

## Development Environment

**Recommended IDE**: Visual Studio Code

**Recommended Extensions**:
- ESLint
- Prettier
- Prisma
- GitLens
- Nx Console

**VSCode Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

**Last Updated**: 2025-11-08
**Source**: CONTRIBUTING.md (Lines 43-110)
