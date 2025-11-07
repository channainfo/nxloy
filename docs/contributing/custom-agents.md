# Custom Claude Agents

**Related**: [Development Workflow](./development-workflow.md) | [Code Standards](./code-standards.md) | [Testing Standards](./testing-standards.md)

---

NxLoy includes **6 specialized Claude Code agents** to help with implementation, code review, architecture analysis, and product research. These agents are custom-configured to understand NxLoy's architecture, coding standards, and business domain.

## Why Use Custom Agents?

- **Specialized Expertise**: Each agent is trained on specific domain knowledge (backend, frontend, blockchain, AI/MCP, architecture)
- **Consistency**: Agents enforce NxLoy standards (40-line methods, 3 parameters, no mocks)
- **Quality**: Systematic reviews catch issues before human review
- **Efficiency**: Automated implementation and review speeds up development
- **Learning**: Agent feedback teaches best practices

## Available Agents

| Agent Name | Purpose | When to Use | Invoke Command |
|------------|---------|-------------|----------------|
| **backend-code-reviewer** | Reviews NestJS backend code for quality, standards, testing | After implementing backend features, before PR | `/task @backend-code-reviewer` |
| **frontend-implementation-specialist** | Implements cross-platform features (Next.js + React Native) | When building UI features for both web and mobile | `/task @frontend-implementation-specialist` |
| **architecture-reviewer** | Elite architectural review, security, scalability analysis | Before major architectural decisions, during design phase | `/task @architecture-reviewer` |
| **blockchain-nft-code-reviewer** | Reviews smart contracts, Web3 integrations, blockchain code | After implementing blockchain features or NFT functionality | `/task @blockchain-nft-code-reviewer` |
| **ai-mcp-genai-reviewer** | Reviews AI/MCP/GenAI code for best practices and security | After implementing AI features or MCP integrations | `/task @ai-mcp-genai-reviewer` |
| **product-market-researcher** | Analyzes market demand, competitive landscape, validates features | During product planning, feature validation, market research | `/task @product-market-researcher` |

## Example Workflows

### 1. Backend Feature Development

```bash
# Step 1: Implement feature
# Edit files: apps/backend/src/loyalty/loyalty.service.ts

# Step 2: Invoke backend code reviewer
/task @backend-code-reviewer Review the loyalty points calculation feature I just implemented in apps/backend/src/loyalty/loyalty.service.ts

# Step 3: Address feedback
# Fix issues identified by the agent

# Step 4: Re-review if needed
/task @backend-code-reviewer Re-review after fixes

# Step 5: Run tests and commit
nx affected:test
git add .
git commit -m "feat(backend): add loyalty points calculation"
```

### 2. Cross-Platform Frontend Feature

```bash
# Step 1: Use frontend specialist for implementation
/task @frontend-implementation-specialist Implement a customer profile screen that works on both Next.js web (apps/web) and React Native mobile (apps/mobile). The screen should display customer name, email, loyalty points, and tier status.

# Agent will:
# - Create components for both platforms
# - Ensure shared business logic
# - Follow NxLoy UI patterns
# - Use @nxloy/shared-types

# Step 2: Test both platforms
nx serve web  # Test web at localhost:4200
nx run mobile:start  # Test mobile

# Step 3: Commit
git add apps/web apps/mobile
git commit -m "feat(frontend): add customer profile screen (web + mobile)"
```

### 3. Architecture Review Workflow

```bash
# Step 1: Design phase - describe your architecture
/task @architecture-reviewer I'm designing a multi-tenant notification system that needs to:
1. Send emails, SMS, and push notifications
2. Support rate limiting per business
3. Handle 10,000 notifications/sec
4. Store notification history
5. Support templates and personalization

Please review this architecture and identify:
- Security concerns
- Scalability bottlenecks
- Best practices violations
- Recommended patterns

# Step 2: Receive detailed architectural review
# Agent provides:
# - Security analysis (auth, data isolation, encryption)
# - Scalability assessment (bottlenecks, optimization strategies)
# - Pattern recommendations (queue-based, event-driven)
# - Risk assessment

# Step 3: Iterate on design based on feedback

# Step 4: Document decision in ADR
# Create docs/adr/XXXX-notification-system-architecture.md
```

### 4. Multi-Agent Collaboration

```bash
# Scenario: Implementing and reviewing a complex feature

# Step 1: Implement backend
# Edit apps/backend/src/rewards/rewards.service.ts

# Step 2: Backend code review
/task @backend-code-reviewer Review rewards redemption feature

# Step 3: Fix code issues

# Step 4: Architecture review
/task @architecture-reviewer Review the overall rewards redemption architecture for scalability and security concerns

# Step 5: Address architectural feedback

# Step 6: Final verification
nx affected:test
nx affected:lint

# Step 7: Commit
git commit -m "feat(rewards): implement redemption with architectural improvements"
```

## Best Practices

### When to Use Agents

**✅ Use agents for:**
- Implementing features (frontend specialist)
- Code reviews before PR submission
- Architecture validation before major decisions
- Market research during product planning
- Security reviews for sensitive code (auth, payments, blockchain)
- Learning NxLoy patterns and standards

**❌ Don't use agents for:**
- Simple documentation updates
- Trivial bug fixes
- Tasks you want to learn manually
- Quick prototypes or experiments

### Providing Context to Agents

Agents work best with clear context:

```bash
# ❌ Bad - Too vague
/task @backend-code-reviewer Review my code

# ✅ Good - Specific context
/task @backend-code-reviewer Review the new customer segmentation feature in apps/backend/src/customer/segmentation.service.ts. Focus on:
1. SQL query performance (handling 100K+ customers)
2. Cache invalidation strategy
3. Multi-tenant data isolation
4. Test coverage
```

**Provide:**
- **File paths**: Exact locations of relevant code
- **Context**: What the feature does and why
- **Concerns**: Specific areas you want reviewed
- **Constraints**: Performance requirements, security needs

### Iterating on Agent Feedback

Agents provide detailed feedback - use it iteratively:

```bash
# First review
/task @backend-code-reviewer Review loyalty.service.ts

# Agent identifies 5 issues

# Fix critical issues (security, bugs)

# Second review - focus on remaining issues
/task @backend-code-reviewer Re-review loyalty.service.ts, focusing on performance optimization suggestions

# Continue until satisfactory
```

### Combining Multiple Agents

Use multiple agents for comprehensive review:

```bash
# Implement blockchain feature
/task @frontend-implementation-specialist Implement NFT wallet display

# Review code quality
/task @blockchain-nft-code-reviewer Review smart contract integration

# Review architecture
/task @architecture-reviewer Review blockchain integration architecture

# All angles covered!
```

## Agent Invocation Guide

### Using /task Command (Recommended)

```bash
# Syntax
/task @agent-name <your request>

# Examples
/task @backend-code-reviewer Review apps/backend/src/auth/auth.service.ts

/task @frontend-implementation-specialist Create a loyalty program card component for both web and mobile

/task @product-market-researcher Analyze market demand for subscription-based loyalty programs in the fitness industry
```

### Programmatic Invocation (Advanced)

If you're using Claude Code API or building automation:

```typescript
// Example: Automated review pipeline
async function reviewBackendChanges(files: string[]) {
  for (const file of files) {
    await claudeCode.task({
      agent: '@backend-code-reviewer',
      prompt: `Review ${file} for code quality and NxLoy standards compliance`
    });
  }
}
```

### Reading Agent Output

Agents provide structured output:

**Backend Code Reviewer Output**:
```markdown
## Code Quality Review

### Issues Found
1. **CRITICAL**: Method exceeds 40 lines (line 25-78)
2. **WARNING**: More than 3 parameters (line 15)
3. **INFO**: Consider extracting helper method

### Standards Compliance
✅ Follows single responsibility
✅ No mocks in tests
❌ Missing @nxloy/* imports

### Test Coverage
Current: 75% | Target: 80%
Missing tests for: edge case handling

### Recommendations
1. Extract lines 45-78 into separate method
2. Use options object for parameters
3. Add tests for error scenarios
```

## Multi-Agent Patterns

### Sequential Reviews (Quality Pipeline)

```bash
# 1. Code quality
/task @backend-code-reviewer Review

# 2. Architecture quality
/task @architecture-reviewer Review architecture

# 3. Domain-specific quality
/task @blockchain-nft-code-reviewer Review (if blockchain code)

# Each review builds on previous feedback
```

### Parallel Reviews (Fast Feedback)

```bash
# In separate worktrees or sessions

# Agent 1: Review backend
/task @backend-code-reviewer Review backend changes

# Agent 2: Review frontend (simultaneously)
/task @frontend-implementation-specialist Review frontend implementation

# Combine feedback from both
```

### Iterative Refinement

```bash
# Round 1: Initial implementation
/task @frontend-implementation-specialist Implement feature

# Round 2: Review and fix critical issues
/task @backend-code-reviewer Review
# Fix critical issues

# Round 3: Optimize and polish
/task @architecture-reviewer Review for optimization
# Apply optimizations

# Round 4: Final verification
/task @backend-code-reviewer Final review
```

## Creating and Modifying Agents

### Agent File Structure

Agents are defined in `.claude/agents/*.md` with YAML frontmatter:

```markdown
---
name: your-agent-name
description: |
  Brief description of what this agent does.

  Usage: Invoke this agent when you need to [specific scenario].

  Example: /task @your-agent-name Review my implementation
model: sonnet
---

# Your Agent Name

## Role and Expertise

You are a [specialized role] expert for the NxLoy loyalty platform...

## Responsibilities

1. **Primary**: [Main responsibility]
2. **Secondary**: [Additional responsibilities]

## Review Framework

### 1. Category One
- Check point 1
- Check point 2

### 2. Category Two
- Check point 1
- Check point 2

## Output Format

Provide feedback in this structure:

## Category One
- ✅ Passes: [what's good]
- ❌ Issues: [what needs fixing]

## Recommendations
1. [Specific actionable recommendation]

## NxLoy Standards

CRITICAL: Enforce these rules from CLAUDE.md:
- Max 40 lines per method
- Max 3 parameters per method
- No mocks in tests (use factories + Faker)
- Import from @nxloy/* packages
- 80% test coverage minimum

## Context Awareness

- Monorepo: Nx-based with pnpm
- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Next.js (web) + React Native (mobile)
- Multi-tenant: businessId on all tables
- Soft delete: deletedAt on all tables
```

### Required Fields

Every agent must have:

1. **name**: Kebab-case identifier (e.g., `backend-code-reviewer`)
2. **description**: Brief description + usage example
3. **model**: `sonnet` (recommended), `opus` (for complex tasks), or `haiku` (for simple tasks)
4. **instructions**: Detailed role, responsibilities, review framework

### NxLoy-Specific Agent Standards

All agents must reference and enforce:

- **CLAUDE.md** rules (40-line methods, 3 parameters, no mocks)
- **NxLoy architecture** (monorepo, domains, packages)
- **Tech stack** (NestJS, Next.js, React Native, Prisma)
- **Patterns** (multi-tenant, soft delete, contract-first)

Example enforcement section:

```markdown
## NxLoy Standards Enforcement

Reject code that violates:
- Methods > 40 lines
- Methods with > 3 parameters
- Mocks in tests
- Direct database access (must use Prisma)
- Missing businessId on tenant-scoped tables
- Missing deletedAt for soft deletes
```

### Testing New Agents

After creating an agent:

```bash
# 1. Create agent file
# .claude/agents/my-new-agent.md

# 2. Test invocation
/task @my-new-agent Test prompt to verify agent behavior

# 3. Verify agent follows NxLoy standards
# Check if agent enforces 40-line limit, no mocks, etc.

# 4. Iterate on instructions if needed

# 5. Document in this guide
# Add to "Available Agents" table above
```

### When to Create a New Agent

**Create a new agent when:**
- You have a specialized domain not covered (e.g., DevOps, Security, Data)
- Existing agents are too broad for your use case
- You need domain-specific expertise (e.g., GDPR compliance, PCI-DSS)
- A pattern emerges that needs consistent enforcement

**Use existing agents when:**
- Task fits within current agent scope
- Minor variations can be handled with better prompts
- Avoiding agent proliferation

### Agent File Anatomy

Let's break down a complete agent file:

```markdown
---
name: backend-code-reviewer                    # ← Unique identifier
description: |                                  # ← Multi-line description
  Reviews NestJS backend code for quality...

  Usage: After implementing backend features   # ← When to use

  Example: /task @backend-code-reviewer...     # ← Example invocation
model: sonnet                                   # ← Model to use
---

# Backend Code Reviewer                        # ← Human-readable title

## Role and Expertise                          # ← Define the role
You are an elite NestJS backend developer...

## Responsibilities                            # ← What agent does
1. **Code Quality Review**
2. **Standards Compliance**

## Review Framework                            # ← How agent reviews
### 1. Code Quality
- Check methods ≤ 40 lines
- Check parameters ≤ 3

### 2. Testing
- Verify 80% coverage
- Ensure no mocks

## Output Format                               # ← Response structure
Provide structured feedback:

## Code Quality
✅/❌ [findings]

## Recommendations
1. [actionable items]

## NxLoy Standards                             # ← Enforce project rules
CRITICAL: Reject code violating CLAUDE.md:
- Methods > 40 lines
- Mocks in tests

## Context                                     # ← Project-specific context
- NestJS + Prisma + PostgreSQL
- Multi-tenant (businessId)
- Soft delete (deletedAt)
```

## Troubleshooting

### Agent Not Following NxLoy Standards

**Problem**: Agent accepts code with > 40 line methods

**Solution**:
1. Check agent file includes NxLoy Standards section
2. Ensure agent references CLAUDE.md explicitly
3. Update agent instructions to be more strict:

```markdown
## CRITICAL RULES - NEVER ACCEPT

❌ REJECT if methods exceed 40 lines
❌ REJECT if methods have > 3 parameters
❌ REJECT if tests use mocks
```

### Agent Output Too Generic

**Problem**: Agent gives vague feedback

**Solution**: Provide more context in your request

```bash
# ❌ Vague
/task @backend-code-reviewer Review

# ✅ Specific
/task @backend-code-reviewer Review apps/backend/src/loyalty/points.service.ts, focusing on:
- Performance with 100K+ transactions
- Race condition handling
- Cache strategy
- Test coverage for edge cases
```

### Agent Conflicts with Existing Code

**Problem**: Agent suggests changes that break other parts

**Solution**: Provide full context

```bash
/task @backend-code-reviewer Review loyalty.service.ts in the context of:
- Existing CustomerService interface
- Current LoyaltyProgram schema
- Multi-tenant isolation requirements
- Performance benchmarks (< 100ms response time)
```

### Agent Doesn't Know About Recent Changes

**Problem**: Agent not aware of new patterns

**Solution**:
1. Update agent file with new patterns
2. Reference recent ADRs or documentation:

```bash
/task @architecture-reviewer Review notification system design. Note: We recently adopted event-driven architecture (see docs/adr/0005-event-driven-architecture.md). Please review in that context.
```

---

**Last Updated**: 2025-11-08
**Source**: CONTRIBUTING.md (Lines 230-786)
