# Story Protocol Contract Addresses for Solidity Developers

All contract addresses for direct Solidity interaction. Import the interface and instantiate at the address shown.

## Core Protocol Contracts

Same address on Aeneid (chain ID 1315) and Mainnet (chain ID 1514).

| Contract | Address | Solidity Import |
|----------|---------|-----------------|
| IPAssetRegistry | `0x77319B4031e6eF1250907aa00018B8B1c67a244b` | `@story-protocol/core/registries/IPAssetRegistry.sol` |
| LicensingModule | `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f` | `@story-protocol/core/modules/licensing/LicensingModule.sol` |
| RoyaltyModule | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` | `@story-protocol/core/modules/royalty/RoyaltyModule.sol` |
| DisputeModule | `0x9b7A9c70AFF961C799110954fc06F3093aeb94C5` | `@story-protocol/core/modules/dispute/DisputeModule.sol` |
| PILicenseTemplate | `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316` | `@story-protocol/core/modules/licensing/PILicenseTemplate.sol` |
| AccessController | `0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a` | `@story-protocol/core/access/AccessController.sol` |
| ModuleRegistry | `0x022DBAAeA5D8fB31a0Ad793335e39Ced5D631fa5` | `@story-protocol/core/registries/ModuleRegistry.sol` |
| LicenseRegistry | `0x529a750E02d8E2f15649c13D69a465286a780e24` | `@story-protocol/core/registries/LicenseRegistry.sol` |
| LicenseToken | `0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC` | `@story-protocol/core/LicenseToken.sol` |
| RoyaltyPolicyLAP | `0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E` | `@story-protocol/core/modules/royalty/policies/LAP/RoyaltyPolicyLAP.sol` |
| RoyaltyPolicyLRP | `0x9156e603C949481883B1d3355c6f1132D191fC41` | `@story-protocol/core/modules/royalty/policies/LRP/RoyaltyPolicyLRP.sol` |
| CoreMetadataModule | `0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16` | `@story-protocol/core/modules/metadata/CoreMetadataModule.sol` |
| GroupingModule | `0x69D3a7aa9edb72Bc226E745A7cCdd50D947b69Ac` | `@story-protocol/core/modules/grouping/GroupingModule.sol` |
| EvenSplitGroupPool | `0xf96f2c30b41Cb6e0290de43C8528ae83d4f33F89` | `@story-protocol/core/modules/grouping/EvenSplitGroupPool.sol` |

## Contracts That Differ Between Networks

| Contract | Aeneid (1315) | Mainnet (1514) |
|----------|---------------|----------------|
| IPAccountImpl | `0xdeC03e0c63f800efD7C9d04A16e01E80cF57Bf79` | `0x7343646585443F1c3F64E4F08b708788527e1C77` |
| IpRoyaltyVaultImpl | `0xbd0f3c59B6f0035f55C58893fA0b1Ac4aDEa50Dc` | `0x63cC7611316880213f3A4Ba9bD72b0EaA2010298` |
| SPGNFTImpl | `0x5266215a00c31AaA2f2BB7b951Ea0028Ea8b4e37` | `0x6Cfa03Bc64B1a76206d0Ea10baDed31D520449F5` |

## Periphery / SPG Workflow Contracts

Same address on both networks.

| Contract | Address | Solidity Import |
|----------|---------|-----------------|
| RegistrationWorkflows | `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` | `@story-protocol/periphery/workflows/RegistrationWorkflows.sol` |
| DerivativeWorkflows | `0x9e2d496f72C547C2C535B167e06ED8729B374a4f` | `@story-protocol/periphery/workflows/DerivativeWorkflows.sol` |
| LicenseAttachmentWorkflows | `0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8` | `@story-protocol/periphery/workflows/LicenseAttachmentWorkflows.sol` |
| GroupingWorkflows | `0xD7c0beb3aa4DCD4723465f1ecAd045676c24CDCd` | `@story-protocol/periphery/workflows/GroupingWorkflows.sol` |
| RoyaltyWorkflows | `0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890` | `@story-protocol/periphery/workflows/RoyaltyWorkflows.sol` |
| RoyaltyTokenDistributionWorkflows | `0xa38f42B8d33809917f23997B8423054aAB97322C` | `@story-protocol/periphery/workflows/RoyaltyTokenDistributionWorkflows.sol` |
| TokenizerModule | `0xAC937CeEf893986A026f701580144D9289adAC4C` | `@story-protocol/periphery/modules/tokenizer/TokenizerModule.sol` |

## License Hook Contracts

| Contract | Aeneid (1315) | Mainnet (1514) |
|----------|---------------|----------------|
| TotalLicenseTokenLimitHook | `0xaBAD364Bfa41230272b08f171E0Ca939bD600478` | `0xB72C9812114a0Fc74D49e01385bd266A75960Cda` |
| LockLicenseHook | `0x54C52990dA304643E7412a3e13d8E8923cD5bfF2` | `0x5D874d4813c4A8A9FB2AB55F30cED9720AEC0222` |

## Infrastructure

| Contract | Address |
|----------|---------|
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| Bridged USDC (Stargate) | `0xF1815bd50389c46847f0Bda824eC8da914045D14` |

## Payment Tokens

| Network | Token | Address |
|---------|-------|---------|
| Both | WIP (Wrapped IP) | `0x1514000000000000000000000000000000000000` |
| Aeneid | MERC20 (test) | `0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E` |

## Foundry Address Constants

Declare protocol addresses as constants in your test contracts:

```solidity
// Core
IPAssetRegistry public constant IP_ASSET_REGISTRY =
    IPAssetRegistry(0x77319B4031e6eF1250907aa00018B8B1c67a244b);
LicensingModule public constant LICENSING_MODULE =
    LicensingModule(0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f);
PILicenseTemplate public constant PIL_TEMPLATE =
    PILicenseTemplate(0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316);
RoyaltyModule public constant ROYALTY_MODULE =
    RoyaltyModule(0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086);
DisputeModule public constant DISPUTE_MODULE =
    DisputeModule(0x9b7A9c70AFF961C799110954fc06F3093aeb94C5);
AccessController public constant ACCESS_CONTROLLER =
    AccessController(0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a);

// SPG
RegistrationWorkflows public constant REGISTRATION_WORKFLOWS =
    RegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424);
DerivativeWorkflows public constant DERIVATIVE_WORKFLOWS =
    DerivativeWorkflows(0x9e2d496f72C547C2C535B167e06ED8729B374a4f);

// Tokens
address public constant WIP = 0x1514000000000000000000000000000000000000;
```

## Network RPC Endpoints

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Aeneid (testnet) | 1315 | `https://aeneid.storyrpc.io` | `https://aeneid.storyscan.io` |
| Mainnet | 1514 | `https://mainnet.storyrpc.io` | `https://mainnet.storyscan.xyz` |

## Public Testing Resources

| Resource | Value |
|----------|-------|
| Public SPG Collection (Aeneid) | `0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc` |
| Faucet | `https://aeneid.faucet.story.foundation/` |
