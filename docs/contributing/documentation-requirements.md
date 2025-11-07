# Documentation Requirements

**Related**: [Development Workflow](./development-workflow.md) | [Code Standards](./code-standards.md)

---

## Code Documentation

**Document complex logic**:
```typescript
/**
 * Calculates loyalty points based on transaction amount and tier multiplier.
 *
 * Base rate: 1 point per $1 spent
 * Tier multipliers: Silver 1.5x, Gold 2x, Platinum 3x
 *
 * @param amount - Transaction amount in cents
 * @param tier - Customer's loyalty tier
 * @returns Points earned (rounded down to nearest integer)
 *
 * @example
 * calculatePoints(10000, 'gold') // Returns 200 (100 * 2x multiplier)
 */
function calculatePoints(amount: number, tier: LoyaltyTier): number {
  const basePoints = Math.floor(amount / 100);
  const multiplier = TIER_MULTIPLIERS[tier];
  return Math.floor(basePoints * multiplier);
}
```

**Don't document obvious code**:
```typescript
// ❌ Bad: Comment adds no value
// Get customer by ID
function getCustomer(id: string) {}

// ✅ Good: Code is self-explanatory
function getCustomer(id: string) {}
```

## Feature Documentation

When implementing a feature, update:

1. **Feature Spec** (`docs/requirements/features/<feature>/`)
   - Mark completed sections
   - Add implementation notes

2. **API Documentation** (`docs/contracts/openapi.yaml`)
   - Add/update endpoints
   - Include examples

3. **README** (if applicable)
   - Update if adding new app or package
   - Update if changing setup process

4. **ADR** (for architectural decisions)
   - Create ADR if making significant architectural choice
   - See `docs/adr/README.md` for template

## Changelog

For changes to published packages:

1. Run `pnpm changeset`
2. Select affected packages
3. Choose version bump (major/minor/patch)
4. Write user-facing changelog description

---

**Last Updated**: 2025-11-08
**Source**: CONTRIBUTING.md (Lines 1235-1299)
