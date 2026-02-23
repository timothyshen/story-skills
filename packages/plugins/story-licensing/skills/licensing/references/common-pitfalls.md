# Common Pitfalls in Story Protocol Licensing

## 1. Re-registering Non-Commercial Social Remixing PIL (ID=1)

**Problem**: Calling `registerNonComSocialRemixingPIL()` or manually registering terms that match the Non-Commercial Social Remixing configuration.

**Why it's wrong**: This license is already registered as `licenseTermsId = 1` on both Aeneid testnet and mainnet. The contract will return the existing ID but you waste gas on a redundant transaction.

**Fix**: Use `licenseTermsId = 1n` directly.

```typescript
// WRONG — wastes gas
const response = await client.license.registerNonComSocialRemixingPIL();

// RIGHT — use existing ID
await client.license.attachLicenseTerms({
  ipId: '0xYourIpId',
  licenseTermsId: 1n,
});
```

## 2. commercialRevShare Encoding (Percent vs uint32)

**Problem**: Passing the contract-level uint32 value (e.g., `5_000_000`) to the SDK, or passing the SDK-level percentage (e.g., `5`) directly to the contract.

**Why it's wrong**: The SDK expects a human-readable percentage (0-100) and multiplies by 1,000,000 internally. Passing `5_000_000` to the SDK would be interpreted as 5,000,000% and the transaction will revert.

**Fix**:

```typescript
// SDK — use 0-100 percentage
const terms = PILFlavor.commercialRemix({
  commercialRevShare: 5, // 5%, NOT 5_000_000
  defaultMintingFee: parseEther('1'),
  currency: WIP_TOKEN_ADDRESS,
});

// Solidity — use 0-100,000,000 range
// commercialRevShare: 5_000_000  (= 5%)
```

## 3. Wrong Spender in registerDerivative (Historical SDK Bug)

**Problem**: In older SDK versions, the `registerDerivative` function used the wrong spender address for the minting fee approval, causing "insufficient allowance" errors.

**Why it's wrong**: The SDK was approving the `DerivativeWorkflows` contract instead of the `RoyaltyModule` or `LicensingModule`.

**Fix**: Ensure you are using `@story-protocol/core-sdk` version 1.2.0 or later. If you encounter allowance errors on `registerDerivative` or `linkDerivative`, update the SDK:

```bash
npm install @story-protocol/core-sdk@latest
```

If you must use an older version, manually approve the correct spender before calling:

```typescript
// Check the SDK source or release notes for the correct spender address
```

## 4. Not Checking response.success on attachLicenseTerms

**Problem**: Assuming `attachLicenseTerms` will throw if the terms are already attached to an IP.

**Why it's wrong**: The function returns `{ success: false, txHash: undefined }` if the terms are already attached. It does **not** throw an error.

**Fix**: Always check `response.success`:

```typescript
const response = await client.license.attachLicenseTerms({
  ipId: '0xYourIpId',
  licenseTermsId: 1n,
});

if (!response.success) {
  console.log('Terms already attached — skipping');
  return;
}

console.log(`Attached: tx=${response.txHash}`);
```

## 5. maxRts Out of Range

**Problem**: Passing a value outside 0-100,000,000 for the `maxRts` parameter.

**Why it's wrong**: The `maxRts` parameter represents the maximum royalty token percentage (where 100,000,000 = 100%). Values outside this range will cause the transaction to revert.

**Fix**: Use `100_000_000` as the default unless you have a specific reason to limit it:

```typescript
await client.ipAsset.linkDerivative({
  childIpId: '0xChildIpId',
  parentIpIds: ['0xParentIpId'],
  licenseTermsIds: [1n],
  maxMintingFee: parseEther('2'),
  maxRevenueShare: 100_000_000,
  maxRts: 100_000_000, // 100% — accept any royalty token allocation
});
```

## 6. Currency Not Whitelisted

**Problem**: Using an arbitrary ERC-20 token address as the `currency` in license terms.

**Why it's wrong**: The protocol only accepts whitelisted payment tokens. Using a non-whitelisted token will cause the license registration to revert.

**Whitelisted tokens**:

| Network | Token | Address |
|---------|-------|---------|
| Both | WIP (Wrapped IP) | `0x1514000000000000000000000000000000000000` |
| Aeneid (testnet) | MERC20 | `0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E` |

**Fix**: Always use a whitelisted token:

```typescript
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';

// Use WIP for both testnet and mainnet
const response = await client.license.registerCommercialRemixPIL({
  defaultMintingFee: parseEther('1'),
  commercialRevShare: 5,
  currency: WIP_TOKEN_ADDRESS, // 0x1514000000000000000000000000000000000000
});
```

For non-commercial licenses (no minting fee), you can use `zeroAddress` as the currency.

## 7. Multicall3 Incompatibility with SPG Functions

**Problem**: Using the standard Multicall3 contract (`0xcA11bde05977b3631167028862bE2a173976CA11`) to batch SPG function calls that involve SPGNFT minting.

**Why it's wrong**: SPG functions use `msg.sender` for permission checks and minting. When called via Multicall3, `msg.sender` becomes the Multicall3 contract, which does not have minting rights on the SPGNFT collection.

**Fix**: Use the SPG contract's built-in `multicall` function instead of external Multicall3:

```typescript
// WRONG — using external Multicall3
const multicall3 = getContract({
  address: '0xcA11bde05977b3631167028862bE2a173976CA11',
  abi: multicall3Abi,
  client: walletClient,
});

// RIGHT — use the SPG contract's built-in multicall
// The SDK handles this automatically when using batch operations
```

If you need to batch multiple SPG operations, use the SDK's built-in batching or call the SPG contract's `multicall(bytes[] calldata data)` directly.

## Summary Checklist

Before submitting a licensing transaction, verify:

- [ ] Not re-registering Non-Commercial Social Remixing (use `licenseTermsId = 1n`)
- [ ] `commercialRevShare` is in SDK percentage (0-100), not contract uint32
- [ ] SDK version is 1.2.0+ (no spender bug)
- [ ] Checking `response.success` after `attachLicenseTerms`
- [ ] `maxRts` is within 0-100,000,000
- [ ] `currency` is a whitelisted token (WIP or MERC20 on testnet)
- [ ] Not using external Multicall3 with SPG minting functions
