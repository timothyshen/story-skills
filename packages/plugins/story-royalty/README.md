# story-royalty

AI-powered assistance for Story Protocol royalty payments, revenue claiming, and IP Royalty Vault management.

## Skills

### royalty-integration

Guides developers through royalty payments and revenue claiming on Story Protocol, covering:

- IP Royalty Vault mechanics and royalty token distribution
- LAP (Liquid Absolute Percentage) vs LRP (Liquid Relative Percentage) policies
- Paying royalties via `payRoyaltyOnBehalf()`
- Claiming revenue via `claimAllRevenue()` and `batchClaimAllRevenue()`
- Royalty stack calculation and revenue distribution strategies
- Payment tokens (WIP, MERC20)

## Installation

```bash
npx skills add storyprotocol/story-skills
```

## Usage

The skill activates contextually when you mention:

- "royalty", "revenue", "pay royalty", "claim revenue"
- "royalty vault", "royalty tokens", "LAP", "LRP"
- "IpRoyaltyVault", "payRoyaltyOnBehalf", "claimAllRevenue"
