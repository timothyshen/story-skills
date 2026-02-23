# story-contracts Plugin

This plugin provides AI assistance for Story Protocol Solidity smart contract interaction.

## Key Concepts

- **Core Contracts**: Registries (IPAssetRegistry) and Modules (LicensingModule, RoyaltyModule, DisputeModule) form the protocol backbone
- **SPG Workflows**: Periphery contracts (RegistrationWorkflows, DerivativeWorkflows, etc.) that batch multiple operations into single transactions
- **AccessController**: Onchain permission system allowing IP owners to delegate module-level actions to other addresses
- **IP Account**: An ERC-6551 Token Bound Account deployed for each IP Asset; this is the `ipId`

## Important

- Core contracts handle individual protocol operations; SPG workflow contracts batch them for gas efficiency
- Never use Multicall3 (`0xcA11bde05977b3631167028862bE2a173976CA11`) with SPGNFT minting functions -- use the SPG contract's built-in `multicall()` instead
- AccessController permissions use wildcard patterns: `address(0)` for any module/IP, `bytes4(0)` for any function selector
- Fork test against Aeneid: `forge test --fork-url https://aeneid.storyrpc.io/`
