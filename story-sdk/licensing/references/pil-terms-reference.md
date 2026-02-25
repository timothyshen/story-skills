# PIL License Terms Reference

## LicenseTerms Struct

The `LicenseTerms` struct is the core data structure for all IP licenses on Story Protocol. It is stored in the `PILicenseTemplate` contract.

### Field Reference

| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `transferable` | `bool` | `true` | `true`/`false` | Whether the minted license token (ERC-721) can be transferred between addresses |
| `royaltyPolicy` | `address` | `zeroAddress` | Contract address | Royalty policy contract. Use LAP (`0xBe54...`) or LRP (`0x9156...`). `zeroAddress` = no royalties |
| `defaultMintingFee` | `uint256` | `0` | 0+ (wei) | Fee in `currency` tokens to mint one license token. Paid by the derivative creator |
| `expiration` | `uint256` | `0` | 0 = perpetual, else Unix timestamp | When the license expires. 0 means the license never expires |
| `commercialUse` | `bool` | `false` | `true`/`false` | Whether the licensee can use the IP for commercial purposes |
| `commercialAttribution` | `bool` | `false` | `true`/`false` | Whether commercial use requires crediting the original IP owner |
| `commercializerChecker` | `address` | `zeroAddress` | Contract address | Optional contract implementing `ICommercializerChecker` that gates who may commercialize |
| `commercializerCheckerData` | `bytes` | `0x` | Arbitrary bytes | Initialization data passed to the commercializer checker contract |
| `commercialRevShare` | `uint32` | `0` | 0 - 100,000,000 | Revenue share from commercial use. See encoding section below |
| `commercialRevCeiling` | `uint256` | `0` | 0 = unlimited, else wei | Maximum cumulative revenue from commercial use before rights expire |
| `derivativesAllowed` | `bool` | `false` | `true`/`false` | Whether derivative works can be created from this IP |
| `derivativesAttribution` | `bool` | `false` | `true`/`false` | Whether derivatives must credit the parent IP |
| `derivativesApproval` | `bool` | `false` | `true`/`false` | Whether each derivative requires explicit approval from the parent IP owner |
| `derivativesReciprocal` | `bool` | `false` | `true`/`false` | Whether derivatives must use the exact same license terms (copyleft) |
| `derivativeRevCeiling` | `uint256` | `0` | 0 = unlimited, else wei | Maximum revenue from all derivatives before rights expire |
| `currency` | `address` | — | Whitelisted token | ERC-20 token used for minting fees and revenue. Must be whitelisted |
| `uri` | `string` | `""` | URL | URI pointing to off-chain human-readable license text |

## commercialRevShare Encoding

This is one of the most common sources of confusion.

### SDK vs Contract

| Layer | Input Range | Example for 10% |
|-------|-------------|------------------|
| **SDK (TypeScript)** | 0 - 100 (percent) | `commercialRevShare: 10` |
| **Contract (Solidity)** | 0 - 100,000,000 (uint32) | `commercialRevShare: 10_000_000` |
| **PILFlavor helper** | 0 - 100 (percent) | `PILFlavor.commercialRemix({ commercialRevShare: 10, ... })` |

The SDK automatically converts: `userInput * 1_000_000 = contractValue`.

### Conversion Table

| Percentage | SDK Value | Contract Value |
|------------|-----------|----------------|
| 0% | `0` | `0` |
| 1% | `1` | `1,000,000` |
| 5% | `5` | `5,000,000` |
| 10% | `10` | `10,000,000` |
| 25% | `25` | `25,000,000` |
| 50% | `50` | `50,000,000` |
| 100% | `100` | `100,000,000` |

### Important

- If calling the contract directly in Solidity, you must use the 0-100,000,000 range
- If using the TypeScript SDK or PILFlavor helpers, use 0-100
- Passing `5_000_000` to the SDK would be interpreted as 5,000,000% — this will revert

## PILFlavor Preset Configurations

| Preset | commercialUse | derivativesAllowed | derivativesReciprocal | commercialRevShare | defaultMintingFee |
|--------|--------------|-------------------|----------------------|-------------------|------------------|
| Non-Commercial Social Remixing (ID=1) | `false` | `true` | `true` | `0` | `0` |
| Commercial Use | `true` | `false` | `false` | `0` | User-defined |
| Commercial Remix | `true` | `true` | `true` | User-defined | User-defined |
| Creative Commons Attribution | `false` | `true` | `false` | `0` | `0` |

### Non-Commercial Social Remixing (ID=1)

```typescript
// Full struct (for reference — do NOT re-register this)
{
  transferable: true,
  royaltyPolicy: zeroAddress,
  defaultMintingFee: 0n,
  expiration: 0n,
  commercialUse: false,
  commercialAttribution: false,
  commercializerChecker: zeroAddress,
  commercializerCheckerData: '0x',
  commercialRevShare: 0,
  commercialRevCeiling: 0n,
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: false,
  derivativesReciprocal: true,
  derivativeRevCeiling: 0n,
  currency: zeroAddress,
  uri: '',
}
```

### Commercial Use

```typescript
{
  transferable: true,
  royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E', // LAP
  defaultMintingFee: parseEther('1'), // user-defined
  expiration: 0n,
  commercialUse: true,
  commercialAttribution: true,
  commercializerChecker: zeroAddress,
  commercializerCheckerData: '0x',
  commercialRevShare: 0,
  commercialRevCeiling: 0n,
  derivativesAllowed: false,
  derivativesAttribution: false,
  derivativesApproval: false,
  derivativesReciprocal: false,
  derivativeRevCeiling: 0n,
  currency: WIP_TOKEN_ADDRESS,
  uri: '',
}
```

### Commercial Remix

```typescript
{
  transferable: true,
  royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E', // LAP
  defaultMintingFee: parseEther('1'), // user-defined
  expiration: 0n,
  commercialUse: true,
  commercialAttribution: true,
  commercializerChecker: zeroAddress,
  commercializerCheckerData: '0x',
  commercialRevShare: 5, // user-defined, SDK percent
  commercialRevCeiling: 0n,
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: false,
  derivativesReciprocal: true,
  derivativeRevCeiling: 0n,
  currency: WIP_TOKEN_ADDRESS,
  uri: '',
}
```

## LicensingConfig Struct

The `LicensingConfig` controls per-IP licensing behavior and is set via `setLicensingConfig`.

| Field | Type | Description |
|-------|------|-------------|
| `isSet` | `bool` | Whether this config is active |
| `mintingFee` | `uint256` | Override minting fee for this specific IP (0 = use default from terms) |
| `licensingHook` | `address` | Optional hook contract called on each mint |
| `hookData` | `bytes` | Data passed to the licensing hook |
| `commercialRevShare` | `uint32` | Override rev share for this IP (0 = use default from terms) |
| `disabled` | `bool` | If true, no new licenses can be minted for this IP |
| `expectMinimumGroupRewardShare` | `uint32` | Minimum group reward share |
| `expectGroupRewardPool` | `address` | Expected group reward pool |

```typescript
await client.license.setLicensingConfig({
  ipId: '0xYourIpId',
  licenseTermsId: 1n,
  licensingConfig: {
    isSet: true,
    mintingFee: parseEther('2'),
    licensingHook: zeroAddress,
    hookData: '0x',
    commercialRevShare: 0,
    disabled: false,
    expectMinimumGroupRewardShare: 0,
    expectGroupRewardPool: zeroAddress,
  },
});
```

## Example Configurations

### Free Non-Commercial Remix

Use `licenseTermsId = 1` (already registered). No fees, no commercial use, derivatives allowed with same terms.

### Paid Commercial License (No Derivatives)

```typescript
const response = await client.license.registerCommercialUsePIL({
  defaultMintingFee: parseEther('10'), // 10 WIP to use commercially
  currency: WIP_TOKEN_ADDRESS,
});
```

### Commercial Remix with 10% Revenue Share

```typescript
const response = await client.license.registerCommercialRemixPIL({
  defaultMintingFee: parseEther('1'),
  commercialRevShare: 10, // 10% of derivative revenue goes to parent
  currency: WIP_TOKEN_ADDRESS,
});
```

### Time-Limited License

```typescript
const oneYearFromNow = BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60);

await client.license.registerPilTermsAndAttach({
  ipId: '0xYourIpId',
  terms: {
    transferable: true,
    royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
    defaultMintingFee: parseEther('5'),
    expiration: oneYearFromNow,
    commercialUse: true,
    commercialAttribution: true,
    commercializerChecker: zeroAddress,
    commercializerCheckerData: '0x',
    commercialRevShare: 10,
    commercialRevCeiling: 0n,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: false,
    derivativeRevCeiling: 0n,
    currency: WIP_TOKEN_ADDRESS,
    uri: '',
  },
});
```
