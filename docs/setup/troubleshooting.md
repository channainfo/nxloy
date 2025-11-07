# Troubleshooting Guide

**Last Updated**: 2025-11-08

[← Back to main README](../../README.md) | [← Quick Start](quick-start.md)

Comprehensive troubleshooting guide for common issues across all development areas of NxLoy.

---

## Table of Contents

1. [General Issues](#general-issues)
2. [Mobile Development Issues](#mobile-development-issues)
3. [AI-MCP Server Issues](#ai-mcp-server-issues)
4. [Blockchain Development Issues](#blockchain-development-issues)
5. [Infrastructure & DevOps Issues](#infrastructure--devops-issues)
6. [Getting Help](#getting-help)

---

## General Issues

### "Module not found" errors after pulling changes

**Cause**: New dependencies added, Nx cache stale

**Solution**:
```bash
pnpm install
nx reset
```

### Port already in use (EADDRINUSE)

**Cause**: Previous process still running on port

**Solution**:
```bash
# Find process using port 8080 (backend)
lsof -ti:8080 | xargs kill

# Find process using port 8081 (web)
lsof -ti:8081 | xargs kill

# Find process using port 8082 (mobile Metro bundler)
lsof -ti:8082 | xargs kill

# Find process using port 8083 (ai-mcp)
lsof -ti:8083 | xargs kill
```

### Prisma Client out of sync

**Cause**: Schema changed but client not regenerated

**Solution**:
```bash
cd packages/database
pnpm prisma generate
```

### Nx cache issues (stale builds)

**Solution**:
```bash
nx reset
pnpm install
```

### Git worktree already exists error

**Solution**:
```bash
# Remove stale worktree
git worktree remove ../nxloy-agent-1 --force

# Or use cleanup script
./tools/scripts/cleanup-worktree.sh agent-1
```

---

## Mobile Development Issues

### Metro bundler won't start

**Cause**: Port 8081 in use or cache corruption

**Solution**:
```bash
# Kill existing Metro process
lsof -ti:8081 | xargs kill

# Clear Metro cache
nx run mobile:start --reset-cache
```

### iOS build fails with "Command PhaseScriptExecution failed"

**Cause**: CocoaPods dependencies not installed or outdated

**Solution**:
```bash
cd apps/mobile/ios
pod deintegrate
pod install
cd ../../..
nx run mobile:run-ios
```

### Android build fails with "SDK location not found"

**Cause**: Android SDK path not configured

**Solution**:
```bash
# Create local.properties file
echo "sdk.dir=$HOME/Library/Android/sdk" > apps/mobile/android/local.properties

# Or for Linux
echo "sdk.dir=$HOME/Android/Sdk" > apps/mobile/android/local.properties
```

### Expo Go app shows "Unable to connect to Metro"

**Cause**: Firewall blocking connection or wrong network

**Solution**:
- Ensure phone and computer are on same WiFi network
- Try connecting via tunnel: `nx run mobile:start --tunnel`
- Check firewall settings to allow port 8081

### React Native version mismatch errors

**Cause**: Conflicting React Native versions in dependencies

**Solution**:
```bash
pnpm install
cd apps/mobile/ios
pod install --repo-update
cd ../../..
```

### "Build input file cannot be found" (iOS)

**Cause**: Xcode workspace issues

**Solution**:
```bash
cd apps/mobile/ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod install
cd ../../..
```

---

## AI-MCP Server Issues

### AI-MCP server fails to start with "API key not found"

**Cause**: Missing environment variables

**Solution**:
```bash
# Add to .env file
AI_MCP_PORT=8001
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### MCP context requests timeout

**Cause**: Database connection slow or context too large

**Solution**:
- Check PostgreSQL is running: `pg_isready`
- Reduce context size in MCP requests
- Increase timeout in `apps/ai-mcp/src/config/mcp.config.ts`

### "Tool not found" error when executing AI actions

**Cause**: MCP tool not registered in module

**Solution**:
```bash
# Verify tool is registered in apps/ai-mcp/src/app/mcp.module.ts
# Restart server
nx serve ai-mcp
```

### AI-MCP tests fail with "LLM provider error"

**Cause**: API keys expired or quota exceeded

**Solution**:
- Check API key validity at provider dashboard
- Use test mode with mock responses for CI/CD
- Set `MCP_TEST_MODE=true` in test environment

---

## Blockchain Development Issues

### Hardhat node fails to start

**Cause**: Port 8545 already in use

**Solution**:
```bash
lsof -ti:8545 | xargs kill
cd packages/blockchain-contracts
npx hardhat node
```

### "Transaction reverted" during contract testing

**Cause**: Smart contract logic error or insufficient gas

**Solution**:
```bash
# Run tests with stack traces
cd packages/blockchain-contracts
npx hardhat test --verbose

# Check gas limits in hardhat.config.ts
```

### MetaMask shows "ChainId mismatch"

**Cause**: MetaMask connected to wrong network

**Solution**:
- Open MetaMask settings
- Select "Hardhat" network (localhost:8545, Chain ID: 31337)
- Or add Polygon Mumbai (Chain ID: 80001)

### Contract deployment fails with "Insufficient funds"

**Cause**: Deployer account has no ETH

**Solution**:
```bash
# For testnet, use faucet:
# Polygon Mumbai: https://faucet.polygon.technology/
# Ethereum Sepolia: https://sepoliafaucet.com/

# For local node, use pre-funded accounts from Hardhat output
```

### IPFS upload fails

**Cause**: IPFS daemon not running or API credentials missing

**Solution**:
```bash
# Start IPFS Desktop app, or:
ipfs daemon

# Or use Pinata API keys in .env:
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
```

### "Nonce too high" error

**Cause**: Transaction nonce out of sync with network

**Solution**:
- Reset MetaMask account: Settings > Advanced > Reset Account
- Or manually set nonce in transaction

---

## Infrastructure & DevOps Issues

### Docker build fails with "no space left on device"

**Cause**: Docker disk space full

**Solution**:
```bash
# Clean up Docker resources
docker system prune -a
docker volume prune

# Increase Docker disk limit in Docker Desktop settings
```

### Kubernetes pods stuck in "Pending" state

**Cause**: Insufficient cluster resources

**Solution**:
```bash
# Check resource requests
kubectl describe pod <pod-name> -n nxloy

# Increase Minikube resources
minikube delete
minikube start --cpus=4 --memory=8192
```

### Terraform apply fails with "provider not found"

**Cause**: Terraform plugins not initialized

**Solution**:
```bash
cd packages/infrastructure/terraform
terraform init -upgrade
terraform apply
```

### "ImagePullBackOff" error in Kubernetes

**Cause**: Docker image not available in registry

**Solution**:
```bash
# Build and load image to Minikube
eval $(minikube docker-env)
docker build -t nxloy-backend:latest -f packages/infrastructure/docker/backend.Dockerfile .
```

### Docker Compose services can't communicate

**Cause**: Services on different networks

**Solution**:
```bash
# Check docker-compose.yml has all services in same network
docker-compose down
docker network prune
docker-compose up -d
```

---

## Getting Help

If you can't find a solution here:

- 📖 **Documentation**: Check the [docs/](../) directory for guides
- 🐛 **Issues**: Search existing issues or create a new one on GitHub
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Contact**: Reach out to the Ploy Lab team

### Useful Resources

- [Backend Development Guide](../development/backend.md)
- [Mobile Development Guide](../development/mobile.md)
- [Infrastructure Guide](../development/infrastructure.md)
- [Contributing Guide](../contributing/getting-started.md)

---

**Navigation**:
- [← Back to main README](../../README.md)
- [← Previous: Quick Start](quick-start.md)
- [Development Guides →](../development/)
