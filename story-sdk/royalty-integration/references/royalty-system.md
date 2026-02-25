# Story Protocol Royalty System

## Overview

The royalty system in Story Protocol enables automated revenue distribution across IP derivative chains. When an IP Asset earns revenue, the system ensures that all ancestor IPs receive their fair share based on the license terms.

## IP Royalty Vault

### What Is a Vault?

Each IP Asset can have an associated **IP Royalty Vault** — an ERC-20 contract that:

- Holds exactly **100 Royalty Tokens** (each representing 1% of revenue rights)
- Acts as the ERC-20 token contract for those royalty tokens (the vault address IS the token address)
- Receives royalty payments and distributes them to token holders

### Vault Deployment

Vaults are **auto-deployed** by the protocol. You never deploy them manually. A vault is created when:

1. **First license token is minted** for the IP Asset
2. **A derivative is registered** that links to this IP as a parent

If neither has happened, the IP has no vault.

### Royalty Token Supply

- **External representation**: 100 tokens (each = 1% of revenue)
- **Internal representation**: `royaltySharesTotalSupply = 100_000_000` (6 decimal precision)
- This means 1 royalty token = 1,000,000 internal units
- The 6 decimal precision allows fractional ownership below 1%

### Initial Token Distribution

On vault deployment, **all 100 royalty tokens are minted to the IP Account** (the ERC-6551 Token Bound Account), NOT to the IP owner's wallet.

To receive revenue directly, the IP owner must:

1. Transfer royalty tokens from the IP Account to their wallet
2. Use `client.ipAccount.execute()` to call the vault's ERC-20 `transfer` function
3. Or use `autoTransferAllClaimedTokensFromIp: true` when claiming

### Retrieving the Vault Address

```typescript
const vaultAddress = await client.royalty.getRoyaltyVaultAddress(ipId);
// Returns the vault contract address (also the ERC-20 token address)
// Returns zero address if no vault exists yet
```

## LAP vs LRP

Story Protocol provides two royalty policies that determine how revenue flows through derivative chains.

### LAP (Liquid Absolute Percentage)

**Contract**: `0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E`

Under LAP, each ancestor in the derivative chain receives a percentage cut from **ALL downstream derivatives**, regardless of depth.

```text
IPA1 (root, commercialRevShare: 5%)
  └── IPA2 (derivative, commercialRevShare: 10%)
        └── IPA3 (derivative of both)
```

When revenue is paid to IPA3:

- IPA1 receives 5% (even though IPA3 is two levels below)
- IPA2 receives 10%
- IPA3 retains 85%

### LRP (Liquid Relative Percentage)

**Contract**: `0x9156e603C949481883B1d3355c6f1132D191fC41`

Under LRP, only **direct parent-child** relationships are enforced. Revenue flows one hop at a time.

```text
IPA1 (root, commercialRevShare: 5%)
  └── IPA2 (derivative, commercialRevShare: 10%)
        └── IPA3 (derivative of IPA2)
```

When revenue is paid to IPA3:

- IPA2 receives 10% from IPA3
- IPA1 receives 5% from IPA2 (not directly from IPA3)
- Revenue cascades up one level at a time

### Comparison Table

| Feature | LAP | LRP |
|---------|-----|-----|
| **Contract** | `0xBe54...390E` | `0x9156...fC41` |
| **Revenue scope** | All ancestors | Direct parent only |
| **Flow direction** | Fan-out to all upstream | Single hop up |
| **Stack calculation** | Sum of all ancestor shares | Per-link only |
| **Complexity** | Higher (tracks full tree) | Lower (tracks one link) |
| **Best for** | Complex IP ecosystems | Simple parent-child chains |
| **Gas cost** | Higher (more ancestors) | Lower (one hop) |

## Royalty Stack

### Definition

The **royalty stack** is the total cumulative percentage of revenue that an IP Asset owes to all its ancestors. It is calculated at derivative registration time and is **immutable** — it cannot change after registration.

### Calculation

For LAP:

```text
royaltyStack(IPA) = sum of commercialRevShare for each ancestor
```

### Example

```text
IPA_Root: commercialRevShare = 5%
  ├── IPA_A: commercialRevShare = 10%
  │     └── IPA_C (derivative of IPA_Root and IPA_A)
  │           royaltyStack = 5% + 10% = 15%
  │           retains = 85%
  └── IPA_B: commercialRevShare = 3%
        └── IPA_D (derivative of IPA_Root and IPA_B)
              royaltyStack = 5% + 3% = 8%
              retains = 92%
```

### Constraints

- Maximum royalty stack is **100%** (an IP cannot owe more than it receives)
- If the stack would exceed 100%, derivative registration **fails**
- An IP with 100% stack retains nothing — all revenue goes to ancestors
- The stack is enforced onchain and checked at registration time

## Revenue Flow

```text
External Payer
    │
    ▼
payRoyaltyOnBehalf(receiverIpId, amount)
    │
    ▼
IP Royalty Vault (receiverIpId)
    │
    ├── Ancestor claims via claimAllRevenue()
    │     └── Revenue flows to ancestor's vault
    │
    └── Royalty token holders claim proportional share
          └── Based on % of royalty tokens held
```

## Contract Addresses

| Contract | Address | Notes |
|----------|---------|-------|
| RoyaltyModule | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` | Core royalty logic |
| RoyaltyPolicyLAP | `0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E` | Absolute percentage |
| RoyaltyPolicyLRP | `0x9156e603C949481883B1d3355c6f1132D191fC41` | Relative percentage |
| RoyaltyWorkflows | `0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890` | Periphery workflows |
| RoyaltyTokenDistributionWorkflows | `0xa38f42B8d33809917f23997B8423054aAB97322C` | Token distribution |
| IpRoyaltyVaultImpl (Aeneid) | `0xbd0f3c59B6f0035f55C58893fA0b1Ac4aDEa50Dc` | Vault implementation |
| IpRoyaltyVaultImpl (Mainnet) | `0x63cC7611316880213f3A4Ba9bD72b0EaA2010298` | Vault implementation |
