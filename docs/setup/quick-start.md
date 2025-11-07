# Quick Start Guide

**Last Updated**: 2025-11-08

[← Back to main README](../../README.md) | [← Installation](installation.md)

Get started developing with NxLoy in minutes. This guide shows you how to run applications and verify your setup.

## Run Applications

### Backend API

```bash
nx serve backend

# API available at: http://localhost:8080
# API docs: http://localhost:8080/api/docs
```

**Status**: 🚧 Framework configured, no domain modules yet

### Web Frontend

```bash
nx serve web

# App available at: http://localhost:8081
```

**Status**: ✅ Fully functional

### Mobile App

**iOS** (macOS only):
```bash
nx run mobile:run-ios
```

**Android**:
```bash
nx run mobile:run-android
```

**Web (Development)**:
```bash
nx run mobile:serve
# Available at: http://localhost:8082
```

**Status**: 🚧 Development mode works, production builds need eas.json

For detailed mobile development workflow, see [Mobile Development Guide](../development/mobile.md).

### AI-MCP Server

```bash
nx serve ai-mcp

# Server available at: http://localhost:8083
# Health check: http://localhost:8083/health
```

**Status**: 📋 Placeholder only - prints "Hello World", MCP not implemented

For AI-MCP development details, see [AI-MCP Integration Guide](../development/ai-mcp.md).

## Verify Installation

Run these commands to ensure everything is working correctly:

### Run Tests

```bash
# Test all projects
nx run-many --target=test --all

# Test affected projects only (faster)
nx affected:test

# Test specific project
nx test backend
nx test shared-types

# Test with coverage
nx test backend --coverage
```

### Lint Code

```bash
# Lint all projects
nx run-many --target=lint --all

# Lint affected only
nx affected:lint

# Fix lint issues
nx affected:lint --fix
```

### Type Check

```bash
# Type check all projects
nx run-many --target=typecheck --all
```

### View Dependency Graph

```bash
# Visualize project dependencies
nx graph

# View affected projects
nx affected:graph
```

## Success! 🎉

If all commands succeed, you're ready to develop!

---

## Development Workflow

### Start Development

```bash
# Serve specific application with watch mode
nx serve backend --watch
nx serve web --watch

# Run tests in watch mode
nx test backend --watch
```

### Common Commands

```bash
# Build specific app
nx build backend
nx build web

# Format code
nx format:write

# Clear Nx cache (if things feel stale)
nx reset

# Show project information
nx show project backend
```

### Next Steps

Now that your environment is set up:

1. **Read the guides**:
   - [Backend Development](../development/backend.md)
   - [Web Development](../development/web.md)
   - [Mobile Development](../development/mobile.md)

2. **Understand the architecture**:
   - [Architecture Overview](../architecture/overview.md)
   - [Domain Structure](../architecture/domains.md)

3. **Start contributing**:
   - [Development Workflow](../contributing/development-workflow.md)
   - [Code Standards](../contributing/code-standards.md)
   - [Testing Standards](../contributing/testing-standards.md)

---

## Troubleshooting

If you encounter issues:

- **Port conflicts**: See [Troubleshooting - Port already in use](troubleshooting.md#port-already-in-use-eaddrinuse)
- **Module errors**: See [Troubleshooting - Module not found](troubleshooting.md#module-not-found-errors-after-pulling-changes)
- **Database errors**: See [Troubleshooting - Prisma Client out of sync](troubleshooting.md#prisma-client-out-of-sync)

Full troubleshooting guide: [Troubleshooting Guide](troubleshooting.md)

---

**Navigation**:
- [← Back to main README](../../README.md)
- [← Previous: Installation](installation.md)
- [Next: Troubleshooting →](troubleshooting.md)
