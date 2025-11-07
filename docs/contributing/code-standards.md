# Code Standards

**Related**: [Testing Standards](./testing-standards.md) | [Development Workflow](./development-workflow.md)

---

## General Rules

From `CLAUDE.md`:

### 1. Max 40 lines per method (excluding comments)
- If method exceeds 40 lines, extract helper methods
- Exception: Complex switch statements with many cases

### 2. Max 3 parameters per method
- If more needed, use options object
- Example:
  ```typescript
  // ❌ Bad
  function createUser(name: string, email: string, phone: string, address: string) {}

  // ✅ Good
  function createUser(data: CreateUserDto) {}
  ```

### 3. Single responsibility
- Method name shouldn't contain "and"
- If it does, split into multiple methods
- Example:
  ```typescript
  // ❌ Bad
  function validateAndSaveUser() {}

  // ✅ Good
  function validateUser() {}
  function saveUser() {}
  ```

### 4. No environment-specific code
- Same behavior in dev and production
- Use environment variables for configuration
- Example:
  ```typescript
  // ❌ Bad
  if (process.env.NODE_ENV === 'development') {
    // Skip validation
  }

  // ✅ Good
  const validationEnabled = process.env.VALIDATION_ENABLED === 'true';
  if (validationEnabled) {
    // Validate
  }
  ```

## TypeScript Standards

**Use strict TypeScript**:
```typescript
// tsconfig.json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

**Avoid `any`**:
```typescript
// ❌ Bad
function process(data: any) {}

// ✅ Good
function process(data: ProcessDto) {}
// Or if truly dynamic
function process(data: unknown) {
  // Type guard
  if (isProcessDto(data)) {
    // Now TypeScript knows the type
  }
}
```

**Use types from shared packages**:
```typescript
// ✅ Good
import { Customer, LoyaltyProgram } from '@nxloy/database';
import { CreateCustomerDto } from '@nxloy/shared-types';
```

## Import Organization

**Order**:
1. Node.js built-ins
2. External dependencies
3. Internal workspace packages
4. Relative imports

**Example**:
```typescript
// 1. Node.js built-ins
import { readFile } from 'fs/promises';

// 2. External dependencies
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

// 3. Workspace packages
import { prisma, Customer } from '@nxloy/database';
import { CreateCustomerDto } from '@nxloy/shared-types';

// 4. Relative imports
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
```

## Naming Conventions

**Files**:
- kebab-case for files: `customer-service.ts`, `loyalty-program.controller.ts`
- PascalCase for classes/interfaces: `CustomerService`, `LoyaltyProgram`

**Variables/Functions**:
- camelCase: `customerName`, `calculatePoints()`
- SCREAMING_SNAKE_CASE for constants: `MAX_POINTS`, `DEFAULT_TIER`

**Classes**:
- PascalCase: `CustomerService`, `LoyaltyProgramController`
- Suffix with type: `*Service`, `*Controller`, `*Repository`, `*Dto`

**Booleans**:
- Prefix with `is`, `has`, `should`, `can`: `isActive`, `hasPermission`, `shouldValidate`

---

**Last Updated**: 2025-11-08
**Source**: CONTRIBUTING.md (Lines 789-917)
