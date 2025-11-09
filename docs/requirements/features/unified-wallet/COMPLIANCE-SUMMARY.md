# Unified Wallet Compliance Summary - ASEAN Focus

**Document Version**: 1.0.0
**Last Updated**: 2025-11-09
**Prepared For**: NxLoy Platform (Cambodia-based, ASEAN expansion)
**Purpose**: Executive summary of compliance requirements for store credit, gift cards, and unified wallet

---

## Executive Summary

**NxLoy Strategic Positioning**: Structure as **loyalty/rewards program**, NOT purchased gift cards

**Primary Operating Markets**: Cambodia (home) → Singapore → ASEAN
**Compliance Approach**: ASEAN-first, with US/EU as reference only

**Key Strategic Decision**: ✅ **Loyalty rewards** (CASHBACK, DIGITAL_GIFT) | ❌ **Purchased gift cards**

---

## Quick Reference: ASEAN vs US/EU Compliance

| Factor | ASEAN (Loyalty Program) | US (Gift Cards) | Advantage |
|--------|------------------------|-----------------|-----------|
| **Escheatment** | **NO** | YES (3-5 years) | **ASEAN** - Breakage stays with business |
| **Expiration** | Flexible (12-24 mo) | Fed: 5yr / CA: NO | **ASEAN** - Operational flexibility |
| **Fees** | Flexible (not recommended) | Fed: After 12mo / CA: NO | **ASEAN** - More options |
| **Licensing** | NO (loyalty exemption) | NO (closed-loop) | **Neutral** |
| **Compliance Burden** | **LOW** | HIGH (50 states) | **ASEAN** - Simpler regulation |
| **Tax Reporting** | Simple (VAT at redemption) | Complex (state-by-state) | **ASEAN** - Easier compliance |
| **Customer Tax** | Not taxable | >$600 may be taxable | **ASEAN** - Simpler for customers |
| **Breakage Recognition** | **Easier** (no escheatment) | Complex (state restrictions) | **ASEAN** - Better economics |

**Bottom Line**: ASEAN offers **significantly simpler compliance** and **better economics** for loyalty-based wallet features.

---

## ASEAN Market Comparison

### Regulatory Risk Matrix

| Country | Regulation Level | Gift Card Law | Loyalty Exemption | Recommended Approach |
|---------|-----------------|---------------|-------------------|----------------------|
| **Cambodia** | LOW | None | N/A | ✅ Loyalty rewards (simplest) |
| **Singapore** | MEDIUM | PS Act (limited-purpose exempt) | YES | ✅ Loyalty rewards (no licensing) |
| **Philippines** | **HIGH** (if GC) | Gift Check Act | **YES** (DTI) | ✅ **Loyalty ONLY** (critical) |
| **Vietnam** | MEDIUM | Consumer protection | TBD | ✅ Loyalty rewards (safer) |
| **Thailand** | LOW-MEDIUM | General | N/A | ✅ Loyalty rewards |
| **Malaysia** | LOW-MEDIUM | General | N/A | ✅ Loyalty rewards |
| **Indonesia** | LOW-MEDIUM | General | N/A | ✅ Loyalty rewards |

**Key Insight**: **Philippines = ASEAN's "California"** BUT loyalty programs are EXEMPT from Gift Check Act

---

## Compliance by Feature

### Store Credit (CASHBACK Reward Type)

**Structure**: Loyalty program benefit (earned, not purchased)

#### Cambodia
- **Regulation**: None specific (general consumer protection)
- **Tax**: VAT 10% at redemption
- **Expiration**: Flexible (recommend 12-24 months)
- **Licensing**: Not required
- **Risk**: **LOW**

#### Singapore
- **Regulation**: Limited-purpose exemption from Payment Services Act
- **Tax**: GST 9% at redemption (MPV treatment)
- **Expiration**: Flexible
- **Licensing**: Not required (loyalty program)
- **Risk**: **LOW**

#### Philippines
- **Regulation**: Exempt from Gift Check Act (loyalty program)
- **Tax**: VAT (check current rate)
- **Expiration**: Allowed (loyalty exemption)
- **Licensing**: Not required
- **Risk**: **LOW** (if loyalty structure maintained)

#### Compliance Requirements
- ✅ Clear terms of service (local language + English)
- ✅ Transparent expiration policy (12 months recommended)
- ✅ VAT/GST at redemption (10% Cambodia, 9% Singapore)
- ✅ IFRS 15 accounting (breakage recognition)
- ❌ NO escheatment obligations
- ❌ NO licensing requirements

---

### Gift Cards (DIGITAL_GIFT Reward Type)

**Phase 1 Recommendation**: **DO NOT sell for money** - Use as loyalty rewards only

#### If Implementing Purchased Gift Cards (Phase 2+)

**Cambodia**:
- Regulation: None specific
- Tax: VAT 10% at redemption
- Expiration: Flexible
- Risk: **LOW** (but unnecessary complexity)

**Singapore**:
- Regulation: Payment Services Act may apply
- Tax: GST 9% at redemption
- Expiration: Flexible
- Risk: **MEDIUM** (potential licensing)

**Philippines**:
- Regulation: **Gift Check Act - NO EXPIRATION**
- Tax: VAT
- Penalties: **PHP 500k-1M**
- Risk: **VERY HIGH**
- **Recommendation**: **AVOID purchased gift cards entirely**

#### Compliance Requirements (If Implementing)
- ❌ **Avoid in Philippines** (use loyalty rewards instead)
- ✅ Legal clearance in Cambodia/Singapore
- ✅ MAS guidance if Singapore (limited-purpose exemption)
- ✅ Fraud prevention system (card number generation, rate limiting)
- ✅ VAT/GST compliance
- ❌ NO escheatment (ASEAN advantage)

---

### Unified Wallet (Multi-Balance System)

**Structure**: Single wallet holding multiple balance types
- **Points**: Loyalty points (existing)
- **Store Credit**: CASHBACK rewards (cash-equivalent)
- **Digital Rewards**: DIGITAL_GIFT rewards (promotional)

#### Compliance Approach
- **All balances**: Loyalty program benefits (not purchased)
- **Payment method**: Multi-tender support (points + credit + cash)
- **Tax treatment**: VAT/GST at redemption regardless of balance type
- **Expiration**: Consistent policy across balance types (12 months recommended)
- **Accounting**: Separate liability tracking by balance type

#### Technical Requirements
- Balance tracking per type (points, credit, digital rewards)
- Multi-tender payment processing
- Priority/depletion order configuration
- Real-time balance synchronization
- Transaction history across all types
- Multi-currency support (USD, KHR, SGD)

---

## Financial & Accounting Summary

### Accounting Treatment (IFRS 15 / SFRS)

**Store Credit / Digital Rewards Liability**:
```
At Issuance:
  DR: Marketing Expense (or Cash if refund)
  CR: Store Credit Liability

At Redemption:
  DR: Store Credit Liability
  CR: Revenue

At Expiration (Breakage):
  DR: Store Credit Liability
  CR: Breakage Revenue
```

### Breakage Revenue Recognition

**ASEAN Advantage**: No escheatment = simpler, better economics

**Recommended Policy**:
- **Method**: Remote method (recognize at expiration)
- **Expiration**: 12 months + 30-day grace period
- **Initial Estimate**: 15% breakage rate
- **Review**: Quarterly adjustment based on actual data
- **Standard**: IFRS 15 (international) / SFRS (Singapore)

**Industry Benchmarks**:
- Typical breakage: 10-20%
- Conservative estimate: 15%
- Track for 6-12 months to establish baseline

### Tax Summary

| Country | VAT/GST Rate | At Issuance | At Redemption | Breakage |
|---------|--------------|-------------|---------------|----------|
| **Cambodia** | 10% | No | **YES** | No VAT |
| **Singapore** | 9% | No | **YES** | No GST |
| **Philippines** | TBD | No | **YES** | No VAT |
| **Vietnam** | TBD | No | **YES** | No VAT |
| **Thailand** | 7% | No | **YES** | No VAT |
| **Malaysia** | SST/GST | No | **YES** | TBD |
| **Indonesia** | 11% | No | **YES** | No VAT |

**Key Principle**: Tax at redemption (when goods/services provided), not at issuance

### Corporate Income Tax

**Cambodia**: 20% on taxable income (including breakage revenue)
**Singapore**: 17% standard rate
**Other ASEAN**: Varies by country

**Breakage Revenue**: Taxable when recognized (no escheatment offset = full income)

---

## Implementation Roadmap

### Phase 1: Cambodia Launch (Months 1-3)

**Features**:
- ✅ Store credit (CASHBACK reward type)
- ✅ Digital rewards (DIGITAL_GIFT reward type)
- ✅ Unified wallet (points + credit + digital rewards)
- ❌ NO purchased gift cards

**Compliance**:
- [ ] Engage Cambodian legal counsel
- [ ] Draft terms of service (Khmer + English)
- [ ] Implement VAT accounting (10% at redemption)
- [ ] Set up IFRS 15 breakage recognition
- [ ] 12-month expiration policy

**Tax**:
- VAT 10% at redemption
- Corporate tax 20% on breakage revenue
- VAT returns monthly (by 20th)

### Phase 2: Singapore Expansion (Months 4-6)

**Features**:
- Same as Phase 1 (loyalty rewards only)

**Compliance**:
- [ ] Confirm MAS limited-purpose exemption (written guidance)
- [ ] Consumer Protection (Fair Trading) Act compliance
- [ ] Implement GST accounting (9%)
- [ ] Localize terms of service

**Tax**:
- GST 9% at redemption (MPV treatment)
- Corporate tax 17%
- No GST on breakage revenue

### Phase 3: Regional Expansion (Months 7-12)

**Markets**: Vietnam, Thailand, Malaysia, Indonesia
**Philippines**: Only if loyalty structure confirmed with DTI

**Features**:
- Loyalty rewards only across all markets
- Consistent wallet structure

**Compliance**:
- [ ] Localize terms per market
- [ ] VAT/GST compliance per country
- [ ] Legal review in each jurisdiction
- [ ] Philippines: DTI exemption confirmation (if expanding)

### Phase 4: Optimization (Year 2+)

**Potential Enhancements**:
- Purchased gift cards in Cambodia/Singapore ONLY (if business case)
- AVOID Philippines for purchased gift cards
- Refine breakage models based on historical data
- Multi-currency wallet features

---

## Risk Assessment & Mitigation

### Regulatory Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Misclassification** (loyalty vs. gift card) | MEDIUM | HIGH | Clear documentation, legal opinions, avoid "gift card" language |
| **Philippines expansion** without exemption | LOW | CRITICAL | DTI consultation BEFORE launch, written confirmation |
| **Singapore licensing** requirement | LOW | MEDIUM | MAS written guidance, maintain limited-purpose structure |
| **Regulatory change** (new ASEAN laws) | MEDIUM | MEDIUM | Quarterly monitoring, industry associations, legal counsel |

### Financial Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Overstated breakage** | MEDIUM | MEDIUM | Conservative estimates (15%), quarterly review, external audit |
| **Multi-currency volatility** | MEDIUM | LOW | Hedge currency risk, functional currency = USD |
| **Tax compliance errors** | LOW | MEDIUM | Automated VAT/GST calculation, regular audits |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **System failure** (lost balances) | LOW | HIGH | Redundant backups, disaster recovery, customer confirmations |
| **Fraud** (balance manipulation) | MEDIUM | MEDIUM | Strong controls, approval workflows, fraud detection |

---

## Decision Framework

### Should NxLoy Implement Feature X?

**Questions to Ask**:

1. **Business Case**: Is there strong customer demand?
2. **Compliance**: Does it fit loyalty program structure?
3. **Risk**: What's the regulatory risk by market?
4. **Economics**: Does breakage recognition work (considering escheatment)?
5. **Alternatives**: Can loyalty rewards meet the need instead?

**Decision Matrix**:

| Feature | Phase 1 | Cambodia | Singapore | Philippines | Other ASEAN |
|---------|---------|----------|-----------|-------------|-------------|
| **Store credit (loyalty)** | ✅ YES | ✅ | ✅ | ✅ | ✅ |
| **Digital rewards (loyalty)** | ✅ YES | ✅ | ✅ | ✅ | ✅ |
| **Unified wallet** | ✅ YES | ✅ | ✅ | ✅ | ✅ |
| **Purchased gift cards** | ❌ NO | Phase 2+ | Phase 2+ | ❌ AVOID | Phase 2+ |

---

## Key Takeaways

### Strategic Advantages in ASEAN

1. ✅ **No Escheatment** - Breakage revenue stays with business (not remitted to government)
2. ✅ **Loyalty Exemptions** - Favorable treatment across ASEAN (especially Philippines)
3. ✅ **Simpler Compliance** - No 50-state complexity like US
4. ✅ **Better Economics** - Can recognize breakage without escheatment complications
5. ✅ **Flexible Expiration** - 12-24 month expiration allowed for loyalty programs
6. ✅ **Customer Tax** - Not taxable to customers (vs. US Form 1099 >$600)

### Critical Success Factors

1. **Maintain Loyalty Program Structure** - Key to exemptions across ASEAN
2. **Avoid "Gift Card" Language** - Use "loyalty rewards," "digital rewards," "store credit"
3. **Philippines Strategy** - Loyalty rewards ONLY, confirm DTI exemption
4. **Conservative Accounting** - 15% breakage estimate, quarterly review
5. **VAT/GST Compliance** - Tax at redemption (Cambodia 10%, Singapore 9%)
6. **Multi-Currency** - Support USD, KHR, SGD

### Bottom Line

**NxLoy should implement unified wallet with store credit and digital rewards as loyalty program benefits (Phase 1), and avoid purchased gift cards until strong business case emerges (Phase 2+), with Philippines permanently off-limits for purchased gift cards.**

**ASEAN regulatory environment is significantly more favorable than US/EU for loyalty-based wallet features.**

---

## Reference Documents

**Detailed Compliance**:
- `/docs/requirements/features/store-credit/COMPLIANCE.md` (v2.0.0 - ASEAN Focus)
- `/docs/requirements/features/gift-cards/COMPLIANCE.md` (v2.0.0 - ASEAN Focus)
- `/docs/compliance/ASEAN-GIFT-CARD-STORE-CREDIT-REGULATIONS.md` (1,352 lines)

**Next Steps**:
- Feature specifications (store credit, gift cards, unified wallet)
- Domain model updates (entities, value objects, aggregates)
- Technical implementation

---

**Document Prepared By**: Claude (NxLoy Documentation Assistant)
**Review Status**: Ready for Legal Counsel Review
**Next Review**: 2026-01-09 or upon regulatory changes
