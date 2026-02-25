---
name: smart-contracts
description: Story Protocol Solidity smart contract interaction. Use when user mentions "Story contract", "IPAssetRegistry", "Solidity", "Story smart contract", "foundry", "forge", "LicensingModule", "RoyaltyModule", or wants to interact with Story contracts directly.
allowed-tools: Read, Glob, Grep, WebFetch, Task(subagent_type:Explore)
model: opus
license: MIT
metadata:
  author: story-protocol
  version: '0.1.0'
---

# Story Protocol Smart Contract Interaction

Guide for interacting with Story Protocol smart contracts directly in Solidity, including core contracts, SPG workflows, Foundry testing, and permission management.

## Architecture Overview

Story Protocol contracts are organized into two layers:

| Layer | Purpose | Examples |
|-------|---------|---------|
| **Core** | Individual protocol operations, registries, and modules | IPAssetRegistry, LicensingModule, RoyaltyModule |
| **Periphery (SPG)** | Batched workflow contracts combining multiple core calls | RegistrationWorkflows, DerivativeWorkflows |

**Registries** store state (IP assets, licenses, modules). **Modules** execute logic (licensing, royalties, disputes). The **AccessController** gates which addresses can call which module functions on behalf of an IP Account.

```text
                ┌─────────────────────────────────────┐
                │         SPG Workflow Contracts       │
                │  (RegistrationWorkflows, Derivative  │
                │   Workflows, LicenseAttachment...)   │
                └──────────────┬──────────────────────┘
                               │ calls
                ┌──────────────▼──────────────────────┐
                │          Core Contracts              │
                │  ┌──────────────┐ ┌───────────────┐  │
                │  │ Registries   │ │   Modules     │  │
                │  │ IPAsset      │ │ Licensing     │  │
                │  │ License      │ │ Royalty       │  │
                │  │ Module       │ │ Dispute       │  │
                │  └──────────────┘ │ Access        │  │
                │                   │ CoreMetadata  │  │
                │                   │ Grouping      │  │
                │                   └───────────────┘  │
                └─────────────────────────────────────┘
```

## Core Contracts

### IPAssetRegistry

Global registry of all IP Assets. Each registered NFT gets an ERC-6551 IP Account (the `ipId`).

**Address:** `0x77319B4031e6eF1250907aa00018B8B1c67a244b`

```solidity
import { IPAssetRegistry } from "@story-protocol/core/registries/IPAssetRegistry.sol";

// Register an existing ERC-721 NFT as an IP Asset
function register(uint256 chainid, address tokenContract, uint256 tokenId)
    external returns (address ipId);

// Derive the ipId deterministically (no tx needed)
function ipId(uint256 chainid, address tokenContract, uint256 tokenId)
    external view returns (address);

// Check if an NFT is already registered
function isRegistered(address id) external view returns (bool);
```

**Key events:**

```solidity
event IPRegistered(
    address ipId,
    uint256 chainId,
    address tokenContract,
    uint256 tokenId,
    string name,
    string uri,
    uint256 registrationDate
);
```

**Usage pattern:**

```solidity
IPAssetRegistry public immutable IP_ASSET_REGISTRY =
    IPAssetRegistry(0x77319B4031e6eF1250907aa00018B8B1c67a244b);

// Register an NFT you own
address ipId = IP_ASSET_REGISTRY.register(block.chainid, address(myNft), tokenId);

// Check ipId for any NFT
address existingIpId = IP_ASSET_REGISTRY.ipId(block.chainid, address(myNft), tokenId);
require(IP_ASSET_REGISTRY.isRegistered(existingIpId), "Not registered");
```

### LicensingModule

Manages license terms attachment and license token minting.

**Address:** `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f`

```solidity
import { LicensingModule } from "@story-protocol/core/modules/licensing/LicensingModule.sol";

// Attach license terms to an IP (IP owner or authorized caller)
function attachLicenseTerms(address ipId, address licenseTemplate, uint256 licenseTermsId)
    external;

// Mint license tokens for a given IP + terms pair
function mintLicenseTokens(
    address licensorIpId,
    address licenseTemplate,
    uint256 licenseTermsId,
    uint256 amount,
    address receiver,
    bytes calldata royaltyContext
) external returns (uint256 startLicenseTokenId);
```

**Key events:**

```solidity
event LicenseTermsAttached(address caller, address ipId, address licenseTemplate, uint256 licenseTermsId);
event LicenseTokensMinted(address caller, address licensorIpId, address licenseTemplate, uint256 licenseTermsId, uint256 amount, address receiver, uint256 startLicenseTokenId);
```

**Usage pattern:**

```solidity
LicensingModule public immutable LICENSING_MODULE =
    LicensingModule(0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f);

address PIL_TEMPLATE = 0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316;

// Attach PIL terms (ID obtained from PILicenseTemplate.registerLicenseTerms())
LICENSING_MODULE.attachLicenseTerms(ipId, PIL_TEMPLATE, licenseTermsId);

// Mint 1 license token to receiver
uint256 startId = LICENSING_MODULE.mintLicenseTokens(
    ipId, PIL_TEMPLATE, licenseTermsId, 1, receiver, ""
);
```

### RoyaltyModule

Handles royalty payments between IP Assets.

**Address:** `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086`

```solidity
import { RoyaltyModule } from "@story-protocol/core/modules/royalty/RoyaltyModule.sol";

// Pay royalties on behalf of an IP to its parent
function payRoyaltyOnBehalf(
    address receiverIpId,
    address payerIpId,
    address token,
    uint256 amount
) external;
```

**Key events:**

```solidity
event RoyaltyPaid(address receiverIpId, address payerIpId, address sender, address token, uint256 amount);
```

**Usage pattern:**

```solidity
RoyaltyModule public immutable ROYALTY_MODULE =
    RoyaltyModule(0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086);

address WIP = 0x1514000000000000000000000000000000000000;

// Approve the RoyaltyModule to spend tokens first
IERC20(WIP).approve(address(ROYALTY_MODULE), amount);

// Pay royalties
ROYALTY_MODULE.payRoyaltyOnBehalf(parentIpId, childIpId, WIP, amount);
```

### DisputeModule

Allows raising and resolving disputes against IP Assets.

**Address:** `0x9b7A9c70AFF961C799110954fc06F3093aeb94C5`

```solidity
import { DisputeModule } from "@story-protocol/core/modules/dispute/DisputeModule.sol";

// Raise a dispute against an IP
function raiseDispute(
    address targetIpId,
    string calldata linkToDisputeEvidence,
    bytes32 targetTag,
    bytes calldata data
) external returns (uint256 disputeId);

// Resolve a dispute (arbiter only)
function resolveDispute(uint256 disputeId, bytes calldata data) external;
```

**Key events:**

```solidity
event DisputeRaised(uint256 disputeId, address targetIpId, address disputeInitiator, bytes32 arbitrationPolicy, bytes32 linkToDisputeEvidence, bytes32 targetTag, bytes data);
event DisputeResolved(uint256 disputeId);
```

### AccessController

Manages permissions for which addresses can call module functions on behalf of IP Accounts.

**Address:** `0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a`

```solidity
import { AccessController } from "@story-protocol/core/access/AccessController.sol";

// Set a permission
function setPermission(
    address ipAccount,
    address signer,
    address to,
    bytes4 func,
    uint8 permission // 0=ABSTAIN, 1=ALLOW, 2=DENY
) external;

// Check a permission
function checkPermission(
    address ipAccount,
    address signer,
    address to,
    bytes4 func
) external view;
```

See the AccessController Pattern section below for detailed permission management.

### CoreMetadataModule

Sets IP metadata onchain.

**Address:** `0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16`

```solidity
import { CoreMetadataModule } from "@story-protocol/core/modules/metadata/CoreMetadataModule.sol";

// Set all metadata fields
function setAll(
    address ipId,
    string calldata metadataURI,
    bytes32 metadataHash,
    bytes32 nftMetadataHash
) external;

// Update just the metadata hash
function updateMetadataHash(address ipId, bytes32 metadataHash) external;

// Freeze metadata (irreversible)
function freezeMetadata(address ipId) external;
```

## SPG Workflow Contracts

SPG (Story Protocol Gateway) workflow contracts batch multiple core operations into single transactions for gas efficiency and better UX.

### RegistrationWorkflows

**Address:** `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424`

```solidity
import { RegistrationWorkflows } from "@story-protocol/periphery/workflows/RegistrationWorkflows.sol";
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";

// Mint an NFT from SPGNFT collection + register as IP in one tx
function mintAndRegisterIp(
    address spgNftContract,
    address recipient,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    bool allowDuplicates
) external returns (address ipId, uint256 tokenId);

// Register an existing NFT as IP
function registerIp(
    address nftContract,
    uint256 tokenId,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    WorkflowStructs.SignatureData calldata sigMetadata,
    WorkflowStructs.SignatureData calldata sigRegister
) external returns (address ipId);
```

### DerivativeWorkflows

**Address:** `0x9e2d496f72C547C2C535B167e06ED8729B374a4f`

```solidity
import { DerivativeWorkflows } from "@story-protocol/periphery/workflows/DerivativeWorkflows.sol";

// Mint + register + make derivative in one tx
function mintAndRegisterIpAndMakeDerivative(
    address spgNftContract,
    WorkflowStructs.MakeDerivative calldata derivData,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    address recipient,
    bool allowDuplicates
) external returns (address ipId, uint256 tokenId);

// Register existing NFT + make derivative
function registerIpAndMakeDerivative(
    address nftContract,
    uint256 tokenId,
    WorkflowStructs.MakeDerivative calldata derivData,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    WorkflowStructs.SignatureData calldata sigMetadata,
    WorkflowStructs.SignatureData calldata sigRegister
) external returns (address ipId);
```

### LicenseAttachmentWorkflows

**Address:** `0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8`

```solidity
import { LicenseAttachmentWorkflows } from "@story-protocol/periphery/workflows/LicenseAttachmentWorkflows.sol";

// Mint + register + attach PIL terms in one tx
function mintAndRegisterIpAndAttachPILTerms(
    address spgNftContract,
    address recipient,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    PILTerms[] calldata terms,
    bool allowDuplicates
) external returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds);

// Register existing NFT + attach terms
function registerIpAndAttachPILTerms(
    address nftContract,
    uint256 tokenId,
    WorkflowStructs.IPMetadata calldata ipMetadata,
    PILTerms[] calldata terms,
    WorkflowStructs.SignatureData calldata sigMetadata,
    WorkflowStructs.SignatureData calldata sigRegister,
    WorkflowStructs.SignatureData calldata sigAttach
) external returns (address ipId, uint256[] memory licenseTermsIds);
```

### GroupingWorkflows

**Address:** `0xD7c0beb3aa4DCD4723465f1ecAd045676c24CDCd`

Batch operations for creating and managing IP groups:

- `mintAndRegisterIpAndAttachLicenseAndAddToGroup` -- Mint + register + attach license + add to group
- `registerIpAndAttachLicenseAndAddToGroup` -- Register existing NFT + attach license + add to group
- `registerGroupAndAttachLicenseAndAddIps` -- Create group + attach license + add multiple IPs

### RoyaltyWorkflows

**Address:** `0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890`

Batch operations for royalty management:

- `claimAllRevenue` -- Claim all accumulated revenue for an IP across multiple tokens
- `claimAllRevenueForAncestorIp` -- Claim revenue that has flowed from descendants to ancestor IPs

### RoyaltyTokenDistributionWorkflows

**Address:** `0xa38f42B8d33809917f23997B8423054aAB97322C`

Distribute royalty vault tokens to multiple recipients during registration:

- `mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens`
- `mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens`

## WorkflowStructs

All SPG workflow contracts use shared structs defined in `WorkflowStructs`:

```solidity
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";

struct IPMetadata {
    string ipMetadataURI;       // IPFS URI for IP metadata JSON
    bytes32 ipMetadataHash;     // SHA-256 hash of IP metadata
    string nftMetadataURI;      // IPFS URI for NFT metadata JSON
    bytes32 nftMetadataHash;    // SHA-256 hash of NFT metadata
}

struct MakeDerivative {
    address[] parentIpIds;              // Parent IP addresses
    uint256[] licenseTermsIds;          // License terms to use
    address licenseTemplate;            // PILicenseTemplate address
    bytes royaltyContext;               // Usually empty ("")
    uint256 maxMintingFee;              // Max fee willing to pay (0 for unlimited)
    uint256 maxRts;                     // Max royalty tokens (0 for unlimited)
    uint256 maxRevenueShare;            // Max revenue share (0 for unlimited)
}

struct SignatureData {
    address signer;     // Address that signed
    uint256 deadline;   // Expiration timestamp
    bytes signature;    // EIP-712 signature bytes
}
```

## Contract Addresses

See `references/contract-addresses.md` for the complete list. Key addresses (same on both networks unless noted):

| Contract | Address |
|----------|---------|
| IPAssetRegistry | `0x77319B4031e6eF1250907aa00018B8B1c67a244b` |
| LicensingModule | `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f` |
| RoyaltyModule | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` |
| DisputeModule | `0x9b7A9c70AFF961C799110954fc06F3093aeb94C5` |
| PILicenseTemplate | `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316` |
| AccessController | `0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a` |
| RegistrationWorkflows | `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424` |
| DerivativeWorkflows | `0x9e2d496f72C547C2C535B167e06ED8729B374a4f` |

## Foundry Testing

### Fork Testing Against Aeneid

All Foundry tests should fork the Aeneid testnet for integration testing:

```bash
# Run all tests
forge test --fork-url https://aeneid.storyrpc.io/

# Run a specific test file
forge test --fork-url https://aeneid.storyrpc.io/ --match-path test/1_LicenseTerms.t.sol

# Run with verbosity for debugging
forge test --fork-url https://aeneid.storyrpc.io/ -vvvv

# Run a specific test function
forge test --fork-url https://aeneid.storyrpc.io/ --match-test test_registerIp
```

### Boilerplate Repository

Use the official boilerplate for quick start:
[https://github.com/storyprotocol/story-protocol-boilerplate](https://github.com/storyprotocol/story-protocol-boilerplate)

### Test Setup Pattern

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import { IPAssetRegistry } from "@story-protocol/core/registries/IPAssetRegistry.sol";
import { LicensingModule } from "@story-protocol/core/modules/licensing/LicensingModule.sol";
import { PILicenseTemplate } from "@story-protocol/core/modules/licensing/PILicenseTemplate.sol";
import { RoyaltyModule } from "@story-protocol/core/modules/royalty/RoyaltyModule.sol";

contract StoryProtocolTest is Test {
    IPAssetRegistry public constant IP_ASSET_REGISTRY =
        IPAssetRegistry(0x77319B4031e6eF1250907aa00018B8B1c67a244b);
    LicensingModule public constant LICENSING_MODULE =
        LicensingModule(0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f);
    PILicenseTemplate public constant PIL_TEMPLATE =
        PILicenseTemplate(0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316);
    RoyaltyModule public constant ROYALTY_MODULE =
        RoyaltyModule(0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086);

    address public alice;
    address public bob;

    function setUp() public {
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }
}
```

## AccessController Pattern

The AccessController manages a 3D permission table: `(ipAccount, signer, target) -> permission`.

### Permission Values

| Value | Constant | Meaning |
|-------|----------|---------|
| 0 | ABSTAIN | No explicit permission (falls through to global/default) |
| 1 | ALLOW | Explicitly allowed |
| 2 | DENY | Explicitly denied |

### Wildcard Selectors

| Wildcard | Meaning |
|----------|---------|
| `address(0)` for `to` | Applies to ALL modules/targets |
| `bytes4(0)` for `func` | Applies to ALL function selectors |

### Setting Permissions

```solidity
AccessController public constant ACCESS_CONTROLLER =
    AccessController(0xcCF37d0a503Ee1D4C11208672e622ed3DFB2275a);

// Allow 'operator' to call attachLicenseTerms on LicensingModule for this IP
ACCESS_CONTROLLER.setPermission(
    ipId,                                         // IP Account
    operator,                                     // Signer (who is allowed)
    address(LICENSING_MODULE),                     // Target module
    LICENSING_MODULE.attachLicenseTerms.selector,  // Function selector
    1                                             // ALLOW
);

// Allow 'operator' to call ANY function on LicensingModule for this IP
ACCESS_CONTROLLER.setPermission(
    ipId, operator, address(LICENSING_MODULE), bytes4(0), 1
);

// Allow 'operator' to call ANY function on ANY module for this IP
ACCESS_CONTROLLER.setPermission(
    ipId, operator, address(0), bytes4(0), 1
);
```

### Permission Resolution Order

1. Specific permission: `(ipAccount, signer, module, function)`
2. Module wildcard: `(ipAccount, signer, module, bytes4(0))`
3. Global wildcard: `(ipAccount, signer, address(0), bytes4(0))`
4. Default: DENY

Only the IP Account owner (NFT holder) can call `setPermission`.

## SPG Multicall Pattern

SPG workflow contracts inherit OpenZeppelin's `Multicall`, allowing you to batch multiple workflow calls in a single transaction.

### Built-in Multicall Usage

```solidity
import { RegistrationWorkflows } from "@story-protocol/periphery/workflows/RegistrationWorkflows.sol";
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";

// Encode multiple calls
bytes[] memory calls = new bytes[](2);

calls[0] = abi.encodeCall(
    RegistrationWorkflows.mintAndRegisterIp,
    (spgNftContract, recipient, ipMetadata1, true)
);

calls[1] = abi.encodeCall(
    RegistrationWorkflows.mintAndRegisterIp,
    (spgNftContract, recipient, ipMetadata2, true)
);

// Execute all in one tx via SPG's built-in multicall
bytes[] memory results = RegistrationWorkflows(
    0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424
).multicall(calls);

// Decode results
(address ipId1, uint256 tokenId1) = abi.decode(results[0], (address, uint256));
(address ipId2, uint256 tokenId2) = abi.decode(results[1], (address, uint256));
```

### Why Multicall3 Does NOT Work With SPGNFT Minting

The standard Multicall3 contract at `0xcA11bde05977b3631167028862bE2a173976CA11` uses `delegatecall` to execute batched calls. This changes `msg.sender` to the Multicall3 contract address instead of the original caller.

SPGNFT minting functions check `msg.sender` for minting rights. When called through Multicall3:

1. User calls `Multicall3.aggregate3()`
2. Multicall3 calls `RegistrationWorkflows.mintAndRegisterIp()` via delegatecall
3. Inside RegistrationWorkflows, `msg.sender` is now `Multicall3` address
4. SPGNFT rejects the mint because Multicall3 has no minting rights

**Solution:** Always use the SPG contract's built-in `multicall()` function. It uses `delegatecall` internally but preserves the correct `msg.sender` context because the calls execute within the SPG contract itself.

## Common Pitfalls

1. **Multicall3 with SPGNFT**: Never use the standard Multicall3 for SPG operations that involve SPGNFT minting. `msg.sender` changes to the Multicall3 contract address, breaking minting permission checks. Use SPG's built-in `multicall()` instead.

2. **msg.sender in delegatecall**: When using `delegatecall`, `msg.sender` refers to the contract executing the delegatecall, not the original EOA. This affects all permission checks in Story Protocol modules.

3. **Gas estimation with fork tests**: Aeneid fork tests may show different gas costs than mainnet. Always set appropriate gas limits and use `--gas-limit` flag if tests run out of gas.

4. **ipId vs tokenId**: The `ipId` is the IP Account contract address (ERC-6551 TBA), NOT the ERC-721 token ID. Use `IPAssetRegistry.ipId()` to derive it.

5. **License terms must exist before attaching**: You must first register license terms via `PILicenseTemplate.registerLicenseTerms()` before calling `LicensingModule.attachLicenseTerms()`.

6. **ERC-20 approvals for royalties**: Before calling `payRoyaltyOnBehalf`, the caller must approve the RoyaltyModule to spend the payment token.

7. **Permission before module calls**: If a third-party contract calls a module on behalf of an IP, the IP owner must first grant permission via AccessController. Without this, the call reverts with `AccessController__PermissionDenied`.

8. **SignatureData for SPG with existing NFTs**: When using SPG to register an existing NFT, you must provide EIP-712 signatures (SignatureData) to authorize the SPG contract to act on behalf of the NFT owner.

## Network Configuration

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Aeneid (testnet) | 1315 | `https://aeneid.storyrpc.io` | `https://aeneid.storyscan.io` |
| Mainnet | 1514 | `https://mainnet.storyrpc.io` | `https://mainnet.storyscan.xyz` |

## Import Paths

Core contracts use the `@story-protocol/core` package, periphery contracts use `@story-protocol/periphery`:

```solidity
// Core
import { IPAssetRegistry } from "@story-protocol/core/registries/IPAssetRegistry.sol";
import { LicensingModule } from "@story-protocol/core/modules/licensing/LicensingModule.sol";
import { PILicenseTemplate } from "@story-protocol/core/modules/licensing/PILicenseTemplate.sol";
import { RoyaltyModule } from "@story-protocol/core/modules/royalty/RoyaltyModule.sol";
import { DisputeModule } from "@story-protocol/core/modules/dispute/DisputeModule.sol";
import { AccessController } from "@story-protocol/core/access/AccessController.sol";
import { CoreMetadataModule } from "@story-protocol/core/modules/metadata/CoreMetadataModule.sol";
import { GroupingModule } from "@story-protocol/core/modules/grouping/GroupingModule.sol";

// Periphery / SPG
import { RegistrationWorkflows } from "@story-protocol/periphery/workflows/RegistrationWorkflows.sol";
import { DerivativeWorkflows } from "@story-protocol/periphery/workflows/DerivativeWorkflows.sol";
import { LicenseAttachmentWorkflows } from "@story-protocol/periphery/workflows/LicenseAttachmentWorkflows.sol";
import { GroupingWorkflows } from "@story-protocol/periphery/workflows/GroupingWorkflows.sol";
import { RoyaltyWorkflows } from "@story-protocol/periphery/workflows/RoyaltyWorkflows.sol";
import { WorkflowStructs } from "@story-protocol/periphery/lib/WorkflowStructs.sol";
```
