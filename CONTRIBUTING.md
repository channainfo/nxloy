# Contributing to NxLoy

Thank you for your interest in contributing to NxLoy! This document provides a quick overview. For detailed guides, see the [docs/contributing/](docs/contributing/) directory.

## 📖 Quick Navigation

### Essential Reading
1. **[Code of Conduct](docs/contributing/code-of-conduct.md)** - Community standards (required reading)
2. **[Getting Started](docs/contributing/getting-started.md)** - First-time contributor setup
3. **[Development Workflow](docs/contributing/development-workflow.md)** - Day-to-day development process

### Standards & Guidelines
4. **[Code Standards](docs/contributing/code-standards.md)** - Code quality rules
5. **[Testing Standards](docs/contributing/testing-standards.md)** - Testing philosophy and practices
6. **[Pull Request Process](docs/contributing/pull-request-process.md)** - Creating and reviewing PRs
7. **[Database Migrations](docs/contributing/database-migrations.md)** - Prisma migration guidelines
8. **[Documentation Requirements](docs/contributing/documentation-requirements.md)** - Writing documentation

### Advanced Topics
9. **[Custom Claude Agents](docs/contributing/custom-agents.md)** - AI-assisted development with specialized agents

## 🚀 Quick Start for Contributors

### 1. Prerequisites
- Node.js 22.12.0+
- pnpm 10.14.0+
- PostgreSQL 16 or 17
- Git 2.40+

**Full details**: [Setup Prerequisites](docs/setup/prerequisites.md)

### 2. Initial Setup

```bash
# Fork the repository (external contributors)
# OR clone directly (internal team)
git clone https://github.com/channainfo/nxloy.git
cd nxloy

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
cd packages/database
pnpm prisma migrate dev
pnpm prisma generate
cd ../..

# Verify setup
nx affected:test && nx affected:lint
```

**Detailed setup**: [Getting Started Guide](docs/contributing/getting-started.md)

### 3. Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Run tests
nx affected:test && nx affected:lint

# 4. Push and create PR
git push origin feature/your-feature-name
```

**Full workflow**: [Development Workflow](docs/contributing/development-workflow.md)

## 📋 Code Standards Overview

### Core Rules
- **Max 40 lines per method** (excluding comments)
- **Max 3 parameters per method**
- **Single responsibility** - No method names with "and"
- **80% test coverage minimum**, 100% for business logic
- **No environment defaults** - Throw error if env vars missing

**Full standards**: [Code Standards](docs/contributing/code-standards.md)

### Testing Philosophy
- **NEVER use mocks** - Test against real dependencies
- **Use factories** - Create actual database records
- **Use Faker** - Generate realistic test data
- **Clean up** - Each test creates and destroys its own data

**Full testing guide**: [Testing Standards](docs/contributing/testing-standards.md)

## 🤖 Custom Claude Agents

NxLoy provides 6 specialized AI agents for code review and implementation:

1. **backend-code-reviewer** - NestJS backend code review
2. **frontend-implementation-specialist** - Cross-platform features (Next.js + React Native)
3. **architecture-reviewer** - Architecture and security analysis
4. **blockchain-nft-code-reviewer** - Smart contract and Web3 review
5. **ai-mcp-genai-reviewer** - AI/MCP code review
6. **product-market-researcher** - Market validation and competitive analysis

**Full guide**: [Custom Claude Agents](docs/contributing/custom-agents.md)

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows [Code Standards](docs/contributing/code-standards.md)
- [ ] Tests pass: `nx affected:test && nx affected:lint`
- [ ] Test coverage ≥ 80%
- [ ] Documentation updated
- [ ] Changeset created (if needed): `pnpm changeset`

### PR Checklist
1. Write clear title and description
2. Link related issues
3. Add screenshots/videos for UI changes
4. Request review from appropriate team members
5. Address review feedback
6. Ensure CI/CD passes

**Detailed process**: [Pull Request Process](docs/contributing/pull-request-process.md)

## 🗄️ Database Migrations

### Key Points
- Use Prisma Migrate (schema-first, declarative)
- Edit schema files in `packages/database/prisma/schema/`
- Use descriptive migration names
- Never edit migrations after commit
- Test migrations on staging first

**Full migration guide**: [Database Migrations](docs/contributing/database-migrations.md)

## 📝 Documentation

All significant features require documentation:
- Update relevant docs in `docs/`
- Add ADR for architectural decisions
- Update README/CONTRIBUTING if workflows change
- Include code examples and screenshots

**Documentation standards**: [Documentation Requirements](docs/contributing/documentation-requirements.md)

## 🤝 Getting Help

- **💬 Questions**: Use GitHub Discussions
- **🐛 Bugs**: Create an issue with bug report template
- **💡 Features**: Create an issue with feature request template
- **📧 Contact**: Reach out to the core team

## 📚 Additional Resources

### Development Guides
- [Backend Development](docs/development/backend.md)
- [Web Development](docs/development/web.md)
- [Mobile Development](docs/development/mobile.md)
- [Blockchain Development](docs/development/blockchain.md)
- [Infrastructure](docs/development/infrastructure.md)

### Architecture
- [Architecture Overview](docs/architecture/overview.md)
- [Domain Structure](docs/architecture/domains.md)
- [Tech Stack](docs/architecture/tech-stack.md)

### Workflow Guides
- [Multi-Agent Development](docs/guides/multi-agent-workflow.md)
- [Git Worktree Workflow](docs/guides/worktree-workflow.md)

---

**Thank you for contributing to NxLoy!** 🎉

For detailed information on any topic, navigate to the specific guide in [docs/contributing/](docs/contributing/).
