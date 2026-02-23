# story-royalty Plugin

This plugin provides AI assistance for Story Protocol royalty payments and revenue claiming.

## Key Concepts

- **IP Royalty Vault**: An ERC-20 contract auto-deployed per IP Asset holding 100 Royalty Tokens (each = 1% revenue rights)
- **Royalty Tokens**: Fungible tokens representing revenue share; 100 tokens = 100%, internal supply = 100_000_000 (6 decimal precision)
- **LAP (Liquid Absolute Percentage)**: Each ancestor gets a cut from ALL downstream derivatives
- **LRP (Liquid Relative Percentage)**: Only direct parent-child royalty relationships

## Important

- Royalty tokens are initially held by the IP Account, NOT the owner's wallet. You must transfer them out.
- The vault address IS the ERC-20 token contract for royalty tokens.
- Claiming revenue is permissionless: anyone can trigger `claimAllRevenue()` for any IP.
- Do NOT use standard Multicall3 with SPG functions involving royalty workflows. Use SPG's built-in `multicall` instead.
