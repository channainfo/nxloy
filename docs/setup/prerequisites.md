# Prerequisites

**Last Updated**: 2025-11-08

[← Back to main README](../../README.md)

Before you begin developing with NxLoy, ensure you have the required tools installed. Additional platform-specific tools are listed in their respective sections below.

## Core Tools (Required for All Development)

### Node.js

- **Required**: 22.12.0 or higher (LTS) ([Download](https://nodejs.org/))
- **Recommended**: Node.js 22.x (Active LTS, EOL: April 2027)
- **Alternative**: Node.js 20.19.0+ (EOL: April 2026)
- **Why Node.js 22?** Longest support window, required by Nx 22.x, optimal for all stack components

```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Verify version
node --version  # Should show v22.x.x
```

### pnpm

- **Required**: 10.14.0 or higher ([Install](https://pnpm.io/installation))

```bash
npm install -g pnpm@10.14.0
```

### Git

- **Required**: 2.40+ ([Download](https://git-scm.com/downloads))

## Backend Development

### PostgreSQL

- **Required**: 16 or 17 ([Download](https://www.postgresql.org/download/))
- **Recommended**: PostgreSQL 17 (supported until November 2029)
- **Alternative**: PostgreSQL 16 (supported until November 2028)
- **NOT recommended**: PostgreSQL 18 (too new, Prisma support pending)

### Prisma

- **Required**: 6.7.0+ (installed via dependencies)

## Mobile Development

See [Mobile Development Guide](../development/mobile.md) for iOS/Android tools (Xcode, Android Studio, etc.)

### For iOS Development (macOS only)

- **Xcode**: 14.0 or later ([Mac App Store](https://apps.apple.com/us/app/xcode/id497799835))
  ```bash
  xcode-select --install
  ```
- **CocoaPods**: 1.11.0 or later
  ```bash
  sudo gem install cocoapods
  ```
- **iOS Simulator**: Included with Xcode

### For Android Development

- **Android Studio**: Latest stable ([Download](https://developer.android.com/studio))
- **Java JDK**: 17 or later (bundled with Android Studio)
- **Android SDK**: API Level 33+ (install via Android Studio)
- **Android Emulator**: Install via Android Studio AVD Manager

### For All Platforms

- **Expo CLI**: Installed automatically with dependencies
- **EAS CLI** (for builds): `npm install -g eas-cli`
- **Metro Bundler**: Included with React Native

## AI-MCP Development

See [AI-MCP Integration Guide](../development/ai-mcp.md) for API keys and MCP SDK requirements.

- **Node.js**: 22.12.0+ (same as main project)
- **MCP SDK**: Installed via dependencies
- **API Keys**: OpenAI, Anthropic, or other LLM providers (configure in `.env`)

## Blockchain Development (📋 Planned - Not Required Yet)

When blockchain features are implemented, you'll need:

### For EVM Chains (Base/Ethereum)

- **Hardhat**: Ethereum development environment ([Docs](https://hardhat.org/))
- **Solidity**: 0.8.20+ (bundled with Hardhat)
- **MetaMask**: Browser wallet ([Download](https://metamask.io/))
- **Alchemy**: RPC provider ([Alchemy](https://www.alchemy.com/))

### For Solana

- **Anchor Framework**: Solana development framework ([Docs](https://www.anchor-lang.com/))
- **Rust**: 1.70+ ([Install](https://www.rust-lang.org/tools/install))
- **Solana CLI**: Command-line tools ([Install](https://docs.solana.com/cli/install-solana-cli-tools))
- **Phantom**: Solana wallet ([Download](https://phantom.app/))

### For Sui

- **Sui CLI**: Sui development tools ([Docs](https://docs.sui.io/))
- **Move**: Sui smart contract language
- **Sui Wallet**: Browser extension ([Download](https://sui.io/wallet))

### Shared Tools

- **IPFS Desktop**: Local IPFS node ([Download](https://docs.ipfs.tech/install/ipfs-desktop/))
- **Pinata**: IPFS pinning service ([Sign up](https://www.pinata.cloud/))

See [Blockchain Development Guide](../development/blockchain.md) for details.

## Infrastructure & DevOps (📋 Planned - Not Required Yet)

When infrastructure is implemented, you'll need:

### Required Tools

- **Docker Desktop**: 4.20+ ([Download](https://www.docker.com/products/docker-desktop/))
  ```bash
  docker --version  # Verify installation
  ```
- **kubectl**: Kubernetes CLI ([Install](https://kubernetes.io/docs/tasks/tools/))
  ```bash
  kubectl version --client
  ```
- **Terraform**: 1.5+ ([Download](https://www.terraform.io/downloads))
  ```bash
  terraform --version
  ```
- **Helm**: Kubernetes package manager ([Install](https://helm.sh/docs/intro/install/))
  ```bash
  helm version
  ```

### Optional Tools

- **Minikube/Kind**: Local Kubernetes cluster ([Minikube](https://minikube.sigs.k8s.io/))
- **k9s**: Kubernetes TUI ([k9s](https://k9scli.io/))

See [Infrastructure Development Guide](../development/infrastructure.md) for details.

---

## Next Steps

Once you have the prerequisites installed:

1. [Installation Guide](installation.md) - Clone and set up the repository
2. [Quick Start Guide](quick-start.md) - Run applications and verify setup
3. [Troubleshooting](troubleshooting.md) - Common issues and solutions

---

**Navigation**:
- [← Back to main README](../../README.md)
- [Next: Installation →](installation.md)
