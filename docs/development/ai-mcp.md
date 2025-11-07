# AI-MCP Integration Guide

**Last Updated**: 2025-11-08

[← Back to README](../../README.md) | [Development Guides](../development/)

---

## Overview

The **ai-mcp** app is an AI integration server that will implement the **Model Context Protocol (MCP)**, enabling structured communication between AI models and the NxLoy platform.

**Current Status**: 📋 Placeholder app only - contains "console.log('Hello World')", MCP protocol not implemented

**Planned Technology Stack**:
- **Framework**: NestJS (same as backend)
- **Protocol**: Model Context Protocol (MCP)
- **LLM Providers**: OpenAI, Anthropic Claude
- **Port**: 8083

---

## What is MCP? (Planned Feature)

**Model Context Protocol (MCP)** is an open protocol that standardizes how AI applications provide context to language models. It enables:

- **Contextual AI**: LLMs access real-time business data (customers, transactions, loyalty points)
- **Tool Calling**: AI agents can execute actions (award points, create rewards, send notifications)
- **Multi-Agent Coordination**: Multiple AI agents share context and collaborate on complex workflows
- **Audit & Control**: All AI actions are logged and governed by business rules

### Use Cases in NxLoy

**Planned AI capabilities**:
- AI-powered customer support chatbots with loyalty context
- Automated reward recommendations based on customer behavior
- Churn prediction and retention campaigns
- Partner network optimization suggestions
- Dynamic loyalty program adjustments

---

## Prerequisites

**Core Requirements**:
- **Node.js**: 22.12.0+ (same as main project)
- **MCP SDK**: Installed via dependencies (when implemented)
- **API Keys**: OpenAI, Anthropic, or other LLM providers

**Environment Variables**:
```bash
AI_MCP_PORT=8083
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MCP_LOG_LEVEL=debug
```

---

## Setup

### 1. Configure Environment Variables

Add to `.env` file:
```bash
AI_MCP_PORT=8083
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MCP_LOG_LEVEL=debug
```

### 2. Install Dependencies

```bash
pnpm install
```

---

## Running the AI-MCP Server (📋 Planned)

**Current state**: App runs but only prints "Hello World"

**Planned functionality**:
```bash
nx serve ai-mcp

# Will be available at: http://localhost:8083
# Health check: http://localhost:8083/health (to be implemented)
```

---

## API Endpoints (📋 Planned - Not Yet Implemented)

### Core MCP Endpoints (to be built)

**Context Management**:
- `POST /mcp/context` - Provide context to AI model
- `GET /mcp/context/{sessionId}` - Retrieve context for session

**Tool Execution**:
- `POST /mcp/tools/execute` - Execute tool call from AI
- `GET /mcp/tools` - List available tools
- `GET /mcp/tools/{toolId}` - Get tool details

**Health & Status**:
- `GET /mcp/health` - Server health check
- `GET /mcp/status` - Service status and metrics

### Integration Endpoints (to be built)

**AI Interactions**:
- `POST /ai/chat` - Send chat message with loyalty context
- `POST /ai/recommend` - Get AI-powered reward recommendations
- `POST /ai/analyze` - Analyze customer behavior patterns
- `POST /ai/predict` - Predict customer churn or engagement

**Examples of planned functionality**:

```typescript
// Example: Send chat message with customer context
POST /ai/chat
{
  "customerId": "cust_123",
  "message": "What rewards am I eligible for?",
  "context": {
    "includePoints": true,
    "includeTier": true,
    "includeHistory": true
  }
}

// Example: Get AI-powered recommendations
POST /ai/recommend
{
  "customerId": "cust_123",
  "type": "rewards",
  "limit": 5
}

// Example: Analyze customer behavior
POST /ai/analyze
{
  "customerId": "cust_123",
  "metrics": ["engagement", "churn_risk", "lifetime_value"]
}
```

---

## Development Workflow (📋 Planned)

When implemented, the workflow will be:

### 1. Define New MCP Tools

Create tool definitions in `apps/ai-mcp/src/tools/` (directory to be created):

```typescript
// Example: apps/ai-mcp/src/tools/award-points.tool.ts
export class AwardPointsTool implements MCPTool {
  name = 'award_points';
  description = 'Award loyalty points to a customer';

  schema = {
    customerId: { type: 'string', required: true },
    points: { type: 'number', required: true },
    reason: { type: 'string', required: true }
  };

  async execute(params: AwardPointsParams): Promise<ToolResult> {
    // Implementation
  }
}
```

### 2. Register Tools

Register in `apps/ai-mcp/src/app/mcp.module.ts` (file to be created):

```typescript
@Module({
  providers: [
    AwardPointsTool,
    CreateRewardTool,
    CustomerLookupTool,
    // ... other tools
  ]
})
export class MCPModule {}
```

### 3. Test with AI Model

Test using Anthropic Claude or OpenAI:

```bash
# Start MCP server
nx serve ai-mcp

# Send test request
curl -X POST http://localhost:8083/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"customerId": "test_123", "message": "Award me 100 points"}'
```

### 4. Monitor Logs

View debug logs:

```bash
# Logs will show MCP protocol interactions
tail -f logs/ai-mcp.log
```

---

## Architecture (📋 Planned)

### Planned Directory Structure

```
apps/ai-mcp/
├── src/
│   ├── app/
│   │   ├── app.module.ts         # Root module
│   │   └── mcp.module.ts         # MCP-specific module
│   ├── tools/                    # MCP tool definitions
│   │   ├── award-points.tool.ts
│   │   ├── create-reward.tool.ts
│   │   ├── customer-lookup.tool.ts
│   │   └── index.ts
│   ├── context/                  # Context providers
│   │   ├── customer-context.provider.ts
│   │   ├── loyalty-context.provider.ts
│   │   └── transaction-context.provider.ts
│   ├── llm/                      # LLM provider integrations
│   │   ├── openai.service.ts
│   │   ├── anthropic.service.ts
│   │   └── llm.interface.ts
│   ├── config/
│   │   └── mcp.config.ts
│   └── main.ts
├── test/                         # E2E tests
└── project.json
```

### MCP Tool Lifecycle

```
1. AI Request → MCP Server receives chat/query
2. Context Gathering → Fetch relevant customer/loyalty data
3. LLM Processing → Send context + tools to LLM
4. Tool Selection → LLM chooses appropriate tool
5. Tool Execution → MCP server executes tool
6. Response → Return result to user
7. Audit Log → Record all AI actions
```

---

## Common AI-MCP Issues

### AI-MCP server fails to start with "API key not found"

**Cause**: Missing environment variables

**Solution**:
```bash
# Add to .env file
AI_MCP_PORT=8083
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

## Security Considerations (📋 Planned)

### Authentication & Authorization

- All MCP endpoints require API key authentication
- Tool execution requires specific permissions
- Customer data access follows RBAC rules
- Audit logs track all AI-initiated actions

### Rate Limiting

- Prevent abuse with rate limiting per customer/session
- Monitor LLM API usage to control costs
- Implement circuit breakers for external API calls

### Data Privacy

- PII data is filtered before sending to LLM
- Customer data is anonymized in logs
- Sensitive fields are redacted from context
- GDPR/CCPA compliance for AI interactions

---

## Testing MCP Integration (📋 Planned)

### Unit Tests

```bash
# Test individual MCP tools
nx test ai-mcp

# Test with coverage
nx test ai-mcp --coverage
```

### E2E Tests

```bash
# Test full MCP workflow
nx e2e ai-mcp-e2e
```

### Mock LLM Responses

Use factories for consistent test data:

```typescript
// test/factories/llm-response.factory.ts
export const createMockLLMResponse = () => ({
  toolCalls: [
    {
      name: 'award_points',
      params: { customerId: 'test_123', points: 100 }
    }
  ]
});
```

---

## Best Practices

### MCP Tool Design

- Keep tools focused and single-purpose
- Use descriptive names and clear schemas
- Validate all input parameters
- Return structured, parseable results

### Context Management

- Only include relevant context (avoid sending entire database)
- Use pagination for large datasets
- Cache frequently accessed context
- Expire stale context appropriately

### Error Handling

- Gracefully handle LLM API failures
- Provide fallback responses when tools fail
- Log errors for debugging and monitoring
- Return user-friendly error messages

---

## Related Documentation

- [Backend Development](./backend.md) - NestJS backend integration
- [Model Context Protocol](https://modelcontextprotocol.io/) - Official MCP docs
- [OpenAI API](https://platform.openai.com/docs) - OpenAI documentation
- [Anthropic Claude](https://docs.anthropic.com/) - Claude API docs
- [Architecture](../../ARCHITECTURE.md) - System architecture

---

**Implementation Status**: The AI-MCP server is currently a placeholder. Implementation will include MCP protocol integration, LLM provider connections, and tool definitions for loyalty platform actions.
