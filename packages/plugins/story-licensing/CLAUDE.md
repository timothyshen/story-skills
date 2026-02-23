# story-licensing Plugin

This plugin provides AI assistance for Story Protocol licensing and derivative IP registration.

## Key Concepts

- **PIL (Programmable IP License)**: Story Protocol's onchain license framework — all license terms are stored as a `LicenseTerms` struct in the `PILicenseTemplate` contract
- **LicenseTerms**: A struct with 16 fields controlling commercial use, derivatives, revenue sharing, minting fees, and more
- **PILFlavor**: SDK helper presets that produce common `LicenseTerms` configurations (e.g., `PILFlavor.commercialRemix(...)`)
- **License Token**: An ERC-721 NFT minted when a user pays the minting fee — can be burned to register a derivative

## Important

- **commercialRevShare encoding**: The SDK takes a human-readable percentage (0-100), but the contract stores a `uint32` in the range 0-100,000,000 where 10,000,000 = 10%
- Non-Commercial Social Remixing PIL is **already registered** as `licenseTermsId=1` on both testnet and mainnet — never re-register it
- Currency addresses must be **whitelisted** — use WIP (`0x1514000000000000000000000000000000000000`) on mainnet or MERC20 on testnet
- `attachLicenseTerms` returns `response.success = false` if terms are already attached — it does NOT throw, so always check the return value
