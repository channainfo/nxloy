# Gift Card Compliance & Regulatory Requirements

**Feature**: Gift Card System
**Version**: 2.0.0
**Date**: 2025-11-09
**Status**: Phase 1 - Compliance Research (ASEAN Focus)
**Owner**: NxLoy Platform Team
**Operating Context**: Cambodia (Home Base) → Singapore → ASEAN → US/EU (Reference)

---

## Executive Summary

**NxLoy Context**: NxLoy is based in **Cambodia** with primary expansion to **Singapore** and other ASEAN countries. This document provides compliance guidance for gift cards with **ASEAN-first focus**.

**🎯 CRITICAL STRATEGIC RECOMMENDATION**: **DO NOT position as "purchased gift cards" in ASEAN markets**

Instead, structure as **loyalty/rewards program benefits** (digital rewards, promotional credits) to avoid:
- Philippines Gift Check Act restrictions (no expiration allowed if sold for money)
- Singapore Payment Services Act licensing requirements
- Complex compliance burden vs. minimal business benefit

**Key Strategic Insights**:
1. **Philippines = ASEAN's "California"** - Gift Check Act prohibits expiration on purchased gift cards (PHP 500k-1M penalties)
2. **Loyalty Program Exemption** - Philippines DTI exempts loyalty/rewards programs from Gift Check Act
3. **Singapore Licensing** - Purchased gift cards may trigger Payment Services Act; loyalty programs exempt
4. **No Escheatment in ASEAN** - Major financial advantage vs. US/EU
5. **Simpler as Loyalty Rewards** - Position as earned rewards (CASHBACK, DIGITAL_GIFT reward types) not purchased products

**Recommended Approach for NxLoy**:
- **Phase 1**: Loyalty rewards only (CASHBACK, DIGITAL_GIFT reward types from reward catalog)
- **Phase 2** (if needed): Digital gift cards as loyalty redemption option
- **Avoid**: Selling gift cards for cash (triggers Gift Check Act in Philippines)

**This Document's Purpose**: Provides comprehensive gift card compliance for businesses that DO sell gift cards for money. NxLoy can reference this if expanding to purchased gift card features in Phase 2+.

---

## Table of Contents

1. [Overview](#overview)
2. [Legal Classification](#legal-classification)
3. [ASEAN Regulations (Primary Operating Environment)](#asean-regulations-primary-operating-environment)
   - 3.1 [Cambodia - Home Base](#cambodia---home-base)
   - 3.2 [Singapore - Primary Expansion](#singapore---primary-expansion)
   - 3.3 [Philippines - Gift Check Act (Critical)](#philippines---gift-check-act-critical)
   - 3.4 [Other ASEAN Markets](#other-asean-markets)
   - 3.5 [ASEAN Comparison Matrix](#asean-comparison-matrix)
4. [United States Federal Regulations (Reference)](#united-states-federal-regulations-reference)
5. [State-Level Regulations (Reference)](#state-level-regulations-reference)
6. [International Regulations (EU, UK, Australia)](#international-regulations-eu-uk-australia)
7. [Expiration and Fee Restrictions](#expiration-and-fee-restrictions)
8. [Disclosure Requirements](#disclosure-requirements)
9. [Financial Reporting & Accounting](#financial-reporting--accounting)
10. [Tax Implications](#tax-implications)
11. [Escheatment & Unclaimed Property](#escheatment--unclaimed-property)
12. [Fraud Prevention & Security](#fraud-prevention--security)
13. [Third-Party Gift Cards](#third-party-gift-cards)
14. [Recommended Compliance Strategy for NxLoy](#recommended-compliance-strategy-for-nxloy)
15. [Compliance Implementation Checklist](#compliance-implementation-checklist)
16. [Risk Mitigation](#risk-mitigation)

---

## Overview

### What is a Gift Card?

A **gift card** (also called gift certificate, stored-value card, or prepaid card) is a **prepaid payment instrument** that:

- Is **purchased with money** (distinguishes from promotional credits)
- Represents a **specified monetary value**
- Can be **redeemed for goods or services** at the issuing merchant or network
- May be **physical** (plastic card with magnetic stripe/barcode) or **digital** (electronic code)

### NxLoy's Strategic Positioning

**Critical Decision**: NxLoy **does NOT sell gift cards for money** in Phase 1

**Instead**: Position as **loyalty/rewards program** with digital rewards:
- **CASHBACK** reward type → Store credit (covered in store-credit/COMPLIANCE.md)
- **DIGITAL_GIFT** reward type → Promotional digital rewards, NOT purchased gift cards
- **Reward redemption** → Customers redeem points for digital benefits

**Why Avoid Purchased Gift Cards in ASEAN**:
1. **Philippines Gift Check Act** - No expiration allowed if sold for money (PHP 500k-1M penalties)
2. **Singapore Payment Services Act** - May trigger licensing requirements
3. **Compliance complexity** - Heavy regulation for minimal Phase 1 benefit
4. **Loyalty exemption advantage** - Avoid restrictions by structuring as rewards

**This Document's Scope**: Reference guide IF NxLoy adds purchased gift card features in Phase 2+

### Types of Gift Cards (For Reference)

1. **Closed-Loop (Merchant-Specific)**
   - Valid only at issuing merchant
   - Example: Starbucks gift card, Target gift card
   - **NxLoy**: Phase 2+ consideration only

2. **Open-Loop (Network)**
   - Valid at multiple merchants (Visa, Mastercard, Amex network)
   - Subject to additional regulations (Bank Secrecy Act, prepaid card rules)
   - **Out of scope** for NxLoy

3. **Third-Party Gift Cards**
   - Retailer sells another merchant's gift cards (e.g., grocery store sells Amazon cards)
   - Different compliance considerations
   - **Out of scope** for NxLoy Phase 1

### Regulatory Scope

**ASEAN Markets** (NxLoy's Primary Environment):
- **Philippines**: Most restrictive (Gift Check Act - no expiration on purchased cards)
- **Singapore**: Payment Services Act may apply to purchased gift cards
- **Cambodia**: Minimal regulation; general consumer protection
- **Others**: Moderate consumer protection requirements

**US/EU Markets** (Reference):
Gift cards are subject to **extensive regulation** due to:
- **Consumer protection**: Prevent unfair expiration and fee practices (CARD Act, state laws)
- **Financial stability**: Liability management and breakage recognition
- **Fraud prevention**: High fraud risk due to anonymity and transferability
- **Tax compliance**: Sales tax collection and income reporting
- **Unclaimed property**: Escheatment to states

---

## Legal Classification

### Gift Card vs. Store Credit vs. Loyalty Points

| Characteristic | Gift Card | Store Credit | Loyalty Points |
|----------------|-----------|--------------|----------------|
| **Purchased with money** | YES | NO | NO |
| **CARD Act applies** | YES | Generally NO | NO |
| **State gift card laws** | YES | Varies | NO |
| **Expiration restrictions** | Strict (5+ years) | Varies | More flexible |
| **Fee restrictions** | Strict | Moderate | Flexible |
| **Escheatment** | Usually YES | Varies | Usually NO |
| **Transferability** | YES | Often NO | Usually NO |

**Critical Distinction for NxLoy**:
- Gift cards are **highly regulated** (especially in US, Philippines)
- NxLoy **avoids purchased gift cards** in Phase 1, uses loyalty/rewards instead
- Loyalty rewards (CASHBACK, DIGITAL_GIFT) receive favorable treatment in ASEAN
- Different database schemas, business logic, and disclosures required IF implementing purchased gift cards

---

## ASEAN Regulations (Primary Operating Environment)

**Reference Document**: For comprehensive ASEAN regulatory research, see `/docs/compliance/ASEAN-GIFT-CARD-STORE-CREDIT-REGULATIONS.md`.

**Key Strategic Insight**: **Avoid selling gift cards for money** in ASEAN markets. Use loyalty/rewards program structure instead.

### Cambodia - Home Base

**Regulatory Status**: **No specific gift card legislation**

**Strategy for NxLoy**: Structure as loyalty/rewards program (DIGITAL_GIFT reward type), not purchased gift cards

**If NxLoy Were to Sell Gift Cards** (Phase 2+ consideration):

**Applicable Laws**:
- Law on Consumer Protection (2019): General consumer protection
- E-commerce regulations: Transparency requirements
- NBC oversight: May apply if classified as prepaid instrument

**Tax**: VAT 10% (at redemption, not at sale)

**Compliance**:
- Clear terms and conditions (Khmer + English)
- Transparent expiration policies
- Fair redemption practices

**Risk**: **LOW** (minimal regulation)

**Recommended**: Continue positioning as loyalty rewards to maintain simplicity

---

### Singapore - Primary Expansion

**Regulatory Status**: **Payment Services Act 2019 may apply to purchased gift cards**

**Strategy for NxLoy**: Maintain limited-purpose loyalty program structure to avoid licensing

**If NxLoy Were to Sell Gift Cards** (Phase 2+ consideration):

**Payment Services Act 2019**:
- **Limited-purpose e-money**: May be exempt IF:
  - Redeemable only at NxLoy merchants
  - Non-withdrawable, non-refundable
  - Single merchant or related group
- **Licensing**: May NOT be required if limited-purpose exemption applies
- **Confirmation needed**: MAS written guidance

**Consumer Protection (Fair Trading) Act**:
- No unfair practices
- Clear disclosure of terms
- Fair treatment

**Tax**: GST 9% (at redemption)

**Compliance Requirements**:
- Determine if Payment Services Act applies
- Possible MAS licensing (if multi-purpose or network card)
- Consumer protection disclosures
- GST accounting

**Risk**: **MEDIUM** (potential licensing requirement)

**Recommended**: Avoid purchased gift cards; maintain loyalty program structure (no MAS licensing)

---

### Philippines - Gift Check Act (Critical)

**Regulatory Status**: **MOST RESTRICTIVE in ASEAN for purchased gift cards**

**Republic Act No. 10962 - Gift Check Act of 2017**:

**Prohibitions** (for purchased gift cards):
1. **NO EXPIRATION** allowed on gift checks/cards
2. **NO FEES** on stored value
3. **MUST HONOR** unredeemed balances indefinitely

**Penalties**: PHP 500,000 to PHP 1,000,000

**🎯 CRITICAL EXEMPTION**:
**Loyalty, rewards, or promotional program gift checks are EXEMPT** (DTI determination)

**NxLoy Strategy**: **MUST structure as loyalty/rewards program** to qualify for exemption

**If Structured as Loyalty Program**:
- ✅ Exempt from Gift Check Act
- ✅ Expiration allowed (reasonable terms)
- ✅ No PHP 500k-1M penalty risk
- ✅ Operational flexibility

**If Sold as Gift Cards for Money**:
- ❌ NO EXPIRATION allowed
- ❌ NO FEES allowed
- ❌ MUST honor balances forever
- ❌ HIGH PENALTY RISK

**Compliance for NxLoy**:
- [ ] Continue loyalty/rewards program structure
- [ ] Avoid selling "gift cards" for money
- [ ] Marketing: Use "loyalty rewards," NOT "gift cards"
- [ ] DTI confirmation: Written opinion on exemption (if expanding to Philippines)

**Risk**: **HIGH IF GIFT CARDS / LOW IF LOYALTY PROGRAM**

**Recommended**: **DO NOT sell gift cards for money in Philippines**. Maintain loyalty rewards structure.

---

### Other ASEAN Markets

#### Vietnam

**Consumer Protection Law 2023** (Effective July 1, 2024):
- Transparency on fees, expiration, redemption
- Fair treatment requirements

**Gift Cards**: Subject to new consumer protection laws

**Compliance**:
- Clear disclosures
- Fair terms
- VAT applicable

**Risk**: **MEDIUM** (new laws, evolving)

#### Thailand

**Consumer Protection Act**:
- General consumer protection
- Fair treatment

**Gift Cards**: No specific legislation; general rules apply

**Risk**: **LOW TO MEDIUM**

#### Malaysia

**Consumer Protection Regulations**:
- General consumer protection
- Fair trading requirements

**Risk**: **LOW TO MEDIUM**

#### Indonesia

**OJK Regulations**:
- General consumer protection
- Digital payment oversight

**Risk**: **LOW TO MEDIUM**

---

### ASEAN Comparison Matrix

| Country | Gift Card Law | Loyalty Exemption | Expiration (GC) | Fees (GC) | Escheatment | Tax | Recommended Approach |
|---------|---------------|-------------------|-----------------|-----------|-------------|-----|----------------------|
| **Cambodia** | None | N/A | Flexible | Flexible | **NO** | VAT 10% | Loyalty rewards (simplest) |
| **Singapore** | PS Act (may apply) | YES (limited-purpose) | Flexible | Flexible | **NO** | GST 9% | Loyalty rewards (avoid licensing) |
| **Philippines** | **Gift Check Act** | **YES (DTI)** | **NO** (if purchased) | **NO** (if purchased) | **NO** | TBD | **Loyalty only** (critical) |
| **Vietnam** | Consumer protection | TBD | Disclosure req | Disclosure req | **NO** | VAT | Loyalty rewards (safer) |
| **Thailand** | General | N/A | Reasonable | Disclosure | **NO** | VAT 7% | Loyalty rewards |
| **Malaysia** | General | N/A | Reasonable | Disclosure | **NO** | GST/SST | Loyalty rewards |
| **Indonesia** | General | N/A | Reasonable | Disclosure | **NO** | VAT 11% | Loyalty rewards |

**Key Insights**:
1. **NO ASEAN country has escheatment** - Major advantage vs. US/EU
2. **Philippines is ASEAN's "California"** - BUT loyalty programs are EXEMPT
3. **Loyalty structure = lowest risk** across all ASEAN markets
4. **Selling gift cards = high compliance burden** for minimal Phase 1 benefit

---

### ASEAN vs. US Comparison (Gift Cards)

| Factor | ASEAN (Purchased GC) | ASEAN (Loyalty) | United States (GC) |
|--------|----------------------|-----------------|-------------------|
| **Escheatment** | **NO** | **NO** | YES (3-5 years) |
| **Federal Law** | NO | NO | YES (CARD Act 5yr) |
| **Most Restrictive** | Philippines (no exp) | Low restrictions | California (no exp) |
| **Loyalty Exemption** | **YES** (broad) | N/A | Limited (varies) |
| **Expiration** | PH: NO / Others: Flexible | Flexible | Fed: 5yr / CA,NY: NO |
| **Fees** | PH: NO / Others: Disclosure | Flexible | Fed: After 12mo / CA: NO |
| **Licensing** | SG: Maybe / Others: NO | NO | NO |
| **Compliance Burden** | HIGH (if Philippines) | **LOW** | VERY HIGH (50 states) |

**Strategic Advantage**: **Loyalty rewards structure** in ASEAN = simplest compliance path

---

## United States Federal Regulations (Reference)

### Credit CARD Act of 2009

**Official Name**: Credit Card Accountability Responsibility and Disclosure Act
**Relevant Section**: Title IV - Gift Cards
**Codified**: 15 U.S.C. § 1693l-1

#### Applicability

**Covered Gift Cards**:
- Sold or issued to consumers
- Usable at single merchant or affiliated group of merchants
- Reloadable or non-reloadable
- Marketed or labeled as gift card/certificate

**Excluded**:
- Not marketed as gift card (e.g., promotional credits, rebates)
- Usable solely for telephone services
- Reloadable and not marketed as gift (e.g., transit cards)
- Loyalty/reward cards not purchased with money

#### Key Requirements

##### 1. Expiration Date Restrictions

**Rule**: Gift cards cannot expire for **at least 5 years** from:
- Date of issuance, OR
- Date funds were last loaded (for reloadable cards)

**NxLoy Implementation**:
```
Minimum Expiration Date = MAX(issuance_date, last_reload_date) + 5 years

Example:
- Gift card issued: 2025-01-01
- Minimum expiration: 2030-01-01
- Business can set longer (e.g., 10 years) but not shorter
```

**Important**: Expiration of the **underlying funds** is prohibited. The card itself (physical or electronic access) can expire after 5 years, but customer must be able to get a replacement at no cost.

##### 2. Fee Restrictions

**Prohibited Fees** (unless disclosed and limits met):
- Dormancy fees
- Inactivity fees
- Service fees

**Allowed** (with restrictions):
- Purchase fees: Disclosed at time of purchase
- One dormancy/inactivity fee per month after **12 months** of inactivity
- Replacement card fees (if card lost/stolen)

**NxLoy Implementation**:
```
Fee Rules:
- Purchase fee: Allowed, must be disclosed before purchase
- Monthly fee: PROHIBITED for first 12 months
- After 12 months: Maximum 1 fee per month
- Replacement fee: Allowed (reasonable amount)
- All fees: Must be clearly disclosed
```

##### 3. Disclosure Requirements

**Required Disclosures** (before purchase):
- Expiration date of funds (if any)
- Fees (type, amount, frequency)
- Terms and conditions
- Customer service contact information

**Format Requirements**:
- Clear and conspicuous
- Readable font size
- Prominently placed
- Available before purchase (on packaging or display)

##### 4. Exclusions and Safe Harbors

**Promotional Gift Cards** (excluded from CARD Act):
- Not sold for money
- Provided as part of loyalty/reward program
- Issued for promotional purposes

**Criteria for Exclusion**:
- No money exchanged for gift card
- Cannot be reloaded with money
- Expires within reasonable promotional period

**NxLoy Note**: Loyalty reward redemptions for "gift cards" are actually **promotional credits**, not purchased gift cards, and may be exempt from CARD Act.

### Federal Trade Commission (FTC) Act

**Section 5**: Unfair or Deceptive Acts or Practices

**Applicability to Gift Cards**:
- All gift card marketing and sales subject to FTC oversight
- Cannot make false or misleading claims
- Must honor advertised terms
- Cannot engage in bait-and-switch tactics

**Common Violations**:
- Advertising "no expiration" but funds expire
- Hidden fees not disclosed
- Difficult redemption processes
- Refusing to honor gift cards without justification

### Consumer Financial Protection Bureau (CFPB)

**Authority**: Regulation E (Electronic Fund Transfer Act)

**Applicability**: Electronic gift cards

**Key Requirements**:
- Error resolution procedures
- Disclosure of terms before purchase
- Receipts for transactions
- Protection against unauthorized use (if applicable)

---

## State-Level Regulations

**Key Point**: States have **stricter laws** than federal requirements. NxLoy must comply with **both federal and state** laws (whichever is more restrictive).

### State-by-State Summary

#### California

**Law**: California Civil Code § 1749.5

**Key Provisions**:
- Gift cards **cannot expire** (stricter than federal 5-year rule)
- **No fees** allowed (dormancy, service, or otherwise)
- Exception: Fee allowed if disclosed and card has **no expiration**
- Cash redemption required for balances **under $10**
- Violations: Penalties up to $1,000 per violation

**NxLoy California Rules**:
```
IF customer_location = "California" THEN
  - expiration_date = NULL (no expiration)
  - fees = [] (no fees allowed)
  - cash_redemption_threshold = $10.00
  - must_honor_full_value = TRUE
END IF
```

#### Connecticut

**Law**: Public Act No. 13-4

**Key Provisions**:
- Gift cards cannot expire
- No fees (except replacement fee)
- Cash redemption for balances under $3
- Escheatment: Gift cards dormant 5 years subject to unclaimed property law

#### Maine

**Law**: 10 M.R.S. § 1478

**Key Provisions**:
- Gift cards cannot expire for **at least 5 years** (matches federal)
- No dormancy or service fees
- Promotional cards exempt if clearly disclosed

#### Massachusetts

**Law**: Chapter 255D

**Key Provisions**:
- Gift cards cannot expire
- No fees (including purchase fees in some cases)
- Cash redemption for balances under $5
- Strong consumer protection enforcement

#### New York

**Law**: General Obligations Law § 5-1112

**Key Provisions**:
- Gift cards cannot expire
- No fees (dormancy, inactivity, service)
- Cash redemption not explicitly required
- Escheatment: 5 years dormancy

#### Texas

**Law**: Business & Commerce Code § 35.47

**Key Provisions**:
- Gift cards cannot expire for **at least 3 years**
- Service fees prohibited for **first 24 months**
- After 24 months: Fees allowed if disclosed
- Cash redemption not required

#### Washington

**Law**: RCW 19.240

**Key Provisions**:
- Gift cards cannot expire (except charity cards)
- No fees
- Cash redemption for balances under $5
- Strong enforcement by Attorney General

### Multi-State Compliance Strategy

**NxLoy Approach**: **Jurisdiction-Aware Compliance**

1. **Default Rules** (Strictest - California Model):
   - No expiration
   - No fees
   - Cash redemption threshold: $10

2. **State-Specific Overrides** (Database-Driven):
   ```sql
   gift_card_rules (
     state_code VARCHAR(2),
     min_expiration_years INT NULL,  -- NULL = no expiration
     fees_allowed BOOLEAN,
     cash_redemption_threshold DECIMAL(10,2) NULL
   )
   ```

3. **Determination Logic**:
   - Use **customer billing address** at time of purchase
   - If multi-state business: Apply **strictest rule** across all states of operation
   - Warn business during onboarding of compliance complexity

4. **Compliance Warnings**:
   ```
   Business Dashboard Alert:
   "You operate in California, New York, and Texas. California has the
   strictest gift card laws. We recommend applying California rules
   (no expiration, no fees) to all gift cards for simplicity."
   ```

### State Law Comparison Matrix

| State | Min. Expiration | Fees Allowed | Cash Redemption | Escheatment |
|-------|----------------|--------------|-----------------|-------------|
| **California** | NONE (infinite) | NO | <$10 | After dormancy |
| **Connecticut** | NONE | NO (except replacement) | <$3 | 5 years |
| **Maine** | 5 years | NO | Not required | Varies |
| **Massachusetts** | NONE | NO | <$5 | Varies |
| **New York** | NONE | NO | Not required | 5 years |
| **Texas** | 3 years | After 24 months | Not required | 5 years |
| **Washington** | NONE | NO | <$5 | 5 years |
| **Federal (CARD Act)** | 5 years | After 12 months | Not required | N/A |

---

## International Regulations

### Canada

**Federal**: No federal gift card law (provincial jurisdiction)

#### Ontario - Consumer Protection Act, 2002

**Key Provisions**:
- Gift cards **cannot expire**
- **No fees** (dormancy, service, replacement)
- Exemption: Charitable gift cards (can expire if disclosed)
- Exemption: Cards provided for free (promotional)
- Enforcement: Ministry of Government and Consumer Services

**Implementation**:
```
IF customer_location = "Ontario" THEN
  - expiration_date = NULL
  - fees = []
  - promotional_exemption = TRUE (if not purchased)
END IF
```

#### Quebec - Consumer Protection Act

**Key Provisions**:
- Gift cards cannot expire
- No fees except reasonable replacement fee
- Strong consumer protection enforcement

#### British Columbia - Business Practices and Consumer Protection Act

**Key Provisions**:
- Gift cards cannot expire for **at least 2 years**
- No fees for first 15 months
- After 15 months: Fees allowed if disclosed

### European Union

**No EU-Wide Gift Card Law**: Member states have individual regulations

#### United Kingdom

**Law**: No specific gift card statute

**Key Points**:
- No prohibition on expiration (common: 12-24 months)
- Must clearly disclose terms
- Consumer Rights Act 2015: General protections apply
- Unredeemed balances may be unclaimed property

**NxLoy UK Approach**:
- Allow expiration with clear disclosure (default: 24 months)
- Recommend no fees for simplicity
- Comply with Consumer Rights Act

#### Ireland

**Law**: Consumer Protection Act 2007

**Key Provisions**:
- Gift vouchers must be valid for **at least 5 years**
- Can expire after 5 years with disclosure
- Redemption value cannot be reduced

### Australia

**Law**: Australian Consumer Law (ACL) - Competition and Consumer Act 2010

**Key Provisions**:
- Gift cards must be valid for **at least 3 years** from date of sale
- Expiry date must be displayed on gift card
- After expiry, business may deactivate card
- No fees except reasonable replacement fee

**Exceptions**:
- Promotional gift cards can expire sooner (if not sold for money)
- Prepaid phone cards exempt

**Implementation**:
```
IF customer_location = "Australia" THEN
  - minimum_expiration_years = 3
  - display_expiry_on_card = TRUE
  - fees_allowed = ["replacement"] (only)
END IF
```

---

## Expiration and Fee Restrictions

### Expiration Rules Summary

**Federal Minimum**: 5 years (CARD Act)

**State/Provincial Overrides**:
- California, Connecticut, Massachusetts, New York, Washington, Ontario, Quebec: **No expiration**
- Texas: 3 years minimum
- Australia: 3 years minimum
- British Columbia: 2 years minimum

**NxLoy Safe Harbor Default**:
```
Default Expiration: No expiration (infinite)
Business Configuration: Allow longer expiration, NEVER shorter than jurisdiction minimum
Database: expiration_date NULLABLE (NULL = no expiration)
```

### Fee Restrictions Summary

**Allowed Fees** (with restrictions):

1. **Purchase Fee**
   - When: At time of purchase
   - Disclosure: Must be disclosed before purchase
   - Common: Fixed fee (e.g., $2.95 for physical card)
   - NxLoy: Allow businesses to configure, warn about state restrictions

2. **Dormancy/Inactivity Fee**
   - Federal: Only after 12 months inactivity, max 1/month
   - Many States: Prohibited entirely (CA, NY, MA, etc.)
   - NxLoy: **Do not implement** (too complex, legally risky)

3. **Replacement Fee**
   - When: Customer loses card and requests replacement
   - Federal: Allowed (reasonable amount)
   - States: Generally allowed ($5-$10 typical)
   - NxLoy: Allow businesses to configure (default: $0, max: $10)

4. **Reload Fee**
   - When: Customer adds funds to reloadable card
   - Disclosure: Must be disclosed
   - Common: $0 for digital, $0.50-$1 for physical
   - NxLoy Phase 1: Not implementing reload feature

**NxLoy Fee Policy**:
```
Fees Configuration:
  purchase_fee:
    enabled: true/false
    amount: $0.00 - $5.00
    disclosure: "Required before purchase"

  replacement_fee:
    enabled: true/false
    amount: $0.00 - $10.00
    disclosure: "Shown in terms"

  dormancy_fee:
    enabled: FALSE (hardcoded - too risky)
```

---

## Disclosure Requirements

### Pre-Purchase Disclosures

**Required Information** (before customer completes purchase):

1. **Monetary Value**: Face value of gift card
2. **Expiration Date**: Date funds expire (if applicable) or "No expiration"
3. **Fees**: All fees (type, amount, frequency, conditions)
4. **Restrictions**: Where card can be used, what it can buy
5. **Non-Refundable**: If card cannot be returned for cash refund
6. **Terms & Conditions**: Link or reference to full terms
7. **Customer Service**: Phone number, email, or website for support

**Format Requirements**:
- **Clear and conspicuous**: Readable font, contrasting colors
- **Prominent placement**: Before "Complete Purchase" button
- **Plain language**: No legalese; use simple terms
- **Accessible**: WCAG 2.1 AA compliance for digital cards

**NxLoy Implementation**:

**Physical Cards** (if supported):
- Disclosures on card packaging
- Disclosures at point of sale (receipt or display)

**Digital Cards**:
```
Gift Card Purchase Page:
[Gift Card Image]
Amount: $50.00
Purchase Fee: $0.00
Total: $50.00

Terms:
✓ No expiration date
✓ Valid for merchandise only (excludes other gift cards)
✓ Not redeemable for cash (except where required by law)
✓ Non-refundable after purchase
✓ Contact support@business.com for assistance

[Full Terms & Conditions]

[Complete Purchase Button]
```

### Post-Purchase Disclosures

**On Gift Card** (physical or digital):
- Gift card number/code
- Expiration date (if applicable)
- Balance check instructions
- Customer service contact

**Confirmation Email**:
```
Subject: Your Gift Card Purchase - Order #12345

Thank you for your purchase!

Gift Card Details:
- Amount: $50.00
- Card Number: XXXX-XXXX-XXXX-1234
- PIN: [if applicable]
- Expires: No expiration
- Check balance: https://business.com/balance

Redeem:
- Online: Enter code at checkout
- In-store: Show code to cashier

Terms: [Link to full terms]
Questions? support@business.com | (555) 123-4567
```

### Ongoing Disclosures

**Balance Inquiries**:
- Toll-free phone number
- Website balance checker
- Mobile app integration
- SMS balance check (optional)

**Transaction History**:
- Customer can view all redemptions
- Download/print transaction history
- Email notifications for each redemption

---

## Financial Reporting & Accounting

### Gift Card Liability

**Accounting Treatment**: Gift cards are **deferred revenue liabilities**

#### Journal Entries

**At Sale**:
```
DR: Cash                          $50.00
CR: Gift Card Liability           $50.00

(Customer pays $50 for gift card, business has obligation to provide $50 of goods)
```

**At Redemption**:
```
DR: Gift Card Liability           $30.00
CR: Revenue                       $30.00

(Customer uses $30 of gift card, business recognizes $30 revenue)
```

**At Breakage Recognition** (if allowed):
```
DR: Gift Card Liability           $20.00
CR: Breakage Revenue              $20.00

(Remaining $20 unlikely to be redeemed based on historical data)
```

### Breakage Revenue

**Definition**: Breakage is the portion of gift card value that will never be redeemed

**Industry Statistics**:
- Typical breakage rate: **10-20%** of gift card value
- Varies by industry (higher for QSR, lower for specialty retail)
- Depends on expiration policies (lower breakage if no expiration)

**Accounting Standards**:

#### ASC 606 (US GAAP) - Revenue from Contracts with Customers

**Breakage Recognition Criteria**:
1. **Historical data**: Company has historical evidence of breakage patterns
2. **Remote likelihood**: Redemption is "remote" (customer unlikely to claim value)
3. **Reliable estimate**: Company can reliably estimate breakage
4. **Legal compliance**: Recognition complies with applicable laws

**Recognition Approaches**:

**Option 1: Proportional Method**
```
Recognize breakage proportionally as gift cards are redeemed

Example:
- $1,000 in gift cards sold
- Historical breakage: 15%
- Customer redeems $100
- Revenue recognized: $100 / (1 - 0.15) = $117.65
  - $100 from redemption
  - $17.65 from breakage
```

**Option 2: Remote Method**
```
Recognize breakage when redemption becomes remote (e.g., after expiration or dormancy threshold)

Example:
- $1,000 in gift cards sold
- After 3 years, $200 unredeemed
- Historical data: 80% of unredeemed cards after 3 years are never redeemed
- Breakage recognized: $200 * 0.80 = $160
```

**NxLoy Approach (If Implementing Purchased Gift Cards in Phase 2+)**:
- Support both methods (business configurable)
- Default: **Remote method** (simpler, more conservative)
- Breakage recognition disabled in non-expiring jurisdictions (CA, NY, Philippines if gift cards)
- **ASEAN Advantage**: No escheatment = simpler breakage recognition
- Philippines: Avoid purchased gift cards (use loyalty rewards instead)

#### IFRS 15 (International)

**Similar to ASC 606**:
- Recognize breakage when customer unlikely to exercise rights
- Require reliable estimate based on historical data
- Consider legal restrictions on breakage recognition

### Financial Statement Presentation

**Balance Sheet**:
```
Current Liabilities:
  Gift Card Liability              $125,000
  (Note: Represents unredeemed gift cards)
```

**Income Statement**:
```
Revenue:
  Product Sales                    $500,000
  Breakage Revenue                 $15,000
  Total Revenue                    $515,000
```

**Notes to Financial Statements (US Example - Reference)**:
```
Note 5: Gift Card Liability

The Company sells gift cards that are redeemable for merchandise.
Gift card sales are recorded as deferred revenue liabilities.
Revenue is recognized when gift cards are redeemed or when redemption
is remote based on historical breakage patterns.

As of December 31, 2025:
- Gift card liability:        $125,000
- Gift cards sold (year):     $200,000
- Gift cards redeemed (year): $90,000
- Breakage recognized (year): $15,000
- Average breakage rate:      12%

The Company's gift cards do not expire in accordance with state laws.
```

**Notes to Financial Statements (ASEAN Example - If NxLoy Implements Gift Cards)**:
```
Note 5: Digital Rewards Liability (Loyalty Program)

The Company operates a loyalty program in which customers earn digital rewards
through purchases and promotional activities. Digital rewards (recorded as
deferred revenue liability) can be redeemed for merchandise or services.

The Company recognizes breakage revenue when redemption becomes remote based
on historical patterns. Digital rewards expire 12 months after issuance.

As of December 31, 2025:
- Digital rewards liability:     $50,000 (KHR 200,000,000 / SGD 67,000)
- Digital rewards issued (year): $120,000
- Digital rewards redeemed (year): $85,000
- Breakage recognized (year):    $18,000
- Average breakage rate:         15%

The Company is not subject to escheatment laws in Cambodia/Singapore.
Unredeemed balances benefit the Company upon expiration.
```

### Audit Requirements

**Auditor Will Review (US Context)**:
1. Gift card liability reconciliation
2. Breakage calculation methodology
3. Historical redemption data
4. Compliance with ASC 606 / IFRS 15
5. Legal compliance with expiration laws
6. Escheatment filings and remittances

**Auditor Will Review (ASEAN Context - If Implementing)**:
1. Digital rewards/gift card liability reconciliation
2. Breakage calculation methodology (IFRS 15 compliance)
3. Historical redemption data and trends
4. Loyalty program structure documentation
5. Legal compliance (loyalty exemption confirmation if Philippines)
6. VAT/GST compliance (Cambodia 10%, Singapore 9%)
7. Multi-currency reconciliation (if applicable)
8. **NO escheatment filings** (not applicable in ASEAN)

**NxLoy Reporting Tools (If Implementing)**:
- Gift card/digital rewards liability report (by business, by currency)
- Redemption activity report (monthly/annual)
- Breakage calculation worksheet
- **NO escheatment tracking** (ASEAN advantage)
- Audit trail export (all transactions)
- VAT/GST compliance reports

---

## Tax Implications

### ASEAN VAT/GST Treatment (Primary - If Implementing Gift Cards)

**NxLoy Phase 1**: Not implementing purchased gift cards, so this section is for reference only

**General Rule**: VAT/GST collected **at redemption**, not at sale

#### Cambodia - VAT (10%)

**If Implementing Purchased Gift Cards** (Phase 2+ consideration):
```
Customer buys $100 gift card:
  - Amount charged: $100 (no VAT at sale)
  - Reasoning: No goods/services transferred yet

Customer redeems $100 gift card:
  - Product value: $100
  - VAT (10%): $10
  - Customer pays: $10 VAT (cash) OR uses $110 gift card value (if inclusive)

Recommended: Customer pays VAT separately for clearer accounting
```

**Loyalty Rewards (Current Approach)**:
- Digital rewards earned (not purchased)
- No VAT at issuance
- VAT at redemption (same as above)

#### Singapore - GST (9%)

**Multi-Purpose Voucher (MPV) Rules**:
Gift cards from loyalty programs:
- GST charged at **redemption**, not at issuance
- If expires unredeemed: No GST on breakage revenue

**Example**:
```
Customer buys $100 gift card (if implemented):
  - No GST at sale

Redemption:
  - Product value: $100
  - GST (9%): $9
  - Total: $109
  - Payment: $100 gift card + $9 cash
```

**Breakage**:
```
Gift card expires unredeemed:
  - No GST on breakage revenue (service not provided)
  - Consult IRAS for confirmation
```

#### Philippines - VAT

**NOT RECOMMENDED**: Do not implement purchased gift cards in Philippines
- Gift Check Act prohibits expiration
- Use loyalty rewards structure instead (DIGITAL_GIFT reward type)

#### Other ASEAN Markets

| Country | VAT/GST | At Sale | At Redemption | Notes |
|---------|---------|---------|---------------|-------|
| **Vietnam** | VAT | No | Yes | Check current VAT rate |
| **Thailand** | 7% | No | Yes | Standard VAT rules |
| **Malaysia** | SST/GST | No | Yes | Check current tax regime |
| **Indonesia** | 11% | No | Yes | Digital service tax may apply |

### ASEAN Income Tax (If Implementing)

**For Businesses**:
- Gift card sale: Not taxable income (liability created)
- Redemption: Revenue recognized and taxable
- Breakage: Taxable as income when recognized
- **Advantage**: No escheatment offset in ASEAN

**For Customers**:
- Purchased gift cards: Not taxable to recipient (treated as gift)
- Promotional gift cards (loyalty rewards): Not taxable in ASEAN (marketing incentive)
- **Simpler than US**: No Form 1099 equivalent

### US Sales Tax Treatment (Reference Only)

**General Rule**: Sales tax is collected **at redemption**, not at sale

#### Gift Card Sale
```
Customer buys $100 gift card:
  Amount charged: $100 (no sales tax)

Reasoning: No taxable transaction occurs (no goods/services transferred)
```

#### Gift Card Redemption
```
Customer redeems $100 gift card for $100 product:
  Product retail: $100
  Sales tax: $8 (assuming 8% rate)

Payment:
  - $100 gift card (applied to product)
  - $8 cash/credit card (for sales tax)

OR (if jurisdiction allows):
  - $92.59 gift card (product price after backing out tax)
  - $7.41 sales tax (on $92.59)
  - Total: $100 (fully redeemed gift card)
```

**State Variations**:

**Most States**: Tax at redemption on full retail price
```
$100 product + $8 tax = Customer pays $8 cash with $100 gift card
```

**Some States** (e.g., Connecticut): Tax on discounted amount
```
If $100 product discounted 20%: Tax on $80, not $100
Gift card treated as pre-payment, not discount
```

**NxLoy Implementation**:
- Configure per-state tax rules
- Default: Tax on full retail price
- Gift card payment separate from tax calculation
- Customer pays tax with other payment method (credit card, cash)

### Income Tax (Business)

**Gift Card Sales**:
- **Not taxable income** when sold (deferred revenue)
- **Taxable when redeemed** (recognized as revenue)
- **Breakage taxable** when recognized

**Breakage Revenue**:
- Included in gross income when recognized
- Follow financial accounting (ASC 606 alignment)

### Income Tax (Customers)

**Purchased Gift Cards**:
- Not taxable to recipient (treated as gift, not income)
- Giver cannot deduct (personal gift)

**Promotional Gift Cards** (free/loyalty reward):
- May be taxable as prize/award if over $600/year
- Business must issue 1099-MISC if $600+ threshold met
- Rare for gift cards (usually smaller amounts)

---

## Escheatment & Unclaimed Property

**🎯 CRITICAL ASEAN ADVANTAGE**: **ASEAN countries have NO escheatment/unclaimed property laws**

This is a **major financial and operational advantage** for NxLoy operating in ASEAN markets:
- **No obligation** to remit unredeemed gift card balances to government
- **Simplified accounting**: Can recognize breakage revenue without escheatment complications
- **No compliance burden**: No annual reporting, due diligence, or remittance requirements
- **Better economics**: Unredeemed balances benefit the business, not the state

**This section applies ONLY to businesses serving US customers**. For ASEAN operations, escheatment is **not applicable**.

**NxLoy Phase 1**: Not selling purchased gift cards, so escheatment is irrelevant (loyalty rewards instead)

---

### Gift Cards as Unclaimed Property (US Context Only)

**Key Point**: Unredeemed gift cards are subject to **US state unclaimed property laws** (escheatment)

**Triggering Events** (US Only):
1. Gift card unredeemed for **dormancy period** (3-5 years, varies by state)
2. Business has lost contact with customer (gift cards often anonymous)
3. State law requires escheatment of gift card balances

**ASEAN Status**: **Not applicable** - No ASEAN country has escheatment laws

### Dormancy Periods by State

| State | Dormancy Period | Gift Cards Covered | Exemptions |
|-------|----------------|-------------------|------------|
| **California** | 3 years | YES | None |
| **New York** | 5 years | YES | None |
| **Delaware** | 5 years | YES | None (aggressive enforcement) |
| **Texas** | 5 years | YES | <$100 may be exempt |
| **Florida** | 5 years | Varies | Promotional may be exempt |
| **Washington** | 5 years | YES | Charity cards |

### Escheatment Process for Gift Cards

**Annual Workflow**:

1. **Identification** (60-90 days before report due):
   ```sql
   SELECT * FROM gift_cards
   WHERE last_activity_date < CURRENT_DATE - INTERVAL '5 years'
     AND balance > 0
     AND state_code = 'NY'
   ORDER BY state_code, customer_last_name
   ```

2. **Due Diligence** (varies by state):
   - Some states require attempting to contact customer
   - Gift cards often **anonymous** (no customer data)
   - If no customer data: Due diligence may be waived or "owner unknown"

3. **Reporting** (typically November 1):
   - File unclaimed property report with each state
   - For anonymous gift cards: Report as "unknown owner"
   - Include: Card number (masked), balance, last activity date

4. **Remittance** (with report):
   - Remit unredeemed balance to state
   - State holds funds indefinitely
   - Customer can claim from state (with proof of ownership)

5. **Deactivation**:
   - Deactivate escheated gift cards in system
   - If customer attempts to use: Refer to state unclaimed property office

**Example Escheatment Entry**:
```
New York Unclaimed Property Report - 2025

Card Number      Last Activity    Balance    Owner
*****1234        2020-05-15       $25.00     Unknown
*****5678        2019-12-01       $50.00     Unknown
*****9012        2020-08-22       $15.00     Unknown

Total Remitted:  $90.00
```

### Breakage vs. Escheatment

**Critical Rule**: **Cannot recognize breakage AND escheat the same gift card balance**

**Scenarios**:

1. **Expiring Gift Card** (if allowed by state):
   ```
   - Gift card expires after 5 years
   - Recognize breakage at expiration
   - Escheatment may not apply (funds expired, not abandoned)
   - Check state law (some states prohibit expiration)
   ```

2. **Non-Expiring Gift Card in California**:
   ```
   - Gift card never expires (CA law)
   - Cannot recognize breakage (funds still redeemable)
   - After 3 years dormancy: Escheat to California
   - If customer claims from CA later: Business may owe funds
   ```

3. **Non-Expiring Gift Card in Texas**:
   ```
   - Gift card doesn't expire (business choice)
   - After 5 years dormancy: Escheat to Texas
   - Business may recognize breakage ONLY if can reliably estimate
     and escheatment not required
   - Conservative: Do not recognize breakage, escheat full balance
   ```

**NxLoy Approach**:
- **No breakage recognition** for gift cards in non-expiring states
- **Escheat full unredeemed balance** after dormancy period
- **Conservative accounting**: Reduces legal and financial risk

### Escheatment Compliance Challenges

**Challenge 1: Anonymous Gift Cards**
- Customer bought for cash, no name/address collected
- Cannot perform due diligence
- Report as "unknown owner" to state

**Challenge 2: Multi-State Operations**
- Gift card sold in Texas, used in California
- Which state has escheatment rights?
- General rule: **State of customer's last known address** (if known), or **state of business incorporation**

**Challenge 3: Reloadable Cards**
- Last activity date resets with each reload
- Tracks most recent transaction
- Complexity: Multiple loads from different states

**NxLoy Implementation**:
- Track customer address if provided (optional at purchase)
- Default escheatment state: Business incorporation state
- Automated dormancy tracking and escheatment reporting
- Integration with escheatment services (Kelmar, Ryan, Sovos)

---

## Fraud Prevention & Security

### Gift Card Fraud Risks

**Common Fraud Schemes**:

1. **Card Number Guessing**:
   - Attackers generate sequential card numbers
   - Attempt to check balances online
   - Drain balances if found

2. **Physical Card Tampering**:
   - Fraudsters copy card numbers in store
   - Wait for card to be purchased and activated
   - Use stolen number to drain balance before legitimate buyer

3. **Balance Draining**:
   - Phishing to obtain card numbers from customers
   - Use stolen cards for online purchases
   - Customer discovers $0 balance when trying to redeem

4. **Fake Gift Cards**:
   - Counterfeit physical cards
   - Fraudulent digital codes
   - Sold on secondary markets or auction sites

5. **Refund Fraud**:
   - Use stolen credit card to buy gift cards
   - Use gift cards before credit card charge is reversed
   - Business loses product and gift card value

6. **Employee Fraud**:
   - Staff generate gift cards for themselves
   - Staff provide gift cards to friends/family
   - Insider access to card generation system

### Security Controls

#### Card Number Generation

**Requirements**:
- **Unpredictable**: Use cryptographically secure random number generator (CSRNG)
- **Sufficient length**: Minimum 16 characters (alphanumeric)
- **Check digit**: Luhn algorithm or similar for validation
- **Uniqueness**: Enforce database constraint

**NxLoy Implementation**:
```typescript
generateGiftCardNumber(): string {
  // 16-character alphanumeric code
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous: 0/O, 1/I
  const length = 16;

  let cardNumber = '';
  const randomValues = crypto.getRandomValues(new Uint32Array(length));

  for (let i = 0; i < length; i++) {
    cardNumber += characters[randomValues[i] % characters.length];
  }

  // Add check digit (Luhn or custom algorithm)
  const checkDigit = calculateCheckDigit(cardNumber);

  return `${cardNumber}${checkDigit}`;
}

// Example output: XJKQ-R7P3-M8NH-2V4C6
```

#### PIN Protection (Optional)

**Use Case**: Physical gift cards

**Implementation**:
- Generate 4-6 digit PIN
- Hash PIN before storing (bcrypt or Argon2)
- Require PIN + card number for redemption
- Rate limiting on PIN attempts (max 3-5 attempts)
- Lock card after failed attempts

#### Activation Process

**Physical Cards**:
1. Card number pre-printed on card
2. Card **inactive** until purchased
3. At point of sale: Cashier activates card
4. Only then can card be used

**Digital Cards**:
1. Card number generated at purchase
2. Immediately active
3. Sent only to purchaser's email
4. Cannot be activated before payment clears

#### Balance Check Rate Limiting

**Problem**: Attackers check balances of guessed card numbers

**Solution**:
- Rate limit balance inquiries: Max 5 per IP per hour
- CAPTCHA after 3 balance checks from same IP
- Block IPs with excessive failed checks
- Monitor for automated scraping patterns

#### Redemption Velocity Controls

**Problem**: Stolen cards drained quickly in automated attacks

**Solution**:
- Flag multiple redemptions from same IP/account in short time
- Limit redemption amount per transaction ($500 max)
- Require additional verification for high-value redemptions
- Alert system for suspicious patterns

#### PCI DSS Considerations

**Applicability**:
- Gift cards are **not payment cards** (Visa/Mastercard/Amex)
- PCI DSS **does not apply** to closed-loop gift cards
- However, **security best practices still recommended**

**Best Practices**:
- Encrypt card numbers at rest (AES-256)
- Use HTTPS/TLS for all transmissions
- Tokenization: Store tokens, not actual card numbers
- Access controls: Limit who can view full card numbers
- Audit logging: Log all card generation, activation, redemption

#### Fraud Monitoring

**Real-Time Alerts**:
- Card redeemed within 1 hour of purchase (possible tamper)
- Multiple cards redeemed from same IP
- High-value redemptions ($100+)
- Cards purchased with high-risk payment methods

**Reporting Dashboard**:
- Gift card fraud metrics (volume, value, types)
- Chargeback rate for gift card purchases
- Refund rate for fraud claims
- Top fraud patterns by business

---

## Third-Party Gift Cards

### Overview

**What are Third-Party Gift Cards?**

Scenario: NxLoy business (e.g., grocery store) sells **another merchant's gift cards** (e.g., Amazon, Starbucks)

**Business Models**:
1. **Reseller**: Purchase gift cards wholesale, sell at retail
2. **Consignment**: Display cards, remit payment to issuer after sale
3. **Aggregator**: Digital platform offering multiple brands

**NxLoy Phase 1**: **Out of scope** (focus on businesses issuing their own cards)

**Future Consideration**: Phase 3-4 feature for marketplace businesses

### Regulatory Differences

**Key Points**:
1. **CARD Act still applies**: Third-party cards subject to same federal rules
2. **Liability**: Issuing merchant (not reseller) liable for redemption
3. **Breakage**: Accrues to issuer, not reseller
4. **Escheatment**: Issuer's obligation, not reseller's
5. **Refund rights**: Vary by state and merchant policy

### Compliance for Resellers

**If NxLoy supports third-party cards in future**:

**Requirements**:
- Display issuer's terms (expiration, fees, restrictions)
- Provide issuer's customer service contact
- Clarify issuer's refund policy
- Track separately from own gift cards
- Remit funds to issuer per agreement
- No breakage recognition (belongs to issuer)

---

## Recommended Compliance Strategy for NxLoy

### Strategic Positioning for Gift Cards

**🎯 Phase 1 Recommendation**: **DO NOT sell gift cards for money**

**Instead**: Use existing reward catalog **DIGITAL_GIFT** reward type as promotional rewards, NOT purchased products

**Rationale**:
1. **Avoid Philippines Gift Check Act** - No expiration prohibition on loyalty rewards
2. **Avoid Singapore licensing** - No Payment Services Act compliance for loyalty programs
3. **Simpler compliance** - Loyalty structure has minimal regulation across ASEAN
4. **No escheatment** - ASEAN has no unclaimed property laws (major advantage)
5. **Operational flexibility** - Expiration, terms, redemption rules more flexible
6. **Lower risk** - Avoid PHP 500k-1M penalties in Philippines

### Implementation Approach

#### Phase 1: Loyalty Rewards Only (Current - Recommended)

**DIGITAL_GIFT Reward Type** (from reward catalog):
- **Structure**: Promotional digital rewards earned through loyalty program
- **Issuance**: Customers earn through purchases, referrals, achievements
- **Redemption**: Digital benefits, vouchers, promotional codes
- **NOT**: Sold for money (avoids "gift card" classification)

**Compliance Benefits**:
- ✅ Exempt from Philippines Gift Check Act (loyalty exemption)
- ✅ No Singapore Payment Services Act licensing
- ✅ Flexible expiration (12-24 months recommended)
- ✅ No escheatment in ASEAN
- ✅ Simple consumer protection disclosures
- ✅ Tax at redemption (VAT/GST 9-10%)

**Marketing Language**:
- Use: "Loyalty rewards," "digital rewards," "promotional credits"
- Avoid: "Gift cards," "gift certificates," "stored-value cards"

#### Phase 2: Digital Gift Cards as Redemption Option (If Needed)

**IF business case requires purchased gift cards** (customer demand, competitive pressure):

**Recommended Approach**:
- Offer as **loyalty reward redemption option** first (e.g., redeem 1000 points for $10 digital gift code)
- Test market demand before enabling cash purchase
- Start in Cambodia/Singapore only (avoid Philippines initially)

**Compliance Requirements**:
- [ ] Legal opinion in each market (Cambodia, Singapore)
- [ ] MAS guidance on limited-purpose exemption (Singapore)
- [ ] Consumer protection disclosures
- [ ] GST/VAT accounting
- [ ] Fraud prevention system

**If Expanding to Philippines**:
- [ ] DTI consultation (written confirmation of loyalty exemption)
- [ ] Legal opinion on purchased vs. reward distinction
- [ ] Conservative approach: NO purchased gift cards, loyalty redemption only
- [ ] Avoid PHP 500k-1M penalty risk

### Risk-Based Market Entry

**Low Risk Markets** (Cambodia, Thailand, Malaysia, Indonesia):
- Minimal gift card regulation
- General consumer protection applies
- Can consider purchased gift cards if business case strong

**Medium Risk Markets** (Singapore, Vietnam):
- Singapore: Potential Payment Services Act licensing (confirm exemption)
- Vietnam: New consumer protection laws (July 2024)
- Recommend loyalty structure; if purchased cards, obtain legal clearance

**High Risk Market** (Philippines):
- Gift Check Act prohibits expiration on purchased gift cards
- PHP 500k-1M penalties
- **CRITICAL**: DO NOT sell gift cards for money
- Loyalty rewards ONLY (DTI exemption)

### Compliance Monitoring

**Quarterly Review**:
- [ ] Monitor regulatory changes (NBC, MAS, DTI)
- [ ] Review loyalty program vs. gift card classification
- [ ] Check for new ASEAN consumer protection laws
- [ ] Industry developments (competitors' approaches)

**Annual Review**:
- [ ] Legal counsel review of terms (all markets)
- [ ] Compliance audit (loyalty program structure)
- [ ] Customer feedback on DIGITAL_GIFT rewards
- [ ] Business case reassessment (purchased gift cards demand)

### Success Metrics

**Phase 1 (Loyalty Rewards)**:
- Zero regulatory violations
- DIGITAL_GIFT redemption rate >50%
- Customer satisfaction with digital rewards
- No misclassification as "gift cards"

**If Phase 2 (Purchased Gift Cards)**:
- Legal clearance obtained (all markets)
- MAS/NBC guidance confirmed (if required)
- Philippines avoided OR DTI exemption confirmed
- Zero escheatment obligations (ASEAN advantage)

### Decision Framework: Should NxLoy Sell Gift Cards for Money?

**Ask These Questions**:

1. **Business Case**: Is there strong customer demand for purchased gift cards vs. loyalty rewards?
2. **Market**: Which ASEAN markets? (Avoid Philippines unless loyalty structure confirmed)
3. **Compliance Cost**: Is legal/compliance overhead worth the revenue?
4. **Risk Tolerance**: Comfortable with PHP 500k-1M penalty risk in Philippines?
5. **Alternatives**: Can loyalty rewards (DIGITAL_GIFT) meet customer needs instead?

**Recommendation Matrix**:

| Scenario | Recommendation |
|----------|----------------|
| **Phase 1 Launch** | **Loyalty rewards only** (DIGITAL_GIFT) - simplest, lowest risk |
| **Cambodia/Singapore only** | Consider purchased gift cards IF strong business case + legal clearance |
| **Expanding to Philippines** | **DO NOT sell gift cards for money** - loyalty rewards ONLY |
| **ASEAN-wide expansion** | Loyalty rewards structure across all markets (consistency + simplicity) |
| **Strong gift card demand** | Offer as loyalty redemption option first, test before enabling purchase |

**Bottom Line**: **NxLoy should avoid selling gift cards for money in Phase 1** and maintain loyalty rewards structure for maximum regulatory simplicity across ASEAN.

---

## Compliance Implementation Checklist

### Pre-Launch

- [ ] **Legal review**: Counsel review of gift card terms, privacy policy, refund policy
- [ ] **Jurisdiction mapping**: Identify applicable federal, state, international laws
- [ ] **State registration**: Register as gift card issuer (if required by state)
- [ ] **Compliance matrix**: Document rules by state/province
- [ ] **Accounting setup**: Chart of accounts for gift card liability, breakage
- [ ] **Escheatment setup**: Identify dormancy periods, reporting deadlines by state
- [ ] **Fraud prevention**: Implement card number generation, rate limiting, monitoring
- [ ] **Disclosure templates**: Pre-purchase, post-purchase, card packaging
- [ ] **Customer service**: Train staff on gift card policies and fraud prevention

### Technical Implementation

- [ ] **Database schema**: Gift cards, transactions, audit logs
- [ ] **Card generation**: Secure random number generation with check digit
- [ ] **Activation workflow**: Purchase, payment verification, activation
- [ ] **Redemption workflow**: Multi-tender payment support
- [ ] **Balance inquiry**: Phone, web, mobile app, SMS
- [ ] **Expiration engine**: Calculate minimum expiration by jurisdiction (if allowed)
- [ ] **Escheatment tracking**: Identify dormant cards, generate reports
- [ ] **Fraud detection**: Rate limiting, velocity checks, alerts
- [ ] **Reporting dashboard**: Liability, sales, redemptions, breakage, fraud

### Ongoing Compliance

- [ ] **Quarterly legal review**: Monitor for new legislation
- [ ] **Annual escheatment**: File reports, remit funds by state deadlines (typically Nov 1)
- [ ] **Financial audits**: Provide gift card liability reconciliation
- [ ] **Breakage analysis**: Update redemption models annually
- [ ] **Fraud review**: Monthly fraud metrics, adjust controls as needed
- [ ] **Customer complaints**: Track and resolve gift card issues
- [ ] **Terms updates**: Notify customers of material changes
- [ ] **Staff training**: Annual refresher on compliance and fraud

---

## Risk Mitigation

### Legal Risks

**Risk**: Non-compliance with state gift card laws

**Mitigation**:
- Default to strictest rules (California model: no expiration, no fees)
- Legal counsel review before launch
- Jurisdiction-aware compliance engine
- Regular monitoring of legislative changes
- Maintain detailed compliance documentation

**Risk**: Class action lawsuits for unlawful expiration or fees

**Mitigation**:
- Clear, prominent disclosures
- Honor advertised terms
- Responsive customer service
- Proactive compliance audits
- Errors & omissions insurance

**Risk**: State enforcement actions (Attorney General)

**Mitigation**:
- Escheatment compliance (file on time, remit accurately)
- Respond promptly to state inquiries
- Maintain detailed records (7-10 years)
- Cooperate with state audits

### Financial Risks

**Risk**: Overstated breakage (revenue recognized too aggressively)

**Mitigation**:
- Conservative breakage estimates
- Cannot recognize breakage in non-expiring states
- External audit of breakage methodology
- Comply with ASC 606 / IFRS 15 guidance

**Risk**: Escheatment liability exceeds reserves

**Mitigation**:
- Track gift card liability accurately
- Automate dormancy identification
- Reserve funds for escheatment obligations
- Timely escheatment filing to avoid penalties

**Risk**: Fraud losses

**Mitigation**:
- Strong fraud controls (see Fraud Prevention section)
- Fraud insurance or reserves
- Chargeback management process
- Customer authentication for high-value cards

### Operational Risks

**Risk**: System failure (lost gift card data)

**Mitigation**:
- Redundant database backups
- Disaster recovery plan
- Manual override for card redemption (customer has proof)
- Maintain paper/email confirmations for customers

**Risk**: Customer service failures (unable to assist customers)

**Mitigation**:
- 24/7 balance inquiry (automated phone, web)
- Trained customer service staff
- Clear escalation process for issues
- SLA for issue resolution (24-48 hours)

---

## Conclusion

Gift card compliance is **complex, highly regulated, and varies by jurisdiction**. NxLoy must:

1. **Default to safe harbor**: No expiration, no fees (California model)
2. **Jurisdiction-aware**: Apply state-specific rules based on customer location
3. **Conservative accounting**: Do not recognize breakage in non-expiring states
4. **Escheatment compliance**: Automate tracking, reporting, remittance
5. **Fraud prevention**: Strong security controls to protect customers and businesses
6. **Clear disclosures**: Transparent terms before purchase
7. **Ongoing monitoring**: Track legislative changes, update policies

**Biggest Compliance Risks**:
1. Unlawful expiration (states prohibit or require minimum 3-5 years)
2. Unauthorized fees (most states prohibit or restrict heavily)
3. Escheatment non-compliance (failure to report/remit to states)
4. Fraud losses (inadequate security controls)
5. Breakage recognition in non-expiring jurisdictions (violates accounting standards)

**Next Steps**:
1. Legal counsel review of this compliance document
2. Finalize gift card feature specification (FEATURE-SPEC.md)
3. Design database schema with compliance fields
4. Implement jurisdiction-aware business logic
5. Build escheatment reporting tools
6. Develop fraud prevention system

---

**Document Status**: Draft for Legal Review
**Last Updated**: 2025-11-09
**Next Review**: 2026-01-09 (or upon regulatory changes)

**Key References**:
- Credit CARD Act of 2009 (15 U.S.C. § 1693l-1)
- California Civil Code § 1749.5
- ASC 606: Revenue from Contracts with Customers
- IFRS 15: Revenue from Contracts with Customers
- National Conference of State Legislatures (NCSL) Gift Card Laws
- NAUPA (National Association of Unclaimed Property Administrators)
